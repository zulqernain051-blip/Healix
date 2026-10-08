import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../theme';
import { ScheduleType } from '../../types/care';

interface Props {
  scheduleType: ScheduleType;
  onChange: (type: ScheduleType) => void;
}

export const ScheduleTypeSelector: React.FC<Props> = ({ scheduleType, onChange }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Schedule Type *</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.button, scheduleType === 'ONE_TIME' && styles.buttonActive]}
          onPress={() => onChange('ONE_TIME')}
          activeOpacity={0.8}
        >
          <Text style={[styles.text, scheduleType === 'ONE_TIME' && styles.textActive]}>One-Time Visit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, scheduleType === 'RECURRING' && styles.buttonActive]}
          onPress={() => onChange('RECURRING')}
          activeOpacity={0.8}
        >
          <Text style={[styles.text, scheduleType === 'RECURRING' && styles.textActive]}>Recurring Visits</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.60)',
    borderRadius: RADIUS.round,
    alignItems: 'center',
  },
  buttonActive: {
    borderColor: COLORS.accentBlue,
    backgroundColor: 'rgba(41, 169, 245, 0.18)',
  },
  text: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.textBody,
  },
  textActive: {
    color: COLORS.navy,
  },
});
