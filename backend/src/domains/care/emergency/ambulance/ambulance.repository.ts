import { prisma } from '../../../../common/config/database';

export class AmbulanceRepository {
  public static async createAmbulance(data: {
    vehicleNumber: string;
    plateNumber: string;
    type?: string;
    provider?: string;
    contactNumber?: string;
  }) {
    return prisma.ambulance.create({
      data: {
        vehicleNumber: data.vehicleNumber,
        plateNumber: data.plateNumber,
        type: data.type || 'BASIC',
        provider: data.provider || 'Healix Fleet',
        contactNumber: data.contactNumber,
        status: 'AVAILABLE'
      }
    });
  }

  public static async findAllAmbulances(status?: string) {
    return prisma.ambulance.findMany({
      where: status ? { status } : {},
      include: {
        dispatches: {
          where: { status: { in: ['PENDING', 'DISPATCHED', 'EN_ROUTE', 'ARRIVED'] } },
          select: { id: true, status: true, dispatchedAt: true, patientId: true }
        }
      },
      orderBy: { vehicleNumber: 'asc' }
    });
  }

  public static async findAmbulanceById(id: string) {
    return prisma.ambulance.findUnique({
      where: { id },
      include: {
        dispatches: {
          where: { status: { in: ['PENDING', 'DISPATCHED', 'EN_ROUTE', 'ARRIVED'] } }
        }
      }
    });
  }

  public static async updateAmbulance(id: string, data: any) {
    return prisma.ambulance.update({
      where: { id },
      data
    });
  }

  public static async updateAmbulanceStatus(id: string, status: string, tx?: any) {
    const db = tx || prisma;
    return db.ambulance.update({
      where: { id },
      data: { status }
    });
  }

  public static async deleteAmbulance(id: string) {
    return prisma.ambulance.delete({
      where: { id }
    });
  }

  /**
   * Deterministically finds the first available Healix ambulance that has no active dispatches.
   */
  public static async findAvailableAmbulance(tx?: any) {
    const db = tx || prisma;
    return db.ambulance.findFirst({
      where: {
        status: 'AVAILABLE',
        dispatches: {
          none: {
            status: { in: ['PENDING', 'DISPATCHED', 'EN_ROUTE', 'ARRIVED'] }
          }
        }
      },
      orderBy: { vehicleNumber: 'asc' }
    });
  }
}
