
import { useAppTheme, useThemeValue } from '../../theme/ThemeProvider';
import type { ThemeColors } from '../../theme';
import React from 'react';
import { StyleSheet, View, Switch } from 'react-native';
import { Text } from 'react-native-paper';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

interface AvailabilityToggleBannerProps {
  available: boolean;
  onToggle: (newValue: boolean) => void;
  isLoading?: boolean;
}

export const AvailabilityToggleBanner: React.FC<AvailabilityToggleBannerProps> = ({
  available,
  onToggle,
  isLoading = false,
}) => {
  const { colors: COLORS } = useAppTheme();
  const styles = useThemeValue(createStyles);

  return (
    <View style={[styles.banner, available ? styles.availableBg : styles.unavailableBg]}>
      <View style={styles.textWrap}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>{available ? '🟢' : '🟠'}</Text>
          <Text style={[styles.title, available ? styles.availableTitle : styles.unavailableTitle]}>
            {available ? 'Available for Visits' : 'Currently Unavailable'}
          </Text>
        </View>
        <Text style={styles.subText}>
          {available
            ? 'You are active in the dispatch pool to receive care visit assignments.'
            : 'Toggle ON when ready to accept new care visit dispatches.'}
        </Text>
      </View>

      <Switch
        value={available}
        onValueChange={onToggle}
        disabled={isLoading}
        trackColor={{ false: COLORS.textMuted, true: COLORS.emeraldLight }}
        thumbColor={available ? COLORS.emerald : COLORS.amber}
      />
    </View>
  );
};

const createStyles = (COLORS: ThemeColors) => (StyleSheet.create({
  banner: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    borderWidth: 1,
  },
  availableBg: {
    backgroundColor: COLORS.emeraldLight,
    borderColor: COLORS.emeraldLight,
  },
  unavailableBg: {
    backgroundColor: COLORS.amberLight,
    borderColor: COLORS.amberLight,
  },
  textWrap: {
    flex: 1,
    marginRight: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  icon: {
    fontSize: 12,
    marginRight: 6,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
  },
  availableTitle: {
    color: COLORS.emerald,
  },
  unavailableTitle: {
    color: COLORS.amber,
  },
  subText: {
    color: COLORS.textBody,
    fontSize: 11,
    lineHeight: 16,
  },
}));
