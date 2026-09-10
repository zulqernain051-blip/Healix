import { prisma } from '../../../common/config/database';

export class EmergencyRepository {
  public static async findActiveDispatchForPatient(patientId: string) {
    return prisma.ambulanceDispatch.findFirst({
      where: {
        patientId,
        status: { in: ['PENDING', 'DISPATCHED'] }
      }
    });
  }

  public static async getDummyHospital() {
    let hospital = await prisma.hospital.findFirst();
    if (!hospital) {
      hospital = await prisma.hospital.create({
        data: {
          name: 'City General Hospital (Simulated)',
          latitude: 0,
          longitude: 0,
          capacityStatus: 'AVAILABLE',
          affordabilityTier: 'MEDIUM',
          isCharity: false
        }
      });
    }
    return hospital;
  }

  public static async createEmergencyWorkflow(data: {
    patientId: string;
    visitId?: string;
    doctorId: string; // The doctor triggering it
    doctorUserId: string; // The doctor's user ID for triggeredBy
  }, tx?: any) {
    const executeLogic = async (tx: any) => {
      // 1. Get hospital (simulated FYP fallback)
      let hospital = await tx.hospital.findFirst();
      if (!hospital) {
        hospital = await tx.hospital.create({
          data: {
            name: 'City General Hospital (Simulated)',
            latitude: 0,
            longitude: 0,
            capacityStatus: 'AVAILABLE',
            affordabilityTier: 'MEDIUM',
            isCharity: false
          }
        });
      }

      // 2. Create EmergencyEvent
      const emergencyEvent = await tx.emergencyEvent.create({
        data: {
          patientId: data.patientId,
          visitId: data.visitId || null,
          source: 'DOCTOR', // Represents doctor request
          severity: 'CRITICAL',
        }
      });

      // 3. Create AmbulanceDispatch
      const ambulanceDispatch = await tx.ambulanceDispatch.create({
        data: {
          patientId: data.patientId,
          triggeredByUserId: data.doctorUserId,
          hospitalId: hospital.id,
          status: 'DISPATCHED',
          etaMinutes: 15,
        }
      });

      return { emergencyEvent, ambulanceDispatch };
    };

    if (tx) {
      return executeLogic(tx);
    }
    return prisma.$transaction(executeLogic);
  }
}
