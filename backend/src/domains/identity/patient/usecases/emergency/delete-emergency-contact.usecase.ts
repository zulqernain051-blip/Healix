import { PatientRepository } from '../../patient.repository';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants';

export class DeleteEmergencyContactUseCase {
  constructor(private readonly patientRepository = PatientRepository) {}

  async execute(patientId: string, contactId: string) {
    const contact = await this.patientRepository.findEmergencyContactById(contactId);
    if (!contact) {
      throw new AppError('Emergency contact not found', HTTP_STATUS.NOT_FOUND);
    }
    if (contact.patientId !== patientId) {
      throw new AppError('Unauthorized contact access', HTTP_STATUS.FORBIDDEN);
    }
    return this.patientRepository.deleteEmergencyContact(contactId);
  }
}
