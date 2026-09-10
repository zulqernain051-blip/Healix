import { DoctorRepository } from '../../doctor.repository';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants/index';

let getIo: any = () => undefined; try { const { ChatSocketService } = require("../../../../../communication/chat/chat.socket"); getIo = () => ChatSocketService.getIo(); } catch(e) {}

export class AcceptEmergencyCaseUseCase {
  constructor(private readonly doctorRepository = DoctorRepository) {}

  async execute(caseId: string, doctorId: string) {
    const updated = await this.doctorRepository.acceptEmergencyCase(caseId, doctorId);
    if (!updated) {
      throw new AppError('Case is no longer available or not broadcasted', HTTP_STATUS.BAD_REQUEST);
    }
    
    const io = getIo();
    if (io) {
      io.emit('emergency_case_removed', { caseId });
    }
    return updated;
  }
}
