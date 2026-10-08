import { Request, Response } from 'express';
import { AmbulanceService } from './ambulance.service';

const ok = (res: Response, data: any, message = 'Success') =>
  res.json({ success: true, message, data });

const fail = (res: Response, err: any) => {
  const status = err.code === 'P2002' ? 409 : err.statusCode ?? 500;
  if (err.code === 'P2002') err = { message: 'Vehicle or plate number is already registered' };
  res.status(status).json({ success: false, message: err.message ?? 'Internal error' });
};

export class AmbulanceController {
  public static async getAmbulances(req: Request, res: Response): Promise<void> {
    try {
      const status = req.query.status as string | undefined;
      const ambulances = await AmbulanceService.getAllAmbulances(status);
      ok(res, ambulances);
    } catch (e) {
      fail(res, e);
    }
  }

  public static async getAmbulanceById(req: Request, res: Response): Promise<void> {
    try {
      const ambulance = await AmbulanceService.getAmbulanceById(req.params.id);
      ok(res, ambulance);
    } catch (e) {
      fail(res, e);
    }
  }

  public static async createAmbulance(req: Request, res: Response): Promise<void> {
    try {
      const ambulance = await AmbulanceService.registerAmbulance(req.body);
      ok(res, ambulance, 'Ambulance registered successfully');
    } catch (e) {
      fail(res, e);
    }
  }

  public static async updateAmbulance(req: Request, res: Response): Promise<void> {
    try {
      const ambulance = await AmbulanceService.updateAmbulance(req.params.id, req.body);
      ok(res, ambulance, 'Ambulance updated successfully');
    } catch (e) {
      fail(res, e);
    }
  }

  public static async deleteAmbulance(req: Request, res: Response): Promise<void> {
    try {
      const result = await AmbulanceService.deleteAmbulance(req.params.id);
      ok(res, result, 'Ambulance deleted successfully');
    } catch (e) {
      fail(res, e);
    }
  }
}
