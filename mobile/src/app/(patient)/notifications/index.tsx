import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Text } from 'react-native-paper';
import { navigate } from '../../../utils/navigation';
import { useAuthStore } from '../../../store/auth';
import { useCareRequests } from '../../../hooks/useCareRequests';
import { useDashboardSummary } from '../../../hooks/useDashboard';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../../theme';

export default function NotificationsScreen() {
  const { user } = useAuthStore();
  const patientId = user?.patientId || '';

  const { data: requests = [] } = useCareRequests();
  const { data: dashboardSummary } = useDashboardSummary(patientId);

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [markedRead, setMarkedRead] = useState<Record<string, boolean>>({});

  // Derive dynamic notification list from real care requests and risk assessments
  const dynamicNotifications: any[] = [];

  if (dashboardSummary?.latestRisk) {
    const risk = dashboardSummary.latestRisk;
    dynamicNotifications.push({
      id: 'risk-notif-1',
      title: `AI Clinical Risk Tier: ${risk.riskTier}`,
      body: risk.notes || `Fused risk score calculated at ${(risk.fusedScore * 100).toFixed(0)}%.`,
      time: (risk as any).createdAt || (risk as any).assessedAt ? new Date((risk as any).createdAt || (risk as any).assessedAt).toLocaleDateString() : 'Recent',
      unread: !markedRead['risk-notif-1'],
      icon: '🚨',
      bgColor: risk.riskTier === 'HIGH' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 230, 118, 0.15)',
      route: '/(patient)/records/risk-history',
    });
  }

  (requests || []).forEach((req) => {
    let title = 'Care Visit Update';
    let body = `Request ${req.id.substring(0, 8).toUpperCase()} status is ${req.status}.`;
    let icon = '📋';
    let bgColor = 'rgba(59, 130, 246, 0.15)';

    if (req.status === 'ASSIGNED') {
      title = 'Staff Assigned to Visit';
      body = `Provider assigned for your ${req.type === 'NURSE_VISIT' ? 'Nurse' : 'Doctor'} visit on ${req.scheduledAt ? new Date(req.scheduledAt).toLocaleString() : 'TBD'}.`;
      icon = '🩺';
      bgColor = 'rgba(0, 230, 118, 0.15)';
    } else if (req.status === 'IN_PROGRESS') {
      title = 'Care Visit In Progress';
      body = 'Your healthcare provider has arrived and checked in.';
      icon = '🟢';
      bgColor = 'rgba(245, 158, 11, 0.15)';
    } else if (req.status === 'COMPLETED') {
      title = 'Care Visit Completed';
      body = 'Visit summary and vitals have been saved to your health vault.';
      icon = '✅';
      bgColor = 'rgba(168, 85, 247, 0.15)';
    }

    dynamicNotifications.push({
      id: `req-notif-${req.id}`,
      title,
      body,
      time: req.scheduledAt ? new Date(req.scheduledAt).toLocaleDateString() : 'Scheduled',
      unread: !markedRead[`req-notif-${req.id}`],
      icon,
      bgColor,
      route: `/(patient)/requests/${req.id}`,
    });
  });

  const handleMarkAllRead = () => {
    const allReadMap: Record<string, boolean> = {};
    dynamicNotifications.forEach(n => { markRead.mutate(n.id); });
    setMarkedRead(allReadMap);
  };

  const filteredNotifications = dynamicNotifications.filter(n => {
    if (activeFilter === 'UNREAD') return n.unread;
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#061C19" />
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAllReadText}>Mark all as read</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'ALL' && styles.filterPillActive]}
            onPress={() => setActiveFilter('ALL')}
          >
            <Text style={[styles.filterText, activeFilter === 'ALL' && styles.filterTextActive]}>
              All ({dynamicNotifications.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'UNREAD' && styles.filterPillActive]}
            onPress={() => setActiveFilter('UNREAD')}
          >
            <Text style={[styles.filterText, activeFilter === 'UNREAD' && styles.filterTextActive]}>
              Unread ({dynamicNotifications.filter(n => n.unread).length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.notificationCard,
                  item.unread && styles.notificationCardUnread,
                ]}
                onPress={() => navigate(item.route as any)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconBg, { backgroundColor: item.bgColor }]}>
                  <Text style={styles.iconText}>{item.icon}</Text>
                </View>

                <View style={styles.contentWrap}>
                  <View style={styles.titleRow}>
                    <Text style={styles.notifTitle}>{item.title}</Text>
                    <Text style={styles.notifTime}>{item.time}</Text>
                  </View>
                  <Text style={styles.notifBody}>{item.body}</Text>
                </View>

                {item.unread && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptySub}>
                Updates on care visits, prescriptions, and AI risk alerts will appear here.
              </Text>
            </View>
          )}
        </ScrollView>
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
  markAllReadText: {
    color: '#00E676',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  filterPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.round,
    backgroundColor: '#0A2D28',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  filterPillActive: {
    backgroundColor: '#00E676',
    borderColor: '#00E676',
  },
  filterText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#061C19',
    fontWeight: '700',
  },
  listContainer: {
    paddingBottom: 40,
    gap: SPACING.md,
  },
  notificationCard: {
    backgroundColor: '#0A2D28',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  notificationCardUnread: {
    borderColor: 'rgba(0, 230, 118, 0.4)',
    backgroundColor: '#0E3630',
  },
  iconBg: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  iconText: {
    fontSize: 18,
  },
  contentWrap: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  notifTitle: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    flex: 1,
    marginRight: SPACING.xs,
  },
  notifTime: {
    color: '#6B8E8A',
    fontSize: 10,
  },
  notifBody: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 15,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00E676',
    marginLeft: SPACING.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
  },
  emptySub: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 16,
  },
});

