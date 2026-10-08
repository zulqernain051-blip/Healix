import { Request, Response } from 'express';
import { prisma } from '../../../../common/config/database';
import { NotificationService } from '../../../communication/notification/notification.service';

const ok = (res: Response, data: any, message = 'Success') =>
  res.json({ success: true, message, data });

const fail = (res: Response, err: any) => {
  const status = err.statusCode ?? 500;
  res.status(status).json({ success: false, message: err.message ?? 'Internal error' });
};

export class ExternalEmergencyController {
  public static async logExternalRequest(req: Request, res: Response): Promise<void> {
    try {
      const { patientId, serviceName = '1122', notes = '' } = req.body;
      const callerUserId = (req as any).user.id;

      if (!patientId) {
        res.status(400).json({ success: false, message: 'patientId is required' });
        return;
      }

      // Create an independent EmergencyEvent tracking the external call
      const emergencyEvent = await prisma.emergencyEvent.create({
        data: {
          patientId,
          source: `EXTERNAL_${serviceName.toUpperCase().replace(/\s+/g, '_')}`,
          severity: 'CRITICAL',
          status: 'ACTIVE'
        }
      });

      // Alert Admin via Socket.IO
      try {
        const { ChatSocketService } = require('../../../communication/chat/chat.socket');
        const io = ChatSocketService.getIo();
        if (io) {
          io.emit('admin_emergency_alert', {
            eventId: emergencyEvent.id,
            patientId,
            message: `External emergency service (${serviceName}) requested by user ${callerUserId}. Direct caller to ${serviceName}.${notes ? ' Notes: ' + notes : ''}`
          });
        }
      } catch (e) {}

      // Log in-app notification for patient
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        select: { userId: true }
      });

      if (patient?.userId) {
        await NotificationService.dispatchNotification({
          userId: patient.userId,
          category: 'EMERGENCY',
          title: `External Emergency Call (${serviceName})`,
          body: `Emergency request recorded for ${serviceName}. If not connected, call ${serviceName} immediately.`,
          channel: 'PUSH'
        });
      }

      ok(res, {
        emergencyEventId: emergencyEvent.id,
        serviceName,
        helplineNumber: serviceName === '1122' ? '1122' : '911',
        instructions: `External emergency assistance logged. Please connect via phone line ${serviceName}.`
      }, `External emergency service request logged.`);
    } catch (e) {
      fail(res, e);
    }
  }
}
