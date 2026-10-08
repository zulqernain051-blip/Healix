import { AmbulanceRepository } from './ambulance.repository';
import { AppError } from '../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../common/constants/index';
import { prisma } from '../../../../common/config/database';
import { ambulanceSchema, ACTIVE_DISPATCH_STATUSES } from '../emergency.validation';

export class AmbulanceService {
  public static async getAllAmbulances(status?: string) {
    if (status && !['AVAILABLE', 'DISPATCHED', 'INACTIVE'].includes(status)) throw new AppError('Invalid ambulance status', 400);
    return AmbulanceRepository.findAllAmbulances(status);
  }

  public static async getAmbulanceById(id: string) {
    const ambulance = await AmbulanceRepository.findAmbulanceById(id);
    if (!ambulance) {
      throw new AppError('Ambulance not found', HTTP_STATUS.NOT_FOUND);
    }
    return ambulance;
  }

  public static async registerAmbulance(data: {
    vehicleNumber: string;
    plateNumber: string;
    type?: string;
    provider?: string;
    contactNumber?: string;
  }) {
    if (!data.vehicleNumber || !data.plateNumber) {
      throw new AppError('Vehicle number and plate number are required', HTTP_STATUS.BAD_REQUEST);
    }
    const parsed = ambulanceSchema.safeParse(data);
    if (!parsed.success) throw new AppError(parsed.error.issues.map(i => i.message).join('; '), 400);
    return prisma.ambulance.create({ data: parsed.data });
  }

  public static async updateAmbulance(id: string, data: any) {
    const parsed = ambulanceSchema.partial().safeParse(data);
    if (!parsed.success) throw new AppError(parsed.error.issues.map(i => i.message).join('; '), 400);
    return prisma.$transaction(async tx => {
      const rows = await tx.$queryRaw<any[]>`SELECT "id" FROM "ambulances" WHERE "id" = ${id} FOR UPDATE`;
      if (!rows.length) throw new AppError('Ambulance not found', 404);
      if (parsed.data.status && await tx.ambulanceDispatch.count({ where: { ambulanceId: id, status: { in: ACTIVE_DISPATCH_STATUSES } } })) {
        throw new AppError('Active dispatch controls vehicle availability. Complete or cancel it first.', 409);
      }
      return tx.ambulance.update({ where: { id }, data: parsed.data });
    });
  }

  public static async deleteAmbulance(id: string) {
    return prisma.$transaction(async tx => {
      const rows = await tx.$queryRaw<any[]>`SELECT "id" FROM "ambulances" WHERE "id" = ${id} FOR UPDATE`;
      if (!rows.length) throw new AppError('Ambulance not found', 404);
      if (await tx.ambulanceDispatch.count({ where: { ambulanceId: id } })) throw new AppError('Vehicle has dispatch history. Mark it inactive to preserve records.', 409);
      return tx.ambulance.delete({ where: { id } });
    });
  }
}
