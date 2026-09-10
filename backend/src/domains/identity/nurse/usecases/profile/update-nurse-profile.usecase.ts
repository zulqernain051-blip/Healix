import { NurseRepository } from '../../nurse.repository';
import { NurseProfilePolicy } from '../../policies/nurse-profile.policy';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants';

export class UpdateNurseProfileUseCase {
  public static async execute(nurseId: string, data: {
    bio?: string;
    experience?: number;
    photoUrl?: string;
    available?: boolean;
  }) {
    const nurse = await NurseRepository.findNurseById(nurseId);
    if (!nurse) {
      throw new AppError('Nurse profile not found', HTTP_STATUS.NOT_FOUND);
    }

    if (data.available === true) {
      const nurseToEvaluate = {
        ...nurse,
        bio: data.bio ?? nurse.bio,
        photoUrl: data.photoUrl ?? nurse.photoUrl
      };

      const eligibility = NurseProfilePolicy.checkAvailabilityEligibility(nurseToEvaluate);
      
      if (!eligibility.isEligible) {
        throw new AppError(
          `Profile is incomplete. Please add: ${eligibility.missing.join(', ')} before going available.`,
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    return NurseRepository.updateNurseProfile(nurseId, data);
  }
}
