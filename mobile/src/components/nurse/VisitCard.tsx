
import { useAppTheme, useThemeValue } from '../../theme/ThemeProvider';
import type { ThemeColors } from '../../theme';
import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';


interface VisitCardProps {
  visitId: string;
  patientName: string;
  scheduledTime: string;
  visitType: string;
  status: string;
  address?: string;
  riskTier?: string;
  onPress: () => void;
}

export const VisitCard: React.FC<VisitCardProps> = ({
  visitId,
  patientName,
  scheduledTime,
  visitType,
  status,
  address,
  riskTier,
  onPress,
}) => {
  const { colors: COLORS } = useAppTheme();
  const styles = useThemeValue(createStyles);

  const isHighRisk = riskTier === 'HIGH';
  const isInProgress = status === 'IN_PROGRESS';

  const statusColor = isInProgress ? COLORS.amber : status === 'COMPLETED' ? COLORS.emerald : status === 'CANCELLED' ? COLORS.red : COLORS.textBody;
  const statusBg = isInProgress ? COLORS.amberLight : status === 'COMPLETED' ? COLORS.emeraldLight : status === 'CANCELLED' ? COLORS.redLight : COLORS.textBody;

  return (
    <TouchableOpacity style={[styles.card, isHighRisk && styles.highRiskBorder]} onPress={onPress} activeOpacity={0.85}>
      {isHighRisk && (
        <View style={styles.highRiskBanner}>
          <Text style={styles.highRiskText}>🚨 HIGH RISK PATIENT</Text>
        </View>
      )}

      <View style={styles.headerRow}>
        <View style={styles.infoCol}>
          <Text style={styles.patientName}>{patientName}</Text>
          <Text style={styles.visitType}>{visitType === 'NURSE_VISIT' ? 'Nurse Visit' : (visitType === 'DOCTOR_VISIT' ? 'Doctor Visit' : visitType)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusBg, borderColor: statusColor }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.metaText}>🕐 {scheduledTime}</Text>
        {address && <Text style={styles.metaText} numberOfLines={1}>📍 {address}</Text>}
      </View>

      <Text style={styles.viewLink}>View Details & Start Workflow ›</Text>
    </TouchableOpacity>
  );
};

const createStyles = (COLORS: ThemeColors) => (StyleSheet.create({
  card: { backgroundColor: COLORS.surfaceCard, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.inputBorder, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, marginBottom: 16, overflow: 'hidden' },
  highRiskBorder: { borderColor: COLORS.red, borderWidth: 2 },
  highRiskBanner: { backgroundColor: COLORS.red, marginHorizontal: -16, marginTop: -16, marginBottom: 12, paddingVertical: 6, alignItems: 'center' },
  highRiskText: { color: COLORS.textDark, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  infoCol: { flex: 1, paddingRight: 12 },
  patientName: { color: COLORS.textMuted, fontSize: 16, fontWeight: '800' },
  visitType: { color: COLORS.emerald, fontSize: 12, fontWeight: '600', marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: '700' },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  detailCol: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { color: COLORS.textBody, fontSize: 12, fontWeight: '500' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, borderTopWidth: 1, borderTopColor: COLORS.inputBorder, paddingTop: 12 },
  metaText: { color: COLORS.textBody, fontSize: 12, fontWeight: '500' },
  viewLink: { color: COLORS.emerald, fontSize: 13, fontWeight: '700', marginTop: 4 },
}));
