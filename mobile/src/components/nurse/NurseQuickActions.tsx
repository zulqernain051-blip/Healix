import React from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

interface NurseQuickActionsProps {
  onCheckInPress: () => void;
  onPatientsPress: () => void;
  onBidsPress: () => void;
  onMessagesPress: () => void;
  onEmergencyPress: () => void;
  onScanQRPress: () => void;
}

export const NurseQuickActions: React.FC<NurseQuickActionsProps> = ({
  onCheckInPress,
  onPatientsPress,
  onBidsPress,
  onMessagesPress,
  onEmergencyPress,
  onScanQRPress,
}) => {
  const actions = [
    { label: 'Check-in', icon: '📍', color: 'rgba(0, 230, 118, 0.15)', onPress: onCheckInPress },
    { label: 'Patients', icon: '👥', color: 'rgba(59, 130, 246, 0.15)', onPress: onPatientsPress },
    { label: 'Marketplace', icon: '🌐', color: 'rgba(168, 85, 247, 0.15)', onPress: onBidsPress },
    { label: 'Messages', icon: '💬', color: 'rgba(245, 158, 11, 0.15)', onPress: onMessagesPress },
    { label: 'Emergency', icon: '🚨', color: 'rgba(239, 68, 68, 0.15)', onPress: onEmergencyPress },
    { label: 'Scan QR', icon: '📷', color: 'rgba(20, 184, 166, 0.15)', onPress: onScanQRPress },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Command Quick Actions</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsRow}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionCard}
            onPress={action.onPress}
            activeOpacity={0.8}
          >
            <View style={[styles.iconBg, { backgroundColor: action.color }]}>
              <Text style={styles.iconText}>{action.icon}</Text>
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  sectionTitle: { display: 'none' },
  actionsRow: { gap: 12, paddingBottom: 8 },
  actionCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, alignItems: 'center', width: 90, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  iconBg: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  iconText: { fontSize: 22 },
  actionLabel: { color: '#1E293B', fontSize: 11, fontWeight: '700', textAlign: 'center' },
});
