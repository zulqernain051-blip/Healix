import { AppEventBus, EVENTS } from '../../../common/events/app-event-bus';
import { ChatRepository } from '../../communication/chat/chat.repository';
import { ChatService } from '../../communication/chat/chat.service';
import { NotificationService } from '../../communication/notification/notification.service';
import { VisitRepository } from '../visit/visit.repository';
import { AppError } from '../../../common/errors/AppError';

export function registerEmergencyListeners() {
  AppEventBus.on(EVENTS.AMBULANCE_DISPATCHED, async (payload: { dispatchId: string; patientId: string; visitId: string | null; paramedicUserId: string }) => {
    const patientUserId = await ChatRepository.findPatientUserId(payload.patientId);
    if (!patientUserId) throw new AppError('Patient not found for emergency communication', 404);
    await ChatService.getOrCreateThread(payload.paramedicUserId, patientUserId);
    if (payload.visitId) {
      const visit = await VisitRepository.findVisitById(payload.visitId);
      if (visit?.nurse?.user?.id) await ChatService.getOrCreateThread(payload.paramedicUserId, visit.nurse.user.id);
    }
    await NotificationService.dispatchNotification({
      userId: payload.paramedicUserId, category: 'EMERGENCY', title: 'Emergency Ambulance Assignment',
      body: `You have been assigned to emergency dispatch #${payload.dispatchId.slice(0, 8)}. Open app for patient details.`, channel: 'PUSH'
    });
  });
}
