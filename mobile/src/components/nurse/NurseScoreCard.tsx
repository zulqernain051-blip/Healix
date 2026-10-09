
import { useAppTheme, useThemeValue } from '../../theme/ThemeProvider';
import type { ThemeColors } from '../../theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';


interface NurseScoreCardProps {
  skillAssessmentCount?: number;
  compositeScore: number;
  skillScore: number;
  experienceScore: number;
  reliabilityScore: number;
  performanceScore: number;
}

export const NurseScoreCard: React.FC<NurseScoreCardProps> = ({
  skillAssessmentCount,
  compositeScore,
  skillScore,
  experienceScore,
  reliabilityScore,
  performanceScore,
}) => {
  const { colors: COLORS } = useAppTheme();
  const styles = useThemeValue(createStyles);

  const metrics = [
    { label: 'Assessed Skill', score: skillScore, color: COLORS.emerald },
    { label: 'Experience', score: experienceScore, color: COLORS.primaryText },
    { label: 'Reliability', score: reliabilityScore, color: COLORS.amber },
    { label: 'Performance', score: performanceScore, color: COLORS.purple },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Performance and assessed skills</Text>

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
                <Text style={[styles.barValue, { color: m.color }]}>{m.label === 'Assessed Skill' && !skillAssessmentCount ? 'Not assessed' : Math.round(m.score)}</Text>
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

const createStyles = (COLORS: ThemeColors) => (StyleSheet.create({
  card: { backgroundColor: COLORS.surfaceCard, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: COLORS.inputBorder, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  title: { color: COLORS.textMuted, fontSize: 15, fontWeight: '700', marginBottom: 20 },
  compositeRow: { flexDirection: 'row', alignItems: 'center' },
  scoreCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.surfaceCard, justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: COLORS.emerald, marginRight: 20 },
  scoreNumber: { color: COLORS.textMuted, fontSize: 28, fontWeight: '800' },
  scoreLabel: { color: COLORS.textBody, fontSize: 11, fontWeight: '600', marginTop: -2 },
  barsCol: { flex: 1, gap: 12 },
  barGroup: {},
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  barLabel: { color: COLORS.textBody, fontSize: 12, fontWeight: '600' },
  barValue: { fontSize: 12, fontWeight: '700' },
  barTrack: { height: 6, backgroundColor: COLORS.surfaceCard, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
}));
