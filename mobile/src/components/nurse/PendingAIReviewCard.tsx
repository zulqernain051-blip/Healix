import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

interface PendingAIReviewCardProps {
  pendingCount: number;
  escalationCount: number;
  onPress: () => void;
}

export const PendingAIReviewCard: React.FC<PendingAIReviewCardProps> = ({
  pendingCount,
  escalationCount,
  onPress,
}) => {
  if (pendingCount === 0 && escalationCount === 0) return null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <Text style={styles.sparkleIcon}>✨</Text>
          <Text style={styles.title}>Pending AI & Doctor Reviews</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending AI Assessments</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statBox}>
          <Text style={[styles.statVal, { color: '#F59E0B' }]}>{escalationCount}</Text>
          <Text style={styles.statLabel}>Doctor Escalations</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0E3630',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#00E676',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sparkleIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  title: {
    color: '#00E676',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
  },
  chevron: {
    color: '#00E676',
    fontSize: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 4,
  },
  statBox: {
    alignItems: 'center',
  },
  statVal: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '800',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
