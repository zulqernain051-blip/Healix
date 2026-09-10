import { AppError } from '../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../common/constants/index';
import { MarketplaceRepository } from './marketplace.repository';

export class MarketplaceService {
  public static async getActiveListings() {
    const listings = await MarketplaceRepository.findListings();

    // Mask patient personal identifiable information (PII)
    return listings.map((l) => {
      const patientUser = l.careRequest.patient.user;
      const patientAddress = l.careRequest.patient.address || 'Unknown Zone';
      
      // Mask name e.g. "John Doe" -> "John D."
      const parts = patientUser.fullName.split(' ');
      const maskedName = parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : patientUser.fullName;
      
      // Mask address to zone level location only
      const zoneStr = patientAddress.split(',')[0] || patientAddress;
      const maskedAddress = `[Zone-level Location: ${zoneStr}]`;

      return {
        id: l.id,
        careRequestId: l.careRequestId,
        zone: l.zone,
        specializationRequired: l.specializationRequired,
        status: l.status,
        postedAt: l.postedAt,
        offers: (l as any).offers,
        careRequest: {
          type: l.careRequest.type,
          scheduledAt: l.careRequest.scheduledAt,
          notes: l.careRequest.notes,
          patient: {
            fullName: maskedName,
            address: maskedAddress
          }
        }
      };
    });
  }

  public static async submitOffer(listingId: string, nurseId: string, data: any) {
    const listing = await MarketplaceRepository.findListingById(listingId);
    if (!listing) throw new AppError('Listing not found', HTTP_STATUS.NOT_FOUND);
    if (listing.status === 'CLOSED') throw new AppError('Cannot submit offer: MarketplaceListing is CLOSED', HTTP_STATUS.BAD_REQUEST);
    if (listing.careRequest?.status === 'CANCELLED') throw new AppError('Cannot submit offer: CareRequest is CANCELLED', HTTP_STATUS.BAD_REQUEST);

    const existing = await MarketplaceRepository.findActiveOfferForNurse(listingId, nurseId);
    if (existing) {
      console.log(`[UPDATE] Active offer found for nurse ${nurseId}. Updating previous offer.`);
      return MarketplaceRepository.updateOffer(existing.id, data);
    }

    return MarketplaceRepository.createOffer(listingId, nurseId, data);
  }

  public static async updateOffer(offerId: string, nurseId: string, data: any) {
    const offer = await MarketplaceRepository.findOfferById(offerId);
    if (!offer) throw new AppError('Offer not found', HTTP_STATUS.NOT_FOUND);
    if (offer.nurseId !== nurseId) throw new AppError('Unauthorized', HTTP_STATUS.FORBIDDEN);

    return MarketplaceRepository.updateOffer(offerId, data);
  }

  public static async withdrawOffer(offerId: string, nurseId: string) {
    const offer = await MarketplaceRepository.findOfferById(offerId);
    if (!offer) throw new AppError('Offer not found', HTTP_STATUS.NOT_FOUND);
    if (offer.nurseId !== nurseId) throw new AppError('Unauthorized', HTTP_STATUS.FORBIDDEN);

    return MarketplaceRepository.deleteOffer(offerId);
  }

  public static async getListingOffers(listingId: string) {
    await this.expireExpiredOffers();

    const offers = await MarketplaceRepository.findOffersByListingId(listingId);

    // Compute best match scores
    return offers.map((off) => {
      const priceVal = off.price;
      const ratingVal = off.nurse.score?.compositeScore ?? 75; // fallback rating
      const hasSpecialty = off.nurse.specializations.some(s => s.certified);

      // Best Match Score: higher is better (max 100)
      // Price factor (lower price -> higher factor, e.g. base PKR 2000 reference)
      const priceScore = Math.max(0, 100 - (priceVal / 3000) * 50);
      const ratingScore = ratingVal;
      const specialtyScore = hasSpecialty ? 100 : 0;
      
      const bestMatchScore = Math.round((priceScore * 0.4) + (ratingScore * 0.4) + (specialtyScore * 0.2));

      return {
        ...off,
        bestMatchScore
      };
    });
  }

  public static async selectOffer(listingId: string, offerId: string) {
    const listing = await MarketplaceRepository.findListingById(listingId);
    if (!listing) throw new AppError('Listing not found', HTTP_STATUS.NOT_FOUND);
    if (listing.careRequest?.status === 'CANCELLED') throw new AppError('Cannot select offer: CareRequest is CANCELLED', HTTP_STATUS.BAD_REQUEST);

    const offer = await MarketplaceRepository.selectOffer(listingId, offerId, listing.careRequestId);

    return { offer };
  }

  public static async addFavoriteNurse(patientId: string, nurseId: string) {
    return MarketplaceRepository.createFavoriteNurse(patientId, nurseId);
  }

  public static async getFavoriteNurses(patientId: string) {
    return MarketplaceRepository.findFavoriteNurses(patientId);
  }

  public static async getCostPreview(price: number, _priceType: string, durationHours: number) {
    const feeConfig = await MarketplaceRepository.findPlatformFeeConfig();
    const feePercentage = feeConfig?.feePercentage ?? 10.0; // default 10% platform fee

    const serviceCost = price * durationHours;
    const platformFee = Math.round(serviceCost * (feePercentage / 100));
    const total = serviceCost + platformFee;

    return {
      serviceCost,
      platformFee,
      total,
      feePercentage,
      disclaimer: 'This cost preview is an estimate. Final charges depend on actual visit duration.'
    };
  }

  private static async expireExpiredOffers() {
    await MarketplaceRepository.expireExpiredOffers();
  }
}
