import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

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
  const isHighRisk = riskTier === 'HIGH';
  const isInProgress = status === 'IN_PROGRESS';

  const statusColor = isInProgress ? '#F59E0B' : status === 'COMPLETED' ? '#00E676' : status === 'CANCELLED' ? '#EF4444' : '#94A3B8';
  const statusBg = isInProgress ? 'rgba(245,158,11,0.12)' : status === 'COMPLETED' ? 'rgba(0,230,118,0.12)' : status === 'CANCELLED' ? 'rgba(239,68,68,0.12)' : 'rgba(148,163,184,0.1)';

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
          <Text style={styles.visitType}>{visitType === 'NURSE_VISIT' ? '👩‍⚕️ Nurse Visit' : '👨‍⚕️ Doctor Visit'}</Text>
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

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, marginBottom: 16, overflow: 'hidden' },
  highRiskBorder: { borderColor: '#EF4444', borderWidth: 2 },
  highRiskBanner: { backgroundColor: '#EF4444', marginHorizontal: -16, marginTop: -16, marginBottom: 12, paddingVertical: 6, alignItems: 'center' },
  highRiskText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  infoCol: { flex: 1, paddingRight: 12 },
  patientName: { color: '#1E293B', fontSize: 16, fontWeight: '800' },
  visitType: { color: '#00E676', fontSize: 12, fontWeight: '600', marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: '700' },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  detailCol: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { color: '#64748B', fontSize: 12, fontWeight: '500' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
  metaText: { color: '#64748B', fontSize: 12, fontWeight: '500' },
  viewLink: { color: '#00E676', fontSize: 13, fontWeight: '700', marginTop: 4 },
});
