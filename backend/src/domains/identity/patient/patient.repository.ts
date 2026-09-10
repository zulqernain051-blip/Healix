import { prisma } from '../../../common/config/database';

export class PatientRepository {
  public static async findPatientByUserId(userId: string) {
    return prisma.patient.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            fullName: true,
            role: true,
            status: true,
            createdAt: true
          }
        },
        emergencyContacts: true,
        caregiverLinks: true
      }
    });
  }

  public static async findUserByPhoneLike(phone: string) {
    return prisma.user.findFirst({
      where: {
        phone: {
          contains: phone,
        },
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        role: true,
        status: true,
      },
    });
  }

  public static async findPatientById(id: string) {
    return prisma.patient.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            fullName: true,
            role: true,
            status: true,
            createdAt: true
          }
        },
        emergencyContacts: true,
        caregiverLinks: true
      }
    });
  }

  public static async updatePatientProfile(
    patientId: string,
    userId: string,
    patientData: {
      dob?: Date;
      gender?: string;
      address?: string;
      latitude?: number;
      longitude?: number;
      photoUrl?: string;
    },
    userData?: {
      fullName?: string;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      // 1. Update User table details if supplied
      if (userData && Object.keys(userData).length > 0) {
        await tx.user.update({
          where: { id: userId },
          data: userData
        });
      }

      // 2. Update Patient table details
      const patient = await tx.patient.update({
        where: { id: patientId },
        data: patientData,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              fullName: true,
              role: true,
              status: true,
              createdAt: true
            }
          },
          emergencyContacts: true
        }
      });

      return patient;
    });
  }

  public static async addEmergencyContact(
    patientId: string,
    data: { name: string; phone: string; relationship: string }
  ) {
    return prisma.emergencyContact.create({
      data: {
        patientId,
        ...data
      }
    });
  }

  public static async findEmergencyContactById(id: string) {
    return prisma.emergencyContact.findUnique({
      where: { id }
    });
  }

  public static async deleteEmergencyContact(id: string) {
    return prisma.emergencyContact.delete({
      where: { id }
    });
  }

  public static async getEmergencyContactsCount(patientId: string): Promise<number> {
    return prisma.emergencyContact.count({
      where: { patientId }
    });
  }

  public static async findDashboardSummary(patientId: string) {
    // TODO Phase 6: Replace with CQRS Read Model
    const activeRequestsCount = await prisma.careRequest.count({
      where: {
        patientId,
        status: { in: ['PENDING', 'ASSIGNED', 'IN_PROGRESS'] }
      }
    });

    const upcomingVisits = await prisma.visit.findMany({
      where: {
        request: { patientId },
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
      },
      include: {
        request: true,
        nurse: {
          select: { user: { select: { fullName: true } } }
        },
        doctor: {
          select: { user: { select: { fullName: true } } }
        }
      },
      orderBy: { startedAt: 'asc' },
      take: 3
    });

    const severeAllergiesCount = await prisma.allergy.count({
      where: {
        patientId,
        severity: 'SEVERE'
      }
    });

    const latestRisk = await prisma.riskAssessment.findFirst({
      where: { patientId },
      orderBy: { assessedAt: 'desc' }
    });

    const pendingPayments = await prisma.payment.findMany({
      where: {
        request: { patientId },
        status: 'PENDING'
      }
    });

    const pendingPaymentsSum = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

    return {
      activeRequestsCount,
      upcomingVisits,
      severeAllergiesCount,
      latestRisk,
      pendingPaymentsCount: pendingPayments.length,
      pendingPaymentsSum
    };
  }

  public static async findCaregiverLinks(patientId: string) {
    return prisma.caregiverLink.findMany({
      where: { patientId },
      include: {
        caregiver: {
          select: {
            fullName: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
