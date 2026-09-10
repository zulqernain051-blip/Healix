import { prisma } from '../../../common/config/database';
import { AppError } from '../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../common/constants/index';

export class MarketplaceRepository {
  public static async createListing(data: { careRequestId: string; zone: string; specializationRequired: string | null; status: string }) {
    return prisma.marketplaceListing.create({
      data
    });
  }

  public static async findListingByCareRequestId(careRequestId: string) {
    return prisma.marketplaceListing.findUnique({
      where: { careRequestId }
    });
  }

  public static async closeListingForRequest(careRequestId: string) {
    return prisma.marketplaceListing.updateMany({
      where: { careRequestId },
      data: { status: 'CLOSED' }
    });
  }

  public static async rejectPendingOffersForRequest(careRequestId: string) {
    return prisma.offer.updateMany({
      where: {
        listing: { careRequestId },
        status: 'PENDING'
      },
      data: { status: 'REJECTED' }
    });
  }

  public static async findContractRequestId(contractId: string) {
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      select: { careRequestId: true }
    });
    return contract?.careRequestId;
  }

  public static async findListings() {
    return prisma.marketplaceListing.findMany({
      where: { status: 'OPEN' },
      include: {
        offers: {
          where: { status: 'PENDING' },
          select: { id: true, nurseId: true, price: true, priceType: true, message: true, status: true }
        },
        careRequest: {
          include: {
            patient: {
              include: { user: { select: { fullName: true } } }
            }
          }
        }
      },
      orderBy: { postedAt: 'desc' }
    });
  }

  public static async findListingById(id: string) {
    return prisma.marketplaceListing.findUnique({
      where: { id },
      include: {
        careRequest: {
          include: {
            patient: {
              include: { user: { select: { fullName: true } } }
            }
          }
        }
      }
    });
  }

  public static async findOfferById(id: string) {
    return prisma.offer.findUnique({
      where: { id },
      include: { listing: true }
    });
  }

  public static async findActiveOfferForNurse(listingId: string, nurseId: string) {
    return prisma.offer.findFirst({
      where: {
        listingId,
        nurseId,
        status: 'PENDING'
      }
    });
  }

  public static async createOffer(listingId: string, nurseId: string, data: any) {
    // 4 hours default expiry
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 4);

    return prisma.offer.create({
      data: {
        listingId,
        nurseId,
        price: data.price,
        priceType: data.priceType || 'HOURLY',
        proposedStart: new Date(data.proposedStart),
        message: data.message,
        status: 'PENDING',
        expiresAt
      }
    });
  }

  public static async updateOffer(id: string, data: any) {
    const updateData: any = {};
    if (data.price !== undefined) updateData.price = data.price;
    if (data.priceType !== undefined) updateData.priceType = data.priceType;
    if (data.proposedStart !== undefined) updateData.proposedStart = new Date(data.proposedStart);
    if (data.message !== undefined) updateData.message = data.message;

    return prisma.offer.update({
      where: { id },
      data: updateData
    });
  }

  public static async deleteOffer(id: string) {
    return prisma.offer.update({
      where: { id },
      data: { status: 'REJECTED' } // Withdraw sets status to REJECTED or deleted
    });
  }

  public static async findOffersByListingId(listingId: string) {
    return prisma.offer.findMany({
      where: { listingId, status: 'PENDING' },
      include: {
        nurse: {
          include: {
            user: { select: { fullName: true } },
            score: true,
            specializations: true
          }
        }
      }
    });
  }

  public static async selectOffer(listingId: string, offerId: string, careRequestId: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Close listing
      await tx.marketplaceListing.update({
        where: { id: listingId },
        data: { status: 'CLOSED' }
      });

      // 2. Accept offer
      const offer = await tx.offer.update({
        where: { id: offerId },
        data: { status: 'ACCEPTED' },
        include: { listing: { include: { careRequest: true } } }
      });

      if (!offer) {
        throw new AppError('Offer not found', HTTP_STATUS.NOT_FOUND);
      }

      // 3. Reject other offers
      await tx.offer.updateMany({
        where: {
          listingId,
          id: { not: offerId },
          status: 'PENDING'
        },
        data: { status: 'REJECTED' }
      });

      // 4. Emit OFFER_SELECTED outbox event
      const { OutboxRepository } = require('../../../common/events/outbox.repository');
      const { EVENTS } = require('../../../common/events/app-event-bus');
      
      await OutboxRepository.createEvent(tx, {
        eventType: EVENTS.OFFER_SELECTED,
        aggregateType: 'OFFER',
        aggregateId: offerId,
        payload: {
          offerId,
          listingId,
          careRequestId, // Use the parameter directly
          patientId: offer.listing.careRequest.patientId,
          nurseId: offer.nurseId
        }
      });

      return offer;
    });
  }

  public static async createFavoriteNurse(patientId: string, nurseId: string) {
    const existing = await prisma.favoriteNurse.findFirst({
      where: { patientId, nurseId }
    });
    if (existing) return existing;

    return prisma.favoriteNurse.create({
      data: { patientId, nurseId }
    });
  }

  public static async findFavoriteNurses(patientId: string) {
    return prisma.favoriteNurse.findMany({
      where: { patientId },
      include: {
        nurse: {
          include: { user: { select: { fullName: true } } }
        }
      }
    });
  }

  public static async findPlatformFeeConfig() {
    return prisma.platformFeeConfig.findFirst({
      orderBy: { effectiveFrom: 'desc' }
    });
  }

  public static async expireExpiredOffers() {
    const now = new Date();
    const expiredOffers = await prisma.offer.findMany({
      where: {
        status: 'PENDING',
        expiresAt: { lt: now }
      },
      select: { id: true }
    });

    if (expiredOffers.length === 0) return { count: 0 };

    return prisma.$transaction(async (tx) => {
      const { OutboxRepository } = require('../../../common/events/outbox.repository');
      
      const { count } = await tx.offer.updateMany({
        where: { id: { in: expiredOffers.map(o => o.id) } },
        data: { status: 'EXPIRED' }
      });

      for (const offer of expiredOffers) {
        await OutboxRepository.createEvent(tx, {
          eventType: 'OFFER_EXPIRED',
          aggregateType: 'OFFER',
          aggregateId: offer.id,
          payload: { offerId: offer.id }
        });
      }

      return { count };
    });
  }

  public static async reopenListing(careRequestId: string) {
    return prisma.$transaction(async (tx) => {
      const listing = await tx.marketplaceListing.findUnique({
        where: { careRequestId },
        include: { careRequest: true }
      });

      if (!listing) return null;
      
      // Do not reopen if CareRequest is cancelled
      if (listing.careRequest.status === 'CANCELLED') {
        console.log(`[Marketplace] Cannot reopen listing ${listing.id} because CareRequest is CANCELLED.`);
        return listing;
      }

      if (listing.status === 'OPEN') {
        return listing;
      }

      return tx.marketplaceListing.update({
        where: { id: listing.id },
        data: { status: 'OPEN' }
      });
    });
  }
}
