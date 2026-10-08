import { PatientRepository } from '../../patient.repository';
import { AppError } from '../../../../../common/errors/AppError';

export interface PatientActor { id: string; role: string; patient?: { id: string } | null }

export class AssertPatientAccessUseCase {
  static async execute(patientId: string, actor: PatientActor) {
    if (actor.role === 'ADMIN') return;
    if (actor.role === 'PATIENT' && actor.patient?.id === patientId) return;
    if (await PatientRepository.hasCareRelationship(patientId, actor.id, actor.role)) return;
    throw new AppError('You do not have access to this patient', 403);
  }
}
