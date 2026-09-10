import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useMarketplaceListings } from '../../../hooks/useMarketplace';
import { ListingCard } from '../../../components/marketplace/ListingCard';
import { MarketplaceListing } from '../../../types/marketplace';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../../theme';

export default function NurseMarketplaceScreen() {
  const router = useRouter();
  const { data: listings, isLoading, isError, error, refetch } = useMarketplaceListings();

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handlePressListing = (id: string) => {
    router.push(`/(nurse)/marketplace/${id}` as any);
  };

  if (isLoading && !listings) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text style={styles.loadingText}>Finding available care requests...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load marketplace</Text>
        <Text style={styles.errorDetail}>{(error as Error).message}</Text>
      </View>
    );
  }

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🩺</Text>
      <Text style={styles.emptyText}>No Active Requests</Text>
      <Text style={styles.emptySubtext}>
        There are currently no open care requests in the marketplace. Check back later!
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>Available Jobs</Text>
          <Text style={styles.subtitle}>Browse and submit offers</Text>
        </View>
        <Button 
          mode="outlined" 
          onPress={() => router.push('/(nurse)/marketplace/contracts' as any)}
          textColor={COLORS.primary}
          style={styles.contractsBtn}
        >
          Contracts
        </Button>
      </View>

      <FlatList
        data={listings || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListingCard
            listing={item}
            onPress={() => handlePressListing(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTextWrap: {
    flex: 1,
  },
  contractsBtn: {
    borderColor: COLORS.primary,
    borderRadius: RADIUS.sm,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textPrimary,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  listContent: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    padding: SPACING.xl,
  },
  loadingText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  errorText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.red,
    marginBottom: SPACING.xs,
  },
  errorDetail: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
