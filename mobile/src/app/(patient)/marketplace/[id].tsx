import React from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { useListingOffers, useSelectOffer } from '../../../hooks/useMarketplace';
import { OfferCard } from '../../../components/marketplace/OfferCard';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../theme';

/**
 * Patient Marketplace — Offer Review Screen
 *
 * Shows all offers submitted by nurses for a specific marketplace listing.
 * Patient can compare offers and select one, triggering contract creation.
 *
 * Replaces the obsolete (patient)/explore/compare.tsx
 * Full UI implementation coming in Phase 10C Step 8.
 */
export default function ListingOffersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const listingId = id || '';

  const { data: offers, isLoading, error, refetch } = useListingOffers(listingId, {
    pollingInterval: 15000, // Poll for new offers every 15s
  });

  const selectOffer = useSelectOffer();

  const handleSelectOffer = async (offerId: string) => {
    if (!listingId) return;
    try {
      await selectOffer.mutateAsync({ listingId, offerId });
      Alert.alert('Offer Accepted', 'A contract has been generated. Please review and approve it.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to select offer');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text style={styles.loadingText}>Loading offers...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load offers</Text>
        <Text style={styles.errorDetail}>{(error as Error).message}</Text>
      </View>
    );
  }

  if (!offers || offers.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyIcon}>⏳</Text>
        <Text style={styles.emptyText}>Waiting for nurse offers...</Text>
        <Text style={styles.emptySubtext}>Offers will appear here as nurses respond to your listing.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Review Offers</Text>
      <Text style={styles.subtitle}>{offers.length} offer{offers.length !== 1 ? 's' : ''} received</Text>

      {offers.map((offer) => (
        <OfferCard
          key={offer.id}
          offer={offer}
          isPatientView={true}
          onSelect={handleSelectOffer}
          isSelecting={selectOffer.isPending && selectOffer.variables?.offerId === offer.id}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.lg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg, padding: SPACING.xl },
  title: { ...TYPOGRAPHY.h2, color: COLORS.textPrimary, marginBottom: SPACING.xs },
  subtitle: { ...TYPOGRAPHY.bodyMedium, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  loadingText: { ...TYPOGRAPHY.bodyMedium, color: COLORS.textSecondary, marginTop: SPACING.md },
  errorText: { ...TYPOGRAPHY.h3, color: '#EF4444', marginBottom: SPACING.xs },
  errorDetail: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSecondary },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.md },
  emptyText: { ...TYPOGRAPHY.h3, color: COLORS.textPrimary, marginBottom: SPACING.xs },
  emptySubtext: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSecondary, textAlign: 'center' },
});
