// ─────────────────────────────────────────────
// Marketplace Domain Types
// Derived from frozen backend: src/domains/marketplace/marketplace/
// ─────────────────────────────────────────────

// ─── Listing ───────────────────────────────────

export type ListingStatus = 'OPEN' | 'CLOSED';

export interface MarketplaceListing {
  id: string;
  careRequestId: string;
  zone: string;
  specializationRequired: string | null;
  status: ListingStatus;
  postedAt: string;
  offers?: ListingOfferSummary[];
  careRequest: ListingCareRequest;
}

/** Embedded care request info returned by GET /marketplace/requests */
export interface ListingCareRequest {
  type: string;
  scheduledAt: string;
  notes: string | null;
  patient: {
    fullName: string;   // PII-masked by backend (e.g. "John D.")
    address: string;    // Zone-level only
  };
}

/** Minimal offer summary embedded in listing response */
export interface ListingOfferSummary {
  id: string;
  nurseId: string;
  price: number;
  priceType: string;
  message?: string;
  status: string;
}

// ─── Offer ─────────────────────────────────────

export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
export type PriceType = 'HOURLY' | 'DAILY' | 'FIXED';

export interface NurseOffer {
  id: string;
  listingId: string;
  nurseId: string;
  price: number;
  priceType: PriceType;
  proposedStart: string;
  message: string | null;
  status: OfferStatus;
  expiresAt: string;
  createdAt: string;
  bestMatchScore: number;
  nurse: OfferNurseInfo;
}

export interface OfferNurseInfo {
  user: {
    fullName: string;
  };
  score?: {
    compositeScore: number;
  } | null;
  specializations?: Array<{
    specialization: string;
    certified: boolean;
  }>;
}

// ─── DTOs (Request Bodies) ─────────────────────

export interface SubmitOfferDto {
  price: number;
  priceType: PriceType;
  proposedStart: string; // ISO datetime
  message?: string;
}

export interface UpdateOfferDto {
  price?: number;
  priceType?: PriceType;
  proposedStart?: string;
  message?: string;
}

export interface SelectOfferDto {
  offerId: string;
}

// ─── Favorites ─────────────────────────────────

export interface FavoriteNurse {
  id: string;
  patientId: string;
  nurseId: string;
  createdAt: string;
  nurse: {
    user: {
      fullName: string;
    };
  };
}

// ─── Cost Preview ──────────────────────────────

export interface CostPreviewRequest {
  price: number;
  priceType: PriceType;
  durationHours: number;
}

export interface CostPreviewResponse {
  serviceCost: number;
  platformFee: number;
  total: number;
  feePercentage: number;
  disclaimer: string;
}
