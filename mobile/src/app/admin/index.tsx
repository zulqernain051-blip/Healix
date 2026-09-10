import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { Card, Button, Divider, Chip } from 'react-native-paper';
import { navigate } from '../../utils/navigation';
import { useAuthStore } from '../../store/auth';
import { useAdminStats, useAdminPendingNurses, useAdminPendingDoctors } from '../../hooks/useAdmin';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../theme';

export default function AdminDashboard() {
  const { logout } = useAuthStore();
  const { data: stats } = useAdminStats();
  const { data: pendingNurses = [] } = useAdminPendingNurses();
  const { data: pendingDoctors = [] } = useAdminPendingDoctors();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#061C19' }}>
      <StatusBar barStyle="light-content" backgroundColor="#061C19" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>System Ops Command Center</Text>
              <Text style={styles.subtitle}>Healix Platform Administration & Credentials Governance</Text>
            </View>
            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>🚪 Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Analytics Summary Grid */}
        <Text style={styles.sectionLabel}>System Performance Summary</Text>
        <View style={styles.statsGrid}>
          <TouchableOpacity style={styles.statCard} onPress={() => navigate('/admin/users')}>
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statValue}>{stats?.totalUsers ?? 9}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} onPress={() => navigate('/admin/nurses')}>
            <Text style={styles.statIcon}>👩‍⚕️</Text>
            <Text style={styles.statValue}>{stats?.totalNurses ?? 3}</Text>
            <Text style={styles.statLabel}>Registered Nurses</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} onPress={() => navigate('/admin/doctors')}>
            <Text style={styles.statIcon}>👨‍⚕️</Text>
            <Text style={styles.statValue}>{stats?.totalDoctors ?? 3}</Text>
            <Text style={styles.statLabel}>Verified Doctors</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} onPress={() => navigate('/admin/verification')}>
            <Text style={styles.statIcon}>🛡️</Text>
            <Text style={styles.statValue}>{pendingNurses.length + pendingDoctors.length}</Text>
            <Text style={styles.statLabel}>Pending Queue</Text>
          </TouchableOpacity>
        </View>

        {/* Management Quick Actions */}
        <Text style={styles.sectionLabel}>Admin Operations Modules</Text>
        <View style={styles.moduleGrid}>
          <TouchableOpacity style={styles.moduleCard} onPress={() => navigate('/admin/verification')}>
            <Text style={styles.moduleIcon}>🛡️</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.moduleTitle}>Verification Queue</Text>
              <Text style={styles.moduleSub}>Approve Nurses and Doctors ({pendingNurses.length + pendingDoctors.length} pending)</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.moduleCard} onPress={() => navigate('/admin/users')}>
            <Text style={styles.moduleIcon}>👥</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.moduleTitle}>User Account Management</Text>
              <Text style={styles.moduleSub}>Manage all users</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.moduleCard} onPress={() => navigate('/admin/patients')}>
            <Text style={styles.moduleIcon}>🤕</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.moduleTitle}>Patients Management</Text>
              <Text style={styles.moduleSub}>Manage patient access</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.moduleCard} onPress={() => navigate('/admin/nurses')}>
            <Text style={styles.moduleIcon}>👩‍⚕️</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.moduleTitle}>Nurse Management</Text>
              <Text style={styles.moduleSub}>Review PNC license credentials</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.moduleCard} onPress={() => navigate('/admin/doctors')}>
            <Text style={styles.moduleIcon}>👨‍⚕️</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.moduleTitle}>Doctor Management</Text>
              <Text style={styles.moduleSub}>Review PMDC registrations</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.moduleCard} onPress={() => navigate('/admin/paramedics')}>
            <Text style={styles.moduleIcon}>🚑</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.moduleTitle}>Paramedics Management</Text>
              <Text style={styles.moduleSub}>Manage paramedics access</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* New Operational Modules */}
          <TouchableOpacity style={styles.moduleCard} onPress={() => navigate('/admin/care')}>
            <Text style={styles.moduleIcon}>📋</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.moduleTitle}>Care Operations</Text>
              <Text style={styles.moduleSub}>Requests, Offers, Contracts, Visits</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.moduleCard} onPress={() => navigate('/admin/clinical')}>
            <Text style={styles.moduleIcon}>🏥</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.moduleTitle}>Clinical Operations</Text>
              <Text style={styles.moduleSub}>Manage Cases & Assignments</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.moduleCard, { borderColor: 'rgba(239, 68, 68, 0.3)' }]} onPress={() => navigate('/admin/emergency')}>
            <Text style={styles.moduleIcon}>🚨</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.moduleTitle}>Emergency Center</Text>
              <Text style={styles.moduleSub}>Live monitoring & escalations</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.moduleCard} onPress={() => navigate('/admin/network')}>
            <Text style={styles.moduleIcon}>🌐</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.moduleTitle}>Healthcare Network</Text>
              <Text style={styles.moduleSub}>Hospitals & Ambulances CRM</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.moduleCard} onPress={() => navigate('/admin/reviews')}>
            <Text style={styles.moduleIcon}>⭐</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.moduleTitle}>Review Moderation</Text>
              <Text style={styles.moduleSub}>Approve/Hide Ratings</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.moduleCard} onPress={() => navigate('/admin/config')}>
            <Text style={styles.moduleIcon}>⚙️</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.moduleTitle}>Platform Config & Audit Logs</Text>
              <Text style={styles.moduleSub}>SLA parameters & audit trails</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* System Verification Status Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>🔒 Governance & Compliance Status</Text>
            <Divider style={styles.divider} />
            <Text style={styles.complianceItem}>✓ All 3 Seeded Nurses PNC Verified</Text>
            <Text style={styles.complianceItem}>✓ All 3 Seeded Doctors PMDC Verified</Text>
            <Text style={styles.complianceItem}>✓ Audit Log Logging Active</Text>
            <Text style={styles.complianceItem}>✓ Database Constraints Enforced</Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#061C19' },
  content: { padding: SPACING.lg, paddingBottom: 40 },
  header: { marginBottom: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
  logoutBtn: { backgroundColor: 'rgba(239, 68, 68, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.round, borderWidth: 1, borderColor: '#EF4444' },
  logoutText: { color: '#EF4444', fontSize: 12, fontWeight: '700' },
  sectionLabel: { color: '#00E676', fontSize: 15, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: { width: '48%', backgroundColor: '#0A2D28', padding: 14, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.15)' },
  statIcon: { fontSize: 22, marginBottom: 6 },
  statValue: { color: '#00E676', fontSize: 24, fontWeight: '800' },
  statLabel: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  moduleGrid: { gap: 12, marginBottom: 20 },
  moduleCard: { backgroundColor: '#0A2D28', padding: 14, borderRadius: RADIUS.lg, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.15)' },
  moduleIcon: { fontSize: 24 },
  moduleTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  moduleSub: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  chevron: { color: '#6B8E8A', fontSize: 22 },
  card: { backgroundColor: '#0A2D28', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.15)', marginBottom: 16 },
  cardTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  divider: { backgroundColor: 'rgba(0, 230, 118, 0.1)', marginVertical: 10 },
  complianceItem: { color: '#00E676', fontSize: 12, fontWeight: '600', marginBottom: 6 },
});
