import { PatientRepository } from '../../patient.repository';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants';

export class SearchUserUseCase {
  constructor(private readonly patientRepository = PatientRepository) {}

  async execute(phoneQuery: string) {
    let rawPhone = phoneQuery.trim().replace(/[\s-]/g, '');
    if (!rawPhone) {
      throw new AppError('Phone number query is required', HTTP_STATUS.BAD_REQUEST);
    }

    // Strip country code or local zero prefixes so we have the base number
    if (rawPhone.startsWith('+92')) rawPhone = rawPhone.slice(3);
    else if (rawPhone.startsWith('0092')) rawPhone = rawPhone.slice(4);
    else if (rawPhone.startsWith('92')) rawPhone = rawPhone.slice(2);
    else if (rawPhone.startsWith('0')) rawPhone = rawPhone.slice(1);

    if (rawPhone.length < 10) return [];
    
    // Check possible registered formats
    const variants = [
      '0' + rawPhone,
      '+92' + rawPhone,
      '92' + rawPhone,
      rawPhone
    ];
    
    const users = await this.patientRepository.findUserByExactPhone(variants);
    
    // Always return array, frontend will handle empty state
    return users;
  }
}
