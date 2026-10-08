import { prisma } from '../../../common/config/database';
import { ChatService } from './chat.service';


export class ChatAutoCreator {
  /**
   * Automatically creates a chat thread between a Patient and a Nurse when a contract activates.
   * Catches errors to not block the main workflow.
   */
  static async onNurseAssigned(patientId: string, nurseId: string) {
    try {
      const patient = await prisma.patient.findUnique({ where: { id: patientId }, select: { userId: true } });
      const nurse = await prisma.nurse.findUnique({ where: { id: nurseId }, select: { userId: true } });
      
      if (patient?.userId && nurse?.userId) {
        await ChatService.getOrCreateThread(patient.userId, nurse.userId);
      }
    } catch (err: any) {
      console.error('[ChatAutoCreator] Failed to auto-create Patient-Nurse thread:', err.message);
    }
  }

  /**
   * Automatically creates a chat thread between a Patient and a Doctor when a case is assigned.
   */
  static async onDoctorAssigned(caseAssignmentId: string, doctorUserId: string, tx?: any) {
    try {
      const caseRec = await (tx || prisma).caseAssignment.findUnique({
        where: { id: caseAssignmentId },
        include: {
          visit: {
            include: {
              request: {
                select: { patient: { select: { userId: true } } }
              }
            }
          }
        }
      });
      
      const patientUserId = caseRec?.visit?.request?.patient?.userId;
      if (patientUserId && doctorUserId) {
        if (tx) {
          const [participantAId, participantBId] = [patientUserId, doctorUserId].sort();
          await tx.chatThread.upsert({ where: { participantAId_participantBId: { participantAId, participantBId } }, create: { type: 'PATIENT_DOCTOR', participantAId, participantBId, caseAssignmentId }, update: { caseAssignmentId, readOnly: false } });
        } else await ChatService.getOrCreateThread(patientUserId, doctorUserId);
      }
    } catch (err: any) {
      console.error('[ChatAutoCreator] Failed to auto-create Patient-Doctor thread:', err.message);
    }
  }

  /**
   * Automatically creates chat threads between Patient <-> Paramedic and Nurse <-> Paramedic when a paramedic is assigned.
   */
  static async onParamedicAssigned(paramedicUserId: string, patientUserId: string, nurseUserId?: string) {
    try {
      if (paramedicUserId && patientUserId) {
        await ChatService.getOrCreateThread(patientUserId, paramedicUserId);
      }
      if (paramedicUserId && nurseUserId) {
        await ChatService.getOrCreateThread(nurseUserId, paramedicUserId);
      }
    } catch (err: any) {
      console.error('[ChatAutoCreator] Failed to auto-create Paramedic chat threads:', err.message);
    }
  }
}
