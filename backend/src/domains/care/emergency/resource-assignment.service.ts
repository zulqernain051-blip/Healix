import { prisma } from '../../../common/config/database';
import { AppError } from '../../../common/errors/AppError';
import { ACTIVE_DISPATCH_STATUSES } from './emergency.validation';
import { OutboxRepository } from '../../../common/events/outbox.repository';
import { EVENTS } from '../../../common/events/app-event-bus';

export class ResourceAssignmentService {
  static async assignVehicle(dispatchId: string, ambulanceId: string) {
    return prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT "id" FROM "ambulance_dispatches" WHERE "id" = ${dispatchId} FOR UPDATE`;
      const dispatch = await tx.ambulanceDispatch.findUnique({ where: { id: dispatchId } });
      if (!dispatch) throw new AppError('Dispatch not found', 404);
      if (!ACTIVE_DISPATCH_STATUSES.includes(dispatch.status)) throw new AppError('Cannot reassign a closed dispatch', 409);
      if (dispatch.ambulanceId === ambulanceId) return dispatch;
      const vehicle = await tx.ambulance.findUnique({ where: { id: ambulanceId } });
      if (!vehicle) throw new AppError('Ambulance not found', 404);
      const claimed = await tx.ambulance.updateMany({ where: { id: ambulanceId, status: 'AVAILABLE', dispatches: { none: { status: { in: ACTIVE_DISPATCH_STATUSES } } } }, data: { status: 'DISPATCHED' } });
      if (!claimed.count) throw new AppError('Ambulance is inactive or already assigned', 409);
      if (dispatch.ambulanceId) await tx.ambulance.update({ where: { id: dispatch.ambulanceId }, data: { status: 'AVAILABLE' } });
      return tx.ambulanceDispatch.update({ where: { id: dispatchId }, data: { ambulanceId } });
    });
  }
  static async assignParamedic(dispatchId: string, paramedicId: string) {
    return prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT "id" FROM "ambulance_dispatches" WHERE "id" = ${dispatchId} FOR UPDATE`;
      const dispatch = await tx.ambulanceDispatch.findUnique({ where: { id: dispatchId } });
      if (!dispatch) throw new AppError('Dispatch not found', 404);
      if (!ACTIVE_DISPATCH_STATUSES.includes(dispatch.status)) throw new AppError('Cannot reassign a closed dispatch', 409);
      await tx.$queryRaw`SELECT "id" FROM "paramedics" WHERE "id" = ${paramedicId} FOR UPDATE`;
      const paramedic = await tx.paramedic.findUnique({ where: { id: paramedicId }, include: { user: true } });
      if (!paramedic || paramedic.verificationStatus !== 'VERIFIED' || paramedic.user.status !== 'ACTIVE') throw new AppError('Select an active verified paramedic', 400);
      const busy = await tx.ambulanceDispatch.findFirst({ where: { paramedicId, id: { not: dispatchId }, status: { in: ACTIVE_DISPATCH_STATUSES } } });
      if (busy) throw new AppError('Paramedic is already assigned to an active trip', 409);
      const updated = await tx.ambulanceDispatch.update({ where: { id: dispatchId }, data: { paramedicId, latitude: null, longitude: null, locationUpdatedAt: null, ...(dispatch.status === 'PENDING' && dispatch.ambulanceId ? { status: 'DISPATCHED' } : {}) } });
      await OutboxRepository.createEvent(tx, { eventType: EVENTS.AMBULANCE_DISPATCHED, aggregateType: 'AMBULANCE_DISPATCH', aggregateId: dispatchId,
        payload: { dispatchId, patientId: dispatch.patientId, visitId: null, paramedicUserId: paramedic.userId } });
      return updated;
    });
  }
}
