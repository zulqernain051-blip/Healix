import { prisma } from '../../../common/config/database';

export class NurseRepository {
  /** Fetch full nurse profile including qualifications, specializations, slots, and user info */
  public static async findNurseById(nurseId: string) {
    return prisma.nurse.findFirst({
      where: { id: nurseId },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, phone: true, status: true, createdAt: true }
        },
        qualifications: { orderBy: { yearObtained: 'desc' } },
        specializations: { orderBy: { createdAt: 'asc' } },
        availabilitySlots: { orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] }
      }
    });
  }

  /** Fetch nurse by their user account ID */
  public static async findNurseByUserId(userId: string) {
    return prisma.nurse.findFirst({
      where: { userId },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, phone: true, status: true, createdAt: true }
        },
        qualifications: { orderBy: { yearObtained: 'desc' } },
        specializations: { orderBy: { createdAt: 'asc' } },
        availabilitySlots: { orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] }
      }
    });
  }

  /** Update editable nurse profile fields */
  public static async updateNurseProfile(nurseId: string, data: {
    bio?: string;
    experience?: number;
    photoUrl?: string;
    available?: boolean;
  }) {
    return prisma.nurse.update({
      where: { id: nurseId },
      data
    });
  }

  /** Add a qualification/certification */
  public static async addQualification(nurseId: string, data: {
    title: string;
    issuingBody: string;
    yearObtained: number;
  }) {
    return prisma.nurseQualification.create({
      data: { nurseId, ...data }
    });
  }

  /** Delete a qualification */
  public static async deleteQualification(id: string, nurseId: string) {
    return prisma.nurseQualification.deleteMany({
      where: { id, nurseId }
    });
  }

  /** Add a clinical specialization */
  public static async addSpecialization(nurseId: string, specialization: string) {
    return prisma.nurseSpecialization.create({
      data: { nurseId, specialization }
    });
  }

  // TODO Phase 6:
  // Move to Finance bounded context after Finance Domain and Domain Events exist.
  public static async findEarnings(nurseId: string) {
    // A request payment is counted once, even if the request has recurring visits.
    const payments = await prisma.payment.findMany({
      where: { request: { visits: { some: { nurseId, status: 'COMPLETED' } } } },
      include: { request: { select: { type: true, scheduledAt: true } } },
      orderBy: { createdAt: 'desc' }
    });
    const paid = payments.filter(p => p.status === 'PAID');
    const pending = payments.filter(p => p.status === 'PENDING');
    return {
      totalEarned: paid.reduce((sum, p) => sum + p.amount, 0),
      pendingAmount: pending.reduce((sum, p) => sum + p.amount, 0),
      completedCount: paid.length, pendingCount: pending.length,
      basis: 'Recorded care payments; gross amount before fees. Payout settlement is not connected.',
      history: payments.map(p => ({ id: p.id, amount: p.amount, status: p.status, createdAt: p.createdAt, paidAt: p.paidAt, type: p.request.type }))
    };
  }
}
