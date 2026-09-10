import { CareRequestRepository } from '../../repository/care-request.repository';
import { CreateCareRequestDto } from '../../dto/create-care-request.dto';
import { PatientRepository } from '../../../../identity/patient/patient.repository';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants';


export class CreateCareRequestUseCase {
  public async execute(userId: string, data: CreateCareRequestDto) {
    // 1. Resolve Patient
    const patient = await PatientRepository.findPatientByUserId(userId);
    if (!patient) {
      throw new AppError('Patient profile not found', HTTP_STATUS.NOT_FOUND);
    }

    data.patientId = patient.id;

    // 2. Validate business conditions
    if (data.durationMinutes <= 0 || data.durationMinutes > 1440) {
      throw new AppError('Invalid duration', HTTP_STATUS.BAD_REQUEST);
    }

    // 3. Normalize input
    if (data.notes) data.notes = data.notes.trim();
    if (data.requirements) data.requirements = data.requirements.trim();
    if (data.location?.address) data.location.address = data.location.address.trim();

    // 4. Resolve fallback location
    const fallbackLocation = {
      address: patient.address || 'Unknown Address',
      latitude: patient.latitude || 0,
      longitude: patient.longitude || 0
    };

    // 5. Duplicate Protection Check
    const duplicate = await CareRequestRepository.findSimilarActiveRequest(data, fallbackLocation);
    if (duplicate) {
      // Basic time threshold check (e.g., created within the last hour) to avoid blocking legitimately identical recurring requests months apart
      const ONE_HOUR = 60 * 60 * 1000;
      if (Date.now() - duplicate.createdAt.getTime() < ONE_HOUR) {
        throw new AppError(
          'A similar active care request already exists. Please review your pending requests before submitting a new one.',
          HTTP_STATUS.CONFLICT
        );
      }
    }

    // 6. Determine initial priority
    const priority = 'ROUTINE'; 

    // 7. Create Care Request (transactionally creates CARE_REQUEST_CREATED outbox event)
    const request = await CareRequestRepository.createCareRequest(data, priority, fallbackLocation);

    return request;
  }
}
