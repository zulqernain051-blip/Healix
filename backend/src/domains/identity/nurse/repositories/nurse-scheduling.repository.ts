import { AppError } from '../../../../common/errors/AppError';
import { prisma } from '../../../../common/config/database';

export class NurseSchedulingRepository {
  /** Add a weekly availability slot for the nurse */
  public static async addAvailabilitySlot(nurseId: string, data: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    shiftType?: string;
  }) {
    return prisma.availabilitySlot.create({
      data: { nurseId, ...data }
    });
  }

  /** Get all availability slots for a nurse */
  public static async findAvailabilitySlots(nurseId: string) {
    return prisma.availabilitySlot.findMany({
      where: { nurseId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
    });
  }

  /** Delete an availability slot */
  public static async deleteAvailabilitySlot(id: string, nurseId: string) {
    return prisma.availabilitySlot.deleteMany({ where: { id, nurseId } });
  }

  /** Get all availability slots for a nurse on a specific day */
  public static async findAvailabilitySlotsForDay(nurseId: string, dayOfWeek: number) {
    return prisma.availabilitySlot.findMany({
      where: { nurseId, dayOfWeek }
    });
  }

  public static async createVacation(nurseId: string, startDate: Date, endDate: Date, reason?: string) {
    return prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT "id" FROM "nurses" WHERE "id" = ${nurseId} FOR UPDATE`;
      const [overlap, visit] = await Promise.all([
        tx.nurseVacation.findFirst({ where: { nurseId, startDate: { lte: endDate }, endDate: { gte: startDate } } }),
        tx.visit.findFirst({ where: { nurseId, status: { in: ['SCHEDULED', 'ACCEPTED', 'IN_PROGRESS'] }, request: { scheduledAt: { gte: startDate, lte: endDate } } } })
      ]);
      if (overlap) throw new AppError('This date range overlaps existing time off', 409);
      if (visit) throw new AppError('An assigned visit falls within this time off. Resolve the booking before adding vacation.', 409);
      return tx.nurseVacation.create({ data: { nurseId, startDate, endDate, reason } });
    });
  }
  public static async deleteVacation(vacationId: string, nurseId: string) {
    return prisma.nurseVacation.deleteMany({ where: { id: vacationId, nurseId } });
  }
  public static async findVacationsByNurseId(nurseId: string) {
    return prisma.nurseVacation.findMany({ where: { nurseId }, orderBy: { startDate: 'asc' } });
  }
}


