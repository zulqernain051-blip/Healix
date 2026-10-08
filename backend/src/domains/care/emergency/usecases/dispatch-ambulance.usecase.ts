import { EmergencyRepository } from '../emergency.repository';
import { AppError } from '../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../common/constants/index';
import { prisma } from '../../../../common/config/database';

export class DispatchAmbulanceUseCase {
  async execute(patientId: string, visitId: string | undefined, doctorId: string, doctorUserId: string, tx?: any, hospitalId?: string, notes?: string) {
    const db = tx || prisma;

    // 1. Prevent duplicate active dispatches for the patient
    const activeDispatch = await EmergencyRepository.findActiveDispatchForPatient(patientId, db);
    if (activeDispatch) {
      throw new AppError('An active ambulance dispatch already exists for this patient.', HTTP_STATUS.CONFLICT);
    }

    // 2. Create Emergency Workflow (EmergencyEvent + AmbulanceDispatch + Ambulance + Paramedic)
    const result = await EmergencyRepository.createEmergencyWorkflow({
      patientId,
      visitId,
      doctorId,
      doctorUserId,
      hospitalId,
      notes
    }, tx);

    // Communication is delivered by the outbox after the dispatch transaction commits.
    return result;
  }
}
