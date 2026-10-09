import { useAppTheme, useThemeValue } from '../../theme/ThemeProvider';
import type { ThemeColors } from '../../theme';
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../theme';
import { ScheduleType } from '../../types/care';

interface Props {
  scheduleType: ScheduleType;
  onChange: (type: ScheduleType) => void;
}

export const ScheduleTypeSelector: React.FC<Props> = ({ scheduleType, onChange }) => {
  const { colors: COLORS } = useAppTheme();
  const styles = useThemeValue(createStyles);

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

const createStyles = (COLORS: ThemeColors) => (StyleSheet.create({
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
    backgroundColor: COLORS.glassSurface,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: RADIUS.round,
    alignItems: 'center',
  },
  buttonActive: {
    borderColor: COLORS.accentBlue,
    backgroundColor: COLORS.blueLight,
  },
  text: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.textBody,
  },
  textActive: {
    color: COLORS.primaryText,
  },
}));
