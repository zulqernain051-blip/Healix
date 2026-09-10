import { prisma } from '../../../common/config/database';
import { OutboxRepository } from '../../../common/events/outbox.repository';

export class CareRepository {
  public static async findNormalizedRequests() {
    const requests = await prisma.careRequest.findMany({
      include: {
        patient: {
          include: {
            user: { select: { fullName: true } }
          }
        },
        visits: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return requests.map((req: any) => ({
      ...req,
      visit: req.visits && req.visits.length > 0 ? req.visits[0] : null
    }));
  }

  public static async updateRequestPriority(requestId: string, priority: string) {
    return prisma.careRequest.update({
      where: { id: requestId },
      data: {
        priority
      }
    });
  }

  public static async findRequestById(id: string) {
    return prisma.careRequest.findUnique({
      where: { id },
      include: { patient: true }
    });
  }

  public static async findFutureRequestsForPattern(patternId: string, patientId: string, excludedRequestId: string) {
    return prisma.careRequest.findMany({
      where: {
        patientId,
        notes: { contains: patternId },
        status: { in: ['PENDING', 'ASSIGNED', 'OPEN'] },
        id: { not: excludedRequestId }
      }
    });
  }

  public static async findExistingRequestInWindow(patientId: string, since: Date) {
    return prisma.careRequest.findFirst({
      where: {
        patientId,
        createdAt: { gt: since },
        status: { in: ['PENDING', 'ASSIGNED'] }
      }
    });
  }

  public static async mergeNotes(requestId: string, newNotes: string) {
    const request = await prisma.careRequest.findUnique({ where: { id: requestId } });
    const mergedNotes = request?.notes ? `${request.notes} | ${newNotes}` : newNotes;
    return prisma.careRequest.update({
      where: { id: requestId },
      data: { notes: mergedNotes }
    });
  }



  public static async createRecurringPattern(patientId: string, frequency: string, endDate: Date, occurrencesRemaining: number) {
    return prisma.recurringPattern.create({
      data: {
        patientId,
        frequency,
        endDate,
        occurrencesRemaining
      }
    });
  }

  public static async findOverdueMilestones() {
    return prisma.carePlanMilestone.findMany({
      where: {
        completed: false,
        targetDate: { lt: new Date() }
      },
      include: {
        carePlan: {
          include: {
            patient: {
              include: { user: { select: { fullName: true } } }
            }
          }
        }
      },
      orderBy: { targetDate: 'asc' }
    });
  }











  public static async createRequest(data: any) {
    return prisma.careRequest.create({ data });
  }

  public static async createRecurringRequestsAndVisits(patientId: string, patternId: string, scheduledDates: Date[]) {
    return prisma.$transaction(async (tx) => {
      const generatedVisits = [];
      let i = 1;
      for (const scheduledAt of scheduledDates) {
        const request = await tx.careRequest.create({
          data: {
            patientId,
            type: 'NURSE_VISIT',
            status: 'ASSIGNED',
            scheduledAt,
            notes: `[Recurring Visit #${i} of pattern ${patternId}]`
          }
        });

        const visit = await tx.visit.create({
          data: {
            requestId: request.id,
            status: 'SCHEDULED'
          }
        });

        generatedVisits.push(visit);
        i++;
      }
      return generatedVisits;
    });
  }

  public static async findVisitById(visitId: string) {
    return prisma.visit.findUnique({ where: { id: visitId } });
  }

  public static async updateCareRequestScheduledAt(requestId: string, scheduledAt: Date) {
    return prisma.careRequest.update({
      where: { id: requestId },
      data: { scheduledAt }
    });
  }







  public static async updateCareRequestNotes(requestId: string, notes: string) {
    return prisma.careRequest.update({
      where: { id: requestId },
      data: { notes }
    });
  }

  public static async findAvailableNurses() {
    return prisma.nurse.findMany({
      where: {
        available: true,
        user: { status: 'ACTIVE' }
      },
      include: {
        specializations: true,
        score: true
      }
    });
  }

  public static async findUserWithClinicalRoles(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: { nurse: true, doctor: true }
    });
  }

  public static async countCareRequests(whereArgs: any) {
    return prisma.careRequest.count({ where: whereArgs });
  }








  public static async findPatientCareRequestById(id: string) {
    const request = await prisma.careRequest.findUnique({
      where: { id },
      include: {
        visits: {
          include: {
            nurse: {
              select: {
                experience: true,
                user: {
                  select: {
                    fullName: true,
                    phone: true
                  }
                }
              }
            },
            doctor: {
              select: {
                pmdcNumber: true,
                user: {
                  select: {
                    fullName: true,
                    phone: true
                  }
                }
              }
            }
          }
        },
        payment: true
      }
    });
    
    if (!request) return null;
    return {
      ...request,
      visit: request.visits && request.visits.length > 0 ? request.visits[request.visits.length - 1] : null
    } as any;
  }

  public static async updateCareRequestStatus(id: string, status: string) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.careRequest.update({
        where: { id },
        data: { status }
      });

      if (status === 'CANCELLED') {
        await OutboxRepository.createEvent(tx, {
          eventType: 'CARE_REQUEST_CANCELLED',
          aggregateType: 'CARE_REQUEST',
          aggregateId: id,
          payload: { careRequestId: id }
        });
      }

      return updated;
    });
  }

  public static async rescheduleCareRequest(id: string, scheduledAt: Date) {
    return prisma.careRequest.update({
      where: { id },
      data: { scheduledAt }
    });
  }

  public static async findPatientCareRequests(patientId: string) {
    const requests = await prisma.careRequest.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      include: {
        visits: {
          include: {
            nurse: {
              select: {
                user: {
                  select: {
                    fullName: true
                  }
                }
              }
            },
            doctor: {
              select: {
                user: {
                  select: {
                    fullName: true
                  }
                }
              }
            }
          }
        },
        payment: true,
        marketplaceListing: true
      }
    });
    
    return requests.map((req: any) => ({
      ...req,
      visit: req.visits && req.visits.length > 0 ? req.visits[req.visits.length - 1] : null
    }));
  }

  public static async findPatientCarePlans(patientId: string) {
    return prisma.carePlan.findMany({
      where: { patientId },
      orderBy: { startDate: 'desc' }
    });
  }

  public static async countActiveRequests(patientId: string) {
    return prisma.careRequest.count({
      where: {
        patientId,
        status: { in: ['PENDING', 'ACCEPTED'] }
      }
    });
  }

  public static async createCarePlan(
    patientId: string,
    doctorId: string,
    title: string,
    description: string,
    milestones: any[]
  ) {
    return prisma.carePlan.create({
      data: {
        patientId,
        doctorId,
        title,
        description,
        status: 'ACTIVE',
        milestones: {
          create: milestones
        }
      },
      include: { milestones: true }
    });
  }

  public static async findPendingPayments(patientId: string) {
    return prisma.payment.findMany({
      where: {
        request: { patientId },
        status: 'PENDING'
      }
    });
  }
}
