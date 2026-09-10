import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, StatusBar, RefreshControl } from 'react-native';
import { Text } from 'react-native-paper';
import { navigate } from '../../../utils/navigation';
import { useAuthStore } from '../../../store/auth';
import { useDashboardSummary } from '../../../hooks/useDashboard';
import { useVitalsHistory } from '../../../hooks/useRecords';
import { SPACING } from '../../../theme';

import { DashboardHeader } from '../../../components/patient/DashboardHeader';
import { HighRiskAlertCard } from '../../../components/patient/HighRiskAlertCard';
import { UpcomingVisitCard } from '../../../components/patient/UpcomingVisitCard';
import { QuickActionsGrid } from '../../../components/patient/QuickActionsGrid';
import { HealthSummaryCard } from '../../../components/patient/HealthSummaryCard';

export default function PatientHomeScreen() {
  const { user } = useAuthStore();
  const patientId = user?.patientId || '';
  const activeEmergency: any = null;

  const { data: dashboardSummary, refetch: refetchDashboard, isLoading: loadingDash } = useDashboardSummary(patientId);
  const { data: vitalsHistory, refetch: refetchVitals, isLoading: loadingVitals } = useVitalsHistory(patientId);

  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('Good Morning,');

  useEffect(() => {
    const hrs = new Date().getHours();
    if (hrs < 12) setGreeting('Good Morning,');
    else if (hrs < 17) setGreeting('Good Afternoon,');
    else setGreeting('Good Evening,');
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    if (patientId) {
      await Promise.all([
        refetchDashboard(),
        refetchVitals()
      ]);
    }
    setRefreshing(false);
  };

  const userName = user?.fullName || 'Patient';
  
  // Cast for safety since the actual backend might differ slightly
  const dashData = dashboardSummary as any;
  const latestRisk = dashData?.latestRisk;
  const riskTier = latestRisk?.riskTier || dashData?.riskLevel;
  const isHighRisk = riskTier === 'HIGH' || riskTier === 'CRITICAL';
  
  const upcomingVisits = dashData?.upcomingVisits || [];
  const upcomingVisit = upcomingVisits.length > 0 ? upcomingVisits[0] : null;

  const latestVitals = vitalsHistory && vitalsHistory.length > 0 ? vitalsHistory[0] : null;
  // If the backend returned them mapped or we fallback
  const heartRate = latestVitals?.value && latestVitals?.type === 'HEART_RATE' ? latestVitals.value : '--';
  const bloodPressure = (latestVitals as any)?.systolic && (latestVitals as any)?.diastolic
    ? `${(latestVitals as any).systolic}/${(latestVitals as any).diastolic}`
    : '--/--';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#061C19" />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00E676" colors={['#00E676']} />
        }
      >
        {activeEmergency?.data && (
          <View style={{ backgroundColor: '#EF4444', padding: 16, margin: 16, borderRadius: 8 }}>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>
              🚑 Emergency Assistance Requested
            </Text>
            <Text style={{ color: 'white' }}>
              Your doctor has requested emergency assistance. An ambulance has been dispatched to your location.
            </Text>
            <Text style={{ color: 'white', marginTop: 8, fontWeight: 'bold' }}>
              ETA: {activeEmergency.data.etaMinutes || 15} minutes
            </Text>
          </View>
        )}
        {/* Header */}
        <DashboardHeader
          userName={userName}
          greeting={greeting}
          onProfilePress={() => navigate('/(patient)/profile')}
          onNotificationPress={() => navigate('/(patient)/notifications')}
        />

        {/* Pinned High Risk Alert Banner */}
        {isHighRisk && (
          <HighRiskAlertCard
            message={latestRisk?.notes || 'Your last assessment indicates high risk. Please consult your physician.'}
            onViewDetails={() => navigate('/(patient)/records/risk-history')}
          />
        )}

        {/* Upcoming Visit Card */}
        <UpcomingVisitCard
          staffName={upcomingVisit?.nurse?.user?.fullName || upcomingVisit?.doctor?.user?.fullName || 'Assigned Staff'}
          scheduledAt={upcomingVisit?.scheduledAt ? new Date(upcomingVisit.scheduledAt).toLocaleString() : 'No upcoming visit'}
          status={upcomingVisit?.status || 'Scheduled'}
          onPress={() => navigate('/(patient)/requests')}
          onSeeAllPress={() => navigate('/(patient)/requests')}
        />

        {/* Quick Actions Grid */}
        <View style={styles.sectionSpacer}>
          <QuickActionsGrid
            onRequestPress={() => navigate('/(patient)/requests/new')}
            onRecordsPress={() => navigate('/(patient)/records')}
            onAIPress={() => navigate('/(patient)/ai')}
            onPrescriptionsPress={() => navigate('/(patient)/health/prescriptions')}
          />
        </View>

        {/* Health Overview Summary */}
        <View style={styles.sectionSpacer}>
          <HealthSummaryCard
            heartRate={heartRate}
            bloodPressure={bloodPressure}
            riskLevel={latestRisk?.riskTier || 'Not Assessed'}
            heartRateStatus={latestVitals ? 'Recorded' : 'Pending'}
            bpStatus={latestVitals ? 'Recorded' : 'Pending'}
            riskStatus={latestRisk ? 'Assessed' : 'Pending'}
            onPress={() => navigate('/(patient)/records/vitals')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#061C19' },
  container: { padding: SPACING.lg, paddingBottom: 60, maxWidth: 800, width: '100%', alignSelf: 'center' },
  sectionSpacer: { marginTop: SPACING.xl },
});
