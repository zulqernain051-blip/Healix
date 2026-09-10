import React from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { goBack } from '../../../utils/navigation';
import { useVisitDetail, useQrToken, useConfirmArrival } from '../../../hooks/useVisits';
import { VisitInfoCard } from '../../../components/visits/VisitInfoCard';
import { VisitStatusBadge } from '../../../components/visits/VisitStatusBadge';
import { SPACING, RADIUS } from '../../../theme';

export default function PatientVisitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const visitId = id || '';

  const { data: visit, isLoading, error, refetch } = useVisitDetail(visitId, { pollingInterval: 15000 });
  const { data: qrData, isLoading: qrLoading, refetch: refetchQr } = useQrToken(visitId);
  const confirmArrival = useConfirmArrival();

  if (isLoading && !visit) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#061C19" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#00E676" />
          <Text style={styles.loadingText}>Loading visit...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !visit) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#061C19" />
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error ? (error as Error).message : 'Visit not found'}</Text>
          <Button mode="text" textColor="#00E676" onPress={() => refetch()}>Retry</Button>
        </View>
      </SafeAreaView>
    );
  }

  const isActive = visit.status === 'SCHEDULED' || visit.status === 'ACCEPTED' || visit.status === 'IN_PROGRESS';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#061C19" />

      <View style={styles.headerRow}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Visit Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <VisitInfoCard visit={visit} />

        {/* QR Code for nurse verification */}
        {isActive && (
          <View style={styles.qrSection}>
            <Text style={styles.qrTitle}>Your Visit QR Code</Text>
            <Text style={styles.qrSubtitle}>
              Show this to your nurse when they arrive to verify your identity.
            </Text>

            <View style={styles.qrCard}>
              {qrLoading ? (
                <ActivityIndicator size="large" color="#00E676" />
              ) : qrData?.token ? (
                <View style={styles.qrWrapper}>
                  <QRCode value={qrData.token} size={200} color="#061C19" backgroundColor="#FFFFFF" />
                  <Text style={styles.tokenPreview}>{qrData.token.substring(0, 16)}...</Text>
                </View>
              ) : (
                <View style={styles.qrError}>
                  <Text style={styles.qrErrorText}>QR code not available</Text>
                  <Button mode="outlined" textColor="#00E676" style={{ borderColor: '#00E676', marginTop: 8 }} onPress={() => refetchQr()}>
                    Retry
                  </Button>
                </View>
              )}
            </View>

            <Button
              mode="contained"
              buttonColor="#00E676"
              textColor="#061C19"
              style={styles.refreshBtn}
              onPress={() => refetchQr()}
              labelStyle={{ fontWeight: '700' }}
            >
              Refresh QR Code
            </Button>
          </View>
        )}

        {/* Visit Status Summary */}
        {visit.status === 'COMPLETED' && (
          <View style={styles.completedCard}>
            <Text style={styles.completedTitle}>✅ Visit Completed</Text>
            {visit.completedAt && (
              <Text style={styles.completedDate}>
                Completed on {new Date(visit.completedAt).toLocaleString()}
              </Text>
            )}
            {(visit.vitals?.length ?? 0) > 0 && <Text style={styles.summaryItem}>✓ Vitals recorded</Text>}
            {(visit.symptoms?.length ?? 0) > 0 && <Text style={styles.summaryItem}>✓ Symptoms documented</Text>}
            {visit.clinicalRemark && <Text style={styles.summaryItem}>✓ Clinical remarks submitted</Text>}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#061C19' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.lg },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { color: '#FFFFFF', fontSize: 28 },
  headerTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  scroll: { flex: 1 },
  content: { padding: SPACING.lg, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#94A3B8', marginTop: 10, fontSize: 14 },
  errorText: { color: '#EF4444', fontSize: 15, fontWeight: '600', marginBottom: 10 },
  qrSection: { alignItems: 'center', marginBottom: SPACING.xl },
  qrTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  qrSubtitle: { color: '#94A3B8', fontSize: 13, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  qrCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    width: 260,
    minHeight: 280,
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 24,
  },
  qrWrapper: { alignItems: 'center' },
  tokenPreview: { color: '#64748B', fontSize: 11, marginTop: 16, fontFamily: 'monospace' },
  qrError: { alignItems: 'center' },
  qrErrorText: { color: '#94A3B8', fontSize: 13 },
  refreshBtn: { width: '100%', borderRadius: RADIUS.md },
  completedCard: {
    backgroundColor: '#0A2D28',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  completedTitle: { color: '#10B981', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  completedDate: { color: '#94A3B8', fontSize: 12, marginBottom: 12 },
  summaryItem: { color: '#00E676', fontSize: 13, fontWeight: '600', marginBottom: 4 },
});
