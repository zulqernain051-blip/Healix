import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../../common/config/database';
import { asyncHandler } from '../../../common/middleware/asyncHandler';
import { AppError } from '../../../common/errors/AppError';
import { AssertPatientAccessUseCase } from '../../identity/patient/usecases/profile/assert-patient-access.usecase';
const router = Router();
const canRecord = (actor: any) => { if (!['PATIENT','NURSE','DOCTOR','ADMIN'].includes(actor.role) || (actor.role === 'DOCTOR' && actor.doctor?.verificationStatus !== 'VERIFIED')) throw new AppError('Patient or verified care-team access required', 403); };
const changes = z.object({ version: z.number().int().positive(), reason: z.string().trim().min(10).max(2000), title: z.string().trim().min(3).max(200), description: z.string().trim().max(10000).optional(), milestones: z.array(z.object({ id: z.string().uuid().optional(), title: z.string().trim().min(3).max(500), targetDate: z.string().datetime() })).min(1).max(100) });
router.get('/care-plans/:id/history', asyncHandler(async (req, res) => {
 const plan = await prisma.carePlan.findUnique({ where: { id: req.params.id }, include: { milestones: true } });
 if (!plan) throw new AppError('Care plan not found', 404);
 await AssertPatientAccessUseCase.execute(plan.patientId, (req as any).user);
 const history = await prisma.carePlanVersion.findMany({ where: { carePlanId: plan.id }, orderBy: { version: 'desc' } });
 res.json({ success: true, data: { current: plan, history } });
}));
router.put('/care-plans/:id', asyncHandler(async (req, res) => {
 const actor = (req as any).user; const input = changes.parse(req.body);
 if (actor.role !== 'DOCTOR' || actor.doctor?.verificationStatus !== 'VERIFIED') throw new AppError('Verified doctor access required', 403);
 const result = await prisma.$transaction(async tx => {
  await tx.$queryRaw`SELECT id FROM care_plans WHERE id = ${req.params.id} FOR UPDATE`;
  const plan = await tx.carePlan.findUnique({ where: { id: req.params.id }, include: { milestones: true } });
  if (!plan) throw new AppError('Care plan not found', 404);
  if (plan.doctorId !== actor.doctor.id) throw new AppError('Only the doctor who owns this plan can revise it', 403);
  if (plan.version !== input.version) throw new AppError('The care plan changed. Reload before saving.', 409);
  const ids = input.milestones.flatMap(item => item.id ? [item.id] : []);
  if (new Set(ids).size !== ids.length || ids.some(id => !plan.milestones.some(item => item.id === id))) throw new AppError('Milestones must belong to this care plan', 400);
  if (plan.milestones.some(item => item.completed && !ids.includes(item.id))) throw new AppError('Completed milestones must be preserved', 409);
  await tx.carePlanVersion.upsert({ where: { carePlanId_version: { carePlanId: plan.id, version: plan.version } }, create: { carePlanId: plan.id, version: plan.version, changedBy: actor.id, reason: 'Plan before revision', snapshot: JSON.parse(JSON.stringify(plan)) }, update: {} });
  await tx.carePlanMilestone.deleteMany({ where: { carePlanId: plan.id, id: { notIn: ids }, completed: false } });
  for (const item of input.milestones) {
   if (item.id) await tx.carePlanMilestone.update({ where: { id: item.id }, data: { title: item.title, targetDate: new Date(item.targetDate) } });
   else await tx.carePlanMilestone.create({ data: { carePlanId: plan.id, title: item.title, targetDate: new Date(item.targetDate) } });
  }
  const milestones = await tx.carePlanMilestone.findMany({ where: { carePlanId: plan.id } });
  const progress = milestones.filter(item => item.completed).length / milestones.length * 100;
  const updated = await tx.carePlan.update({ where: { id: plan.id }, data: { title: input.title, description: input.description, version: { increment: 1 }, progress, status: progress === 100 ? 'COMPLETED' : 'ACTIVE' }, include: { milestones: true } });
  await tx.carePlanVersion.create({ data: { carePlanId: plan.id, version: updated.version, changedBy: actor.id, reason: input.reason, snapshot: JSON.parse(JSON.stringify(updated)) } });
  return updated;
 });
 res.json({ success: true, data: result });
}));
router.get('/patients/:id/medication-doses', asyncHandler(async (req, res) => {
 await AssertPatientAccessUseCase.execute(req.params.id, (req as any).user);
 const { page, limit } = z.object({ page: z.coerce.number().int().min(1).max(100000).default(1), limit: z.coerce.number().int().min(1).max(200).default(100) }).parse(req.query);
 const where = { medication: { patientId: req.params.id }, scheduledAt: { gte: new Date(Date.now() - 30 * 86400000), lte: new Date(Date.now() + 90 * 86400000) } };
 const [items, total] = await Promise.all([prisma.medicationDose.findMany({ where, include: { medication: true, log: true }, orderBy: [{ scheduledAt: 'asc' }, { id: 'asc' }], take: limit, skip: (page - 1) * limit }), prisma.medicationDose.count({ where })]);
 res.json({ success: true, data: { items, total, page, limit } });
}));
router.post('/patients/:id/medications/:medicationId/schedule', asyncHandler(async (req, res) => {
 canRecord((req as any).user);
 await AssertPatientAccessUseCase.execute(req.params.id, (req as any).user);
 const { times } = z.object({ times: z.array(z.string().datetime()).min(1).max(720) }).parse(req.body);
 const dates = times.map(value => new Date(value)); const now = Date.now();
 if (dates.some(date => date.getTime() < now - 60_000 || date.getTime() > now + 90 * 86400000)) throw new AppError('Schedule doses within the next 90 days', 400);
 const medication = await prisma.medication.findFirst({ where: { id: req.params.medicationId, patientId: req.params.id, active: true } });
 if (!medication) throw new AppError('Active medication not found for this patient', 404);
 const result = await prisma.medicationDose.createMany({ data: dates.map(scheduledAt => ({ medicationId: medication.id, scheduledAt })), skipDuplicates: true });
 res.status(201).json({ success: true, data: { added: result.count } });
}));
router.put('/patients/:id/medication-doses/:doseId', asyncHandler(async (req, res) => {
 const actor = (req as any).user; canRecord(actor);
 await AssertPatientAccessUseCase.execute(req.params.id, actor);
 const input = z.object({ status: z.enum(['TAKEN', 'SKIPPED']), takenAt: z.string().datetime().optional() }).parse(req.body);
 const data = await prisma.$transaction(async tx => {
  await tx.$queryRaw`SELECT id FROM medication_doses WHERE id = ${req.params.doseId} FOR UPDATE`;
  const dose = await tx.medicationDose.findUnique({ where: { id: req.params.doseId }, include: { medication: true, log: true } });
  if (!dose || dose.medication.patientId !== req.params.id) throw new AppError('Scheduled dose not found for this patient', 404);
  if (dose.scheduledAt.getTime() > Date.now() + 5 * 60_000) throw new AppError('This dose is not due yet', 409);
  if (dose.log) { if (input.status === 'TAKEN') return dose; throw new AppError('A recorded taken dose cannot be marked skipped', 409); }
  const takenAt = input.takenAt ? new Date(input.takenAt) : new Date();
  if (takenAt.getTime() > Date.now() + 5 * 60_000 || takenAt.getTime() < dose.scheduledAt.getTime() - 5 * 60_000) throw new AppError('Taken time must be at or after the scheduled dose and cannot be in the future', 400);
  if (input.status === 'TAKEN') await tx.medicationLog.create({ data: { scheduledDoseId: dose.id, medicationId: dose.medicationId, patientId: req.params.id, takenAt, selfReported: actor.role === 'PATIENT' } });
  return tx.medicationDose.update({ where: { id: dose.id }, data: { status: input.status }, include: { log: true } });
 });
 res.json({ success: true, data });
}));
export default router;
