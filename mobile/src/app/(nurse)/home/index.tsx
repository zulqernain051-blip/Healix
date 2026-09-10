import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, RefreshControl, StatusBar } from 'react-native';
import { Text } from 'react-native-paper';
import { navigate } from '../../../utils/navigation';
import { useAuthStore } from '../../../store/auth';
import { useNurseProfile, useNurseScore, useNurseReviews } from '../../../hooks/useNurse';
import { useNurseVisits } from '../../../hooks/useVisits';
import { NurseScoreCard } from '../../../components/nurse/NurseScoreCard';
import { NurseReviewCard } from '../../../components/nurse/NurseReviewCard';
import { VisitCard } from '../../../components/nurse/VisitCard';
import { VisitFilterPills } from '../../../components/nurse/VisitFilterPills';
import { EmptyState } from '../../../components/common/EmptyState';
import { LoadingState } from '../../../components/common/LoadingState';
import { ErrorState } from '../../../components/common/ErrorState';
import { NurseQuickActions } from '../../../components/nurse/NurseQuickActions';

export default function NurseHomeScreen() {
  const { user, accessToken } = useAuthStore();
  const nurseId = user?.nurseId;
  const token = accessToken;
  const { data: profile, isLoading: loadingProfile, error: profileError, refetch: refetchProfile } = useNurseProfile(nurseId || '');
  const { data: assignedVisits, isLoading: loadingVisits, refetch: refetchVisits } = useNurseVisits(nurseId || '');
  const { data: nurseScore, refetch: refetchScore } = useNurseScore(nurseId || '');
  const { data: nurseReviews, refetch: refetchReviews } = useNurseReviews(nurseId || '');

  const visits = assignedVisits || [];
  const loading = loadingProfile || loadingVisits;
  const error = profileError?.message;

  const [filter, setFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchProfile(),
      refetchVisits(),
      refetchScore(),
      refetchReviews(),
    ]);
    setRefreshing(false);
  };

  const quickActions = {
    onCheckInPress: () => navigate('/(nurse)/visits'),
    onPatientsPress: () => navigate('/(nurse)/patients'),
    onBidsPress: () => navigate('/(nurse)/marketplace'),
    onMessagesPress: () => navigate('/(nurse)/messages'),
    onEmergencyPress: () => navigate('/(nurse)/visits'),
    onScanQRPress: () => navigate('/(nurse)/visits'),
  };

  const filteredVisits = visits.filter((v: any) => {
    if (filter === 'ALL') return true;
    return v.status === filter;
  });

  const latestReview = nurseReviews && nurseReviews.length > 0 ? nurseReviews[0] : null;

  if (loading && !profile) return <LoadingState />;
  if (error && !profile) return <ErrorState error={error} />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#061C19" />
      
      {/* Header Greeting (Teal Background) */}
      <View style={styles.headerBox}>
        <Text style={styles.greetingTitle}>Welcome back, {user?.fullName || 'Nurse'}</Text>
        <Text style={styles.greetingSub}>
          PNC Registered Nurse · {profile?.available ? '🟢 Available for Visits' : '🔴 Currently Unavailable'}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00E676" colors={['#00E676']} />}
      >
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <NurseQuickActions {...quickActions} />
        </View>

        {/* Performance Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Summary</Text>
          <NurseScoreCard
            compositeScore={nurseScore?.compositeScore ?? 85.0}
            skillScore={nurseScore?.skillScore ?? 85}
            experienceScore={nurseScore?.experienceScore ?? 80}
            reliabilityScore={nurseScore?.reliabilityScore ?? 90}
            performanceScore={nurseScore?.performanceScore ?? 85}
          />
        </View>

        {/* Recent Patient Review */}
        {latestReview ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Patient Review</Text>
            <NurseReviewCard
              patientName={latestReview.patient?.user?.fullName || 'Verified Patient'}
              rating={latestReview.stars || 5}
              comment={latestReview.reviewText || 'Excellent clinical care and clear instructions.'}
              reviewedAt={new Date(latestReview.createdAt).toLocaleDateString()}
            />
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Patient Review</Text>
            <View style={styles.emptyReviewCard}>
              <Text style={styles.emptyReviewIcon}>⭐</Text>
              <Text style={styles.emptyReviewTitle}>No Patient Reviews Yet</Text>
              <Text style={styles.emptyReviewSub}>Completed visit ratings and patient reviews will appear here.</Text>
            </View>
          </View>
        )}

        {/* Today's Visits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assigned Care Visits</Text>
          <VisitFilterPills
            activeFilter={filter}
            onFilterChange={setFilter}
            filters={['ALL', 'SCHEDULED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED']}
          />
          {filteredVisits.length === 0 ? (
            <EmptyState title="No Scheduled Visits" subtitle="You have no assigned care visits for this status." />
          ) : (
            filteredVisits.map((v: any) => (
              <VisitCard
                key={v.id}
                visitId={v.id}
                patientName={v.request?.patient?.user?.fullName || 'Assigned Patient'}
                scheduledTime={v.request?.scheduledAt ? new Date(v.request.scheduledAt).toLocaleString() : 'Scheduled'}
                visitType={v.request?.type || 'NURSE_VISIT'}
                status={v.status}
                address={v.request?.patient?.address || 'Patient Address'}
                onPress={() => navigate(`/(nurse)/visits/${v.id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#061C19' },
  headerBox: { padding: 20, paddingBottom: 30, backgroundColor: '#061C19' },
  greetingTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  greetingSub: { color: '#00E676', fontSize: 14, marginTop: 6, fontWeight: '600' },
  scroll: { flex: 1, backgroundColor: '#F8FAFC', borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },
  scrollContent: { padding: 20, paddingBottom: 40, paddingTop: 30 },
  section: { marginBottom: 28 },
  sectionTitle: { color: '#1E293B', fontSize: 18, fontWeight: '800', marginBottom: 16 },
  emptyReviewCard: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  emptyReviewIcon: { fontSize: 28, marginBottom: 8 },
  emptyReviewTitle: { color: '#1E293B', fontSize: 15, fontWeight: '700' },
  emptyReviewSub: { color: '#64748B', fontSize: 13, textAlign: 'center', marginTop: 4 },
});
