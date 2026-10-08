import { AppError } from '../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../common/constants/index';
import { MarketplaceRepository } from './marketplace.repository';
import { PRIVATE_LOCATION, serviceCost } from './pricing';

export class MarketplaceService {
  public static async getActiveListings(user: any) {
    const listings = await MarketplaceRepository.findListings();

    // Mask patient personal identifiable information (PII)
    if (!['PATIENT','NURSE','ADMIN'].includes(user.role)) throw new AppError('Marketplace access forbidden', HTTP_STATUS.FORBIDDEN);
    return listings.filter(l => l.careRequest.status === 'OPEN' && (user.role !== 'PATIENT' || l.careRequest.patientId === user.patient?.id)).map((l) => {
      const patientUser = l.careRequest?.patient?.user;
      
      // Mask name e.g. "John Doe" -> "John D."
      const fullName = patientUser?.fullName || 'Patient';
      const parts = fullName.split(' ');
      const maskedName = parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : fullName;
      
      // Mask address to zone level location only
      const zoneStr = l.careRequest.patient.city || PRIVATE_LOCATION;
      const maskedAddress = `[Zone-level Location: ${zoneStr}]`;

      const displayTiming = l.careRequest?.scheduledAt || l.careRequest?.preferredDate;

      return {
        id: l.id,
        careRequestId: l.careRequestId,
        zone: zoneStr,
        specializationRequired: l.specializationRequired,
        status: l.status,
        postedAt: l.postedAt,
        offers: user.role === 'NURSE' ? l.offers.filter(off => off.nurseId === user.nurse?.id) : l.offers,
        careRequest: {
          type: l.careRequest.type,
          requirements: l.careRequest.requirements,
          scheduleType: l.careRequest.scheduleType,
          preferredDate: l.careRequest.preferredDate,
          preferredStartTime: l.careRequest.preferredStartTime,
          preferredTimeWindow: l.careRequest.preferredTimeWindow,
          durationMinutes: l.careRequest.durationMinutes,
          scheduledAt: displayTiming,
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
    return MarketplaceRepository.savePendingOffer(listingId, nurseId, data);
  }

  public static async updateOffer(offerId: string, nurseId: string, data: any) {
    const offer = await MarketplaceRepository.findOfferById(offerId);
    if (!offer) throw new AppError('Offer not found', HTTP_STATUS.NOT_FOUND);
    if (offer.nurseId !== nurseId) throw new AppError('Unauthorized', HTTP_STATUS.FORBIDDEN);

    return MarketplaceRepository.changePendingOffer(offerId, { nurseId }, data);
  }

  public static async withdrawOffer(offerId: string, nurseId: string) {
    const offer = await MarketplaceRepository.findOfferById(offerId);
    if (!offer) throw new AppError('Offer not found', HTTP_STATUS.NOT_FOUND);
    if (offer.nurseId !== nurseId) throw new AppError('Unauthorized', HTTP_STATUS.FORBIDDEN);

    return MarketplaceRepository.changePendingOffer(offerId, { nurseId }, { status: 'WITHDRAWN' });
  }

  public static async getListingOffers(listingId: string, user: any) {
    const listing = await MarketplaceRepository.findListingById(listingId);
    if (!listing) throw new AppError('Listing not found', HTTP_STATUS.NOT_FOUND);
    if (!(user.role === 'ADMIN' || (user.role === 'PATIENT' && user.patient?.id === listing.careRequest.patientId) || (user.role === 'NURSE' && user.nurse?.id))) throw new AppError('Offer access forbidden', HTTP_STATUS.FORBIDDEN);
    const offers = await MarketplaceRepository.findOffersByListingId(listingId, user.role === 'NURSE' ? user.nurse.id : undefined);
    const feePercentage = (await MarketplaceRepository.findPlatformFeeConfig())?.feePercentage ?? 10;

    const ratings = await MarketplaceRepository.findPublicRatings(offers.map(o=>o.nurseId));
    // Compute best match scores
    return offers.map((off) => {
      const priceVal = serviceCost(off.price, off.priceType, (listing.careRequest.durationMinutes || 60) / 60);
      const rating = ratings.find(r=>r.nurseId===off.nurseId);
      const ratingVal = (rating?._avg.stars || 0) * 20;
      const hasSpecialty = !!listing.specializationRequired && off.nurse.specializations.some(s => s.certified && s.specialization.toLowerCase() === listing.specializationRequired!.toLowerCase());

      // Best Match Score: higher is better (max 100)
      // Price factor (lower price -> higher factor, e.g. base PKR 2000 reference)
      const priceScore = Math.max(0, 100 - (priceVal / 3000) * 50);
      const ratingScore = ratingVal;
      const specialtyScore = hasSpecialty ? 100 : 0;
      
      const bestMatchScore = Math.round((priceScore * 0.4) + (ratingScore * 0.4) + (specialtyScore * 0.2));

      return {
        ...off,
        status: off.status === 'PENDING' && off.expiresAt <= new Date() ? 'EXPIRED' : off.status,
        reviewSummary: { count: rating?._count.id || 0, averageStars: rating?._avg.stars ?? null },
        priceDurationAssumed: !listing.careRequest.durationMinutes,
        estimatedServiceCost: priceVal,
        estimatedPlatformFee: Math.round(priceVal * feePercentage) / 100,
        estimatedTotal: Math.round((priceVal + Math.round(priceVal * feePercentage) / 100) * 100) / 100,
        feePercentage,
        priceDurationMinutes: listing.careRequest.durationMinutes || 60,
        matchBasis: 'Estimated service cost (40%), recorded patient ratings (40%), exact certified specialty (20%). Unrecorded ratings contribute zero.',
        bestMatchScore
      };
    });
  }

  public static async selectOffer(listingId: string, offerId: string) {
    const listing = await MarketplaceRepository.findListingById(listingId);
    if (!listing) throw new AppError('Listing not found', HTTP_STATUS.NOT_FOUND);
    if (listing.careRequest?.status === 'CANCELLED') throw new AppError('Cannot select offer: CareRequest is CANCELLED', HTTP_STATUS.BAD_REQUEST);

    const offer = await MarketplaceRepository.selectOffer(listingId, offerId, listing.careRequestId);

    let contract: any = null;
    try {
      const { CreateContractFromOfferUseCase } = require('../contracts/usecases/create-contract-from-offer.usecase');
      contract = await new CreateContractFromOfferUseCase().execute(listingId, offerId);
    } catch (err: any) {
      console.warn('[MarketplaceService.selectOffer] Immediate contract creation warning (will be handled by outbox):', err.message);
    }

    return { offer, contractId: contract?.id };
  }

  public static async addFavoriteNurse(patientId: string, nurseId: string) {
    return MarketplaceRepository.createFavoriteNurse(patientId, nurseId);
  }

  public static async getFavoriteNurses(patientId: string) {
    return MarketplaceRepository.findFavoriteNurses(patientId);
  }

  public static async removeFavoriteNurse(patientId: string, nurseId: string) {
    return MarketplaceRepository.removeFavoriteNurse(patientId, nurseId);
  }

  public static async rejectOffer(offerId: string, user: any) {
    if (!['PATIENT','ADMIN'].includes(user.role)) throw new AppError('Only the patient can reject an offer', HTTP_STATUS.FORBIDDEN);
    return MarketplaceRepository.changePendingOffer(offerId, { patientId: user.patient?.id, admin: user.role === 'ADMIN' }, { status: 'REJECTED' });
  }

  public static async getCostPreview(price: number, priceType: string, durationHours: number) {
    const feeConfig = await MarketplaceRepository.findPlatformFeeConfig();
    const feePercentage = feeConfig?.feePercentage ?? 10.0; // default 10% platform fee

    const cost = serviceCost(price, priceType, durationHours);
    const platformFee = Math.round(cost * feePercentage) / 100;
    const total = Math.round((cost + platformFee) * 100) / 100;

    return {
      serviceCost: cost,
      platformFee,
      total,
      feePercentage,
      disclaimer: 'Estimate for the planned duration. Hourly uses fractional hours; daily bills each started 24-hour period; fixed bills once. No payment is collected by this preview.'
    };
  }

}
