import { PatientRepository } from '../../patient.repository';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants';

export class UpdateProfileUseCase {
  constructor(private readonly patientRepository = PatientRepository) {}

  async execute(patientId: string, userId: string, payload: any) {
    const patient = await this.patientRepository.findPatientById(patientId);
    if (!patient) {
      throw new AppError('Patient profile not found', HTTP_STATUS.NOT_FOUND);
    }

    const patientData: any = {};
    if (payload.dob !== undefined) patientData.dob = payload.dob;
    if (payload.gender !== undefined) patientData.gender = payload.gender;
    if (payload.address !== undefined) patientData.address = payload.address;
    if (payload.city !== undefined) patientData.city = payload.city;
    if (payload.photoUrl !== undefined) patientData.photoUrl = payload.photoUrl;

    if (payload.address && payload.address !== patient.address && payload.latitude === undefined && payload.longitude === undefined) {
      patientData.latitude = null;
      patientData.longitude = null;
    } else {
      if (payload.latitude !== undefined) patientData.latitude = payload.latitude;
      if (payload.longitude !== undefined) patientData.longitude = payload.longitude;
    }

    const userData: any = {};
    if (payload.fullName !== undefined) userData.fullName = payload.fullName;

    return this.patientRepository.updatePatientProfile(patientId, userId, patientData, userData);
  }
}
