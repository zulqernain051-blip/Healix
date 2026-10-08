import { AppError } from '../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../common/constants/index';
import { DispatchRepository } from './dispatch.repository';
import { EmergencyRepository } from '../emergency.repository';
import { prisma } from '../../../../common/config/database';
import { AssertPatientAccessUseCase, PatientActor } from '../../../identity/patient/usecases/profile/assert-patient-access.usecase';

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class DispatchService {
  static async assertAccess(dispatchId: string, actor: PatientActor & { doctor?: { id: string } | null }, write = false) {
    const dispatch = await DispatchRepository.findDispatchWithDetails(dispatchId);
    if (!dispatch) throw new AppError('Dispatch record not found', HTTP_STATUS.NOT_FOUND);
    return this.assertDispatchActor(dispatch, actor, write);
  }
  static async assertDispatchActor(dispatch: any, actor: PatientActor & { doctor?: { id: string } | null }, write = false) {
    if (actor.role === 'ADMIN') return;
    if (actor.role === 'PARAMEDIC' && dispatch.paramedic?.userId === actor.id) return;
    if (actor.role === 'DOCTOR' && (dispatch.triggeredByUserId === actor.id || (actor.doctor?.id && dispatch.emergencyEvent?.assignedDoctorId === actor.doctor.id))) return;
    if (!write) return AssertPatientAccessUseCase.execute(dispatch.patientId, actor);
    throw new AppError('You are not authorized to update this dispatch', HTTP_STATUS.FORBIDDEN);
  }

  static async recommendHospitals(patientId: string, latitude: number, longitude: number, affordabilityTier = 'HIGH') {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
      throw new AppError('Valid latitude and longitude are required', HTTP_STATUS.BAD_REQUEST);
    }
    const patient = await DispatchRepository.findPatientById(patientId);

    if (!patient) {
      throw new AppError('Patient not found', HTTP_STATUS.NOT_FOUND);
    }

    if (!['LOW', 'MEDIUM', 'HIGH'].includes(affordabilityTier)) throw new AppError('Invalid affordability tier', 400);
    const patAffordability = affordabilityTier;
    const hospitals = await DispatchRepository.findAllHospitals();
    const now = new Date();

    let filtered = hospitals.map(h => {
      const distance = getDistanceKm(latitude, longitude, h.latitude, h.longitude);
      const isStale = (now.getTime() - h.capacityUpdatedAt.getTime()) > 30 * 60 * 1000;
      return {
        ...h,
        distance,
        staleCapacityWarning: isStale
      };
    });

    let passesAffordability = filtered.filter(h => {
      if (h.isCharity) return true;
      if (patAffordability === 'LOW') return h.affordabilityTier === 'LOW';
      if (patAffordability === 'MEDIUM') return h.affordabilityTier === 'LOW' || h.affordabilityTier === 'MEDIUM';
      return true;
    });

    const nearbyAffordable = passesAffordability.filter(h => h.distance <= 25);
    if (nearbyAffordable.length) passesAffordability = nearbyAffordable;
    return passesAffordability.sort((a, b) => Number(a.capacityStatus === 'FULL') - Number(b.capacityStatus === 'FULL') || a.distance - b.distance);
  }

  static async triggerAmbulanceDispatch(patientId: string, hospitalId: string, triggeredByUserId: string, justification?: string) {
    // 1. Verify user authorization (Must be a Doctor)
    const user = await prisma.user.findUnique({
      where: { id: triggeredByUserId },
      include: { doctor: true }
    });

    if (!user || user.role !== 'DOCTOR' || !user.doctor) {
      throw new AppError('Only doctors can authorize Healix emergency ambulance dispatch', HTTP_STATUS.FORBIDDEN);
    }
    if (user.doctor.verificationStatus !== 'VERIFIED' || user.status !== 'ACTIVE') throw new AppError('An active verified doctor must authorize dispatch', 403);

    // 2. Prevent duplicate active dispatches for the patient
    const activeDispatch = await EmergencyRepository.findActiveDispatchForPatient(patientId);
    if (activeDispatch) {
      throw new AppError('An active ambulance dispatch already exists for this patient.', HTTP_STATUS.CONFLICT);
    }

    // 3. Verify destination hospital
    const hospital = await DispatchRepository.findHospitalById(hospitalId);
    if (!hospital) {
      throw new AppError('Hospital not found', HTTP_STATUS.NOT_FOUND);
    }

    // 4. Delegate to unified workflow
    const { DispatchAmbulanceUseCase } = require('../usecases/dispatch-ambulance.usecase');
    const useCase = new DispatchAmbulanceUseCase();
    return useCase.execute(patientId, undefined, user.doctor.id, user.id, undefined, hospitalId, justification);
  }

  static async getDispatchTracking(dispatchId: string) {
    const dispatch = await DispatchRepository.findDispatchWithDetails(dispatchId);

    if (!dispatch) {
      throw new AppError('Dispatch record not found', HTTP_STATUS.NOT_FOUND);
    }

    // Live ETA countdown for display
    const elapsedMinutes = Math.floor((Date.now() - (dispatch.etaUpdatedAt || dispatch.dispatchedAt).getTime()) / (60 * 1000));
    const liveEta = Math.max(0, dispatch.etaMinutes - elapsedMinutes);

    return {
      id: dispatch.id,
      status: dispatch.status, // Database-persisted authoritative status
      etaMinutes: liveEta,
      destinationHospital: dispatch.hospital ? dispatch.hospital.name : 'Unknown Hospital',
      ambulance: dispatch.ambulance ? {
        id: dispatch.ambulance.id,
        vehicleNumber: dispatch.ambulance.vehicleNumber,
        plateNumber: dispatch.ambulance.plateNumber,
        type: dispatch.ambulance.type,
        contactNumber: dispatch.ambulance.contactNumber,
        status: dispatch.ambulance.status
      } : null,
      paramedic: dispatch.paramedic ? {
        id: dispatch.paramedic.id,
        name: dispatch.paramedic.user.fullName,
        contact: dispatch.paramedic.user.phone || null
      } : null,
      emergencyEventId: dispatch.emergencyEventId,
      dispatchedAt: dispatch.dispatchedAt,
      arrivedAt: dispatch.arrivedAt,
      completedAt: dispatch.completedAt,
      notes: dispatch.notes,
      admissions: dispatch.admissions,
      location: dispatch.latitude !== null && dispatch.latitude !== undefined ? {
        latitude: dispatch.latitude, longitude: dispatch.longitude, updatedAt: dispatch.locationUpdatedAt,
        stale: !dispatch.locationUpdatedAt || Date.now() - dispatch.locationUpdatedAt.getTime() > 120000,
      } : null,
      etaSource: dispatch.etaUpdatedAt ? 'PARAMEDIC_ESTIMATE' : 'INITIAL_ESTIMATE',
    };
  }

  static async updateDispatchStatus(dispatchId: string, status: string, notes?: string, actor?: PatientActor & { doctor?: { id: string } | null }) {
    const allowedStatuses = ['PENDING', 'DISPATCHED', 'EN_ROUTE', 'ARRIVED', 'COMPLETED', 'CANCELLED'];
    if (!allowedStatuses.includes(status)) {
      throw new AppError(`Invalid dispatch status: ${status}. Allowed: ${allowedStatuses.join(', ')}`, HTTP_STATUS.BAD_REQUEST);
    }

    return prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT "id" FROM "ambulance_dispatches" WHERE "id" = ${dispatchId} FOR UPDATE`;
      const dispatch = await DispatchRepository.findDispatchWithDetails(dispatchId, tx);
      if (!dispatch) throw new AppError('Dispatch record not found', HTTP_STATUS.NOT_FOUND);
      if (actor) await this.assertDispatchActor(dispatch, actor, true);
      if (['DISPATCHED', 'EN_ROUTE', 'ARRIVED'].includes(status) && (!dispatch.ambulanceId || !dispatch.paramedicId)) throw new AppError('Assign an ambulance and paramedic before advancing the trip', 409);
      const transitions: Record<string, string[]> = {
        PENDING: ['DISPATCHED', 'CANCELLED'], DISPATCHED: ['EN_ROUTE', 'ARRIVED', 'CANCELLED'],
        EN_ROUTE: ['ARRIVED', 'CANCELLED'], ARRIVED: ['COMPLETED', 'CANCELLED'], COMPLETED: [], CANCELLED: []
      };
      if (dispatch.status === status) return dispatch;
      if (!transitions[dispatch.status]?.includes(status)) throw new AppError(`Cannot change dispatch from ${dispatch.status} to ${status}`, HTTP_STATUS.CONFLICT);
      const claimed = await tx.ambulanceDispatch.updateMany({ where: { id: dispatchId, status: dispatch.status }, data: { status } });
      if (claimed.count === 0) throw new AppError('Dispatch status changed concurrently. Please reload.', HTTP_STATUS.CONFLICT);
      const updateData: any = { status };
      if (notes) updateData.notes = notes;

      if (status === 'ARRIVED') {
        updateData.arrivedAt = new Date();
      } else if (status === 'COMPLETED') {
        updateData.completedAt = new Date();

        // Release ambulance back to AVAILABLE
        if (dispatch.ambulanceId) {
          await tx.ambulance.update({
            where: { id: dispatch.ambulanceId },
            data: { status: 'AVAILABLE' }
          });
        }

        // Mark associated EmergencyEvent as RESOLVED
        if (dispatch.emergencyEventId) {
          await tx.emergencyEvent.update({
            where: { id: dispatch.emergencyEventId },
            data: { status: 'RESOLVED', resolvedAt: new Date() }
          });
        }
      } else if (status === 'CANCELLED') {
        // Release ambulance back to AVAILABLE
        if (dispatch.ambulanceId) {
          await tx.ambulance.update({
            where: { id: dispatch.ambulanceId },
            data: { status: 'AVAILABLE' }
          });
        }

        if (dispatch.emergencyEventId) {
          await tx.emergencyEvent.update({
            where: { id: dispatch.emergencyEventId },
            data: { status: 'CANCELLED', resolvedAt: new Date() }
          });
        }
      }

      return tx.ambulanceDispatch.update({
        where: { id: dispatchId },
        data: updateData,
        include: {
          hospital: true,
          ambulance: true,
          paramedic: { include: { user: { select: { id: true, fullName: true, phone: true } } } }
        }
      });
    });
  }
}
