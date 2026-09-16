import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../../store/auth';
import { useNurseContracts } from '../../../../hooks/useContracts';
import { ContractCard } from '../../../../components/contracts/ContractCard';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../../theme';

export default function NurseContractsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const nurseId = user?.nurseId;

  const { data: contracts, isLoading, isError, error, refetch } = useNurseContracts(nurseId || '');

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handlePressContract = (id: string) => {
    router.push(`/(nurse)/marketplace/contracts/${id}` as any);
  };

  if (isLoading && !contracts) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load contracts</Text>
        <Text style={styles.errorDetail}>{(error as Error).message}</Text>
      </View>
    );
  }

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📝</Text>
      <Text style={styles.emptyText}>No Contracts Yet</Text>
      <Text style={styles.emptySubtext}>
        When a patient accepts your offer, the contract will appear here.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>My Contracts</Text>
        <Text style={styles.subtitle}>Manage your service agreements</Text>
      </View>

      <FlatList
        data={contracts || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ContractCard
            contract={item}
            isPatientView={false}
            onPress={() => handlePressContract(item.id)}
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
});
