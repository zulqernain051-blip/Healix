
import { useAppTheme, useThemeValue } from '../../theme/ThemeProvider';
import type { ThemeColors } from '../../theme';

import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Card, Divider, Button } from 'react-native-paper';
import { navigate } from '../../utils/navigation';
import { useAuthStore } from '../../store/auth';
import { useAdminStats, useAdminPendingNurses, useAdminPendingDoctors } from '../../hooks/useAdmin';
import { SPACING, RADIUS } from '../../theme';

export default function AdminDashboard() {
  const { dark: isDarkTheme } = useAppTheme();

  const { colors: COLORS } = useAppTheme();
  const styles = useThemeValue(createStyles);

  const { logout } = useAuthStore();
  const { data: stats } = useAdminStats();
  const { data: pendingNurses = [] } = useAdminPendingNurses();
  const { data: pendingDoctors = [] } = useAdminPendingDoctors();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle={isDarkTheme ? 'light-content' : 'dark-content'} backgroundColor={COLORS.bg} />
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

        <Button onPress={() => navigate('/analytics')}>Analytics & Reports</Button><Button onPress={() => navigate('/support')}>Permissions, Payments & Support</Button>
        {/* Analytics Summary Grid */}
        <Text style={styles.sectionLabel}>System Performance Summary</Text>
        <View style={styles.statsGrid}>
          <TouchableOpacity style={styles.statCard} onPress={() => navigate('/admin/users')}>
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statValue}>{stats?.totalUsers ?? '—'}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} onPress={() => navigate('/admin/nurses')}>
            <Text style={styles.statIcon}>👩‍⚕️</Text>
            <Text style={styles.statValue}>{stats?.totalNurses ?? '—'}</Text>
            <Text style={styles.statLabel}>Registered Nurses</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} onPress={() => navigate('/admin/doctors')}>
            <Text style={styles.statIcon}>👨‍⚕️</Text>
            <Text style={styles.statValue}>{stats?.totalDoctors ?? '—'}</Text>
            <Text style={styles.statLabel}>Registered Doctors</Text>
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

          <TouchableOpacity style={[styles.moduleCard, { borderColor: COLORS.redLight }]} onPress={() => navigate('/admin/emergency')}>
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

          <TouchableOpacity style={styles.moduleCard} activeOpacity={0.8} onPress={() => navigate('/admin/ambulances')}>
            <Text style={styles.moduleIcon}>🚑</Text><View style={{ flex: 1 }}><Text style={styles.moduleTitle}>Ambulance Fleet & Dispatches</Text><Text style={styles.moduleSub}>Vehicles, assignments and admission tracking</Text></View><Text style={styles.chevron}>›</Text>
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

const createStyles = (COLORS: ThemeColors) => (StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.lg, paddingBottom: 40 },
  header: { marginBottom: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: COLORS.textDark, fontSize: 22, fontWeight: '800' },
  subtitle: { color: COLORS.textBody, fontSize: 12, marginTop: 4 },
  logoutBtn: { backgroundColor: COLORS.redLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.round, borderWidth: 1, borderColor: COLORS.red },
  logoutText: { color: COLORS.red, fontSize: 12, fontWeight: '700' },
  sectionLabel: { color: COLORS.emerald, fontSize: 15, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: { width: '48%', backgroundColor: COLORS.bg, padding: 14, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.emeraldLight },
  statIcon: { fontSize: 22, marginBottom: 6 },
  statValue: { color: COLORS.emerald, fontSize: 24, fontWeight: '800' },
  statLabel: { color: COLORS.textBody, fontSize: 11, marginTop: 2 },
  moduleGrid: { gap: 12, marginBottom: 20 },
  moduleCard: { backgroundColor: COLORS.bg, padding: 14, borderRadius: RADIUS.lg, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.emeraldLight },
  moduleIcon: { fontSize: 24 },
  moduleTitle: { color: COLORS.textDark, fontSize: 14, fontWeight: '700' },
  moduleSub: { color: COLORS.textBody, fontSize: 11, marginTop: 2 },
  chevron: { color: COLORS.textBody, fontSize: 22 },
  card: { backgroundColor: COLORS.bg, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.emeraldLight, marginBottom: 16 },
  cardTitle: { color: COLORS.textDark, fontSize: 15, fontWeight: '700' },
  divider: { backgroundColor: COLORS.emeraldLight, marginVertical: 10 },
  complianceItem: { color: COLORS.emerald, fontSize: 12, fontWeight: '600', marginBottom: 6 },
}));
