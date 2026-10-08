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

  static async createDispatch(data: {
    patientId: string;
    hospitalId: string;
    triggeredByUserId: string;
    ambulanceId?: string;
    paramedicId?: string;
    emergencyEventId?: string;
    etaMinutes: number;
  }, tx?: any) {
    const db = tx || prisma;
    return db.ambulanceDispatch.create({
      data: {
        patientId: data.patientId,
        triggeredByUserId: data.triggeredByUserId,
        hospitalId: data.hospitalId,
        ambulanceId: data.ambulanceId || null,
        paramedicId: data.paramedicId || null,
        emergencyEventId: data.emergencyEventId || null,
        status: 'DISPATCHED',
        etaMinutes: data.etaMinutes
      }
    });
  }

  static async findDispatchWithDetails(dispatchId: string, tx?: any) {
    const db = tx || prisma;
    return db.ambulanceDispatch.findUnique({
      where: { id: dispatchId },
      include: {
        hospital: true,
        ambulance: true,
        paramedic: { include: { user: { select: { id: true, fullName: true, phone: true } } } },
        patient: { include: { user: { select: { id: true, fullName: true, phone: true } } } },
        emergencyEvent: true,
        admissions: true
      }
    });
  }

  static async updateDispatch(dispatchId: string, data: any, tx?: any) {
    const db = tx || prisma;
    return db.ambulanceDispatch.update({
      where: { id: dispatchId },
      data,
      include: {
        hospital: true,
        ambulance: true,
        paramedic: { include: { user: { select: { id: true, fullName: true, phone: true } } } }
      }
    });
  }
}
