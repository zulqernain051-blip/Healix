import { prisma } from '../../../common/config/database';
import { OutboxRepository } from '../../../common/events/outbox.repository';
import { AppError } from '../../../common/errors/AppError';

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

  public static async findVisitById(visitId: string) {
    return prisma.visit.findUnique({ where: { id: visitId } });
  }

  public static async updateCareRequestScheduledAt(requestId: string, scheduledAt: Date) {
    return prisma.careRequest.update({
      where: { id: requestId },
      data: { scheduledAt }
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
            vitals: {
              orderBy: { recordedAt: 'desc' }
            },
            assessments: {
              orderBy: { assessedAt: 'desc' }
            },
            caseAssignment: {
              include: {
                doctor: {
                  include: {
                    user: {
                      select: {
                        fullName: true
                      }
                    }
                  }
                }
              }
            },
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
        payment: true,
        contract: {
          include: {
            nurse: {
              include: {
                user: {
                  select: {
                    fullName: true
                  }
                }
              }
            }
          }
        },
        marketplaceListing: {
          include: {
            _count: {
              select: {
                offers: {
                  where: { status: 'PENDING' }
                }
              }
            }
          }
        }
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
      await tx.$queryRaw`SELECT id FROM care_requests WHERE id = ${id} FOR UPDATE`;
      const current = await tx.careRequest.findUnique({ where: { id }, include: { contract: true } });
      if (!current) throw new AppError('Care request not found', 404);
      if (status === 'CANCELLED') {
        if (current.status === 'CANCELLED') return current;
        if (['IN_PROGRESS', 'COMPLETED'].includes(current.status) || await tx.visit.count({ where: { requestId: id, status: { in: ['IN_PROGRESS', 'COMPLETED'] } } })) {
          throw new AppError('Care already started and cannot be cancelled.', 409);
        }
        if (current.contract && ['PENDING_APPROVAL', 'ACTIVE'].includes(current.contract.status)) throw new AppError('Cancel the associated contract before cancelling this request.', 409);
        await tx.visit.updateMany({ where: { requestId: id, status: { in: ['SCHEDULED', 'ACCEPTED'] } }, data: { status: 'CANCELLED' } });
        await tx.marketplaceListing.updateMany({ where: { careRequestId: id }, data: { status: 'CLOSED' } });
      }
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
    return prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM care_requests WHERE id = ${id} FOR UPDATE`;
      const current = await tx.careRequest.findUnique({ where: { id }, include: { contract: true } });
      if (!current) throw new AppError('Care request not found', 404);
      if (!['OPEN', 'PENDING'].includes(current.status)) throw new AppError('Only an open, unassigned request can be rescheduled.', 409);
      if (current.contract && ['PENDING_APPROVAL', 'ACTIVE'].includes(current.contract.status)) throw new AppError('Cancel the existing agreement before changing its schedule.', 409);
      if (!Number.isFinite(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now()) throw new AppError('Select a future appointment time.', 400);
      const previousTime = current.scheduledAt ?? current.preferredDate;
      if (!previousTime || previousTime.getTime() - Date.now() < 2 * 60 * 60 * 1000) throw new AppError('Rescheduling requires at least two hours before the current appointment.', 400);
      return tx.careRequest.update({ where: { id }, data: { scheduledAt, preferredDate: scheduledAt } });
    });
  }

  public static async findPatientCareRequests(patientId: string) {
    const requests = await prisma.careRequest.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      include: {
        visits: {
          include: {
            vitals: {
              orderBy: { recordedAt: 'desc' }
            },
            assessments: {
              orderBy: { assessedAt: 'desc' }
            },
            caseAssignment: {
              include: {
                doctor: {
                  include: {
                    user: {
                      select: {
                        fullName: true
                      }
                    }
                  }
                }
              }
            },
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
        contract: {
          include: {
            nurse: {
              include: {
                user: {
                  select: {
                    fullName: true
                  }
                }
              }
            }
          }
        },
        marketplaceListing: {
          include: {
            _count: {
              select: {
                offers: {
                  where: { status: 'PENDING' }
                }
              }
            }
          }
        }
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
      include: { milestones: { orderBy: [{ targetDate: 'asc' }, { createdAt: 'asc' }] } },
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
