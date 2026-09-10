import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, StatusBar, FlatList } from 'react-native';
import { Card, Button, Chip, Divider } from 'react-native-paper';
import { navigate } from '../../utils/navigation';
import { useAdminPendingNurses, useAdminPendingDoctors, useApproveNurse, useRejectNurse, useApproveDoctor, useRejectDoctor } from '../../hooks/useAdmin';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../theme';

export default function AdminVerification() {
  const { data: pendingNurses = [], isLoading: isLoadingNurses } = useAdminPendingNurses();
  const { data: pendingDoctors = [], isLoading: isLoadingDoctors } = useAdminPendingDoctors();

  const { mutateAsync: approveNurse } = useApproveNurse();
  const { mutateAsync: rejectNurse } = useRejectNurse();
  const { mutateAsync: approveDoctor } = useApproveDoctor();
  const { mutateAsync: rejectDoctor } = useRejectDoctor();
  
  const isLoading = isLoadingNurses || isLoadingDoctors;

  const pendingList = [
    ...pendingNurses.map(n => ({ ...n, type: 'NURSE' })),
    ...pendingDoctors.map(d => ({ ...d, type: 'DOCTOR' }))
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const handleApprove = async (item: any) => {
    try {
      if (item.type === 'NURSE') {
        await approveNurse(item.id);
        Alert.alert('Nurse Approved', 'PNC credentials verified.');
      } else {
        await approveDoctor(item.id);
        Alert.alert('Doctor Approved', 'PMDC credentials verified.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Action failed');
    }
  };

  const handleReject = async (item: any) => {
    Alert.prompt(
      `Reject ${item.type} Verification`,
      `Reason for rejecting application (min 5 chars):`,
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
              if (item.type === 'NURSE') {
                await rejectNurse({ nurseId: item.id, reason: reason.trim() });
              } else {
                await rejectDoctor({ doctorId: item.id, reason: reason.trim() });
              }
              Alert.alert('Rejected', 'Verification application rejected.');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Action failed');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: any) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName}>{item.user?.fullName || (item.type === 'NURSE' ? 'Nurse' : 'Doctor')}</Text>
            <Text style={styles.contactInfo}>
              📧 {item.user?.email} · 📱 {item.user?.phone}
            </Text>
          </View>
          <Chip
            textStyle={{ color: '#061C19', fontSize: 10, fontWeight: '800' }}
            style={{ backgroundColor: item.type === 'NURSE' ? '#3B82F6' : '#8B5CF6' }}
          >
            {item.type}
          </Chip>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{item.type === 'NURSE' ? 'PNC Registration No:' : 'PMDC Registration No:'}</Text>
          <Text style={styles.detailValue}>{item.type === 'NURSE' ? (item.pncNumber || 'PNC-Pending') : (item.pmdcNumber || 'PMDC-Pending')}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>CNIC Number:</Text>
          <Text style={styles.detailValue}>{item.cnic || 'Recorded'}</Text>
        </View>

        <View style={styles.actionsRow}>
          <Button
            mode="contained"
            buttonColor="#00E676"
            textColor="#061C19"
            onPress={() => handleApprove(item)}
            style={{ flex: 0.48, borderRadius: RADIUS.md }}
            labelStyle={{ fontWeight: '700' }}
          >
            Approve
          </Button>
          <Button
            mode="outlined"
            textColor="#EF4444"
            onPress={() => handleReject(item)}
            style={{ flex: 0.48, borderColor: '#EF4444', borderRadius: RADIUS.md }}
            labelStyle={{ fontWeight: '700' }}
          >
            Reject
          </Button>
        </View>
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
          <Text style={styles.title}>Verification Queue</Text>
          <Text style={styles.subtitle}>Audit and approve pending credential verifications</Text>
        </View>

        {isLoading && pendingList.length === 0 ? (
          <ActivityIndicator color="#00E676" size="large" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={pendingList}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={() => (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🛡️</Text>
                <Text style={styles.emptyTitle}>Queue Clear</Text>
                <Text style={styles.emptySub}>No pending verifications at the moment.</Text>
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
  card: { backgroundColor: '#0A2D28', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.15)', marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemName: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
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
