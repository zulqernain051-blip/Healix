import { Request, Response } from 'express';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceRepository } from './marketplace.repository';
import { AppError } from '../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../common/constants/index';
import {
  submitOfferSchema,
  updateOfferSchema,
  selectOfferSchema,
  favoriteNurseSchema,
  costPreviewSchema
} from './marketplace.validation';


const checkPatientOwnership = (req: Request, targetPatientId: string) => {
  const user = (req as any).user;
  if (user.role === 'ADMIN') return;
  if (user.role === 'PATIENT' && user.patient?.id === targetPatientId) return;
  throw new AppError('Access forbidden. You do not own this resource.', HTTP_STATUS.FORBIDDEN);
};

export class MarketplaceController {
  public static async getActiveListings(_req: Request, res: Response) {
    try {
      const list = await MarketplaceService.getActiveListings();
      res.json({ success: true, data: list });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async submitOffer(req: Request, res: Response) {
    try {
      const { id } = req.params; // Listing ID
      const user = (req as any).user;
      const nurseId = user.nurse?.id;
      if (!nurseId) {
        res.status(403).json({ success: false, message: 'Only verified nurses can submit marketplace offers.' });
        return;
      }

      const payload = submitOfferSchema.parse(req.body);
      const result = await MarketplaceService.submitOffer(id, nurseId, payload);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async updateOffer(req: Request, res: Response) {
    try {
      const { id } = req.params; // Offer ID
      const user = (req as any).user;
      const nurseId = user.nurse?.id;
      if (!nurseId) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }

      const payload = updateOfferSchema.parse(req.body);
      const result = await MarketplaceService.updateOffer(id, nurseId, payload);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async withdrawOffer(req: Request, res: Response) {
    try {
      const { id } = req.params; // Offer ID
      const user = (req as any).user;
      const nurseId = user.nurse?.id;
      if (!nurseId) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }

      const result = await MarketplaceService.withdrawOffer(id, nurseId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async getListingOffers(req: Request, res: Response) {
    try {
      const { id } = req.params; // Listing ID
      const list = await MarketplaceService.getListingOffers(id);
      res.json({ success: true, data: list });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async selectOffer(req: Request, res: Response) {
    try {
      const { id } = req.params; // Listing ID
      const { offerId } = selectOfferSchema.parse(req.body);
      
      const listing = await MarketplaceRepository.findListingById(id);
      if (!listing) throw new AppError('Listing not found', HTTP_STATUS.NOT_FOUND);
      checkPatientOwnership(req, listing.careRequest.patientId);

      const result = await MarketplaceService.selectOffer(id, offerId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      const status = err instanceof AppError ? err.statusCode : 400;
      res.status(status).json({ success: false, message: err.message });
    }
  }

  public static async addFavoriteNurse(req: Request, res: Response) {
    try {
      const { id } = req.params; // Patient ID
      checkPatientOwnership(req, id);
      const { nurseId } = favoriteNurseSchema.parse(req.body);
      const result = await MarketplaceService.addFavoriteNurse(id, nurseId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      const status = err instanceof AppError ? err.statusCode : 400;
      res.status(status).json({ success: false, message: err.message });
    }
  }

  public static async getFavoriteNurses(req: Request, res: Response) {
    try {
      const { id } = req.params; // Patient ID
      checkPatientOwnership(req, id);
      const list = await MarketplaceService.getFavoriteNurses(id);
      res.json({ success: true, data: list });
    } catch (err: any) {
      const status = err instanceof AppError ? err.statusCode : 500;
      res.status(status).json({ success: false, message: err.message });
    }
  }

  public static async getCostPreview(req: Request, res: Response) {
    try {
      const { price, priceType, durationHours } = costPreviewSchema.parse(req.body);
      const preview = await MarketplaceService.getCostPreview(price, priceType, durationHours);
      res.json({ success: true, data: preview });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}
