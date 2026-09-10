import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

interface AlertItem {
  id: string;
  type: 'HIGH_RISK' | 'ESCALATION' | 'URGENT';
  patientName: string;
  message: string;
  timeAgo: string;
  visitId?: string;
}

interface CommandCenterAlertsProps {
  alerts: AlertItem[];
  onAlertPress: (alert: AlertItem) => void;
}

export const CommandCenterAlerts: React.FC<CommandCenterAlertsProps> = ({ alerts, onAlertPress }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Urgent Patient & AI Alerts</Text>
      <View style={styles.alertList}>
        {alerts.map((item) => {
          const isHighRisk = item.type === 'HIGH_RISK';
          const isEscalation = item.type === 'ESCALATION';

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.alertCard,
                isHighRisk && styles.highRiskCard,
                isEscalation && styles.escalationCard,
              ]}
              onPress={() => onAlertPress(item)}
              activeOpacity={0.85}
            >
              <View style={styles.topRow}>
                <View style={styles.badgeGroup}>
                  <Text style={styles.alertIcon}>
                    {isHighRisk ? '🚨' : isEscalation ? '⚠️' : '🔔'}
                  </Text>
                  <Text
                    style={[
                      styles.badgeText,
                      isHighRisk && styles.highRiskText,
                      isEscalation && styles.escalationText,
                    ]}
                  >
                    {isHighRisk ? 'HIGH RISK PATIENT' : isEscalation ? 'DOCTOR ESCALATION' : 'URGENT ALERT'}
                  </Text>
                </View>
                <Text style={styles.timeAgo}>{item.timeAgo}</Text>
              </View>

              <Text style={styles.patientName}>{item.patientName}</Text>
              <Text style={styles.messageText}>{item.message}</Text>

              <View style={styles.actionRow}>
                <Text style={styles.actionLink}>Review Patient & Vitals ›</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  alertList: {
    gap: SPACING.sm,
  },
  alertCard: {
    backgroundColor: '#0A2D28',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
  },
  highRiskCard: {
    backgroundColor: '#1E1214',
    borderColor: '#EF4444',
  },
  escalationCard: {
    backgroundColor: '#1E180E',
    borderColor: '#F59E0B',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00E676',
  },
  highRiskText: {
    color: '#EF4444',
  },
  escalationText: {
    color: '#F59E0B',
  },
  timeAgo: {
    color: '#6B8E8A',
    fontSize: 10,
  },
  patientName: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    marginTop: 2,
  },
  messageText: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  actionRow: {
    marginTop: SPACING.sm,
  },
  actionLink: {
    color: '#00E676',
    fontSize: 11,
    fontWeight: '700',
  },
});
