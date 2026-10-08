import { prisma } from '../../../common/config/database';
import { AppError } from '../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../common/constants/index';

export class MarketplaceRepository {
  public static findPublicRatings(nurseIds: string[]) { return prisma.nurseReview.groupBy({by:['nurseId'],where:{nurseId:{in:nurseIds},flagged:false},_avg:{stars:true},_count:{id:true}}); }

  private static async lockListing(tx: any, listingId: string) {
    const original = await tx.marketplaceListing.findUnique({ where: { id: listingId } });
    if (!original) throw new AppError('Listing not found', HTTP_STATUS.NOT_FOUND);
    await tx.$queryRaw`SELECT id FROM care_requests WHERE id = ${original.careRequestId} FOR UPDATE`;
    await tx.$queryRaw`SELECT id FROM marketplace_listings WHERE id = ${listingId} FOR UPDATE`;
    return tx.marketplaceListing.findUniqueOrThrow({ where: { id: listingId }, include: { careRequest: true } });
  }

  private static assertOpen(listing: any) {
    if (listing.status !== 'OPEN' || listing.careRequest.status !== 'OPEN') throw new AppError('This request is no longer open for offers', HTTP_STATUS.CONFLICT);
  }

  public static async savePendingOffer(listingId: string, nurseId: string, data: any) {
    return prisma.$transaction(async tx => {
      const listing = await this.lockListing(tx, listingId); this.assertOpen(listing);
      const nurse = await tx.nurse.findUnique({ where: { id: nurseId }, include: { user: true } });
      if (!nurse || nurse.verificationStatus !== 'VERIFIED' || nurse.user.status !== 'ACTIVE' || nurse.user.deletedAt) throw new AppError('Only active verified nurses may offer care', HTTP_STATUS.FORBIDDEN);
      const existing = await tx.offer.findFirst({ where: { listingId, nurseId, status: 'PENDING', expiresAt: { gt: new Date() } } });
      const values = { price: data.price, priceType: data.priceType, proposedStart: new Date(data.proposedStart), message: data.message };
      if (existing) return tx.offer.update({ where: { id: existing.id }, data: values });
      return tx.offer.create({ data: { ...values, listingId, nurseId, expiresAt: new Date(Date.now() + 4 * 3600000) } });
    });
  }

  public static async changePendingOffer(offerId: string, actor: { nurseId?: string; patientId?: string; admin?: boolean }, data: any) {
    return prisma.$transaction(async tx => {
      const initial = await tx.offer.findUnique({ where: { id: offerId } });
      if (!initial) throw new AppError('Offer not found', HTTP_STATUS.NOT_FOUND);
      const listing = await this.lockListing(tx, initial.listingId);
      const offer = await tx.offer.findUniqueOrThrow({ where: { id: offerId } });
      if (!(actor.admin || (actor.nurseId && actor.nurseId === offer.nurseId) || (actor.patientId && actor.patientId === listing.careRequest.patientId))) throw new AppError('Access forbidden', HTTP_STATUS.FORBIDDEN);
      this.assertOpen(listing);
      if (offer.status !== 'PENDING' || offer.expiresAt <= new Date()) throw new AppError('Only an unexpired pending offer can be changed', HTTP_STATUS.CONFLICT);
      return tx.offer.update({ where: { id: offerId }, data: { ...data, ...(data.proposedStart ? { proposedStart: new Date(data.proposedStart) } : {}) } });
    });
  }
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
        offers: {
          select: { id: true, nurseId: true, price: true, priceType: true, message: true, status: true }
        },
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

  public static async findOffersByListingId(listingId: string, nurseId?: string) {
    return prisma.offer.findMany({
      where: { listingId, ...(nurseId ? { nurseId } : {}) },
      include: {
        nurse: {
          select: {
            id: true, experience: true,
            user: { select: { fullName: true } },
            score: true,
            specializations: { select: { specialization: true, certified: true } }
          }
        }
      }
    });
  }

  public static async selectOffer(listingId: string, offerId: string, careRequestId: string) {
    return prisma.$transaction(async (tx) => {
      const listing = await this.lockListing(tx, listingId);
      const selected = await tx.offer.findUnique({ where: { id: offerId }, include: { listing: { include: { careRequest: true } }, nurse: { include: { user: true } } } });
      if (!selected || selected.listingId !== listingId || listing.careRequestId !== careRequestId) throw new AppError('Offer does not belong to this listing', HTTP_STATUS.CONFLICT);
      if (listing.careRequest.status === 'CANCELLED') throw new AppError('Request was cancelled', HTTP_STATUS.CONFLICT);
      if (listing.status === 'CLOSED' && selected.status === 'ACCEPTED') { const { nurse, ...safe } = selected; return safe; }
      this.assertOpen(listing);
      if (selected.status !== 'PENDING' || selected.expiresAt <= new Date() || selected.proposedStart <= new Date()) throw new AppError('Offer is no longer available', HTTP_STATUS.CONFLICT);
      if (selected.nurse.verificationStatus !== 'VERIFIED' || selected.nurse.user.status !== 'ACTIVE' || selected.nurse.user.deletedAt) throw new AppError('Nurse is no longer eligible', HTTP_STATUS.CONFLICT);
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
        data: { status: 'NOT_SELECTED' }
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
    return prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM patients WHERE id = ${patientId} FOR UPDATE`;
    const nurse = await tx.nurse.findFirst({ where: { id: nurseId, verificationStatus: 'VERIFIED', user: { status: 'ACTIVE', deletedAt: null } } });
    if (!nurse) throw new AppError('Verified nurse not found', HTTP_STATUS.NOT_FOUND);
    const existing = await tx.favoriteNurse.findFirst({
      where: { patientId, nurseId }
    });
    if (existing) return existing;

    return tx.favoriteNurse.create({
      data: { patientId, nurseId }
    });
    });
  }

  public static async removeFavoriteNurse(patientId: string, nurseId: string) {
    return prisma.favoriteNurse.deleteMany({ where: { patientId, nurseId } });
  }

  public static async findFavoriteNurses(patientId: string) {
    return prisma.favoriteNurse.findMany({
      where: { patientId },
      include: {
        nurse: {
          select: { id: true, experience: true, user: { select: { fullName: true } }, specializations: { select: { specialization: true, certified: true } } }
        }
      }
    });
  }

  public static async findPlatformFeeConfig() {
    return prisma.platformFeeConfig.findFirst({
      where: { effectiveFrom: { lte: new Date() } },
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
        where: { id: { in: expiredOffers.map(o => o.id) }, status: 'PENDING', expiresAt: { lte: now } },
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

  public static async reopenListing(careRequestId: string, transaction?: any) {
    const reopen = async (tx: any) => {
      const listing = await tx.marketplaceListing.findUnique({
        where: { careRequestId },
        include: { careRequest: true }
      });

      if (!listing) return null;
      
      // Do not reopen if CareRequest is cancelled
      if (listing.careRequest.status !== 'OPEN') {
        console.log(`[Marketplace] Cannot reopen listing ${listing.id} because CareRequest is CANCELLED.`);
        return listing;
      }

      // Restore non-expired offers to PENDING so patient can see and select offers again
      await tx.offer.updateMany({
        where: {
          listingId: listing.id,
          status: 'NOT_SELECTED',
          expiresAt: { gt: new Date() }
        },
        data: { status: 'PENDING' }
      });

      if (listing.status === 'OPEN') {
        return listing;
      }

      return tx.marketplaceListing.update({
        where: { id: listing.id },
        data: { status: 'OPEN' }
      });
    };
    return transaction ? reopen(transaction) : prisma.$transaction(reopen);
  }
}
