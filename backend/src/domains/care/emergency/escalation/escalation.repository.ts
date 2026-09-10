import { prisma } from '../../../../common/config/database';

export class EscalationRepository {
  static async findEmergencyEvent(eventId: string) {
    return prisma.emergencyEvent.findUnique({
      where: { id: eventId },
      include: { visit: true }
    });
  }

  static async findDoctor(doctorId: string) {
    return prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { user: true }
    });
  }

  static async findPlatformConfig(key: string) {
    return prisma.platformConfig.findUnique({ where: { key } });
  }

  static async createCaseAssignment(visitId: string, doctorId: string, riskTier: string, slaDeadline: Date) {
    return prisma.caseAssignment.create({
      data: {
        visitId,
        doctorId,
        riskTier,
        slaDeadline,
        status: 'PENDING'
      }
    });
  }

  static async findNurse(nurseId: string) {
    return prisma.nurse.findUnique({
      where: { id: nurseId },
      include: { user: true }
    });
  }

  static async createNurseDoctorThread(nurseUserId: string, doctorUserId: string, caseAssignmentId: string) {
    return prisma.chatThread.create({
      data: {
        type: 'NURSE_DOCTOR',
        participantAId: nurseUserId,
        participantBId: doctorUserId,
        caseAssignmentId,
        readOnly: false
      }
    });
  }

  static async findVerifiedDoctors() {
    return prisma.doctor.findMany({
      where: { verificationStatus: 'VERIFIED' },
      include: { user: true }
    });
  }
}
