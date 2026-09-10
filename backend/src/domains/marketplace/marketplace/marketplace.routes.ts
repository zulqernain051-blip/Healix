import { Router } from 'express';
import { protect } from '../../../common/middleware/authMiddleware';
import { MarketplaceController } from './marketplace.controller';

const router = Router();

router.use(protect);

// Listings
router.get('/marketplace/requests', MarketplaceController.getActiveListings);
router.post('/marketplace/listings/:id/offers', MarketplaceController.submitOffer);

// Offers operations
router.put('/offers/:id', MarketplaceController.updateOffer);
router.delete('/offers/:id', MarketplaceController.withdrawOffer);
router.get('/marketplace/listings/:id/offers', MarketplaceController.getListingOffers);
router.post('/marketplace/listings/:id/select', MarketplaceController.selectOffer);

// Patient Favorites
router.post('/patients/:id/favorite-nurses', MarketplaceController.addFavoriteNurse);
router.get('/patients/:id/favorite-nurses', MarketplaceController.getFavoriteNurses);

// Cost preview preview
router.post('/pricing/preview', MarketplaceController.getCostPreview);

export default router;
