import { NurseRepository } from '../../nurse.repository';
import { NurseVerificationRepository } from '../../repositories/nurse-verification.repository';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants';

export class UploadDocumentUseCase {
  public static async execute(userId: string, nurseId: string, documentType: string, fileUrl: string) {
    const nurse = await NurseRepository.findNurseById(nurseId);
    if (!nurse) {
      throw new AppError('Nurse profile not found', HTTP_STATUS.NOT_FOUND);
    }
    const doc = await NurseVerificationRepository.upsertDocument(userId, documentType, fileUrl);
    return doc;
  }
}
