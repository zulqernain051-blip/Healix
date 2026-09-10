import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

interface ConditionCardProps {
  name: string;
  diagnosedDate?: string | null;
  notes?: string | null;
}

export const ConditionCard: React.FC<ConditionCardProps> = ({ name, diagnosedDate, notes }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{name}</Text>
      {diagnosedDate && <Text style={styles.sub}>Diagnosed: {diagnosedDate}</Text>}
      {notes && <Text style={styles.notes}>{notes}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0A2D28',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  name: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
  },
  sub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  notes: {
    color: '#6B8E8A',
    fontSize: 10,
    marginTop: 4,
  },
});
