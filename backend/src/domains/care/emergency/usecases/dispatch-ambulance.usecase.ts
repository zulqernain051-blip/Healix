import { EmergencyRepository } from '../emergency.repository';
import { AppError } from '../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../common/constants/index';

export class DispatchAmbulanceUseCase {
  async execute(patientId: string, visitId: string | undefined, doctorId: string, doctorUserId: string, tx?: any) {
    // 1. Prevent duplicate active dispatches
    const activeDispatch = await EmergencyRepository.findActiveDispatchForPatient(patientId);
    if (activeDispatch) {
      throw new AppError('An active ambulance dispatch already exists for this patient.', HTTP_STATUS.CONFLICT);
    }

    // 2. Create Emergency Workflow (Event + Dispatch)
    const result = await EmergencyRepository.createEmergencyWorkflow({
      patientId,
      visitId,
      doctorId,
      doctorUserId
    }, tx);

    return result;
  }
}
