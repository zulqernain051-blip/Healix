import { useAppTheme, useThemeValue } from '../../theme/ThemeProvider';
import type { ThemeColors } from '../../theme';

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { VisitStatus } from '../../types/visit';

interface VisitStatusBadgeProps {
  status: VisitStatus;
}

const createSTATUS_CONFIG =  (COLORS: ThemeColors) : Record<VisitStatus, { label: string; color: string; bg: string }> => ({
  CANCELLED: { label: 'Cancelled', color: COLORS.red, bg: COLORS.redLight },
  SCHEDULED: { label: 'Scheduled', color: COLORS.amber, bg: COLORS.amberLight },
  ACCEPTED: { label: 'Accepted', color: COLORS.primaryText, bg: COLORS.blueLight },
  IN_PROGRESS: { label: 'In Progress', color: COLORS.emerald, bg: COLORS.emeraldLight },
  COMPLETED: { label: 'Completed', color: COLORS.emerald, bg: COLORS.emeraldLight },
  DECLINED: { label: 'Declined', color: COLORS.red, bg: COLORS.redLight },
});

export const VisitStatusBadge: React.FC<VisitStatusBadgeProps> = ({ status }) => {
  const { colors: COLORS } = useAppTheme();
  const STATUS_CONFIG = useThemeValue(createSTATUS_CONFIG);

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.SCHEDULED;
  return (
    <View style={[styles.badge, { backgroundColor: config.bg, borderColor: config.color }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
  },
});
