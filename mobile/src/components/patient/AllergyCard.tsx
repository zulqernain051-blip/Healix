import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

interface AllergyCardProps {
  allergen: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE' | string;
}

export const AllergyCard: React.FC<AllergyCardProps> = ({ allergen, severity }) => {
  const isSevere = severity === 'SEVERE';
  const isModerate = severity === 'MODERATE';

  return (
    <View style={styles.card}>
      <View style={styles.infoGroup}>
        <Text style={styles.allergenName}>{allergen}</Text>
        <Text style={styles.label}>Allergy Reaction</Text>
      </View>
      <View
        style={[
          styles.badge,
          isSevere && styles.severeBadge,
          isModerate && styles.moderateBadge,
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            isSevere && styles.severeText,
            isModerate && styles.moderateText,
          ]}
        >
          {severity}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0A2D28',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  infoGroup: {
    flex: 1,
  },
  allergenName: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
  },
  label: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.round,
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    borderWidth: 1,
    borderColor: '#00E676',
  },
  badgeText: {
    color: '#00E676',
    fontSize: 10,
    fontWeight: '700',
  },
  moderateBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#F59E0B',
  },
  moderateText: {
    color: '#F59E0B',
  },
  severeBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
  },
  severeText: {
    color: '#EF4444',
  },
});
