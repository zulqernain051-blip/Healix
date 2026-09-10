import { AppError } from '../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../common/constants/index';
import { MarketplaceRepository } from '../marketplace.repository';
import { CareRequestRepository } from '../../../care/requests/repository/care-request.repository';

export class PublishCareRequestToMarketplaceUseCase {
  constructor(
    private readonly marketplaceRepo = MarketplaceRepository,
    private readonly careRequestRepo = CareRequestRepository
  ) {}

  async execute(careRequestId: string) {
    const careRequest = await this.careRequestRepo.findCareRequestById(careRequestId);
    if (!careRequest) {
      throw new AppError('Care Request not found', HTTP_STATUS.NOT_FOUND);
    }
    if (careRequest.status !== 'OPEN') {
      throw new AppError(`Cannot publish Care Request with status: ${careRequest.status}`, HTTP_STATUS.BAD_REQUEST);
    }

    // Idempotency check
    const existingListing = await this.marketplaceRepo.findListingByCareRequestId(careRequestId);
    if (existingListing) {
      return existingListing;
    }

    // Determine zone based on patient's address logic
    const address = careRequest.patient?.address || 'Unknown';
    const zoneStr = address.split(',')[0] || address;

    // Create the MarketplaceListing securely with idempotency on unique constraint failure
    try {
      return await this.marketplaceRepo.createListing({
        careRequestId,
        zone: zoneStr,
        specializationRequired: null, // Basic version
        status: 'OPEN'
      });
    } catch (err: any) {
      if (err.code === 'P2002') {
        console.log(`[Marketplace] Listing for CareRequest ${careRequestId} already exists (caught P2002). Treating as success.`);
        return await this.marketplaceRepo.findListingByCareRequestId(careRequestId);
      }
      throw err;
    }
  }
}
