import { Router } from 'express';
import { z } from 'zod';
import { createHash } from 'crypto';
import { prisma } from '../../../common/config/database';
import { asyncHandler } from '../../../common/middleware/asyncHandler';
import { AppError } from '../../../common/errors/AppError';
import { vitalsSchema, symptomSchema } from './visit.validation';

const router = Router();
const submission = z.discriminatedUnion('kind', [
  z.object({ id: z.string().uuid(), kind: z.literal('VITALS'), capturedAt: z.string().datetime(), data: vitalsSchema }),
  z.object({ id: z.string().uuid(), kind: z.literal('SYMPTOMS'), capturedAt: z.string().datetime(), data: symptomSchema })
]);
const symptomId = (id: string, index: number) => index === 0 ? id : createHash('sha256').update(`healix-symptom:${id}:${index}`).digest('hex').slice(0,32).replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
router.post('/visits/:visitId/clinical-sync', asyncHandler(async (req, res) => {
  const nurseId = (req as any).user?.nurse?.id;
  if (!nurseId) throw new AppError('Nurse access required', 403);
  const input = submission.parse(req.body);
  const capturedAt = new Date(input.capturedAt);
  if (capturedAt.getTime() > Date.now() + 5 * 60_000) throw new AppError('Capture time cannot be in the future', 400);
  const result = await prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM visits WHERE id = ${req.params.visitId} FOR UPDATE`;
    const visit = await tx.visit.findUnique({ where: { id: req.params.visitId } });
    if (!visit || visit.nurseId !== nurseId) throw new AppError('You do not have access to this visit', 403);
    const previousVitals = await tx.vitalsRecord.findUnique({ where: { id: input.id } });
    const previousSymptom = await tx.visitSymptom.findUnique({ where: { id: input.id } });
    if (previousVitals || previousSymptom) {
      if (input.kind === 'VITALS' && previousVitals && previousVitals.visitId === visit.id) {
        const { id, visitId, recordedAt, ...data } = previousVitals;
        if (same({ ...data, bloodSugar: data.bloodSugar ?? undefined }, { ...input.data, bloodSugar: input.data.bloodSugar }) && recordedAt.getTime() === capturedAt.getTime()) return { replayed: true };
      }
      if (input.kind === 'SYMPTOMS' && previousSymptom && previousSymptom.visitId === visit.id) {
        const rows = await tx.visitSymptom.findMany({ where: { id: { in: input.data.symptoms.map((_, i) => symptomId(input.id, i)) } } });
        const matches = rows.length === input.data.symptoms.length && input.data.symptoms.every((item, i) => {
          const row = rows.find(r => r.id === symptomId(input.id, i));
          return row && row.visitId === visit.id && row.createdAt.getTime() === capturedAt.getTime() && row.symptomName === item.symptomName && row.severity === item.severity && (row.bodySystem ?? undefined) === item.bodySystem && (row.notes ?? undefined) === item.notes;
        });
        if (matches) return { replayed: true };
      }
      throw new AppError('Submission identifier already used with different data', 409);
    }
    if (visit.status !== 'IN_PROGRESS') throw new AppError('Visit must still be in progress. Review this draft with your care team.', 409);
    if (!visit.startedAt || capturedAt.getTime() < visit.startedAt.getTime()) throw new AppError('Capture time must be after the visit started', 400);
    if (input.kind === 'VITALS') await tx.vitalsRecord.create({ data: { id: input.id, visitId: visit.id, recordedAt: capturedAt, ...input.data } });
    else await tx.visitSymptom.createMany({ data: input.data.symptoms.map((item, i) => ({ id: symptomId(input.id, i), visitId: visit.id, createdAt: capturedAt, ...item })) });
    return { replayed: false };
  });
  res.json({ success: true, data: { ...result, id: input.id, queued: false, message: 'Clinical observation saved' } });
}));
export default router;
