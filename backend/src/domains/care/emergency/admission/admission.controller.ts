import { Request, Response } from 'express';
import { AdmissionService } from './admission.service';

export class AdmissionController {
  static async updateAdmissionStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, dischargeNotes } = req.body;
      if (!status) {
        res.status(400).json({ success: false, message: 'status is required' });
        return;
      }
      const updated = await AdmissionService.updateAdmissionStatus(id, status, dischargeNotes);
      res.status(200).json({ success: true, data: updated });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message || 'Failed to update admission status' });
    }
  }
}
