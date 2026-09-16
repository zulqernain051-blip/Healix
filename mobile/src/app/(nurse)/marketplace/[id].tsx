import React from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '../../../store/auth';
import {
  useMarketplaceListing,
  useSubmitOffer,
  useWithdrawOffer,
} from '../../../hooks/useMarketplace';
import { ListingCard } from '../../../components/marketplace/ListingCard';
import { OfferForm } from '../../../components/marketplace/OfferForm';
import { OfferCard } from '../../../components/marketplace/OfferCard';
import { SubmitOfferDto, NurseOffer } from '../../../types/marketplace';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../theme';

export default function NurseListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const listingId = id || '';
  const router = useRouter();
  const { user } = useAuthStore();
  const nurseId = user?.nurseId;

  const { listing, isLoading, isError } = useMarketplaceListing(listingId);
  const submitOffer = useSubmitOffer();
  const withdrawOffer = useWithdrawOffer();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  if (isError || !listing) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Listing not found</Text>
      </View>
    );
  }

  // Find if nurse has already submitted an offer on this listing
  const existingOfferSummary = listing.offers?.find((o) => o.nurseId === nurseId);

  // Reconstruct a full NurseOffer from summary to use OfferCard
  const mockExistingOffer: NurseOffer | null = existingOfferSummary
    ? {
        ...existingOfferSummary,
        listingId,
        proposedStart: listing.careRequest.scheduledAt, // Fallback since summary doesn't have proposedStart
        createdAt: new Date().toISOString(),
        expiresAt: new Date().toISOString(),
        bestMatchScore: 0,
        nurse: { user: { fullName: user?.fullName || '' } },
      } as NurseOffer
    : null;

  const handleSubmit = async (data: SubmitOfferDto) => {
    try {
      await submitOffer.mutateAsync({ listingId, data });
      Alert.alert('Success', 'Offer submitted successfully!');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit offer');
    }
  };

  const handleWithdraw = async (offerId: string) => {
    try {
      await withdrawOffer.mutateAsync(offerId);
      Alert.alert('Success', 'Offer withdrawn.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to withdraw offer');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Listing Details</Text>
      
      <ListingCard listing={listing} />

      <View style={styles.section}>
        {mockExistingOffer ? (
          <>
            <Text style={styles.sectionTitle}>Your Offer</Text>
            <OfferCard
              offer={mockExistingOffer}
              isPatientView={false}
              onWithdraw={handleWithdraw}
              isWithdrawing={withdrawOffer.isPending}
            />
          </>
        ) : (
          <OfferForm
            onSubmit={handleSubmit}
            isSubmitting={submitOffer.isPending}
            defaultProposedStart={listing.careRequest.scheduledAt}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: SPACING.lg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  section: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  errorText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.red,
  },
});
