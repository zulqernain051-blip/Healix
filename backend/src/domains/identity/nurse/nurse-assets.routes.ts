import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { randomUUID } from 'crypto';
import path from 'path';
import { promises as fs } from 'fs';
import { prisma } from '../../../common/config/database';
import { asyncHandler } from '../../../common/middleware/asyncHandler';
import { AppError } from '../../../common/errors/AppError';
import { NursePerformanceRepository } from './repositories/nurse-performance.repository';
import { uploadDocumentSchema } from './nurse.validation';
import { UploadDocumentUseCase } from './usecases/verification/upload-document.usecase';
const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024, files: 1 } }).single('file');
const directory = path.resolve(process.cwd(), 'private', 'nurse-assets');
const own = (req: any) => { if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(req.params.id)) throw new AppError('Invalid nurse identifier', 400); if (req.user.role !== 'ADMIN' && req.user.nurse?.id !== req.params.id) throw new AppError('This nurse profile belongs to another account', 403); };
function extension(file?: Express.Multer.File, photo = false): string {
  if (!file) throw new AppError('Choose a file to upload', 400);
  const b = file.buffer;
  if (b.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return '.png';
  if (b[0] === 255 && b[1] === 216 && b[2] === 255) return '.jpg';
  if (!photo && b.subarray(0, 5).toString() === '%PDF-') return '.pdf';
  throw new AppError(photo ? 'Select a PNG or JPEG image' : 'Select a PNG, JPEG or PDF document', 400);
}
router.post('/:id/photo', (req, _res, next) => { try { own(req); next(); } catch(e) { next(e); } }, upload, asyncHandler(async (req, res) => {
  const name = randomUUID() + extension(req.file, true);
  const publicDir = path.resolve(process.cwd(), 'public', 'uploads', 'nurses');
  await fs.mkdir(publicDir, { recursive: true });
  await fs.writeFile(path.join(publicDir, name), req.file!.buffer);
  const photoUrl = `${req.protocol}://${req.get('host')}/uploads/nurses/${name}`;
  const profile = await prisma.nurse.update({ where: { id: req.params.id }, data: { photoUrl } });
  res.json({ success: true, data: profile });
}));
router.post('/:id/verification/file', (req, _res, next) => { try { own(req); next(); } catch(e) { next(e); } }, upload, asyncHandler(async (req, res) => {
  const ext = extension(req.file);
  const parsed = uploadDocumentSchema.omit({ fileUrl: true }).safeParse(req.body);
  if (!parsed.success) throw new AppError('Select a supported verification document type', 400);
  const name = randomUUID() + ext;
  const folder = path.join(directory, req.params.id);
  await fs.mkdir(folder, { recursive: true });
  await fs.writeFile(path.join(folder, name), req.file!.buffer);
  const url = `${req.protocol}://${req.get('host')}/api/v1/nurses/${req.params.id}/documents/${name}`;
  const nurse = await prisma.nurse.findUniqueOrThrow({ where: { id: req.params.id } });
  const doc = await UploadDocumentUseCase.execute(nurse.userId, nurse.id, parsed.data.documentType, url);
  res.status(201).json({ success: true, data: doc });
}));
router.get('/:id/documents/:filename', asyncHandler(async (req, res) => {
  own(req);
  if (!/^[a-f0-9-]{36}\.(pdf|png|jpg)$/.test(req.params.filename)) throw new AppError('Invalid document filename', 400);
  res.setHeader('Cache-Control', 'private, no-store');
  res.sendFile(path.join(directory, req.params.id, req.params.filename));
}));
router.put('/:id/specializations/:specializationId/certificate', asyncHandler(async (req, res) => {
  own(req);
  const certificateUrl = req.body.certificateUrl;
  if (typeof certificateUrl !== 'string' || !/^https?:\/\//.test(certificateUrl)) throw new AppError('A valid certificate URL is required', 400);
  const changed = await prisma.nurseSpecialization.updateMany({ where: { id: req.params.specializationId, nurseId: req.params.id }, data: { certificateUrl, certified: false } });
  if (!changed.count) throw new AppError('Specialization not found', 404);
  res.json({ success: true, data: { submitted: true } });
}));
router.put('/:id/specializations/:specializationId/review', asyncHandler(async (req, res) => {
  if ((req as any).user?.role !== 'ADMIN') throw new AppError('Only administrators can verify certificates', 403);
  if (typeof req.body.certified !== 'boolean') throw new AppError('Choose approve or reject', 400);
  const spec = await prisma.nurseSpecialization.findFirst({ where: { id: req.params.specializationId, nurseId: req.params.id } });
  if (!spec?.certificateUrl) throw new AppError('Submit a certificate before review', 400);
  await prisma.nurseSpecialization.update({ where: { id: spec.id }, data: { certified: req.body.certified, ...(!req.body.certified ? { proficiencyRating: null, assessmentNotes: null, assessedBy: null, assessedAt: null } : {}) } });
  await prisma.nurseBadge.deleteMany({ where: { nurseId: req.params.id, badgeType: { in: ['VERIFIED_SPECIALIST', 'WOUND_CARE_EXPERT', 'DIABETES_SPECIALIST', 'PEDIATRIC_SPECIALIST', 'IV_THERAPY_CERTIFIED'] } } });
  await NursePerformanceRepository.awardBadgesIfEligible(req.params.id);
  await NursePerformanceRepository.computeAndUpsertNurseScore(req.params.id);
  res.json({ success: true, data: { certified: req.body.certified, ...(!req.body.certified ? { proficiencyRating: null, assessmentNotes: null, assessedBy: null, assessedAt: null } : {}) } });
}));
router.put('/:id/specializations/:specializationId/assessment', asyncHandler(async (req, res) => {
  if ((req as any).user?.role !== 'ADMIN') throw new AppError('Only administrators can record skill assessments', 403);
  const input = z.object({ rating: z.number().int().min(1).max(5), notes: z.string().trim().min(20).max(2000) }).parse(req.body);
  const spec = await prisma.nurseSpecialization.findFirst({ where: { id: req.params.specializationId, nurseId: req.params.id } });
  if (!spec?.certified) throw new AppError('Verify the specialty evidence before assessing this skill', 409);
  const actorId = (req as any).user.id;
  const result = await prisma.$transaction(async tx => {
    const result = await tx.nurseSpecialization.update({ where: { id: spec.id }, data: { proficiencyRating: input.rating, assessmentNotes: input.notes, assessedBy: actorId, assessedAt: new Date() } });
    await tx.adminAuditLog.create({ data: { adminId: actorId, action: 'ASSESS_NURSE_SKILL', entityType: 'NURSE_SPECIALIZATION', entityId: spec.id, reason: input.notes } });
    return result;
  });
  await NursePerformanceRepository.computeAndUpsertNurseScore(req.params.id);
  res.json({ success: true, data: result });
}));
export default router;
