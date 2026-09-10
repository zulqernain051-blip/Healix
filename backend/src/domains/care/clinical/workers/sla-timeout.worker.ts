let getIo: any = () => undefined; try { const { ChatSocketService } = require("../../../communication/chat/chat.socket"); getIo = () => ChatSocketService.getIo(); } catch(e) {}
import { prisma } from '../../../../common/config/database';
import { DoctorRepository } from '../../../identity/doctor/doctor.repository';

export class SlaTimeoutWorker {
  public static async processTimeouts() {
    const now = new Date();

    // 1. Check for 5-minute timeout (PROFESSIONAL_BROADCAST -> GENERAL_BROADCAST)
    const fiveMinBreaches = await prisma.caseAssignment.findMany({
      where: {
        status: 'PROFESSIONAL_BROADCAST',
        riskTier: { in: ['HIGH', 'CRITICAL'] },
        slaDeadline: { lt: now }
      }
    });

    for (const caseData of fiveMinBreaches) {
      try {
        await prisma.$transaction(async (tx) => {
          // Lock row
          const lockedCases = await tx.$queryRaw<any[]>`SELECT * FROM "case_assignments" WHERE "id" = ${caseData.id} FOR UPDATE`;
          if (!lockedCases || lockedCases.length === 0) return;
          if (lockedCases[0].status !== 'PROFESSIONAL_BROADCAST') return;

          // Transition to GENERAL_BROADCAST
          await tx.caseAssignment.update({
            where: { id: caseData.id },
            data: { status: 'GENERAL_BROADCAST' }
          });

          await tx.assignmentLog.create({
            data: {
              visitId: caseData.visitId,
              method: 'AUTO',
              assignedTo: 'SYSTEM',
              reason: 'SLA_TIMEOUT: Case escalated to GENERAL_BROADCAST (Professional 5min limit reached)'
            }
          });

          // Generate admin alert
          const admins = await tx.administrator.findMany({ include: { user: true } });
          
          const io = getIo();
          
          if (io) {
            admins.forEach((admin: any) => {
              io.to(`user:${admin.userId}`).emit('admin_emergency_alert', {
                caseId: caseData.id,
                message: `HIGH/CRITICAL case has not been accepted by a professional doctor within 5 minutes.`
              });
            });

            // Notify all verified doctors (general broadcast)
            let eligibleDoctors = await DoctorRepository.findEligibleDoctorsWithWorkload(tx, caseData.riskTier);
            const currentDay = now.getDay();
            const currentHourStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
            eligibleDoctors = eligibleDoctors.filter((doc: any) => {
              if (!doc.availabilities || doc.availabilities.length === 0) return true;
              return doc.availabilities.some((slot: any) => slot.isActive && slot.dayOfWeek === currentDay && currentHourStr >= slot.startTime && currentHourStr <= slot.endTime);
            });
            // Standard + Professional
            eligibleDoctors.forEach((doc: any) => {
              io.to(`user:${doc.userId}`).emit('emergency_case_available', {
                caseId: caseData.id,
                riskTier: caseData.riskTier,
                message: '🚨 EMERGENCY CASE AVAILABLE'
              });
            });
          }
        });
      } catch (err: any) {
        console.error(`[SLA TIMEOUT] Failed to escalate to general broadcast for ${caseData.id}:`, err.message);
      }
    }

    // 2. Check for 10-minute timeout (GENERAL_BROADCAST -> ADMIN_ESCALATED)
    // 10 minutes = slaDeadline + 5 minutes
    const tenMinThreshold = new Date(now.getTime() - 5 * 60 * 1000);
    const tenMinBreaches = await prisma.caseAssignment.findMany({
      where: {
        status: 'GENERAL_BROADCAST',
        riskTier: { in: ['HIGH', 'CRITICAL'] },
        slaDeadline: { lt: tenMinThreshold }
      }
    });

    for (const caseData of tenMinBreaches) {
      try {
        await prisma.$transaction(async (tx) => {
          const lockedCases = await tx.$queryRaw<any[]>`SELECT * FROM "case_assignments" WHERE "id" = ${caseData.id} FOR UPDATE`;
          if (!lockedCases || lockedCases.length === 0) return;
          if (lockedCases[0].status !== 'GENERAL_BROADCAST') return;

          // Transition to ADMIN_ESCALATED
          await tx.caseAssignment.update({
            where: { id: caseData.id },
            data: { status: 'ADMIN_ESCALATED' }
          });

          await tx.assignmentLog.create({
            data: {
              visitId: caseData.visitId,
              method: 'AUTO',
              assignedTo: 'SYSTEM',
              reason: 'SLA_TIMEOUT: Case escalated to ADMIN_ESCALATED (10min limit reached)'
            }
          });

          // Alert admin that they must assign
          const admins = await tx.administrator.findMany({ include: { user: true } });
          
          const io = getIo();
          
          if (io) {
            admins.forEach((admin: any) => {
              io.to(`user:${admin.userId}`).emit('admin_emergency_alert', {
                caseId: caseData.id,
                message: `🚨 ADMIN ACTION REQUIRED: Emergency case has remained unassigned for 10 minutes.`
              });
            });
          }
        });
      } catch (err: any) {
        console.error(`[SLA TIMEOUT] Failed to escalate to admin for ${caseData.id}:`, err.message);
      }
    }
  }
}
