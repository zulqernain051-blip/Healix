import { AppError } from '../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../common/constants/index';
import { prisma } from '../../../common/config/database';
import { OutboxRepository } from '../../../common/events/outbox.repository';

export class VisitRepository {
  public static async findVisitByRequestId(requestId: string) {
    return prisma.visit.findFirst({
      where: { requestId }
    });
  }

  public static async findVisitIdsForRequest(requestId: string, statuses?: string[]) {
    return prisma.visit.findMany({
      where: { 
        requestId,
        ...(statuses ? { status: { in: statuses } } : {})
      },
      select: { id: true }
    });
  }

  public static async findVisitById(visitId: string) {
    return prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        request: {
          include: {
            patient: {
              include: {
                user: {
                  select: { id: true, fullName: true, email: true, phone: true }
                },
                allergies: true
              }
            }
          }
        },
        nurse: {
          include: {
            user: {
              select: { id: true, fullName: true, email: true, phone: true }
            }
          }
        },
        doctor: {
          include: {
            user: {
              select: { id: true, fullName: true, email: true, phone: true }
            }
          }
        },
        verifications: {
          orderBy: { verifiedAt: 'desc' }
        },
        symptoms: {
          orderBy: { createdAt: 'desc' }
        },
        clinicalRemark: true,
        vitals: {
          orderBy: { recordedAt: 'desc' }
        },
        review: true
      }
    });
  }

  public static async findVisitsByNurseId(nurseId: string) {
    return prisma.visit.findMany({
      where: { nurseId },
      include: {
        request: {
          include: {
            patient: {
              include: {
                user: {
                  select: { id: true, fullName: true, email: true, phone: true }
                }
              }
            }
          }
        }
      },
      orderBy: {
        request: {
          scheduledAt: 'desc'
        }
      }
    });
  }

  public static async acceptVisit(visitId: string) {
    return prisma.visit.update({
      where: { id: visitId },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date()
      }
    });
  }

  public static async declineVisit(visitId: string) {
    return prisma.visit.update({
      where: { id: visitId },
      data: {
        status: 'DECLINED'
      }
    });
  }

  public static async startVisit(
    visitId: string, 
    verificationMethod?: string, 
    verificationReason?: string, 
    latitude?: number, 
    longitude?: number
  ) {
    return prisma.$transaction(async (tx) => {
      const updateResult = await tx.visit.updateMany({
        where: { id: visitId, status: 'SCHEDULED' },
        data: {
          status: 'IN_PROGRESS',
          startedAt: new Date()
        }
      });

      if (updateResult.count === 0) {
        const existing = await tx.visit.findUnique({ where: { id: visitId } });
        if (!existing) throw new AppError('Visit not found', HTTP_STATUS.NOT_FOUND);
        if (existing.status === 'IN_PROGRESS') {
          return existing; // Idempotent
        }
        throw new AppError(`Cannot start Visit from status: ${existing.status}`, HTTP_STATUS.BAD_REQUEST);
      }

      const visit = await tx.visit.findUniqueOrThrow({ where: { id: visitId } });

      if (verificationMethod) {
        await tx.visitVerification.create({
          data: {
            visitId,
            method: verificationMethod,
            result: true,
            reason: verificationReason,
            latitude,
            longitude
          }
        });
      }

      // Record attendance
      await tx.attendanceRecord.create({
        data: { visitId, checkInAt: new Date() }
      });

      if (verificationMethod === 'QR') {
        const qr = await tx.visitQrToken.findUnique({ where: { visitId } });
        if (qr && qr.status === 'PENDING') {
          await tx.visitQrToken.update({
            where: { id: qr.id },
            data: { status: 'VERIFIED', verifiedAt: new Date() }
          });
        }
      }

      await tx.careRequest.update({
        where: { id: visit.requestId },
        data: {
          status: 'IN_PROGRESS'
        }
      });

      const { OutboxRepository } = require('../../../common/events/outbox.repository');
      const { EVENTS } = require('../../../common/events/app-event-bus');

      await OutboxRepository.createEvent(tx, {
        eventType: EVENTS.VISIT_STARTED,
        aggregateType: 'VISIT',
        aggregateId: visitId,
        payload: {
          visitId,
          requestId: visit.requestId,
          nurseId: visit.nurseId
        }
      });

      return visit;
    });
  }

  public static async completeVisit(visitId: string) {
    return prisma.$transaction(async (tx) => {
      const updateResult = await tx.visit.updateMany({
        where: { id: visitId, status: 'IN_PROGRESS' },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      });

      if (updateResult.count === 0) {
        const existing = await tx.visit.findUnique({ where: { id: visitId } });
        if (!existing) throw new AppError('Visit not found', HTTP_STATUS.NOT_FOUND);
        if (existing.status === 'COMPLETED') {
          return existing; // Idempotent
        }
        throw new AppError(`Cannot complete Visit from status: ${existing.status}`, HTTP_STATUS.BAD_REQUEST);
      }

      const visit = await tx.visit.findUniqueOrThrow({ where: { id: visitId } });

      const { EvaluateRecurrenceUseCase } = require('./lifecycle/evaluate-recurrence.usecase');
      const evaluator = new EvaluateRecurrenceUseCase();
      await evaluator.execute(visitId, tx);

      const { OutboxRepository } = require('../../../common/events/outbox.repository');
      const { EVENTS } = require('../../../common/events/app-event-bus');

      await OutboxRepository.createEvent(tx, {
        eventType: EVENTS.VISIT_COMPLETED,
        aggregateType: 'VISIT',
        aggregateId: visitId,
        payload: {
          visitId,
          requestId: visit.requestId,
          nurseId: visit.nurseId
        }
      });

      return visit;
    });
  }

  public static async saveVisitNotes(visitId: string, notes: string) {
    return prisma.visit.update({
      where: { id: visitId },
      data: { notes }
    });
  }

  public static async findPatientVisits(patientId: string) {
    return prisma.visit.findMany({
      where: {
        request: { patientId }
      },
      orderBy: { startedAt: 'desc' },
      include: {
        request: true,
        nurse: {
          select: { user: { select: { fullName: true } } }
        },
        doctor: {
          select: { user: { select: { fullName: true } } }
        }
      }
    });
  }

  public static async findUpcomingVisits(patientId: string) {
    return prisma.visit.findMany({
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
  }

  public static async createVisit(requestId: string, scheduledAt: Date) {
    return prisma.$transaction(async (tx) => {
      const visit = await tx.visit.create({
        data: {
          requestId,
          status: 'SCHEDULED'
        }
      });

      await tx.careRequest.update({
        where: { id: requestId },
        data: { status: 'ASSIGNED', scheduledAt }
      });

      // Initialize QR Verification for standard visits (consistent with createVisitFromContract)
      await tx.visitQrToken.create({
        data: {
          visitId: visit.id,
          token: require('crypto').randomUUID(),
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days expiry
        }
      });

      return visit;
    });
  }
  public static async createVisitFromContract(data: {
    requestId: string;
    nurseId: string;
    agreedStartTime: Date;
  }) {
    return prisma.$transaction(async (tx) => {
      const visit = await tx.visit.create({
        data: {
          requestId: data.requestId,
          nurseId: data.nurseId,
          status: 'SCHEDULED', // Visit starts scheduled since it is accepted by contract
          agreedStartTime: data.agreedStartTime
        }
      });

      // Initialize QR Verification
      await tx.visitQrToken.create({
        data: {
          visitId: visit.id,
          token: require('crypto').randomUUID(),
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days expiry
        }
      });

      return visit;
    });
  }

  public static async findVisitsHistory(patientId: string, since: Date) {
    return prisma.visit.findMany({
      where: {
        request: {
          patientId,
          scheduledAt: { gt: since }
        }
      },
      include: { request: true }
    });
  }

  public static async assignVisitProvider(visitId: string, providerId: string, role: 'NURSE' | 'DOCTOR') {
    const data: any = {};
    if (role === 'NURSE') data.nurseId = providerId;
    else data.doctorId = providerId;

    return prisma.visit.update({
      where: { id: visitId },
      data
    });
  }

  public static async cancelVisitAndFutureOccurrences(visitId: string, deleteSeries: boolean) {
    return prisma.$transaction(async (tx) => {
      // Conditional update for cancellation
      const updateResult = await tx.visit.updateMany({
        where: { 
          id: visitId,
          status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
        },
        data: { status: 'CANCELLED' }
      });

      if (updateResult.count === 0) {
        const existing = await tx.visit.findUnique({ where: { id: visitId } });
        if (!existing) throw new AppError('Visit not found', HTTP_STATUS.NOT_FOUND);
        if (existing.status === 'CANCELLED') {
          return; // Idempotent
        }
        throw new AppError(`Cannot cancel Visit from status: ${existing.status}`, HTTP_STATUS.BAD_REQUEST);
      }

      const visit = await tx.visit.findUniqueOrThrow({
        where: { id: visitId },
        include: { request: true }
      });

      await OutboxRepository.createEvent(tx, {
        eventType: 'VISIT_CANCELLED',
        aggregateType: 'VISIT',
        aggregateId: visitId,
        payload: { 
          visitId,
          careRequestId: visit.requestId,
          deleteSeries
        }
      });

      return visit;
    });
  }

  public static async findVisitWithRequestAndPatient(visitId: string) {
    return prisma.visit.findUnique({
      where: { id: visitId },
      include: { request: { include: { patient: true } } }
    });
  }

  public static async findVisitWithRequest(visitId: string) {
    return prisma.visit.findUnique({
      where: { id: visitId },
      include: { request: true }
    });
  }

  public static async createAssignmentLog(visitId: string, method: string, assignedTo: string, reason?: string) {
    return prisma.assignmentLog.create({
      data: {
        visitId,
        method,
        assignedTo,
        reason
      }
    });
  }
}
