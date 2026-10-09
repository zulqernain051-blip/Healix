import { useAppTheme, useThemeValue } from '../../theme/ThemeProvider';
import type { ThemeColors } from '../../theme';
import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Checkbox } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

interface ReminderItem {
  id: string;
  name: string;
  time: string;
  completed?: boolean;
}

interface TodaysRemindersProps {
  reminders: ReminderItem[];
  onSeeAll?: () => void;
  onToggle?: (id: string) => void;
}

export const TodaysReminders: React.FC<TodaysRemindersProps> = ({
  reminders,
  onSeeAll,
  onToggle,
}) => {
  const { colors: COLORS } = useAppTheme();
  const styles = useThemeValue(createStyles);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <TouchableOpacity style={styles.headerRow} onPress={onSeeAll} activeOpacity={0.7}>
          <View style={styles.headerLeft}>
            <Ionicons name="notifications" size={18} color={COLORS.primaryText} />
            <Text style={styles.headerTitle}>  Prescription instructions</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textBody} />
        </TouchableOpacity>

        {/* Reminders list */}
        {reminders.length > 0 ? (
          reminders.map((reminder, index) => (
            <View
              key={reminder.id}
              style={[
                styles.reminderItem,
                index < reminders.length - 1 && styles.reminderBorder,
              ]}
            >
              <View style={styles.pillIconCircle}>
                <Ionicons name="medical" size={16} color={COLORS.primaryText} />
              </View>
              <View style={styles.reminderTextWrap}>
                <Text style={styles.reminderName}>{reminder.name}</Text>
                <Text style={styles.reminderTime}>{reminder.time}</Text>
              </View>
              {onToggle && <Checkbox
                status={reminder.completed ? 'checked' : 'unchecked'}
                onPress={() => onToggle?.(reminder.id)}
                color={COLORS.primaryText}
                uncheckedColor={COLORS.inputBorder}
              />}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.textBody} />
            <Text style={styles.emptyText}>No current prescription instructions</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const createStyles = (COLORS: ThemeColors) => (StyleSheet.create({
  container: {
    paddingBottom: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.dividerLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.textDark,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  reminderBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.dividerLight,
    paddingBottom: SPACING.md,
    marginBottom: SPACING.xs,
  },
  pillIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  reminderTextWrap: {
    flex: 1,
  },
  reminderName: {
    color: COLORS.textDark,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  reminderTime: {
    color: COLORS.accentBlue,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  emptyText: {
    color: COLORS.textBody,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
}));
