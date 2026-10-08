import { Request, Response, NextFunction } from 'express';
import { EmergencyOperationsService } from './operations.service';
export class EmergencyOperationsController {
  static async events(req: Request, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await EmergencyOperationsService.listEvents((req as any).user) }); } catch (e) { next(e); }
  }
  static async list(req: Request, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await EmergencyOperationsService.listDispatches((req as any).user) }); } catch (e) { next(e); }
  }
  static async location(req: Request, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await EmergencyOperationsService.updateLocation(req.params.id, (req as any).user, req.body) }); } catch (e) { next(e); }
  }
  static async admission(req: Request, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await EmergencyOperationsService.requestAdmission(req.params.id, (req as any).user) }); } catch (e) { next(e); }
  }
}
