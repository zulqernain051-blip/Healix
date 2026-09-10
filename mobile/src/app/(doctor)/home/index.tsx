import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, StatusBar, Alert } from 'react-native';
import { Card, Chip, Button } from 'react-native-paper';
import { navigate } from '../../../utils/navigation';
import { useAuthStore } from '../../../store/auth';
import { useDoctorQueue, useDoctorHighRiskQueue } from '../../../hooks/useDoctor';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../../theme';

export default function DoctorDashboard() {
  const { user, accessToken, logout } = useAuthStore();
  const [filter, setFilter] = useState<'ALL' | 'HIGH'>('ALL');

  const { data: queue = [], isLoading: isLoadingQueue } = useDoctorQueue();
  const { data: highRiskQueue = [], isLoading: isLoadingHighRisk } = useDoctorHighRiskQueue();
  
  const isLoading = isLoadingQueue || isLoadingHighRisk;
  const activeQueue = filter === 'ALL' ? queue : highRiskQueue;

  const getSlaColor = (remainingMins?: number) => {
    if (remainingMins === undefined) return '#94A3B8';
    if (remainingMins <= 5) return '#EF4444';
    if (remainingMins <= 10) return '#F59E0B';
    return '#00E676';
  };

  const getRiskColor = (tier: string) => {
    return tier === 'HIGH' ? '#EF4444' : '#F59E0B';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#061C19' }}>
      <StatusBar barStyle="light-content" backgroundColor="#061C19" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.docName}>{user?.fullName ?? 'Dr. Physician'}</Text>
            </View>
            <View style={styles.pmdcBadge}>
              <Text style={styles.pmdcBadgeText}>✓ PMDC Verified Doctor</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>High-Risk Patient Escalation Queue | Real-Time SLA Tracker</Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setFilter('ALL')}
            style={[styles.tab, filter === 'ALL' && styles.activeTab]}
          >
            <Text style={[styles.tabText, filter === 'ALL' && styles.activeTabText]}>
              All Cases ({queue.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilter('HIGH')}
            style={[styles.tab, filter === 'HIGH' && styles.activeTab]}
          >
            <Text style={[styles.tabText, filter === 'HIGH' && styles.activeTabText]}>
              🚨 High Risk ({highRiskQueue.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Nav Shortcuts */}
        <View style={styles.navShortcuts}>
          <Button
            mode="contained"
            buttonColor="#00E676"
            textColor="#061C19"
            onPress={() => Alert.alert('Action Required', 'Please select a case from the queue first.')}
            style={{ borderRadius: RADIUS.md, flex: 0.48 }}
            labelStyle={{ fontWeight: '700' }}
          >
            📋 Diagnosis Engine
          </Button>

          <Button
            mode="outlined"
            textColor="#00E676"
            style={{ borderRadius: RADIUS.md, borderColor: '#00E676', flex: 0.48 }}
            onPress={() => navigate('/(doctor)/messages')}
            labelStyle={{ fontWeight: '700' }}
          >
            💬 Messages
          </Button>
        </View>

        {/* Queue Listing */}
        <Text style={styles.sectionLabel}>Active Escalation Feed</Text>

        {isLoading && activeQueue.length === 0 ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#00E676" />
            <Text style={styles.loadingText}>Fetching case assignments...</Text>
          </View>
        ) : activeQueue.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🩺</Text>
            <Text style={styles.emptyTitle}>Escalation Queue Clean</Text>
            <Text style={styles.emptyText}>No high-risk patient cases are pending review right now.</Text>
          </View>
        ) : (
          activeQueue.map((item: any) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => navigate(`/(doctor)/reviews/${item.id}`)}
              activeOpacity={0.85}
            >
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Text style={styles.patientName}>{item.visit?.request?.patient?.user?.fullName || 'Assigned Patient'}</Text>
                    <View style={styles.badgeRow}>
                      <Chip
                        textStyle={{ color: '#FFF', fontSize: 10, fontWeight: '700' }}
                        style={{ backgroundColor: getRiskColor(item.riskTier), marginRight: 6 }}
                      >
                        {item.riskTier}
                      </Chip>
                      <Chip
                        textStyle={{ color: '#061C19', fontSize: 10, fontWeight: '700' }}
                        style={{ backgroundColor: getSlaColor(item.remainingMins) }}
                      >
                        {item.remainingMins !== undefined ? `${item.remainingMins} MINS SLA` : 'SLA'}
                      </Chip>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Escalated Status:</Text>
                    <Text style={[styles.detailValue, { color: (item.status === 'PENDING' || item.status.includes('BROADCAST')) ? '#F59E0B' : '#00E676' }]}>
                      {(item.status === 'PENDING' || item.status.includes('BROADCAST')) ? `Broadcast (${item.status})` : `Locked (${item.status})`}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#061C19' },
  content: { padding: SPACING.lg, paddingBottom: 40 },
  header: { marginBottom: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { color: '#94A3B8', fontSize: 13 },
  docName: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginTop: 2 },
  pmdcBadge: { backgroundColor: 'rgba(0, 230, 118, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.round, borderWidth: 1, borderColor: '#00E676' },
  pmdcBadgeText: { color: '#00E676', fontSize: 11, fontWeight: '700' },
  subtitle: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
  tabContainer: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tab: { flex: 1, backgroundColor: '#0A2D28', paddingVertical: 10, borderRadius: RADIUS.md, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.15)' },
  activeTab: { backgroundColor: '#0E3630', borderColor: '#00E676' },
  tabText: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  activeTabText: { color: '#00E676', fontWeight: '800' },
  navShortcuts: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  sectionLabel: { color: '#00E676', fontSize: 15, fontWeight: '700', marginBottom: 12 },
  card: { backgroundColor: '#0A2D28', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.15)', marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  patientName: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  badgeRow: { flexDirection: 'row' },
  divider: { backgroundColor: 'rgba(0, 230, 118, 0.1)', height: 1, marginVertical: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { color: '#94A3B8', fontSize: 12 },
  detailValue: { fontSize: 12, fontWeight: '700' },
  centered: { alignItems: 'center', marginVertical: 40 },
  loadingText: { color: '#94A3B8', marginTop: 10 },
  emptyCard: { backgroundColor: '#0A2D28', borderRadius: RADIUS.lg, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.15)' },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  emptyText: { color: '#94A3B8', fontSize: 12, textAlign: 'center', marginTop: 4 },
});
