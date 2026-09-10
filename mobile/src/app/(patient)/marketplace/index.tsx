import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Text, Card, Chip, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useCareRequests } from '../../../hooks/useCareRequests';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../../theme';
import { CareRequestResponse } from '../../../types/care';

export default function PatientMarketplaceScreen() {
  const router = useRouter();
  const { data: requests, isLoading, isError, error, refetch } = useCareRequests();

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Only show requests that have an OPEN marketplace listing
  const marketplaceRequests = (requests || []).filter(
    (r: CareRequestResponse) => r.marketplaceListing && r.marketplaceListing.status === 'OPEN'
  );

  const handlePressReviewOffers = (listingId: string) => {
    router.push(`/(patient)/marketplace/${listingId}` as any);
  };

  if (isLoading && !requests) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load requests</Text>
        <Text style={styles.errorDetail}>{(error as Error).message}</Text>
      </View>
    );
  }

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🛒</Text>
      <Text style={styles.emptyText}>No Active Marketplace Listings</Text>
      <Text style={styles.emptySubtext}>
        When you create a care request, it will appear here so you can review offers from nurses.
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: CareRequestResponse }) => {
    const listingId = item.marketplaceListing?.id;

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text style={styles.cardTitle}>{item.type.replace(/_/g, ' ')}</Text>
            <Chip style={styles.statusChip} textStyle={styles.statusText}>
              ACCEPTING OFFERS
            </Chip>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.label}>Scheduled For:</Text>
            <Text style={styles.value}>
              {item.preferredDate ? new Date(item.preferredDate).toLocaleDateString() : 'Flexible Date'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Duration:</Text>
            <Text style={styles.value}>{item.durationMinutes} mins</Text>
          </View>

          {item.notes && (
            <Text style={styles.notes} numberOfLines={2}>
              "{item.notes}"
            </Text>
          )}

        </Card.Content>
        <Card.Actions style={styles.actions}>
          <Button
            mode="contained"
            onPress={() => listingId && handlePressReviewOffers(listingId)}
            buttonColor={COLORS.primary}
            style={styles.reviewBtn}
          >
            Review Offers
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>Marketplace</Text>
          <Text style={styles.subtitle}>Review offers from nurses</Text>
        </View>
        <Button 
          mode="outlined" 
          onPress={() => router.push('/(patient)/marketplace/contracts' as any)}
          textColor={COLORS.primary}
          style={styles.contractsBtn}
        >
          Contracts
        </Button>
      </View>

      <FlatList
        data={marketplaceRequests}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
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
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  statusChip: {
    backgroundColor: COLORS.tealLight,
    height: 24,
  },
  statusText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: 'bold',
    marginVertical: 0,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  label: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    width: 100,
  },
  value: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  notes: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: SPACING.sm,
  },
  actions: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    justifyContent: 'flex-end',
  },
  reviewBtn: {
    borderRadius: RADIUS.sm,
    width: '100%',
  },
});
