import { useAppTheme, useThemeValue } from '../../theme/ThemeProvider';
import type { ThemeColors } from '../../theme';
import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

export type CareSegment = 'UPCOMING' | 'PAST';

interface RequestFilterPillsProps {
  activeSegment: CareSegment;
  onSegmentChange: (segment: CareSegment) => void;
  upcomingCount?: number;
  pastCount?: number;
}

export const RequestFilterPills: React.FC<RequestFilterPillsProps> = ({
  activeSegment,
  onSegmentChange,
  upcomingCount = 0,
  pastCount = 0,
}) => {
  const { colors: COLORS } = useAppTheme();
  const styles = useThemeValue(createStyles);

  return (
    <View style={styles.segmentedContainer}>
      {/* Upcoming Tab */}
      <TouchableOpacity
        style={[styles.segment, activeSegment === 'UPCOMING' && styles.segmentActive]}
        activeOpacity={0.8}
        onPress={() => onSegmentChange('UPCOMING')}
      >
        <Text style={[styles.segmentText, activeSegment === 'UPCOMING' && styles.segmentTextActive]}>
          Upcoming · {upcomingCount}
        </Text>
      </TouchableOpacity>

      {/* Past Tab */}
      <TouchableOpacity
        style={[styles.segment, activeSegment === 'PAST' && styles.segmentActive]}
        activeOpacity={0.8}
        onPress={() => onSegmentChange('PAST')}
      >
        <Text style={[styles.segmentText, activeSegment === 'PAST' && styles.segmentTextActive]}>
          Past · {pastCount}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (COLORS: ThemeColors) => (StyleSheet.create({
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceCard, // subtle slate track
    borderRadius: RADIUS.round,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  segment: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.transparent,
  },
  segmentActive: {
    backgroundColor: COLORS.surfaceCard,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  segmentTextActive: {
    color: COLORS.textDark,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
}));
