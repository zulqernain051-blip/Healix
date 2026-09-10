import { prisma } from '../../../../common/config/database';

export class DispatchRepository {
  static async findPatientById(patientId: string) {
    return prisma.patient.findUnique({
      where: { id: patientId }
    });
  }

  static async findAllHospitals() {
    return prisma.hospital.findMany();
  }

  static async findHospitalById(hospitalId: string) {
    return prisma.hospital.findUnique({
      where: { id: hospitalId }
    });
  }

  static async createDispatch(patientId: string, hospitalId: string, triggeredByUserId: string, etaMinutes: number) {
    return prisma.ambulanceDispatch.create({
      data: {
        patientId,
        triggeredByUserId,
        hospitalId,
        status: 'DISPATCHED',
        etaMinutes
      }
    });
  }

  static async findDispatchWithDetails(dispatchId: string) {
    return prisma.ambulanceDispatch.findUnique({
      where: { id: dispatchId },
      include: { hospital: true, patient: { include: { user: true } } }
    });
  }
}
