import { Router } from 'express';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { prisma } from '../../../common/config/database';
import { asyncHandler } from '../../../common/middleware/asyncHandler';
import { AppError } from '../../../common/errors/AppError';

const router = Router();
const prefix = '/doctors/home-visits';
function doctorId(req: any) {
  if (req.user?.role !== 'DOCTOR' || req.user.doctor?.verificationStatus !== 'VERIFIED') throw new AppError('Verified doctor access required', 403);
  return req.user.doctor.id as string;
}
const createSchema = z.object({ patientId: z.string().uuid(), scheduledAt: z.string().datetime() });
const updateSchema = z.object({ status: z.enum(['SCHEDULED', 'EN_ROUTE', 'ARRIVED', 'COMPLETED', 'CANCELLED']), findings: z.string().trim().max(10000).optional(), outcomeNotes: z.string().trim().max(10000).optional() });
export const HOME_VISIT_TRANSITIONS: Record<string, string[]> = {
  REQUESTED: ['SCHEDULED', 'CANCELLED'], SCHEDULED: ['EN_ROUTE', 'CANCELLED'], EN_ROUTE: ['ARRIVED', 'CANCELLED'], ARRIVED: ['COMPLETED', 'CANCELLED'], COMPLETED: [], CANCELLED: [],
};
router.get(prefix, asyncHandler(async (req, res) => {
  const visits = await prisma.doctor_home_visits.findMany({ where: { doctorId: doctorId(req) }, include: { patients: { include: { user: { select: { fullName: true } } } } }, orderBy: { scheduledAt: 'asc' } });
  res.json({ success: true, data: visits });
}));
router.get(`${prefix}/patients`, asyncHandler(async (req, res) => {
  const patients = await prisma.patient.findMany({ where: { careRequests: { some: { visits: { some: { caseAssignment: { doctorId: doctorId(req) } } } } } }, select: { id: true, user: { select: { fullName: true } } }, orderBy: { user: { fullName: 'asc' } } });
  res.json({ success: true, data: patients });
}));
router.post(prefix, asyncHandler(async (req, res) => {
  const owner = doctorId(req);
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError('Select a patient and a valid scheduled date/time', 400);
  if (Date.parse(parsed.data.scheduledAt) <= Date.now()) throw new AppError('Visit must be scheduled in the future', 400);
  const relationship = await prisma.caseAssignment.findFirst({ where: { doctorId: owner, visit: { request: { patientId: parsed.data.patientId } } } });
  if (!relationship) throw new AppError('Select a patient from your assigned cases', 403);
  const visit = await prisma.doctor_home_visits.create({ data: { id: randomUUID(), doctorId: owner, patientId: parsed.data.patientId, scheduledAt: new Date(parsed.data.scheduledAt) } });
  res.status(201).json({ success: true, data: visit });
}));
router.put(`${prefix}/:id`, asyncHandler(async (req, res) => {
  const owner = doctorId(req);
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError('Invalid visit status or clinical notes', 400);
  const result = await prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT "id" FROM "doctor_home_visits" WHERE "id" = ${req.params.id} FOR UPDATE`;
    const visit = await tx.doctor_home_visits.findUnique({ where: { id: req.params.id } });
    if (!visit) throw new AppError('Visit not found', 404);
    if (visit.doctorId !== owner) throw new AppError('This visit belongs to another doctor', 403);
    if (!HOME_VISIT_TRANSITIONS[visit.status]?.includes(parsed.data.status)) throw new AppError(`Cannot change visit from ${visit.status} to ${parsed.data.status}`, 409);
    if (parsed.data.status === 'SCHEDULED' && visit.scheduledAt.getTime() <= Date.now()) throw new AppError('Requested visit time has passed; decline the request and ask the patient to request a future time', 409);
    if (parsed.data.status === 'COMPLETED' && !parsed.data.findings?.trim()) throw new AppError('Record clinical findings before completing the visit', 400);
    return tx.doctor_home_visits.update({ where: { id: visit.id }, data: parsed.data });
  });
  res.json({ success: true, data: result });
}));
export default router;
