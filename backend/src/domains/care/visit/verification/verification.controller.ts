import { Request, Response } from 'express';
import { VerificationService } from './verification.service';

export class VerificationController {
  static async checkIn(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const nurseId = (req as any).user?.nurse?.id || (req as any).user?.nurseId;
      const attendance = await VerificationService.checkIn(id, nurseId);
      res.status(200).json({ success: true, data: attendance });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  static async checkOut(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const nurseId = (req as any).user?.nurse?.id || (req as any).user?.nurseId;
      const attendance = await VerificationService.checkOut(id, nurseId);
      res.status(200).json({ success: true, data: attendance });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  static async confirmArrival(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const result = await VerificationService.confirmArrival(id, userId);
      res.status(200).json({ success: true, data: result });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  static async completeVisit(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const nurseId = (req as any).user?.nurse?.id || (req as any).user?.nurseId;
      const result = await VerificationService.completeVisit(id, nurseId);
      res.status(200).json({ success: true, data: result });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  static async uploadEvidence(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const nurseId = (req as any).user?.nurse?.id || (req as any).user?.nurseId;
      const { type, urlOrText, consentGiven } = req.body;
      if (!type || !urlOrText) {
        res.status(400).json({ success: false, message: 'type and urlOrText are required' });
        return;
      }
      const evidence = await VerificationService.uploadEvidence(id, nurseId, type, urlOrText, !!consentGiven);
      res.status(200).json({ success: true, data: evidence });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  static async getQrToken(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const token = await VerificationService.getQrToken(id, userId);
      res.status(200).json({ success: true, data: token });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  static async verifyWithQr(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const nurseId = (req as any).user?.nurse?.id || (req as any).user?.nurseId;
      const { token } = req.body;
      const visit = await VerificationService.verifyWithQr(id, nurseId, token);
      res.status(200).json({ success: true, data: visit });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  static async verifyWithGps(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const nurseId = (req as any).user?.nurse?.id || (req as any).user?.nurseId;
      const { lat, lng } = req.body;
      const visit = await VerificationService.verifyWithGps(id, nurseId, lat, lng);
      res.status(200).json({ success: true, data: visit });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  static async verifyManual(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const nurseId = (req as any).user?.nurse?.id || (req as any).user?.nurseId;
      const visit = await VerificationService.verifyManual(id, nurseId);
      res.status(200).json({ success: true, data: visit });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  static async getEvidence(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const evidence = await VerificationService.getEvidence(id);
      res.status(200).json({ success: true, data: evidence });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  static async getAttendance(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const attendance = await VerificationService.getAttendance(id);
      res.status(200).json({ success: true, data: attendance });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  }
}
