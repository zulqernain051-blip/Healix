
import { useAppTheme, useThemeValue } from '../../theme/ThemeProvider';
import type { ThemeColors } from '../../theme';
import React from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';


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
  const { colors: COLORS } = useAppTheme();
  const styles = useThemeValue(createStyles);

  const actions = [
    { label: 'Check-in', icon: '📍', color: COLORS.emeraldLight, onPress: onCheckInPress },
    { label: 'Patients', icon: '👥', color: COLORS.blueLight, onPress: onPatientsPress },
    { label: 'Marketplace', icon: '🌐', color: COLORS.purpleLight, onPress: onBidsPress },
    { label: 'Messages', icon: '💬', color: COLORS.amberLight, onPress: onMessagesPress },
    { label: 'Visit triage', icon: '🚨', color: COLORS.redLight, onPress: onEmergencyPress },
    { label: 'Scan QR', icon: '📷', color: COLORS.emeraldLight, onPress: onScanQRPress },
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

const createStyles = (COLORS: ThemeColors) => (StyleSheet.create({
  container: { marginBottom: 12 },
  sectionTitle: { display: 'none' },
  actionsRow: { gap: 12, paddingBottom: 8 },
  actionCard: { backgroundColor: COLORS.surfaceCard, padding: 16, borderRadius: 16, alignItems: 'center', width: 90, borderWidth: 1, borderColor: COLORS.inputBorder, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  iconBg: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  iconText: { fontSize: 22 },
  actionLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700', textAlign: 'center' },
}));
