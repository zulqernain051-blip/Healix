import { prisma } from '../../../../common/config/database';

export class NurseSchedulingRepository {
  /** Add a weekly availability slot for the nurse */
  public static async addAvailabilitySlot(nurseId: string, data: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
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

  // TODO: Restore orphaned Vacation methods required by care/visit/scheduling
  public static async createVacation(_nurseId: string, _startDate: Date, _endDate: Date, _reason?: string): Promise<any> {
    throw new Error('Not implemented. Vacation model missing from schema.');
  }
  public static async deleteVacation(_vacationId: string, _nurseId: string): Promise<any> {
    throw new Error('Not implemented. Vacation model missing from schema.');
  }
  public static async findVacationsByNurseId(_nurseId: string): Promise<any[]> {
    return [];
  }
}


