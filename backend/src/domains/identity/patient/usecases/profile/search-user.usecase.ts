import { PatientRepository } from '../../patient.repository';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants';

export class SearchUserUseCase {
  constructor(private readonly patientRepository = PatientRepository) {}

  async execute(phoneQuery: string) {
    const cleanPhone = phoneQuery.trim();
    if (!cleanPhone) {
      throw new AppError('Phone number query is required', HTTP_STATUS.BAD_REQUEST);
    }
    const user = await this.patientRepository.findUserByPhoneLike(cleanPhone);
    if (!user) {
      throw new AppError('No user registered with this phone number on Healix', HTTP_STATUS.NOT_FOUND);
    }
    return user;
  }
}
