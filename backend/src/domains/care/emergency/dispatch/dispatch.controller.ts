import { Request, Response } from 'express';
import { DispatchService } from './dispatch.service';

export class DispatchController {
  static async recommendHospitals(req: Request, res: Response): Promise<void> {
    try {
      const { patientId, latitude, longitude } = req.query;
      if (!patientId || !latitude || !longitude) {
        res.status(400).json({ success: false, message: 'patientId, latitude, and longitude are required' });
        return;
      }
      const list = await DispatchService.recommendHospitals(
        String(patientId),
        parseFloat(String(latitude)),
        parseFloat(String(longitude))
      );
      res.status(200).json({ success: true, data: list });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message || 'Failed to recommend hospitals' });
    }
  }

  static async triggerAmbulanceDispatch(req: Request, res: Response): Promise<void> {
    try {
      const { patientId, hospitalId } = req.body;
      const triggeredByUserId = (req as any).user.id;
      if (!patientId || !hospitalId) {
        res.status(400).json({ success: false, message: 'patientId and hospitalId are required' });
        return;
      }
      const dispatch = await DispatchService.triggerAmbulanceDispatch(patientId, hospitalId, triggeredByUserId);
      res.status(200).json({ success: true, data: dispatch });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message || 'Failed to trigger dispatch' });
    }
  }

  static async getDispatchTracking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tracking = await DispatchService.getDispatchTracking(id);
      res.status(200).json({ success: true, data: tracking });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message || 'Failed to retrieve tracking file' });
    }
  }
}
