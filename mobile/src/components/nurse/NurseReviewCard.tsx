
import { useAppTheme, useThemeValue } from '../../theme/ThemeProvider';
import type { ThemeColors } from '../../theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';


interface NurseReviewCardProps {
  patientName: string;
  rating: number;
  comment?: string | null;
  reviewedAt: string;
}

export const NurseReviewCard: React.FC<NurseReviewCardProps> = ({
  patientName,
  rating,
  comment,
  reviewedAt,
}) => {
  const { colors: COLORS } = useAppTheme();
  const styles = useThemeValue(createStyles);

  const stars = Array(5).fill(0).map((_, i) => i < rating ? '⭐' : '☆');

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.patientName}>{patientName}</Text>
          <Text style={styles.date}>{reviewedAt}</Text>
        </View>
        <Text style={styles.stars}>{stars.join(' ')}</Text>
      </View>
      {comment && <Text style={styles.comment}>{comment}</Text>}
    </View>
  );
};

const createStyles = (COLORS: ThemeColors) => (StyleSheet.create({
  card: { backgroundColor: COLORS.surfaceCard, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.inputBorder, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  patientName: { color: COLORS.textMuted, fontSize: 14, fontWeight: '700' },
  date: { color: COLORS.textBody, fontSize: 11, marginTop: 2 },
  stars: { color: COLORS.amber, fontSize: 12 },
  comment: { color: COLORS.textMuted, fontSize: 13, lineHeight: 20, marginTop: 4 },
}));
