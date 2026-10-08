import { AppError } from '../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../common/constants/index';
import { EscalationRepository } from './escalation.repository';
import { NotificationService } from '../../../communication/notification/notification.service';
import { prisma } from '../../../../common/config/database';

export class EscalationService {
  static async assignDoctor(eventId: string, doctorId: string) {
    const event = await EscalationRepository.findEmergencyEvent(eventId);

    if (!event) {
      throw new AppError('Emergency event not found', HTTP_STATUS.NOT_FOUND);
    }

    const doctor = await EscalationRepository.findDoctor(doctorId);

    if (!doctor) {
      throw new AppError('Doctor not found', HTTP_STATUS.NOT_FOUND);
    }
    if (doctor.verificationStatus !== 'VERIFIED' || doctor.user.status !== 'ACTIVE') throw new AppError('Select an active verified doctor', 400);
    if (['RESOLVED', 'CANCELLED'].includes(event.status)) throw new AppError('Emergency is already closed', 409);

    // Load SLA configuration limit (default 15 minutes)
    const configVal = await EscalationRepository.findPlatformConfig('escalation_sla_max_minutes');
    const configuredMinutes = configVal ? Number(configVal.value) : 15;
    const minutes = Number.isFinite(configuredMinutes) && configuredMinutes > 0 ? configuredMinutes : 15;
    const slaDeadline = new Date(Date.now() + minutes * 60 * 1000);

    // Create case assignment
    const caseAssignment = await prisma.$transaction(async tx => {
      const claimed = await tx.emergencyEvent.updateMany({ where: { id: eventId, status: { notIn: ['RESOLVED', 'CANCELLED'] } }, data: { assignedDoctorId: doctorId, slaDeadline } });
      if (!claimed.count) throw new AppError('Emergency was closed concurrently', 409);
      if (!event.visitId) return null;
      const current = await tx.caseAssignment.findUnique({ where: { visitId: event.visitId } });
      if (current?.status === 'RESOLVED') throw new AppError('The associated case is already resolved', 409);
      return tx.caseAssignment.upsert({ where: { visitId: event.visitId },
        create: { visitId: event.visitId, doctorId, riskTier: event.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH', slaDeadline, status: 'ASSIGNED' },
        update: { doctorId, slaDeadline, status: 'ASSIGNED' } });
    });

    // Auto-create Nurse-Doctor direct chat thread if a nurse visit exists
    if (caseAssignment && event.visit && event.visit.nurseId) {
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

    return caseAssignment || { emergencyEventId: eventId, doctorId };
  }

  static async broadcastCase(eventId: string) {
    const event = await EscalationRepository.findEmergencyEvent(eventId);

    if (!event) {
      throw new AppError('Emergency event not found', HTTP_STATUS.NOT_FOUND);
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
