import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marketplaceApi } from '../api/marketplace.api';
import { SubmitOfferDto, UpdateOfferDto } from '../types/marketplace';
import { CARE_REQUESTS_KEY } from './useCareRequests';

// ─────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────

export const MARKETPLACE_KEYS = {
  all: ['marketplace'] as const,
  listings: () => [...MARKETPLACE_KEYS.all, 'listings'] as const,
  offers: (listingId: string) => [...MARKETPLACE_KEYS.all, 'offers', listingId] as const,
  favorites: (patientId: string) => [...MARKETPLACE_KEYS.all, 'favorites', patientId] as const,
};

// ─────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────

/** Fetch all OPEN marketplace listings (used by Nurse marketplace) */
export const useMarketplaceListings = () => {
  return useQuery({
    queryKey: MARKETPLACE_KEYS.listings(),
    queryFn: () => marketplaceApi.getActiveListings(),
  });
};

/** Get a single listing from the listings cache (useful for detail screens) */
export const useMarketplaceListing = (listingId: string) => {
  const { data: listings, isLoading, isError } = useMarketplaceListings();
  const listing = listings?.find(l => l.id === listingId);
  return { listing, isLoading, isError };
};

/** Fetch offers for a specific listing */
export const useListingOffers = (listingId: string, options?: { pollingInterval?: number }) => {
  return useQuery({
    queryKey: MARKETPLACE_KEYS.offers(listingId),
    queryFn: () => marketplaceApi.getListingOffers(listingId),
    enabled: !!listingId,
    refetchInterval: options?.pollingInterval,
  });
};

// ─────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────

/** Nurse submits an offer on a listing */
export const useSubmitOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listingId, data }: { listingId: string; data: SubmitOfferDto }) =>
      marketplaceApi.submitOffer(listingId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: MARKETPLACE_KEYS.offers(variables.listingId) });
      queryClient.invalidateQueries({ queryKey: MARKETPLACE_KEYS.listings() });
    },
  });
};

/** Nurse updates their pending offer */
export const useUpdateOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ offerId, data }: { offerId: string; data: UpdateOfferDto }) =>
      marketplaceApi.updateOffer(offerId, data),
    onSuccess: () => {
      // Invalidate all offer queries since we don't have the listingId in the response
      queryClient.invalidateQueries({ queryKey: MARKETPLACE_KEYS.all });
    },
  });
};

/** Nurse withdraws their offer */
export const useWithdrawOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (offerId: string) => marketplaceApi.withdrawOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MARKETPLACE_KEYS.all });
    },
  });
};

/** Patient selects an offer (triggers contract creation via backend outbox) */
export const useSelectOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listingId, offerId }: { listingId: string; offerId: string }) =>
      marketplaceApi.selectOffer(listingId, { offerId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: MARKETPLACE_KEYS.offers(variables.listingId) });
      queryClient.invalidateQueries({ queryKey: MARKETPLACE_KEYS.listings() });
      queryClient.invalidateQueries({ queryKey: CARE_REQUESTS_KEY });
    },
  });
};
