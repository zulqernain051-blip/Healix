import { prisma } from '../../../../common/config/database';

export class VerificationRepository {
  public static async findVisitById(visitId: string) {
    return prisma.visit.findUnique({
      where: { id: visitId }
    });
  }

  public static async findVisitWithAttendance(visitId: string) {
    return prisma.visit.findUnique({
      where: { id: visitId },
      include: { vitals: true, attendanceRecord: true, request: true }
    });
  }

  public static async findVisitWithPatient(visitId: string) {
    return prisma.visit.findUnique({
      where: { id: visitId },
      include: { request: { include: { patient: true } } }
    });
  }

  public static async findVisitForCompletion(visitId: string) {
    return prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        vitals: true,
        request: { include: { contract: true } }
      }
    });
  }

  public static async findVisitWithPatientAndQr(visitId: string) {
    return prisma.visit.findUnique({
      where: { id: visitId },
      include: { request: { include: { patient: true } }, qrToken: true }
    });
  }

  public static async findVisitWithQr(visitId: string) {
    return prisma.visit.findUnique({
      where: { id: visitId },
      include: { qrToken: true }
    });
  }


  public static async checkOutVisit(visitId: string) {
    return prisma.attendanceRecord.update({
      where: { visitId },
      data: { checkOutAt: new Date() }
    });
  }

  public static async confirmPatientArrival(visitId: string) {
    const verification = await prisma.visitVerification.create({
      data: {
        visitId,
        method: 'PATIENT_CONFIRMATION',
        result: true,
        reason: 'Patient confirmed nurse arrival in-app'
      }
    });

    await prisma.visit.update({
      where: { id: visitId },
      data: { patientConfirmed: true }
    });

    return verification;
  }

  public static async updateNurseConfirmed(visitId: string, nurseConfirmed: boolean) {
    return prisma.visit.update({
      where: { id: visitId },
      data: { nurseConfirmed }
    });
  }


  public static async createEvidence(visitId: string, type: string, urlOrText: string, consentGiven: boolean) {
    return prisma.visitEvidence.create({
      data: { visitId, type, urlOrText, consentGiven }
    });
  }

  public static async regenerateQrToken(qrTokenId: string) {
    const crypto = require('crypto');
    return prisma.visitQrToken.update({
      where: { id: qrTokenId },
      data: {
        token: crypto.randomUUID(),
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
  }


  public static async findEvidence(visitId: string) {
    return prisma.visitEvidence.findMany({
      where: { visitId },
      orderBy: { uploadedAt: 'asc' }
    });
  }

  public static async findAttendance(visitId: string) {
    return prisma.attendanceRecord.findFirst({
      where: { visitId },
      orderBy: { checkInAt: 'desc' }
    });
  }

  public static async createVerification(visitId: string, method: string, result: boolean, data?: { reason?: string; latitude?: number; longitude?: number }) {
    return prisma.visitVerification.create({
      data: {
        visitId,
        method,
        result,
        reason: data?.reason,
        latitude: data?.latitude,
        longitude: data?.longitude
      }
    });
  }

  public static async findVerificationsByVisitId(visitId: string) {
    return prisma.visitVerification.findMany({
      where: { visitId },
      orderBy: { verifiedAt: 'desc' }
    });
  }
}
