import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

interface PerformanceSummaryCardProps {
  compositeScore?: number;
  totalVisits?: number;
  avgRating?: number;
  onPress: () => void;
}

export const PerformanceSummaryCard: React.FC<PerformanceSummaryCardProps> = ({
  compositeScore = 92,
  totalVisits = 14,
  avgRating = 4.9,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Performance & Skill Score</Text>
        <Text style={styles.linkText}>View Score Breakdown ›</Text>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreNumber}>{compositeScore}</Text>
          <Text style={styles.scoreLabel}>Score</Text>
        </View>

        <View style={styles.metricsCol}>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Completed Visits:</Text>
            <Text style={styles.metricVal}>{totalVisits}</Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Average Rating:</Text>
            <View style={styles.starRow}>
              <Text style={styles.starIcon}>⭐</Text>
              <Text style={styles.metricVal}>{avgRating.toFixed(1)}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0A2D28',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
  },
  linkText: {
    color: '#00E676',
    fontSize: 11,
    fontWeight: '600',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    borderWidth: 2,
    borderColor: '#00E676',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  scoreNumber: {
    color: '#00E676',
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '800',
  },
  scoreLabel: {
    color: '#94A3B8',
    fontSize: 9,
  },
  metricsCol: {
    flex: 1,
    gap: 6,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    color: '#94A3B8',
    fontSize: 11,
  },
  metricVal: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 12,
    marginRight: 4,
  },
});
