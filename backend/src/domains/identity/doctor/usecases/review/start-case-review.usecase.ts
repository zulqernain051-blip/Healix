let getIo: any = () => undefined; try { const { ChatSocketService } = require("../../../communication/chat/chat.socket"); getIo = () => ChatSocketService.getIo(); } catch(e) {}
import { DoctorRepository } from '../../doctor.repository';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants/index';

export class StartCaseReviewUseCase {
  constructor(private readonly doctorRepository = DoctorRepository) {}

  async execute(caseId: string, doctorId: string) {
    const caseAssignment = await this.doctorRepository.findCaseById(caseId);
    if (!caseAssignment) {
      throw new AppError('Case not found', HTTP_STATUS.NOT_FOUND);
    }

    // Emergency Broadcast Acceptance Flow
    if (caseAssignment.status === 'PROFESSIONAL_BROADCAST' || caseAssignment.status === 'GENERAL_BROADCAST' || caseAssignment.status === 'ADMIN_ESCALATED') {
      await this.doctorRepository.findEligibleDoctorsWithWorkload(); // Minimal hack if needed.
      
      const result = await this.doctorRepository.acceptEmergencyCase(caseId, doctorId);
      if (!result) {
        throw new AppError('Case is no longer available. Another doctor has accepted this case.', HTTP_STATUS.CONFLICT);
      }
      
      
      const io = getIo();
      if (io) {
        io.emit('emergency_case_removed', { caseId }); // Notify all to remove from queue
      }
      return result;
    }

    // Normal Flow
    if (caseAssignment.doctorId !== doctorId) {
      throw new AppError('Unauthorized: This case is not assigned to you', HTTP_STATUS.FORBIDDEN);
    }
    if (caseAssignment.status !== 'ASSIGNED') {
      throw new AppError(`Cannot start review for case in status: ${caseAssignment.status}`, HTTP_STATUS.BAD_REQUEST);
    }

    const result = await this.doctorRepository.startReview(caseId, doctorId);
    if (result.count === 0) {
      throw new AppError('Failed to start review (case might have been reassigned)', HTTP_STATUS.CONFLICT);
    }
    
    return true;
  }
}
