import { prisma } from '../../../common/config/database';
import { AppError } from '../../../common/errors/AppError';
import { DispatchService } from './dispatch/dispatch.service';
import { ACTIVE_DISPATCH_STATUSES, locationSchema } from './emergency.validation';

export class EmergencyOperationsService {
  static async listEvents(actor: any) {
    if (actor.role !== 'DOCTOR') throw new AppError('Doctor access required', 403);
    return prisma.emergencyEvent.findMany({ where: { assignedDoctorId: actor.doctor?.id || '__none__', status: 'ACTIVE' }, orderBy: { createdAt: 'desc' },
      include: { patient: { include: { user: { select: { fullName: true, phone: true } } } }, dispatches: { where: { status: { in: ACTIVE_DISPATCH_STATUSES } }, select: { id: true } } } });
  }
  static async listDispatches(actor: any) {
    let where: any;
    if (actor.role === 'ADMIN') where = {};
    else if (actor.role === 'PARAMEDIC') where = { paramedic: { userId: actor.id } };
    else if (actor.role === 'DOCTOR') where = { OR: [
      { triggeredByUserId: actor.id }, { emergencyEvent: { assignedDoctorId: actor.doctor?.id || '__none__' } },
    ] };
    else if (actor.role === 'PATIENT') where = { patient: { userId: actor.id } };
    else throw new AppError('You cannot access dispatch operations', 403);
    return prisma.ambulanceDispatch.findMany({
      where, orderBy: { dispatchedAt: 'desc' }, take: 200,
      include: { hospital: true, ambulance: true, emergencyEvent: true, admissions: true,
        patient: { include: { user: { select: { fullName: true, phone: true } } } },
        paramedic: { include: { user: { select: { fullName: true, phone: true } } } } },
    });
  }
  static async updateLocation(dispatchId: string, actor: any, input: unknown) {
    const parsed = locationSchema.safeParse(input);
    if (!parsed.success) throw new AppError(parsed.error.issues.map(i => i.message).join('; '), 400);
    const dispatch = await prisma.ambulanceDispatch.findUnique({ where: { id: dispatchId }, include: { paramedic: true } });
    if (!dispatch) throw new AppError('Dispatch not found', 404);
    if (actor.role !== 'PARAMEDIC' || dispatch.paramedic?.userId !== actor.id) throw new AppError('Only the assigned paramedic can share vehicle location', 403);
    const now = new Date();
    const updated = await prisma.ambulanceDispatch.updateMany({
      where: { id: dispatchId, paramedicId: dispatch.paramedicId, status: { in: ACTIVE_DISPATCH_STATUSES } },
      data: { latitude: parsed.data.latitude, longitude: parsed.data.longitude, locationUpdatedAt: now,
        ...(parsed.data.etaMinutes !== undefined ? { etaMinutes: parsed.data.etaMinutes, etaUpdatedAt: now } : {}) },
    });
    if (!updated.count) throw new AppError('Dispatch is no longer active', 409);
    return DispatchService.getDispatchTracking(dispatchId);
  }
  static async requestAdmission(dispatchId: string, actor: any) {
    if (!['ADMIN', 'DOCTOR', 'PARAMEDIC'].includes(actor.role)) throw new AppError('Only clinical staff can request admission', 403);
    await DispatchService.assertAccess(dispatchId, actor, true);
    return prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT "id" FROM "ambulance_dispatches" WHERE "id" = ${dispatchId} FOR UPDATE`;
      const dispatch = await tx.ambulanceDispatch.findUniqueOrThrow({ where: { id: dispatchId }, include: { paramedic: true, emergencyEvent: true } });
      await DispatchService.assertDispatchActor(dispatch, actor, true);
      if (dispatch.status === 'CANCELLED') throw new AppError('Cannot request admission for a cancelled dispatch', 409);
      const existing = await tx.admission.findFirst({ where: { dispatchId } });
      if (existing) return existing;
      return tx.admission.create({ data: { dispatchId, patientId: dispatch.patientId, status: 'REQUESTED' } });
    });
  }
}
