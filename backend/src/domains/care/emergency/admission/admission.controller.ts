import { Request, Response, NextFunction } from 'express';
import { AdmissionService } from './admission.service';

export class AdmissionController {
  static async updateAdmissionStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, dischargeNotes } = req.body;
      if (!status) {
        res.status(400).json({ success: false, message: 'status is required' });
        return;
      }
      const updated = await AdmissionService.updateAdmissionStatus(id, status, (req as any).user, dischargeNotes);
      res.status(200).json({ success: true, data: updated });
    } catch (e: any) {
      next(e);
    }
  }
}
