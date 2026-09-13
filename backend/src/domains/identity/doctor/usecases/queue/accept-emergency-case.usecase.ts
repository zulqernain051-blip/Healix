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
    
    // Auto-create Chat Thread for Doctor Assignment
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      const doctor = await prisma.doctor.findUnique({ where: { id: doctorId }, select: { userId: true } });
      if (doctor?.userId) {
        const { ChatAutoCreator } = require('../../../../communication/chat/chat.auto-creator');
        await ChatAutoCreator.onDoctorAssigned(caseId, doctor.userId);
      }
    } catch (e) {}
    
    const io = getIo();
    if (io) {
      io.emit('emergency_case_removed', { caseId });
    }
    return updated;
  }
}
