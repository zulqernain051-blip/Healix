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

const styles = StyleSheet.create({
  alertCard: {
    backgroundColor: '#FFF0F2',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: '#FFCCD2',
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
    color: '#D32F2F',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
  },
  chevronText: {
    color: '#D32F2F',
    fontSize: 20,
    fontWeight: '600',
  },
  alertBody: {
    color: '#5C1D24',
    fontSize: TYPOGRAPHY.sizes.xs,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  alertActionBtn: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  alertActionText: {
    color: '#D32F2F',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
  },
});
