
import { useAppTheme, useThemeValue } from '../../theme/ThemeProvider';
import type { ThemeColors } from '../../theme';
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Visit } from '../../types/visit';
import { VisitStatusBadge } from './VisitStatusBadge';
import { RADIUS, SPACING } from '../../theme';

interface VisitSummaryCardProps {
  visit: Visit;
  onPress: () => void;
}

export const VisitSummaryCard: React.FC<VisitSummaryCardProps> = ({ visit, onPress }) => {
  const { colors: COLORS } = useAppTheme();
  const styles = useThemeValue(createStyles);

  const patientName = visit.request?.patient?.user?.fullName || 'Patient';
  const scheduledAt = visit.request?.scheduledAt
    ? new Date(visit.request.scheduledAt).toLocaleString()
    : 'Pending';
  const visitType = visit.request?.requirements || (visit.request?.type === 'NURSE_VISIT' ? 'Nurse Visit' : 'Care Visit');
  const address = visit.request?.location?.address;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.headerRow}>
        <View style={styles.infoCol}>
          <Text style={styles.patientName}>{patientName}</Text>
          <Text style={styles.visitType}>{visitType}</Text>
        </View>
        <VisitStatusBadge status={visit.status} />
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.metaText}>Scheduled: {scheduledAt}</Text>
        {address && (
          <Text style={styles.metaText} numberOfLines={1}>{address}</Text>
        )}
      </View>

      <Text style={styles.viewLink}>View Details</Text>
    </TouchableOpacity>
  );
};

const createStyles = (COLORS: ThemeColors) => (StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceCard,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  infoCol: { flex: 1, paddingRight: 12 },
  patientName: { color: COLORS.textMuted, fontSize: 16, fontWeight: '800' },
  visitType: { color: COLORS.emerald, fontSize: 12, fontWeight: '600', marginTop: 4 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.inputBorder, paddingTop: 12 },
  metaText: { color: COLORS.textBody, fontSize: 12, fontWeight: '500' },
  viewLink: { color: COLORS.emerald, fontSize: 13, fontWeight: '700', marginTop: 8 },
}));

