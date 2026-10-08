import { prisma } from '../../../../../common/config/database';
import { AssertPatientAccessUseCase, PatientActor } from '../../../../identity/patient/usecases/profile/assert-patient-access.usecase';
const DAY = 86400000;
export class GetComplianceMetricsUseCase {
 async execute(patientId: string, actor: PatientActor) {
  await AssertPatientAccessUseCase.execute(patientId, actor);
  const now = new Date(), since = new Date(now.getTime() - 30 * DAY), previous = new Date(now.getTime() - 60 * DAY);
  const [visits, doses] = await Promise.all([
   prisma.visit.findMany({ where: { request: { patientId }, status: { notIn: ['CANCELLED', 'DECLINED'] }, OR: [{ agreedStartTime: { gte: previous, lte: now } }, { agreedStartTime: null, request: { scheduledAt: { gte: previous, lte: now } } }] }, select: { status: true, agreedStartTime: true, request: { select: { scheduledAt: true } } } }),
   prisma.medicationDose.findMany({ where: { medication: { patientId }, scheduledAt: { gte: since, lte: now } }, include: { log: true } })
  ]);
  const currentVisits = visits.filter(visit => (visit.agreedStartTime || visit.request.scheduledAt)!.getTime() >= since.getTime());
  const priorVisits = visits.filter(visit => (visit.agreedStartTime || visit.request.scheduledAt)!.getTime() < since.getTime());
  const completedVisits = currentVisits.filter(visit => visit.status === 'COMPLETED').length;
  const ratio = (done: number, total: number) => total ? Math.round(done / total * 100) : null;
  const visitCompliance = ratio(completedVisits, currentVisits.length);
  const priorRatio = ratio(priorVisits.filter(visit => visit.status === 'COMPLETED').length, priorVisits.length);
  const takenDoses = doses.filter(dose => dose.status === 'TAKEN' && dose.log).length;
  const timelyDoses = doses.filter(dose => dose.log && Math.abs(dose.log.takenAt.getTime() - dose.scheduledAt.getTime()) <= 2 * 3600000).length;
  return {
   visitCompliance, medicationCompliance: ratio(takenDoses, doses.length), medicationTimingCompliance: ratio(timelyDoses, doses.length),
   completedVisits, dueVisits: currentVisits.length, takenDoses, dueDoses: doses.length,
   medicationTimingBasis: 'Recorded within two hours of the scheduled time; an informational measure, not a clinical dosing recommendation',
   unscheduledMedications: await prisma.medication.count({ where: { patientId, active: true, scheduledDoses: { none: {} } } }),
   complianceFlag: visitCompliance == null ? 'NO_DATA' : visitCompliance < 70 ? 'AT_RISK' : 'ON_TRACK',
   trend: visitCompliance == null || priorRatio == null ? 'INSUFFICIENT_DATA' : visitCompliance - priorRatio > 5 ? 'UP' : priorRatio - visitCompliance > 5 ? 'DOWN' : 'STABLE',
   period: { start: since.toISOString(), end: now.toISOString() }
  };
 }
}
