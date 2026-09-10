import { NurseRepository } from '../../nurse.repository';
import { NurseVerificationRepository } from '../../repositories/nurse-verification.repository';
import { VerificationPolicy } from '../../policies/verification.policy';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants';

export class GetVerificationStatusUseCase {
  public static async execute(userId: string, nurseId: string) {
    const nurse = await NurseRepository.findNurseById(nurseId);
    if (!nurse) {
      throw new AppError('Nurse profile not found', HTTP_STATUS.NOT_FOUND);
    }
    const documents = await NurseVerificationRepository.findDocuments(userId);
    
    const checksMap = VerificationPolicy.buildVerificationStatusMap(documents);
    const allApproved = VerificationPolicy.isEligibleForActivation(documents);
    
    return {
      accountStatus: nurse.user.status,
      isFullyVerified: allApproved,
      checks: checksMap
    };
  }
}
