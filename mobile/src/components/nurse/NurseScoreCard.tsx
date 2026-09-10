import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

interface NurseScoreCardProps {
  compositeScore: number;
  skillScore: number;
  experienceScore: number;
  reliabilityScore: number;
  performanceScore: number;
}

export const NurseScoreCard: React.FC<NurseScoreCardProps> = ({
  compositeScore,
  skillScore,
  experienceScore,
  reliabilityScore,
  performanceScore,
}) => {
  const metrics = [
    { label: 'Clinical Skill', score: skillScore, color: '#00E676' },
    { label: 'Experience', score: experienceScore, color: '#3B82F6' },
    { label: 'Reliability', score: reliabilityScore, color: '#F59E0B' },
    { label: 'Performance', score: performanceScore, color: '#A855F7' },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Skill Score Breakdown (Feature 3.8)</Text>

      <View style={styles.compositeRow}>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreNumber}>{Math.round(compositeScore)}</Text>
          <Text style={styles.scoreLabel}>Composite</Text>
        </View>

        <View style={styles.barsCol}>
          {metrics.map(m => (
            <View key={m.label} style={styles.barGroup}>
              <View style={styles.barLabelRow}>
                <Text style={styles.barLabel}>{m.label}</Text>
                <Text style={[styles.barValue, { color: m.color }]}>{Math.round(m.score)}</Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${Math.min(Math.round(m.score), 100)}%` as any, backgroundColor: m.color }]} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  title: { color: '#1E293B', fontSize: 15, fontWeight: '700', marginBottom: 20 },
  compositeRow: { flexDirection: 'row', alignItems: 'center' },
  scoreCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#00E676', marginRight: 20 },
  scoreNumber: { color: '#1E293B', fontSize: 28, fontWeight: '800' },
  scoreLabel: { color: '#64748B', fontSize: 11, fontWeight: '600', marginTop: -2 },
  barsCol: { flex: 1, gap: 12 },
  barGroup: {},
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  barLabel: { color: '#64748B', fontSize: 12, fontWeight: '600' },
  barValue: { fontSize: 12, fontWeight: '700' },
  barTrack: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
});
