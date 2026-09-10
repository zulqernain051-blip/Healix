import { AppError } from '../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../common/constants/index';
import { VerificationRepository } from './verification.repository';
import { VisitRepository } from '../visit.repository';

export class VerificationService {

  // ─── 11.1 Check-In ─────────────────────────────────────────────────────────
  static async checkIn(visitId: string, nurseId: string) {
    const visit = await VerificationRepository.findVisitById(visitId);
    if (!visit) throw new AppError('Visit not found', HTTP_STATUS.NOT_FOUND);
    if (visit.nurseId !== nurseId) throw new AppError('You are not assigned to this visit', HTTP_STATUS.FORBIDDEN);
    
    // Check-in implies starting the visit manually without verification
    return VisitRepository.startVisit(visitId, 'MANUAL', 'Checked in manually');
  }

  // ─── 11.1 Check-Out ────────────────────────────────────────────────────────
  static async checkOut(visitId: string, nurseId: string) {
    const visit = await VerificationRepository.findVisitWithAttendance(visitId);
    if (!visit) throw new AppError('Visit not found', HTTP_STATUS.NOT_FOUND);
    if (visit.nurseId !== nurseId) throw new AppError('You are not assigned to this visit', HTTP_STATUS.FORBIDDEN);
    if (visit.status !== 'COMPLETED') {
      throw new AppError('Check-out is only allowed after visit is marked COMPLETED', HTTP_STATUS.BAD_REQUEST);
    }
    if (!visit.attendanceRecord) throw new AppError('No check-in record found for this visit', HTTP_STATUS.BAD_REQUEST);
    if (visit.attendanceRecord.checkOutAt) throw new AppError('Already checked out', HTTP_STATUS.BAD_REQUEST);

    return VerificationRepository.checkOutVisit(visitId);
  }

  // ─── 11.2 Patient Arrival Confirmation ─────────────────────────────────────
  static async confirmArrival(visitId: string, patientUserId: string) {
    const visit = await VerificationRepository.findVisitWithPatient(visitId);
    if (!visit) throw new AppError('Visit not found', HTTP_STATUS.NOT_FOUND);
    if (visit.request.patient.userId !== patientUserId) {
      throw new AppError('Only the patient for this visit can confirm arrival', HTTP_STATUS.BAD_REQUEST);
    }
    if (visit.status !== 'IN_PROGRESS') {
      throw new AppError('Visit must be IN_PROGRESS to confirm nurse arrival', HTTP_STATUS.BAD_REQUEST);
    }

    return VerificationRepository.confirmPatientArrival(visitId);
  }

  // ─── 11.3 Visit Completion ──────────────────────────────────────────────────
  static async completeVisit(visitId: string, nurseId: string) {
    const visit = await VerificationRepository.findVisitForCompletion(visitId);
    if (!visit) throw new AppError('Visit not found', HTTP_STATUS.NOT_FOUND);
    if (visit.nurseId !== nurseId) throw new AppError('You are not assigned to this visit', HTTP_STATUS.FORBIDDEN);
    if (visit.status !== 'IN_PROGRESS') throw new AppError('Visit must be IN_PROGRESS to complete', HTTP_STATUS.BAD_REQUEST);

    // Business Rule: vitals must be submitted before completion
    if (!visit.vitals || visit.vitals.length === 0) {
      throw new AppError('Cannot complete visit: vitals not recorded', HTTP_STATUS.BAD_REQUEST);
    }

    // Mark nurse confirmed
    await VerificationRepository.updateNurseConfirmed(visitId, true);

    // Complete the visit immediately and trigger risk engine
    return VisitRepository.completeVisit(visitId);
  }

  // ─── 11.4 Visit Evidence ────────────────────────────────────────────────────
  static async uploadEvidence(
    visitId: string,
    nurseId: string,
    type: string,
    urlOrText: string,
    consentGiven: boolean
  ) {
    const visit = await VerificationRepository.findVisitById(visitId);
    if (!visit) throw new AppError('Visit not found', HTTP_STATUS.NOT_FOUND);
    if (visit.nurseId !== nurseId) throw new AppError('You are not assigned to this visit', HTTP_STATUS.FORBIDDEN);

    // Evidence is immutable once visit is COMPLETED
    if (visit.status === 'COMPLETED') {
      throw new AppError('Evidence is immutable after visit completion. Add a new attachment instead.', HTTP_STATUS.BAD_REQUEST);
    }

    // Photos require explicit patient consent
    if (type === 'PHOTO' && !consentGiven) {
      throw new AppError('Patient consent is required before uploading photos containing identifiable patient faces', HTTP_STATUS.BAD_REQUEST);
    }

    return VerificationRepository.createEvidence(visitId, type, urlOrText, consentGiven);
  }

  // ─── 11.5 QR Token Management ──────────────────────────────────────────────────
  static async getQrToken(visitId: string, patientUserId: string) {
    const visit = await VerificationRepository.findVisitWithPatientAndQr(visitId);
    if (!visit) throw new AppError('Visit not found', HTTP_STATUS.NOT_FOUND);
    if (visit.request.patient.userId !== patientUserId) {
      throw new AppError('Only the patient can view this QR code', HTTP_STATUS.BAD_REQUEST);
    }
    if (!visit.qrToken) {
      throw new AppError('No QR code generated for this visit yet. Ensure contract is active.', HTTP_STATUS.BAD_REQUEST);
    }
    if (visit.qrToken.status === 'EXPIRED' || new Date() > visit.qrToken.expiresAt) {
      // If expired, generate a new one since it was just time-expiry
      if (visit.qrToken.status !== 'VERIFIED') {
        return VerificationRepository.regenerateQrToken(visit.qrToken.id);
      }
      throw new AppError('QR code is expired and already verified.', HTTP_STATUS.BAD_REQUEST);
    }
    return visit.qrToken;
  }

  // ─── 11.6 Verification Methods ────────────────────────────────────────────────
  static async verifyWithQr(visitId: string, nurseId: string, token: string) {
    const visit = await VerificationRepository.findVisitWithQr(visitId);
    if (!visit) throw new AppError('Visit not found', HTTP_STATUS.NOT_FOUND);
    if (visit.nurseId !== nurseId) throw new AppError('You are not assigned to this visit', HTTP_STATUS.FORBIDDEN);
    if (visit.status !== 'SCHEDULED') throw new AppError('Visit is not in a valid state for verification', HTTP_STATUS.BAD_REQUEST);
    if (!visit.qrToken) throw new AppError('No QR token found for this visit', HTTP_STATUS.BAD_REQUEST);
    
    if (visit.qrToken.token !== token) throw new AppError('Invalid QR code', HTTP_STATUS.BAD_REQUEST);
    if (visit.qrToken.status !== 'PENDING' || new Date() > visit.qrToken.expiresAt) {
      throw new AppError('QR code is expired or already used', HTTP_STATUS.BAD_REQUEST);
    }

    return VisitRepository.startVisit(visitId, 'QR', 'QR Code scanned successfully');
  }

  static async verifyWithGps(visitId: string, nurseId: string, lat: number, lng: number) {
    const visit = await VerificationRepository.findVisitWithPatient(visitId);
    if (!visit) throw new AppError('Visit not found', HTTP_STATUS.NOT_FOUND);
    if (visit.nurseId !== nurseId) throw new AppError('You are not assigned to this visit', HTTP_STATUS.FORBIDDEN);
    if (visit.status !== 'SCHEDULED') throw new AppError('Visit is not in a valid state for verification', HTTP_STATUS.BAD_REQUEST);
    
    const pLat = visit.request.patient.latitude;
    const pLng = visit.request.patient.longitude;
    
    if (!pLat || !pLng) throw new AppError('Patient location not set for this visit', HTTP_STATUS.BAD_REQUEST);

    // Haversine formula
    const R = 6371e3; // metres
    const r1 = pLat * Math.PI / 180;
    const r2 = lat * Math.PI / 180;
    const dLat = (lat - pLat) * Math.PI / 180;
    const dLng = (lng - pLng) * Math.PI / 180;

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(r1) * Math.cos(r2) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // in metres

    if (d > 150) {
      throw new AppError('GPS verification failed: You are further than 150m from the patient location', HTTP_STATUS.BAD_REQUEST);
    }

    return VisitRepository.startVisit(visitId, 'GPS', `Verified via GPS distance: ${Math.round(d)}m`, lat, lng);
  }

  static async verifyManual(visitId: string, nurseId: string) {
    if (process.env.NODE_ENV === 'production') {
      throw new AppError('Manual testing verification is not allowed in production', HTTP_STATUS.BAD_REQUEST);
    }

    const visit = await VerificationRepository.findVisitById(visitId);
    if (!visit) throw new AppError('Visit not found', HTTP_STATUS.NOT_FOUND);
    if (visit.nurseId !== nurseId) throw new AppError('You are not assigned to this visit', HTTP_STATUS.FORBIDDEN);
    if (visit.status !== 'SCHEDULED') throw new AppError('Visit is not in a valid state for verification', HTTP_STATUS.BAD_REQUEST);

    return VisitRepository.startVisit(visitId, 'MANUAL', 'Verified manually via dev tools');
  }

  // ─── Get evidence list ──────────────────────────────────────────────────────
  static async getEvidence(visitId: string) {
    return VerificationRepository.findEvidence(visitId);
  }

  // ─── Get attendance record ──────────────────────────────────────────────────
  static async getAttendance(visitId: string) {
    return VerificationRepository.findAttendance(visitId);
  }
}
