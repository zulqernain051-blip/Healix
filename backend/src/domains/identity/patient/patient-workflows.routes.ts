import { Router } from 'express';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { prisma } from '../../../common/config/database';
import { asyncHandler } from '../../../common/middleware/asyncHandler';
import { AppError } from '../../../common/errors/AppError';
import { textPdf } from '../../../common/utils/text-pdf';
const router = Router();
function owner(req: any): string {
  if (req.user?.role !== 'PATIENT' || req.user.patient?.id !== req.params.id) throw new AppError('Only the patient can manage this record', 403);
  return req.params.id;
}
router.get('/:id/prescriptions/:prescriptionId/pdf', asyncHandler(async (req, res) => {
  const patientId = owner(req);
  const rx = await prisma.prescription.findFirst({ where: { id: req.params.prescriptionId, patientId }, include: { items: true, patient: { include: { user: { select: { fullName: true } } } }, doctor: { include: { user: { select: { fullName: true } } } } } });
  if (!rx) throw new AppError('Prescription not found', 404);
  const lines = ['HEALIX - PRESCRIPTION', `Record: ${rx.id}`, `Patient: ${rx.patient.user.fullName}`, `Doctor: ${rx.doctor.user.fullName}`, `PMDC: ${rx.doctor.pmdcNumber}`, `Issued: ${rx.prescribedAt.toISOString()}`, '', ...rx.items.flatMap((item, i) => [`${i + 1}. ${item.medicationName}`, `Dosage: ${item.dosage}; Frequency: ${item.frequency}; Duration: ${item.durationDays} days`, '']), 'Instructions:', rx.instructions || 'No additional instructions recorded.'];
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="healix-prescription-${rx.id}.pdf"`);
  res.setHeader('Cache-Control', 'private, no-store');
  res.send(textPdf(lines));
}));
router.get('/:id/payments', asyncHandler(async (req, res) => {
  const patientId = owner(req);
  const payments = await prisma.payment.findMany({ where: { request: { patientId } }, include: { request: { select: { type: true, scheduledAt: true } } }, orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data: payments });
}));
router.get('/:id/home-visits/doctors', asyncHandler(async (req, res) => {
  owner(req);
  const doctors = await prisma.doctor.findMany({ where: { verificationStatus: 'VERIFIED', user: { status: 'ACTIVE' } }, select: { id: true, pmdcNumber: true, user: { select: { fullName: true } } }, orderBy: { user: { fullName: 'asc' } } });
  res.json({ success: true, data: doctors });
}));
router.get('/:id/home-visits', asyncHandler(async (req, res) => {
  const visits = await prisma.doctor_home_visits.findMany({ where: { patientId: owner(req) }, include: { doctors: { select: { user: { select: { fullName: true } } } } }, orderBy: { scheduledAt: 'desc' } });
  res.json({ success: true, data: visits });
}));
router.post('/:id/home-visits', asyncHandler(async (req, res) => {
  const patientId = owner(req);
  const parsed = z.object({ doctorId: z.string().uuid(), scheduledAt: z.string().datetime() }).safeParse(req.body);
  if (!parsed.success || Date.parse(parsed.data.scheduledAt) <= Date.now()) throw new AppError('Choose a doctor and a future visit date/time', 400);
  const doctor = await prisma.doctor.findFirst({ where: { id: parsed.data.doctorId, verificationStatus: 'VERIFIED', user: { status: 'ACTIVE' } } });
  if (!doctor) throw new AppError('Doctor is unavailable', 400);
  const visit = await prisma.doctor_home_visits.create({ data: { id: randomUUID(), patientId, doctorId: doctor.id, scheduledAt: new Date(parsed.data.scheduledAt), status: 'REQUESTED' } });
  res.status(201).json({ success: true, data: visit });
}));
router.put('/:id/home-visits/:visitId/cancel', asyncHandler(async (req, res) => {
  const patientId = owner(req);
  const changed = await prisma.doctor_home_visits.updateMany({ where: { id: req.params.visitId, patientId, status: { in: ['REQUESTED', 'SCHEDULED'] } }, data: { status: 'CANCELLED' } });
  if (!changed.count) throw new AppError('Visit cannot be cancelled or does not belong to you', 409);
  res.json({ success: true, data: { status: 'CANCELLED' } });
}));
export default router;
