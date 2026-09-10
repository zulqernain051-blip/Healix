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
    const visits = await prisma.visit.findMany({
      where: { nurseId, status: 'COMPLETED' },
      include: {
        request: {
          include: { payment: true, contract: true }
        }
      }
    });

    let totalEarned = 0;
    let pendingAmount = 0;
    let completedCount = 0;
    let pendingCount = 0;
    const history: any[] = [];

    for (const v of visits) {
      if (v.request?.payment) {
        // Calculate the nurse cut (80% of payment amount, or based on contract)
        const amount = Number(v.request.payment.amount) * 0.8;
        
        if (v.request.payment.status === 'PAID') {
          totalEarned += amount;
          completedCount++;
        } else {
          pendingAmount += amount;
          pendingCount++;
        }

        history.push({
          id: v.request.payment.id,
          amount,
          status: v.request.payment.status,
          createdAt: v.request.payment.createdAt
        });
      }
    }

    return { totalEarned, completedCount, pendingAmount, pendingCount, history };
  }
}
