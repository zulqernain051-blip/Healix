import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

interface AIRiskAssessmentDisplayProps {
  riskTier: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  fusedScore: number;
  factors?: string[];
  recommendations?: string[];
  escalationRequired?: boolean;
  onEscalatePress?: () => void;
}

export const AIRiskAssessmentDisplay: React.FC<AIRiskAssessmentDisplayProps> = ({
  riskTier = 'LOW',
  fusedScore = 0.2,
  factors = ['Elevated blood pressure', 'Irregular heart rate'],
  recommendations = ['Monitor vitals every 4 hours', 'Notify attending doctor if BP > 140/90'],
  escalationRequired = false,
  onEscalatePress,
}) => {
  const isHigh = riskTier === 'HIGH';
  const isMed = riskTier === 'MEDIUM';

  const tierColor = isHigh ? '#EF4444' : isMed ? '#F59E0B' : '#00E676';
  const tierBg = isHigh ? 'rgba(239,68,68,0.12)' : isMed ? 'rgba(245,158,11,0.12)' : 'rgba(0,230,118,0.12)';

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text style={styles.sparkleIcon}>✨</Text>
          <Text style={styles.title}>AI Clinical Risk Analysis</Text>
        </View>
        <View style={[styles.tierBadge, { backgroundColor: tierBg, borderColor: tierColor }]}>
          <Text style={[styles.tierText, { color: tierColor }]}>{riskTier} RISK</Text>
        </View>
      </View>

      <View style={styles.scoreRow}>
        <Text style={styles.scoreLabel}>Fused Risk Score:</Text>
        <Text style={[styles.scoreValue, { color: tierColor }]}>{(fusedScore * 100).toFixed(0)}%</Text>
      </View>

      {/* Contributing Factors */}
      {factors && factors.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Contributing Risk Factors:</Text>
          {factors.map((f, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>{f}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Clinical Recommendations:</Text>
          {recommendations.map((r, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bulletCheck}>✓</Text>
              <Text style={styles.bulletText}>{r}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Doctor Escalation Action */}
      {(escalationRequired || isHigh) && onEscalatePress && (
        <TouchableOpacity style={styles.escalateBtn} onPress={onEscalatePress} activeOpacity={0.8}>
          <Text style={styles.escalateBtnText}>🚨 Escalate to Doctor Immediately</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0A2D28',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sparkleIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  title: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
  },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.round,
    borderWidth: 1,
  },
  tierText: {
    fontSize: 10,
    fontWeight: '800',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  scoreLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginRight: 8,
  },
  scoreValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '800',
  },
  section: {
    marginTop: SPACING.sm,
  },
  sectionHeading: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  bulletDot: {
    color: '#F59E0B',
    marginRight: 6,
  },
  bulletCheck: {
    color: '#00E676',
    fontSize: 11,
    marginRight: 6,
  },
  bulletText: {
    color: '#94A3B8',
    fontSize: 11,
    flex: 1,
  },
  escalateBtn: {
    backgroundColor: '#EF4444',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  escalateBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
