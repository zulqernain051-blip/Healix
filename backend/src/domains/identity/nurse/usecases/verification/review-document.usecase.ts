import { NurseVerificationRepository } from '../../repositories/nurse-verification.repository';
import { VerificationPolicy } from '../../policies/verification.policy';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants';

export class ReviewDocumentUseCase {
  public static async execute(documentId: string, status: 'APPROVED' | 'REJECTED', rejectionReason?: string) {
    const doc = await NurseVerificationRepository.findDocumentById(documentId);
    if (!doc) {
      throw new AppError('Document not found', HTTP_STATUS.NOT_FOUND);
    }

    const reviewed = await NurseVerificationRepository.reviewDocument(documentId, status, rejectionReason);

    if (status === 'APPROVED') {
      const allDocs = await NurseVerificationRepository.findDocuments(doc.userId);
      // Temporarily update the currently reviewed doc in the array so the policy check uses the new status
      const updatedDocs = allDocs.map(d => d.id === documentId ? reviewed : d);
      
      const allApproved = VerificationPolicy.isEligibleForActivation(updatedDocs);
      if (allApproved) {
        await NurseVerificationRepository.updateUserStatus(doc.userId, 'ACTIVE');
      }
    }
    return reviewed;
  }
}
