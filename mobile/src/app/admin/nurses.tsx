import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, StatusBar, FlatList } from 'react-native';
import { Card, Button, Chip, Divider } from 'react-native-paper';
import { navigate } from '../../utils/navigation';
import { useAdminNurses, useAdminPendingNurses, useApproveNurse, useRejectNurse, useRevokeNurse } from '../../hooks/useAdmin';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../theme';

export default function AdminNurses() {
  const { data: pendingNurses = [], isLoading: isLoadingPending } = useAdminPendingNurses();
  const { data: nurses = [], isLoading: isLoadingNurses } = useAdminNurses();

  const { mutateAsync: approveNurse } = useApproveNurse();
  const { mutateAsync: rejectNurse } = useRejectNurse();
  const { mutateAsync: revokeNurse } = useRevokeNurse();
  
  const isLoading = isLoadingPending || isLoadingNurses;
  const [tab, setTab] = useState<'PENDING' | 'ALL'>('PENDING');

  const handleApprove = async (id: string) => {
    try {
      await approveNurse(id);
      Alert.alert('Nurse Approved', 'PNC credentials verified and account activated.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Action failed');
    }
  };

  const handleReject = async (id: string) => {
    Alert.prompt(
      'Reject PNC Verification',
      'Reason for rejecting nurse application (min 5 chars):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          onPress: async (reason?: string) => {
            if (!reason || reason.trim().length < 5) {
              Alert.alert('Error', 'A clear justification reason is required.');
              return;
            }
            try {
              await rejectNurse({ nurseId: id, reason: reason.trim() });
              Alert.alert('Nurse Rejected', 'Verification application rejected.');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Action failed');
            }
          }
        }
      ]
    );
  };

  const activeList = tab === 'PENDING' ? pendingNurses : nurses;

  const renderItem = ({ item: nurse }: any) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.nurseName}>{nurse.user?.fullName || 'Nurse Specialist'}</Text>
            <Text style={styles.contactInfo}>
              📧 {nurse.user?.email} · 📱 {nurse.user?.phone}
            </Text>
          </View>
          <Chip
            textStyle={{ color: '#061C19', fontSize: 10, fontWeight: '800' }}
            style={{ backgroundColor: nurse.verificationStatus === 'VERIFIED' ? '#00E676' : '#F59E0B' }}
          >
            {nurse.verificationStatus}
          </Chip>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>PNC Registration No:</Text>
          <Text style={styles.detailValue}>{nurse.pncNumber || 'PNC-Pending'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>CNIC Number:</Text>
          <Text style={styles.detailValue}>{nurse.cnic || 'Recorded'}</Text>
        </View>

        {nurse.verificationStatus === 'PENDING' && (
          <View style={styles.actionsRow}>
            <Button
              mode="contained"
              buttonColor="#00E676"
              textColor="#061C19"
              onPress={() => handleApprove(nurse.id)}
              style={{ flex: 0.48, borderRadius: RADIUS.md }}
              labelStyle={{ fontWeight: '700' }}
            >
              Approve PNC
            </Button>
            <Button
              mode="outlined"
              textColor="#EF4444"
              onPress={() => handleReject(nurse.id)}
              style={{ flex: 0.48, borderColor: '#EF4444', borderRadius: RADIUS.md }}
              labelStyle={{ fontWeight: '700' }}
            >
              Reject File
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#061C19' }}>
      <StatusBar barStyle="light-content" backgroundColor="#061C19" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigate('/admin')} style={styles.backBtn}>
            <Text style={styles.backText}>‹ Back to Command Center</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Nurse Credential Governance</Text>
          <Text style={styles.subtitle}>Audit PNC license certificates and approve home visit nurses</Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'PENDING' && styles.tabBtnActive]}
            onPress={() => setTab('PENDING')}
          >
            <Text style={[styles.tabBtnText, tab === 'PENDING' && styles.tabBtnTextActive]}>
              Pending Verification ({pendingNurses.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, tab === 'ALL' && styles.tabBtnActive]}
            onPress={() => setTab('ALL')}
          >
            <Text style={[styles.tabBtnText, tab === 'ALL' && styles.tabBtnTextActive]}>
              All Registered Nurses ({nurses.length})
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading && activeList.length === 0 ? (
          <ActivityIndicator color="#00E676" size="large" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={activeList}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={() => (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🩺</Text>
                <Text style={styles.emptyTitle}>Queue Clear</Text>
                <Text style={styles.emptySub}>No nurse credentials require audit in this tab.</Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#061C19', padding: SPACING.lg },
  listContent: { paddingBottom: 40 },
  header: { marginBottom: 20 },
  backBtn: { marginBottom: 8 },
  backText: { color: '#00E676', fontSize: 13, fontWeight: '700' },
  title: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  subtitle: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tabBtn: { flex: 1, backgroundColor: '#0A2D28', paddingVertical: 10, borderRadius: RADIUS.md, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.15)' },
  tabBtnActive: { backgroundColor: '#0E3630', borderColor: '#00E676' },
  tabBtnText: { color: '#94A3B8', fontSize: 11, fontWeight: '600' },
  tabBtnTextActive: { color: '#00E676', fontWeight: '800' },
  card: { backgroundColor: '#0A2D28', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.15)', marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  nurseName: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  contactInfo: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  divider: { backgroundColor: 'rgba(0, 230, 118, 0.1)', marginVertical: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  detailLabel: { color: '#94A3B8', fontSize: 12 },
  detailValue: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  emptyCard: { backgroundColor: '#0A2D28', borderRadius: RADIUS.lg, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.15)' },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  emptySub: { color: '#94A3B8', fontSize: 12, textAlign: 'center', marginTop: 4 },
});
