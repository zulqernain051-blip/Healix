import { AppError } from '../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../common/constants/index';
import { prisma } from '../../../../common/config/database';

export class EvaluateRecurrenceUseCase {
  async execute(visitId: string, providedTx?: any) {
    const runLogic = async (tx: any) => {
      // 1. Fetch the visit with CareRequest and RecurringPattern
      const visit = await tx.visit.findUnique({
        where: { id: visitId },
        include: {
          request: {
            include: {
              recurringPattern: true
            }
          }
        }
      });

      if (!visit) {
        throw new AppError('Visit not found', HTTP_STATUS.NOT_FOUND);
      }

      const request = visit.request;
      const pattern = request.recurringPattern;

      // 2. If it's ONE_TIME, or pattern is missing, mark CareRequest as COMPLETED
      if (request.scheduleType !== 'RECURRING' || !pattern) {
        if (request.status !== 'COMPLETED') {
          await tx.careRequest.update({
            where: { id: request.id },
            data: { status: 'COMPLETED' }
          });
        }
        return { action: 'COMPLETED_CARE_REQUEST' };
      }

      // 3. Prevent Duplicate Next Visits (Idempotency)
      const activeVisits = await tx.visit.count({
        where: {
          requestId: request.id,
          status: { in: ['SCHEDULED', 'ACCEPTED', 'IN_PROGRESS'] }
        }
      });

      if (activeVisits > 0) {
        return { action: 'NEXT_VISIT_ALREADY_EXISTS' };
      }

      // 4. Calculate next occurrence
      let baseDate = visit.agreedStartTime || request.scheduledAt || pattern.startDate;

      const nextDate = new Date(baseDate);
      if (pattern.frequency === 'DAILY') {
        nextDate.setDate(nextDate.getDate() + 1);
      } else if (pattern.frequency === 'WEEKLY') {
        nextDate.setDate(nextDate.getDate() + 7);
      } else if (pattern.frequency === 'BIWEEKLY') {
        nextDate.setDate(nextDate.getDate() + 14);
      } else {
        throw new Error('Unsupported frequency: ' + pattern.frequency);
      }

      // 5. Evaluate End Boundaries
      if (pattern.occurrencesRemaining <= 1) {
        await tx.careRequest.update({
          where: { id: request.id },
          data: { status: 'COMPLETED' }
        });
        
        await tx.recurringPattern.update({
          where: { id: pattern.id },
          data: { occurrencesRemaining: 0 }
        });
        
        return { action: 'COMPLETED_ALL_OCCURRENCES' };
      }

      const endOfDayEndDate = new Date(pattern.endDate);
      endOfDayEndDate.setHours(23, 59, 59, 999);
      
      if (nextDate > endOfDayEndDate) {
        await tx.careRequest.update({
          where: { id: request.id },
          data: { status: 'COMPLETED' }
        });
        return { action: 'EXCEEDED_END_DATE' };
      }

      // 6. Generate Next Visit
      await tx.recurringPattern.update({
        where: { id: pattern.id },
        data: { occurrencesRemaining: pattern.occurrencesRemaining - 1 }
      });

      if (request.status === 'COMPLETED' || request.status !== 'ASSIGNED') {
         await tx.careRequest.update({
          where: { id: request.id },
          data: { status: 'ASSIGNED' }
        });
      }

      const nextVisit = await tx.visit.create({
        data: {
          requestId: request.id,
          nurseId: visit.nurseId,
          doctorId: visit.doctorId,
          status: 'SCHEDULED',
          agreedStartTime: nextDate
        }
      });

      await tx.visitQrToken.create({
        data: {
          visitId: nextVisit.id,
          token: require('crypto').randomUUID(),
          status: 'PENDING',
          expiresAt: new Date(nextDate.getTime() + 7 * 24 * 60 * 60 * 1000)
        }
      });

      return { action: 'CREATED_NEXT_VISIT', nextVisit };
    };

    if (providedTx) {
      return runLogic(providedTx);
    } else {
      return prisma.$transaction(runLogic);
    }
  }
}
