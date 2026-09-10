import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, RefreshControl, ActivityIndicator } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { navigate } from '../../../utils/navigation';
import { SPACING, RADIUS, TYPOGRAPHY, COLORS } from '../../../theme';

import { RequestCard } from '../../../components/patient/RequestCard';
import { RequestFilterPills } from '../../../components/patient/RequestFilterPills';
import { useCareRequests } from '../../../hooks/useCareRequests';

export default function RequestsScreen() {
  const [activeFilter, setActiveFilter] = useState('ALL');
  
  const { data: requests, isLoading, isError, refetch, isRefetching } = useCareRequests();

  const filters = ['ALL', 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  const filteredRequests = (requests || []).filter(req => {
    if (activeFilter === 'ALL') return true;
    return req.status === activeFilter;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#061C19" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>My Requests</Text>
        </View>

        {/* Filter Pills */}
        <RequestFilterPills
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          filters={filters}
        />

        {/* List */}
        <ScrollView
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#00E676" colors={['#00E676']} />
          }
        >
          {isLoading && !isRefetching ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
          ) : isError ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>⚠️</Text>
              <Text style={styles.emptyText}>Failed to load requests.</Text>
              <Button mode="text" onPress={() => refetch()}>Retry</Button>
            </View>
          ) : filteredRequests.length > 0 ? (
            filteredRequests.map(req => (
              <RequestCard
                key={req.id}
                title={req.scheduleType === 'RECURRING' ? 'Recurring Care Request' : 'One-Time Care Request'}
                type={req.type === 'NURSE_VISIT' ? 'Nurse Visit' : 'Doctor Visit'}
                scheduledAt={req.preferredDate ? new Date(req.preferredDate).toLocaleString() : 'Date TBD'}
                status={req.status}
                onPress={() => navigate(`/(patient)/requests/${req.id}`)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No requests found for this filter</Text>
            </View>
          )}
        </ScrollView>

        {/* New Request CTA */}
        <TouchableOpacity
          style={styles.newRequestBtn}
          onPress={() => navigate('/(patient)/requests/new')}
        >
          <Text style={styles.newRequestBtnText}>+ New Request</Text>
        </TouchableOpacity>
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
  headerTitle: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
  },
  listContainer: {
    paddingBottom: 80,
    gap: SPACING.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  newRequestBtn: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: '#00E676',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    elevation: 4,
  },
  newRequestBtnText: {
    color: '#061C19',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
  },
});
