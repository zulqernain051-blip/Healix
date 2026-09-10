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
        trackColor={{ false: '#0E3630', true: 'rgba(0, 230, 118, 0.4)' }}
        thumbColor={available ? '#00E676' : '#F59E0B'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  unavailableBg: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
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
    color: '#00E676',
  },
  unavailableTitle: {
    color: '#F59E0B',
  },
  subText: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
  },
});
