import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Card, Divider, ProgressBar, Chip } from 'react-native-paper';
import { useAuthStore } from '../../../store/auth';
import { useNurseScore, useNurseBadges } from '../../../hooks/useNurse';
import { ErrorState } from '../../../components/common/ErrorState';

const COLORS = {
  bg: '#0A1628',
  card: '#111D35',
  border: '#1E2D4A',
  teal: '#0D9488',
  emerald: '#10B981',
  amber: '#F59E0B',
  blue: '#3B82F6',
  red: '#EF4444',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#475569'
};

const BADGE_MAP: Record<string, { label: string; color: string }> = {
  FIRST_VISIT: { label: '🏅 First Visit Done', color: COLORS.emerald },
  TEN_VISITS: { label: '⭐ 10 Visits milestone', color: COLORS.blue },
  TOP_RATED: { label: '👑 Top Rated Expert', color: COLORS.amber },
  VERIFIED_SPECIALIST: { label: '🎖 Verified Specialist', color: COLORS.teal },
  RELIABLE: { label: '🔒 Highly Reliable', color: COLORS.emerald }
};

export default function NursePerformanceScreen() {
  const { user } = useAuthStore();
  const nurseId = user?.nurseId || user?.id || '';

  const { data: nurseScore, isLoading: loadingScore, error: errorScore } = useNurseScore(nurseId);
  const { data: nurseBadges, isLoading: loadingBadges, error: errorBadges } = useNurseBadges(nurseId);
  
  const isLoading = loadingScore || loadingBadges;
  
  if (errorScore || errorBadges) {
    return <ErrorState error={(errorScore || errorBadges)?.message || 'Error'} />;
  }

  if (isLoading && !nurseScore) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.teal} />
        <Text style={styles.loadingText}>Fetching performance metrics...</Text>
      </View>
    );
  }

  const score = nurseScore || {
    compositeScore: 0,
    skillScore: 0,
    experienceScore: 0,
    reliabilityScore: 0,
    performanceScore: 0,
    totalVisits: 0,
    avgRating: 0
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>📈 Performance Analytics</Text>
        <Text style={styles.subtitle}>Track your ratings, internal metrics, and special achievement badges</Text>
      </View>

      {/* Circle Composite Score */}
      <View style={styles.scoreCircleContainer}>
        <View style={styles.circle}>
          <Text style={styles.circleNumber}>{Math.round(score.compositeScore)}</Text>
          <Text style={styles.circleLabel}>Composite Score</Text>
        </View>
      </View>

      {/* Sub-Score Progress Bars */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Performance breakdown</Text>
          <Divider style={styles.divider} />

          <View style={styles.metricRow}>
            <View style={styles.metricLabelRow}>
              <Text style={styles.metricLabel}>Skill Rating</Text>
              <Text style={styles.metricVal}>{Math.round(score.skillScore)}%</Text>
            </View>
            <ProgressBar progress={score.skillScore / 100} color={COLORS.teal} style={styles.progressBar} />
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricLabelRow}>
              <Text style={styles.metricLabel}>Experience Level</Text>
              <Text style={styles.metricVal}>{Math.round(score.experienceScore)}%</Text>
            </View>
            <ProgressBar progress={score.experienceScore / 100} color={COLORS.blue} style={styles.progressBar} />
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricLabelRow}>
              <Text style={styles.metricLabel}>Reliability Score</Text>
              <Text style={styles.metricVal}>{Math.round(score.reliabilityScore)}%</Text>
            </View>
            <ProgressBar progress={score.reliabilityScore / 100} color={COLORS.emerald} style={styles.progressBar} />
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricLabelRow}>
              <Text style={styles.metricLabel}>Patient Satisfaction</Text>
              <Text style={styles.metricVal}>{Math.round(score.performanceScore)}%</Text>
            </View>
            <ProgressBar progress={score.performanceScore / 100} color={COLORS.amber} style={styles.progressBar} />
          </View>
        </Card.Content>
      </Card>

      {/* Overall Summary stats */}
      <View style={styles.statsRow}>
        <Card style={[styles.statCard, { marginRight: 10 }]}>
          <Card.Content style={styles.statCenter}>
            <Text style={styles.statNumber}>{score.totalVisits}</Text>
            <Text style={styles.statLabel}>Total Visits</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statCenter}>
            <Text style={styles.statNumber}>★ {score.avgRating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Avg Stars</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Badges Section */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>🎖 Professional Badges</Text>
          <Divider style={styles.divider} />

          {(!nurseBadges || nurseBadges.length === 0) ? (
            <Text style={styles.emptyText}>No badges unlocked yet. Complete visits and gain positive reviews to earn them!</Text>
          ) : (
            <View style={styles.badgeContainer}>
              {(nurseBadges || []).map((badge: any) => {
                const badgeInfo = BADGE_MAP[badge.badgeType] || { label: badge.badgeType, color: COLORS.textSecondary };
                return (
                  <Chip
                    key={badge.id}
                    textStyle={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}
                    style={[styles.badgeChip, { backgroundColor: badgeInfo.color }]}
                  >
                    {badgeInfo.label}
                  </Chip>
                );
              })}
            </View>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  title: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '700' },
  subtitle: { color: COLORS.textSecondary, fontSize: 13, marginTop: 4 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
  loadingText: { color: COLORS.textSecondary, marginTop: 12 },
  scoreCircleContainer: { alignItems: 'center', marginVertical: 24 },
  circle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    borderColor: COLORS.teal,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.card
  },
  circleNumber: { color: COLORS.textPrimary, fontSize: 36, fontWeight: '800' },
  circleLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginTop: 4 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 20 },
  cardTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  divider: { backgroundColor: COLORS.border, marginVertical: 10 },
  metricRow: { marginBottom: 16 },
  metricLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  metricLabel: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '500' },
  metricVal: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' },
  progressBar: { height: 8, borderRadius: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  statCenter: { alignItems: 'center' },
  statNumber: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '800' },
  statLabel: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4 },
  badgeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  badgeChip: { paddingHorizontal: 6, paddingVertical: 4 },
  emptyText: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 18, paddingVertical: 10 }
});
