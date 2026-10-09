
import { useAppTheme, useThemeValue } from '../../theme/ThemeProvider';
import type { ThemeColors } from '../../theme';
import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

interface HighRiskAlertCardProps {
  message?: string;
  onViewDetails: () => void;
}

export const HighRiskAlertCard: React.FC<HighRiskAlertCardProps> = ({
  message = 'Your last assessment indicates high risk. Please take care.',
  onViewDetails,
}) => {
  const { colors: COLORS } = useAppTheme();
  const styles = useThemeValue(createStyles);

  return (
    <TouchableOpacity
      style={styles.alertCard}
      onPress={onViewDetails}
      activeOpacity={0.9}
    >
      <View style={styles.alertHeaderRow}>
        <View style={styles.alertTitleGroup}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <Text style={styles.alertTitle}>High Risk Alert</Text>
        </View>
        <Text style={styles.chevronText}>›</Text>
      </View>
      <Text style={styles.alertBody}>{message}</Text>
      <TouchableOpacity style={styles.alertActionBtn} onPress={onViewDetails}>
        <Text style={styles.alertActionText}>View Details</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const createStyles = (COLORS: ThemeColors) => (StyleSheet.create({
  alertCard: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.amberLight,
  },
  alertHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  alertTitle: {
    color: COLORS.red,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
  },
  chevronText: {
    color: COLORS.red,
    fontSize: 20,
    fontWeight: '600',
  },
  alertBody: {
    color: COLORS.red,
    fontSize: TYPOGRAPHY.sizes.xs,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  alertActionBtn: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  alertActionText: {
    color: COLORS.red,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
  },
}));
