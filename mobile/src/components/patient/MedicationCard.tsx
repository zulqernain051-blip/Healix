import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

interface MedicationCardProps {
  name: string;
  dosage: string;
  frequency: string;
  active: boolean;
}

export const MedicationCard: React.FC<MedicationCardProps> = ({ name, dosage, frequency, active }) => {
  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.sub}>{dosage} · {frequency}</Text>
      </View>
      <View style={[styles.badge, active ? styles.activeBadge : styles.inactiveBadge]}>
        <Text style={[styles.badgeText, active ? styles.activeText : styles.inactiveText]}>
          {active ? 'Active' : 'Inactive'}
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
  info: { flex: 1 },
  name: { color: '#FFFFFF', fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '700' },
  sub: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.round, borderWidth: 1 },
  activeBadge: { backgroundColor: 'rgba(0, 230, 118, 0.12)', borderColor: '#00E676' },
  activeText: { color: '#00E676' },
  inactiveBadge: { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: '#6B8E8A' },
  inactiveText: { color: '#6B8E8A' },
  badgeText: { fontSize: 10, fontWeight: '700' },
});
