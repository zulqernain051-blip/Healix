import { apiClient } from './client';
import {
  MarketplaceListing,
  NurseOffer,
  SubmitOfferDto,
  UpdateOfferDto,
  SelectOfferDto,
  FavoriteNurse,
  CostPreviewRequest,
  CostPreviewResponse,
} from '../types/marketplace';

// ─────────────────────────────────────────────
// Marketplace API Module
// All endpoints verified against frozen backend:
//   src/domains/marketplace/marketplace/marketplace.routes.ts
//   src/domains/marketplace/marketplace/marketplace.controller.ts
// ─────────────────────────────────────────────

export const marketplaceApi = {
  // ─── Listings ────────────────────────────────

  /** GET /marketplace/requests — fetch all OPEN marketplace listings */
  getActiveListings: () =>
    apiClient.get<MarketplaceListing[]>('/marketplace/requests'),

  // ─── Offers ──────────────────────────────────

  /** POST /marketplace/listings/:id/offers — nurse submits an offer */
  submitOffer: (listingId: string, data: SubmitOfferDto) =>
    apiClient.post<NurseOffer>(`/marketplace/listings/${listingId}/offers`, data),

  /** GET /marketplace/listings/:id/offers — get all pending offers for a listing */
  getListingOffers: (listingId: string) =>
    apiClient.get<NurseOffer[]>(`/marketplace/listings/${listingId}/offers`),

  /**
   * PUT /offers/:id — nurse updates their pending offer
   * NOTE: Backend route is /offers/:id, NOT /marketplace/offers/:id
   */
  updateOffer: (offerId: string, data: UpdateOfferDto) =>
    apiClient.put<NurseOffer>(`/offers/${offerId}`, data),

  /**
   * DELETE /offers/:id — nurse withdraws their offer
   * NOTE: Backend route is /offers/:id, NOT /marketplace/offers/:id
   */
  withdrawOffer: (offerId: string) =>
    apiClient.delete<any>(`/offers/${offerId}`),

  /** POST /marketplace/listings/:id/select — patient selects an offer */
  selectOffer: (listingId: string, data: SelectOfferDto) =>
    apiClient.post<any>(`/marketplace/listings/${listingId}/select`, data),

  // ─── Favorites ───────────────────────────────

  /** POST /patients/:id/favorite-nurses */
  addFavoriteNurse: (patientId: string, nurseId: string) =>
    apiClient.post<FavoriteNurse>(`/patients/${patientId}/favorite-nurses`, { nurseId }),

  /** GET /patients/:id/favorite-nurses */
  getFavoriteNurses: (patientId: string) =>
    apiClient.get<FavoriteNurse[]>(`/patients/${patientId}/favorite-nurses`),

  // ─── Cost Preview ────────────────────────────

  /** POST /pricing/preview */
  getCostPreview: (data: CostPreviewRequest) =>
    apiClient.post<CostPreviewResponse>('/pricing/preview', data),
};
