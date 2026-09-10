import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Alert, ActivityIndicator, Platform } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { navigate, goBack } from '../../../utils/navigation';
import { SPACING, RADIUS, TYPOGRAPHY, COLORS } from '../../../theme';

import { RequestTrackingStepper } from '../../../components/patient/RequestTrackingStepper';
import { CancelRequestModal } from '../../../components/patient/CancelRequestModal';
import { RescheduleRequestModal } from '../../../components/patient/RescheduleRequestModal';
import { useCareRequestDetails, useCancelCareRequest, useRescheduleCareRequest } from '../../../hooks/useCareRequests';

export default function RequestDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { data: request, isLoading, isError, refetch } = useCareRequestDetails(String(id));
  const cancelCareRequest = useCancelCareRequest();
  const rescheduleCareRequest = useRescheduleCareRequest();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (isError || !request) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => goBack()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ color: 'white', textAlign: 'center', marginTop: 40 }}>Failed to load Request Details.</Text>
        <Button mode="text" onPress={() => refetch()}>Retry</Button>
      </SafeAreaView>
    );
  }

  const isCancelable = request.status === 'OPEN';
  const isReschedulable = request.status === 'OPEN';

  const trackingSteps = [
    {
      title: 'Request Published',
      time: request.createdAt ? new Date(request.createdAt).toLocaleString() : 'Done',
      status: 'completed' as const,
    },
    {
      title: 'Staff Assigned',
      sub: request.status === 'OPEN' ? 'Awaiting Bid Accept' : 'Assigned',
      time: request.status === 'OPEN' ? 'In Negotiation' : 'Done',
      status: request.status === 'OPEN' ? ('current' as const) : ('completed' as const),
    },
    {
      title: 'Visit In Progress',
      time: request.status === 'IN_PROGRESS' ? 'Active now' : request.status === 'COMPLETED' ? 'Done' : 'Pending',
      status: request.status === 'IN_PROGRESS' ? ('current' as const) : request.status === 'COMPLETED' ? ('completed' as const) : ('pending' as const),
    },
    {
      title: 'Completed',
      time: request.status === 'COMPLETED' ? 'Finished' : 'Pending',
      status: request.status === 'COMPLETED' ? ('completed' as const) : ('pending' as const),
    },
  ];

  const handleCancel = async (reason: string) => {
    cancelCareRequest.mutate({ id: request.id, data: { reason } }, {
      onSuccess: () => {
        setShowCancelModal(false);
        if (Platform.OS === 'web') {
          alert('Success: Request has been cancelled successfully.');
        } else {
          Alert.alert('Success', 'Request has been cancelled successfully.');
        }
      },
      onError: (err: any) => {
        if (Platform.OS === 'web') {
          alert('Cancellation Error: ' + (err.message || 'Could not cancel request.'));
        } else {
          Alert.alert('Cancellation Error', err.message || 'Could not cancel request.');
        }
      }
    });
  };

  const handleReschedule = async (newDate: string) => {
    rescheduleCareRequest.mutate({ id: request.id, data: { newDate } }, {
      onSuccess: () => {
        setShowRescheduleModal(false);
        if (Platform.OS === 'web') {
          alert('Success: Request has been rescheduled successfully.');
        } else {
          Alert.alert('Success', 'Request has been rescheduled successfully.');
        }
      },
      onError: (err: any) => {
        if (Platform.OS === 'web') {
          alert('Reschedule Error: ' + (err.message || 'Could not reschedule request.'));
        } else {
          Alert.alert('Reschedule Error', err.message || 'Could not reschedule request.');
        }
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#061C19" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => goBack()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Request Details</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Order Header Card */}
        <View style={styles.orderHeaderCard}>
          <View style={styles.orderTitleGroup}>
            <Text style={styles.orderId}>{String(request.id).substring(0, 10).toUpperCase()}</Text>
            <View style={[styles.statusPill, { backgroundColor: request.status === 'OPEN' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(0, 230, 118, 0.15)' }]}>
              <Text style={[styles.statusText, { color: request.status === 'OPEN' ? '#F59E0B' : '#00E676' }]}>
                {request.status}
              </Text>
            </View>
          </View>
          <Text style={styles.orderMeta}>
            📅 {request.preferredDate ? new Date(request.preferredDate).toLocaleDateString() : 'Date TBD'}
            {'  ·  '}
            {request.type === 'NURSE_VISIT' ? '👩‍⚕️ Nurse Visit' : '👨‍⚕️ Doctor Visit'}
          </Text>
          {request.notes ? (
            <Text style={styles.orderNotes} numberOfLines={2}>{request.notes}</Text>
          ) : null}
        </View>

        {/* Tracking Stepper */}
        <RequestTrackingStepper steps={trackingSteps} />

        {/* Action Buttons */}
        {(isCancelable || isReschedulable) && (
          <View style={styles.actionsContainer}>
            {isCancelable && (
              <Button
                mode="outlined"
                textColor="#EF4444"
                style={[styles.actionBtn, { borderColor: '#EF4444' }]}
                onPress={() => setShowCancelModal(true)}
              >
                Cancel Request
              </Button>
            )}
            {isReschedulable && (
              <Button
                mode="contained"
                buttonColor="#00E676"
                textColor="#061C19"
                style={styles.actionBtn}
                onPress={() => setShowRescheduleModal(true)}
              >
                Reschedule
              </Button>
            )}
          </View>
        )}

      </ScrollView>

      {/* Modals */}
      <CancelRequestModal
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        isLoading={cancelCareRequest.isPending}
      />

      <RescheduleRequestModal
        visible={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        onConfirm={handleReschedule}
        isLoading={rescheduleCareRequest.isPending}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#061C19' },
  container: { paddingBottom: 60 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: '#061C19',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  backIcon: { color: '#FFF', fontSize: 32, lineHeight: 34, marginLeft: -2 },
  headerTitle: { color: '#FFFFFF', fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '700' },
  
  orderHeaderCard: {
    backgroundColor: '#000000',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  orderTitleGroup: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.xs },
  orderId: { ...TYPOGRAPHY.h3, color: COLORS.text, fontWeight: '800' },
  statusPill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: RADIUS.round },
  statusText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  orderMeta: { ...TYPOGRAPHY.bodyMedium, color: COLORS.textSecondary, marginBottom: SPACING.sm, fontWeight: '600' },
  orderNotes: { ...TYPOGRAPHY.bodySmall, color: '#94A3B8', fontStyle: 'italic', backgroundColor: 'rgba(255,255,255,0.03)', padding: SPACING.sm, borderRadius: RADIUS.sm },

  actionsContainer: { flexDirection: 'row', gap: SPACING.md, padding: SPACING.lg, backgroundColor: '#000000', marginTop: SPACING.md },
  actionBtn: { flex: 1, borderRadius: RADIUS.md },
});
