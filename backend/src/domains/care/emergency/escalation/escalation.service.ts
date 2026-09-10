import { AppError } from '../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../common/constants/index';
import { EscalationRepository } from './escalation.repository';
import { NotificationService } from '../../../communication/notification/notification.service';

export class EscalationService {
  static async assignDoctor(eventId: string, doctorId: string) {
    const event = await EscalationRepository.findEmergencyEvent(eventId);

    if (!event) {
      throw new AppError('', HTTP_STATUS.NOT_FOUND);
    }

    const doctor = await EscalationRepository.findDoctor(doctorId);

    if (!doctor) {
      throw new AppError('', HTTP_STATUS.NOT_FOUND);
    }

    // Load SLA configuration limit (default 15 minutes)
    const configVal = await EscalationRepository.findPlatformConfig('escalation_sla_max_minutes');
    const minutes = configVal ? parseInt(configVal.value) : 15;
    const slaDeadline = new Date(Date.now() + minutes * 60 * 1000);

    // Create case assignment
    const caseAssignment = await EscalationRepository.createCaseAssignment(
      event.visitId || 'TEMP-VISIT-ID', // Fallback or associate with visit
      doctorId,
      'HIGH',
      slaDeadline
    );

    // Auto-create Nurse-Doctor direct chat thread if a nurse visit exists
    if (event.visit && event.visit.nurseId) {
      const nurse = await EscalationRepository.findNurse(event.visit.nurseId);

      if (nurse) {
        await EscalationRepository.createNurseDoctorThread(nurse.userId, doctor.userId, caseAssignment.id);
      }
    }

    // Trigger urgent notification dispatch to doctor
    await NotificationService.dispatchNotification({
      userId: doctor.userId,
      category: 'EMERGENCY',
      title: '🚨 New Emergency Escalation Case',
      body: `You have been assigned an emergency case with a strict ${minutes}-minute SLA response limit.`,
      channel: 'PUSH'
    });

    return caseAssignment;
  }

  static async broadcastCase(eventId: string) {
    const event = await EscalationRepository.findEmergencyEvent(eventId);

    if (!event) {
      throw new AppError('', HTTP_STATUS.NOT_FOUND);
    }

    // Retrieve all active/verified doctors
    const doctors = await EscalationRepository.findVerifiedDoctors();

    // Dispatch emergency notification to all doctors
    for (const doc of doctors) {
      await NotificationService.dispatchNotification({
        userId: doc.userId,
        category: 'EMERGENCY',
        title: '🚨 EMERGENCY BROADCAST ALERT',
        body: 'An unacknowledged emergency case is now broadcasting to all doctors. Open dashboard immediately.',
        channel: 'PUSH'
      });
    }

    return { broadcastedCount: doctors.length };
  }
}
