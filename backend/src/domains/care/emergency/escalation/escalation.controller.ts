import { Request, Response } from 'express';
import { EscalationService } from './escalation.service';

export class EscalationController {
  static async assignDoctor(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const { doctorId } = req.body;
      if (!doctorId) {
        res.status(400).json({ success: false, message: 'doctorId is required' });
        return;
      }
      const assignment = await EscalationService.assignDoctor(eventId, doctorId);
      res.status(200).json({ success: true, data: assignment });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message || 'Failed to assign doctor' });
    }
  }

  static async broadcastCase(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const result = await EscalationService.broadcastCase(eventId);
      res.status(200).json({ success: true, data: result });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message || 'Failed to broadcast case' });
    }
  }
}
