import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../store/auth';
import { useRiskHistory } from '../../../hooks/useRecords';
import { SPACING, TYPOGRAPHY } from '../../../theme';

import { RiskHistoryCard } from '../../../components/patient/RiskHistoryCard';
import { LoadingState } from '../../../components/common/LoadingState';
import { ErrorState } from '../../../components/common/ErrorState';

export default function RiskHistoryScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const patientId = user?.patientId || '';

  const { data: riskHistory, isLoading, error, refetch } = useRiskHistory(patientId);

  if (isLoading && !riskHistory) return <LoadingState message="Loading risk history..." />;
  if (error) return <ErrorState error={error as Error} onRetry={refetch} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#061C19" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Risk History</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
          {riskHistory && riskHistory.length > 0 ? (
            riskHistory.map((item: any) => (
              <RiskHistoryCard
                key={item.id}
                riskTier={item.riskTier || item.level}
                fusedScore={item.fusedScore || item.score}
                assessedAt={item.assessedAt || new Date().toISOString()}
                notes={item.notes}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyTitle}>No Risk History Recorded</Text>
              <Text style={styles.emptySub}>
                Your AI clinical risk assessments generated during care visits will appear here.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#061C19',
  },
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
  },
  listContainer: {
    paddingBottom: 40,
    gap: SPACING.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
  },
  emptySub: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 16,
  },
});

