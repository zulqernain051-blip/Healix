import { AppError } from '../../../../../common/errors/AppError';

export interface VisitActor {
  id: string;
  role: string;
  patient?: { id: string } | null;
  nurse?: { id: string } | null;
  doctor?: { id: string } | null;
}

export class VisitAccessPolicy {
  static assertCanRead(visit: { nurseId: string | null; doctorId: string | null; request: { patientId: string }; caseAssignment?: { doctorId: string | null; secondOpinions?: { consultedDoctorId: string }[] } | null }, actor: VisitActor) {
    if (actor.role === 'ADMIN') return;
    if (actor.role === 'PATIENT' && actor.patient?.id === visit.request.patientId) return;
    if (actor.role === 'NURSE' && actor.nurse?.id && actor.nurse.id === visit.nurseId) return;
    if (actor.role === 'DOCTOR' && actor.doctor?.id && actor.doctor.id === visit.doctorId) return;
    if (actor.role === 'DOCTOR' && actor.doctor?.id && (actor.doctor.id === visit.caseAssignment?.doctorId || visit.caseAssignment?.secondOpinions?.some(opinion => opinion.consultedDoctorId === actor.doctor!.id))) return;
    throw new AppError('You do not have access to this visit', 403);
  }

  static assertOwnNurse(nurseId: string, actor: VisitActor) {
    if (actor.role === 'ADMIN') return;
    if (actor.role === 'NURSE' && actor.nurse?.id === nurseId) return;
    throw new AppError('You do not have access to this nurse schedule', 403);
  }
}
