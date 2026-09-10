import { prisma } from '../../../common/config/database';

export class AdminRepository {
  // ─── STATS ───────────────────────────────────────────────────────────────────
  static async getDashboardStats() {
    const [
      totalUsers, activeUsers, pendingNurses, pendingDoctors,
      totalVisits, completedVisits, activeContracts, highRiskCases,
      totalNurses, totalDoctors, totalPatients,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { status: 'ACTIVE', deletedAt: null } }),
      prisma.nurse.count({ where: { verificationStatus: 'PENDING' } }),
      prisma.doctor.count({ where: { verificationStatus: 'PENDING' } }),
      prisma.visit.count(),
      prisma.visit.count({ where: { status: 'COMPLETED' } }),
      prisma.contract.count({ where: { status: 'ACTIVE' } }),
      prisma.caseAssignment.count({ where: { status: 'PENDING', riskTier: 'HIGH' } }),
      prisma.nurse.count(),
      prisma.doctor.count(),
      prisma.patient.count(),
    ]);
    return {
      totalUsers, activeUsers, pendingNurses, pendingDoctors,
      totalVisits, completedVisits, activeContracts, highRiskCases,
      totalNurses, totalDoctors, totalPatients,
    };
  }

  // ─── USER MANAGEMENT ─────────────────────────────────────────────────────────
  static async findUsers(query: {
    search?: string; role?: string; status?: string; page?: number; limit?: number;
  }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (query.role) where.role = query.role;
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: { select: { id: true, cnic: true } },
          nurse: { select: { id: true, cnic: true, pncNumber: true, verificationStatus: true } },
          doctor: { select: { id: true, cnic: true, pmdcNumber: true, verificationStatus: true } },
          admin: { select: { id: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, limit, pages: Math.ceil(total / limit) };
  }

  static async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        patient: { include: { emergencyContacts: true, chronicConditions: true, allergies: true } },
        nurse: { include: { qualifications: true, specializations: true, score: true, badges: true } },
        doctor: { include: { diagnoses: { take: 5 }, caseAssignments: { take: 5 } } },
        admin: true,
        sessions: { where: { revoked: false, expiresAt: { gt: new Date() } } },
        documents: true,
      },
    });
  }

  static async updateUserStatus(id: string, status: string, reason: string) {
    return prisma.user.update({
      where: { id },
      data: { status: status as any, deactivationReason: reason },
    });
  }

  static async revokeUserSessions(userId: string) {
    return prisma.session.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }

  static async softDeleteUser(id: string) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // ─── NURSE CREDENTIAL MANAGEMENT ─────────────────────────────────────────────
  static async findPendingNurses() {
    return prisma.nurse.findMany({
      where: { verificationStatus: 'PENDING' },
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true, createdAt: true, documents: true } },
        qualifications: true,
        specializations: true,
      },
      orderBy: { user: { createdAt: 'asc' } },
    });
  }

  static async findAllNurses(status?: string) {
    return prisma.nurse.findMany({
      where: status ? { verificationStatus: status } : {},
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true, status: true, createdAt: true } },
        score: true,
      },
      orderBy: { user: { createdAt: 'desc' } },
    });
  }

  static async approveNurse(nurseId: string) {
    return prisma.nurse.update({
      where: { id: nurseId },
      data: { verificationStatus: 'VERIFIED', verificationApprovedAt: new Date(), rejectionReason: null },
    });
  }

  static async rejectNurse(nurseId: string, reason: string) {
    return prisma.nurse.update({
      where: { id: nurseId },
      data: { verificationStatus: 'REJECTED', rejectionReason: reason },
    });
  }

  static async revokeNurse(nurseId: string, reason: string) {
    return prisma.nurse.update({
      where: { id: nurseId },
      data: { verificationStatus: 'REVOKED', revocationReason: reason, available: false },
    });
  }

  // ─── DOCTOR CREDENTIAL MANAGEMENT ────────────────────────────────────────────
  static async findPendingDoctors() {
    return prisma.doctor.findMany({
      where: { verificationStatus: 'PENDING' },
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true, createdAt: true, documents: true } },
      },
      orderBy: { user: { createdAt: 'asc' } },
    });
  }

  static async findAllDoctors(status?: string) {
    return prisma.doctor.findMany({
      where: status ? { verificationStatus: status } : {},
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true, status: true, createdAt: true } },
      },
      orderBy: { user: { createdAt: 'desc' } },
    });
  }

  static async approveDoctor(doctorId: string) {
    return prisma.doctor.update({
      where: { id: doctorId },
      data: { verificationStatus: 'VERIFIED', verificationApprovedAt: new Date(), rejectionReason: null },
    });
  }

  static async rejectDoctor(doctorId: string, reason: string) {
    return prisma.doctor.update({
      where: { id: doctorId },
      data: { verificationStatus: 'REJECTED', rejectionReason: reason },
    });
  }

  static async revokeDoctor(doctorId: string, reason: string) {
    // Flag active case assignments for re-escalation
    await prisma.caseAssignment.updateMany({
      where: { doctorId, status: 'ACCEPTED' },
      data: { status: 'PENDING', doctorId: null },
    });
    return prisma.doctor.update({
      where: { id: doctorId },
      data: { verificationStatus: 'REVOKED', revocationReason: reason },
    });
  }

  // ─── MARKETPLACE MANAGEMENT ───────────────────────────────────────────────────
  static async findAllOffers(status?: string) {
    return prisma.offer.findMany({
      where: status ? { status } : {},
      include: {
        nurse: { include: { user: { select: { fullName: true, email: true } } } },
        listing: { include: { careRequest: { include: { patient: { include: { user: { select: { fullName: true } } } } } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async removeOffer(offerId: string, _reason: string) {
    return prisma.offer.update({
      where: { id: offerId },
      data: { status: 'REMOVED' },
    });
  }

  // ─── PLATFORM CONFIG ──────────────────────────────────────────────────────────
  static async getAllConfig() {
    return prisma.platformConfig.findMany({ orderBy: { key: 'asc' } });
  }

  static async getConfigByKey(key: string) {
    return prisma.platformConfig.findUnique({ where: { key } });
  }

  static async upsertConfig(key: string, value: string, adminId: string, changeReason?: string) {
    return prisma.platformConfig.upsert({
      where: { key },
      create: { key, value, updatedByAdminId: adminId, changeReason },
      update: { value, updatedByAdminId: adminId, updatedAt: new Date(), changeReason },
    });
  }

  static async getFeatureFlags() {
    return prisma.platformConfig.findMany({
      where: { key: { startsWith: 'feature_flag_' } },
      orderBy: { key: 'asc' },
    });
  }

  // ─── AUDIT LOGS ───────────────────────────────────────────────────────────────
  static async createAuditLog(data: {
    adminId: string; targetUserId?: string; action: string;
    entityType?: string; entityId?: string; reason?: string; metadataJson?: string;
  }) {
    return prisma.adminAuditLog.create({ data });
  }

  static async findAuditLogs(query: {
    adminId?: string; targetUserId?: string; action?: string;
    entityType?: string; fromDate?: string; toDate?: string;
    page?: number; limit?: number;
  }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 100;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.adminId) where.adminId = query.adminId;
    if (query.targetUserId) where.targetUserId = query.targetUserId;
    if (query.action) where.action = { contains: query.action, mode: 'insensitive' };
    if (query.entityType) where.entityType = query.entityType;
    if (query.fromDate || query.toDate) {
      where.createdAt = {};
      if (query.fromDate) where.createdAt.gte = new Date(query.fromDate);
      if (query.toDate) where.createdAt.lte = new Date(query.toDate);
    }

    const [logs, total] = await Promise.all([
      prisma.adminAuditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: { select: { fullName: true, email: true } },
          targetUser: { select: { fullName: true, email: true, role: true } },
        },
      }),
      prisma.adminAuditLog.count({ where }),
    ]);

    return { logs, total, page, limit, pages: Math.ceil(total / limit) };
  }

  // ─── Care Operations ──────────────────────────────────────────────────────────
  static async getCareRequests(query: any) {
    return prisma.careRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: { patient: { include: { user: { select: { fullName: true } } } } }
    });
  }
  static async getContracts(query: any) {
    return prisma.contract.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        nurse: { include: { user: { select: { fullName: true } } } },
        patient: { include: { user: { select: { fullName: true } } } }
      }
    });
  }
  static async getVisits(query: any) {
    return prisma.visit.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        nurse: { include: { user: { select: { fullName: true } } } },
        doctor: { include: { user: { select: { fullName: true } } } },
        request: { include: { patient: { include: { user: { select: { fullName: true } } } } } }
      }
    });
  }

  // ─── Clinical Operations ──────────────────────────────────────────────────────
  static async getClinicalCasesByStatus(status: string) {
    return prisma.caseAssignment.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      include: { doctor: { include: { user: { select: { fullName: true } } } }, visit: { include: { request: { include: { patient: { include: { user: { select: { fullName: true } } } } } } } } }
    });
  }
  static async getHighRiskCases() {
    return prisma.caseAssignment.findMany({
      where: { riskTier: 'HIGH' },
      orderBy: { createdAt: 'desc' },
      include: { doctor: { include: { user: { select: { fullName: true } } } }, visit: { include: { request: { include: { patient: { include: { user: { select: { fullName: true } } } } } } } } }
    });
  }

  // ─── Emergency Center ─────────────────────────────────────────────────────────
  static async getEmergencies(slaStatus?: string) {
    const where: any = {};
    if (slaStatus) where.source = slaStatus; 
    return prisma.emergencyEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { patient: { include: { user: { select: { fullName: true } } } } }
    });
  }
  static async assignEmergencyDoctor(emergencyId: string, doctorId: string) {
    const event = await prisma.emergencyEvent.findUnique({ where: { id: emergencyId } });
    if (event?.visitId) {
       await prisma.caseAssignment.updateMany({
         where: { visitId: event.visitId },
         data: { doctorId, status: 'ACCEPTED' }
       });
    }
    return event;
  }

  // ─── Healthcare Network ───────────────────────────────────────────────────────
  static async getHospitals() {
    return prisma.hospital.findMany({ orderBy: { name: 'asc' } });
  }
  static async createHospital(data: any) {
    return prisma.hospital.create({ data });
  }
  static async updateHospital(id: string, data: any) {
    return prisma.hospital.update({ where: { id }, data });
  }
  static async deleteHospital(id: string) {
    return prisma.hospital.delete({ where: { id } });
  }

  // ─── Reviews / Moderation ─────────────────────────────────────────────────────
  static async getNurseReviews() {
    return prisma.nurseReview.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        nurse: { include: { user: { select: { fullName: true } } } },
        patient: { include: { user: { select: { fullName: true } } } },
        visit: true
      }
    });
  }
  static async updateNurseReview(reviewId: string, data: any) {
    return prisma.nurseReview.update({ where: { id: reviewId }, data });
  }
  static async deleteNurseReview(reviewId: string) {
    return prisma.nurseReview.delete({ where: { id: reviewId } });
  }
}
