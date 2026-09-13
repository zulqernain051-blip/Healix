import { PrismaClient } from '@prisma/client';
import { ChatService } from './chat.service';

const prisma = new PrismaClient();

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
  static async onDoctorAssigned(caseAssignmentId: string, doctorUserId: string) {
    try {
      const caseRec = await prisma.caseAssignment.findUnique({
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
        await ChatService.getOrCreateThread(patientUserId, doctorUserId);
      }
    } catch (err: any) {
      console.error('[ChatAutoCreator] Failed to auto-create Patient-Doctor thread:', err.message);
    }
  }
}
