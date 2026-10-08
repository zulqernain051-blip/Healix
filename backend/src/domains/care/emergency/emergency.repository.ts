import { prisma } from '../../../common/config/database';
import { AppError } from '../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../common/constants';
import { OutboxRepository } from '../../../common/events/outbox.repository';
import { EVENTS } from '../../../common/events/app-event-bus';

export class EmergencyRepository {
  public static async findActiveDispatchForPatient(patientId: string, tx?: any) {
    const db = tx || prisma;
    return db.ambulanceDispatch.findFirst({
      where: {
        patientId,
        status: { in: ['PENDING', 'DISPATCHED', 'EN_ROUTE', 'ARRIVED'] }
      }
    });
  }

  public static async findLowestWorkloadParamedic(tx?: any) {
    const db = tx || prisma;
    const eligibleParamedics = await db.paramedic.findMany({
      where: {
        verificationStatus: 'VERIFIED',
        user: { status: 'ACTIVE' },
        ambulanceDispatches: { none: { status: { in: ['PENDING', 'DISPATCHED', 'EN_ROUTE', 'ARRIVED'] } } }
      },
      include: {
        user: { select: { id: true, fullName: true, phone: true } },
        ambulanceDispatches: {
          where: {
            status: { in: ['PENDING', 'DISPATCHED', 'EN_ROUTE', 'ARRIVED'] }
          },
          select: { id: true }
        }
      }
    });

    if (!eligibleParamedics || eligibleParamedics.length === 0) {
      return null;
    }

    // Sort by active workload count ascending, then deterministic tie-breaker by ID
    eligibleParamedics.sort((a: any, b: any) => {
      const loadA = a.ambulanceDispatches.length;
      const loadB = b.ambulanceDispatches.length;
      if (loadA !== loadB) return loadA - loadB;
      return a.id.localeCompare(b.id);
    });

    const selected = eligibleParamedics.find((p: any) => p.ambulanceDispatches.length === 0);
    if (!selected) return null;
    await db.$queryRaw`SELECT "id" FROM "paramedics" WHERE "id" = ${selected.id} FOR UPDATE`;
    const busy = await db.ambulanceDispatch.findFirst({ where: { paramedicId: selected.id, status: { in: ['PENDING', 'DISPATCHED', 'EN_ROUTE', 'ARRIVED'] } } });
    return busy ? null : selected;
  }

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

  public static async findDefaultHospital(tx?: any) {
    const db = tx || prisma;
    return db.hospital.findFirst({ where: { capacityStatus: 'AVAILABLE' }, orderBy: { name: 'asc' } });
  }

  public static async createEmergencyWorkflow(data: {
    patientId: string;
    visitId?: string;
    doctorId: string; // The doctor triggering it
    doctorUserId: string; // The doctor's user ID for triggeredBy
    hospitalId?: string;
    notes?: string;
  }, tx?: any) {
    const executeLogic = async (tClient: any) => {
      // 1. Get destination hospital
      const hospital = data.hospitalId
        ? await tClient.hospital.findUnique({ where: { id: data.hospitalId } })
        : await this.findDefaultHospital(tClient);
      if (!hospital) throw new AppError(data.hospitalId ? 'Hospital not found' : 'No available destination hospital is configured', data.hospitalId ? HTTP_STATUS.NOT_FOUND : HTTP_STATUS.SERVICE_UNAVAILABLE);
      if (hospital.capacityStatus === 'FULL') throw new AppError('Selected hospital is marked full. Select another destination.', 409);

      // 2. Deterministically select available Healix ambulance
      const ambulance = await this.findAvailableAmbulance(tClient);
      if (!ambulance) {
        // Record EmergencyEvent so the patient's condition is tracked and surfaced to Admin
        // Persist the resource-shortage alert independently of a failed dispatch
        // transaction, otherwise the error rolls the emergency record back.
        const existingShortage = await prisma.emergencyEvent.findFirst({ where: { patientId: data.patientId, assignedDoctorId: data.doctorId, status: 'ACTIVE' } });
        const emergencyEvent = existingShortage || await prisma.emergencyEvent.create({
          data: {
            patientId: data.patientId,
            visitId: data.visitId || null,
            source: 'DOCTOR',
            severity: 'CRITICAL',
            status: 'ACTIVE',
            assignedDoctorId: data.doctorId,
            slaDeadline: new Date(Date.now() + 15 * 60 * 1000)
          }
        });

        try {
          const { ChatSocketService } = require('../../communication/chat/chat.socket');
          const io = ChatSocketService.getIo();
          if (io) {
            io.to('role:ADMIN').emit('admin_emergency_alert', {
              eventId: emergencyEvent.id,
              patientId: data.patientId,
              message: '🚨 CRITICAL: Doctor requested emergency ambulance, but no Healix ambulance is currently available!'
            });
          }
        } catch (e) {}

        throw new AppError('No Healix ambulance is currently available for dispatch. Emergency recorded and Admin notified.', HTTP_STATUS.SERVICE_UNAVAILABLE);
      }

      // Serialize dispatches for a patient as well as claims for a vehicle.
      const patients = await tClient.$queryRaw`SELECT "id" FROM "patients" WHERE "id" = ${data.patientId} FOR UPDATE`;
      if (!patients.length) throw new AppError('Patient not found', HTTP_STATUS.NOT_FOUND);
      if (await this.findActiveDispatchForPatient(data.patientId, tClient)) {
        throw new AppError('An active ambulance dispatch already exists for this patient.', HTTP_STATUS.CONFLICT);
      }
      const claimed = await tClient.ambulance.updateMany({
        where: { id: ambulance.id, status: 'AVAILABLE' }, data: { status: 'DISPATCHED' }
      });
      if (claimed.count === 0) throw new AppError('Ambulance was assigned by another request. Please retry.', HTTP_STATUS.CONFLICT);

      // 3. Workload-balanced eligible paramedic selection
      const paramedic = await this.findLowestWorkloadParamedic(tClient);

      // 4. Create EmergencyEvent as an independent entity with status and SLA
      const existingEvent = await tClient.emergencyEvent.findFirst({ where: { patientId: data.patientId, assignedDoctorId: data.doctorId, status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } });
      const eventData = {
          patientId: data.patientId,
          visitId: data.visitId || existingEvent?.visitId || null,
          source: 'DOCTOR',
          severity: 'CRITICAL',
          status: 'ACTIVE',
          assignedDoctorId: data.doctorId,
          slaDeadline: new Date(Date.now() + 15 * 60 * 1000) // 15-minute emergency response SLA default
      };
      const emergencyEvent = existingEvent
        ? await tClient.emergencyEvent.update({ where: { id: existingEvent.id }, data: { severity: 'CRITICAL', slaDeadline: eventData.slaDeadline } })
        : await tClient.emergencyEvent.create({ data: eventData });

      // 5. Create AmbulanceDispatch linking real ambulance and paramedic
      const ambulanceDispatch = await tClient.ambulanceDispatch.create({
        data: {
          emergencyEventId: emergencyEvent.id,
          patientId: data.patientId,
          triggeredByUserId: data.doctorUserId,
          hospitalId: hospital.id,
          ambulanceId: ambulance ? ambulance.id : null,
          paramedicId: paramedic ? paramedic.id : null,
          status: paramedic ? 'DISPATCHED' : 'PENDING',
          etaMinutes: 15,
          notes: data.notes
        },
        include: {
          ambulance: true,
          paramedic: { include: { user: { select: { id: true, fullName: true, phone: true } } } },
          hospital: true,
          patient: { include: { user: { select: { id: true, fullName: true, phone: true } } } }
        }
      });

      // 6. Mark ambulance as DISPATCHED if assigned
      let updatedAmbulance = ambulance;
      if (ambulance) {
        updatedAmbulance = await tClient.ambulance.update({
          where: { id: ambulance.id },
          data: { status: 'DISPATCHED' }
        });
      }

      if (paramedic) {
        await OutboxRepository.createEvent(tClient, {
          eventType: EVENTS.AMBULANCE_DISPATCHED, aggregateType: 'AMBULANCE_DISPATCH', aggregateId: ambulanceDispatch.id,
          payload: { dispatchId: ambulanceDispatch.id, patientId: data.patientId, visitId: data.visitId || null, paramedicUserId: paramedic.userId }
        });
      }
      return { emergencyEvent, ambulanceDispatch, ambulance: updatedAmbulance, paramedic };
    };

    if (tx && tx !== prisma) {
      return executeLogic(tx);
    }
    return prisma.$transaction(executeLogic);
  }
}
