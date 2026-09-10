import React from 'react';
import { StyleSheet, View, TouchableOpacity, Linking } from 'react-native';
import { Text } from 'react-native-paper';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

interface PrescriptionCardProps {
  doctorName: string;
  prescribedAt: string;
  instructions?: string | null;
  fileUrl?: string;
  onDownload: () => void;
}

export const PrescriptionCard: React.FC<PrescriptionCardProps> = ({ doctorName, prescribedAt, instructions, fileUrl, onDownload }) => {
  const handleDownload = () => {
    if (fileUrl) { Linking.openURL(fileUrl).catch(() => {}); }
    onDownload();
  };

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.doctor}>Dr. {doctorName}</Text>
        <Text style={styles.date}>{prescribedAt}</Text>
        {instructions ? <Text style={styles.instructions} numberOfLines={2}>{instructions}</Text> : null}
      </View>
      <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload} activeOpacity={0.8}>
        <Text style={styles.downloadText}>📄 PDF</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#0A2D28', borderRadius: RADIUS.lg, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,230,118,0.15)' },
  info: { flex: 1 },
  doctor: { color: '#FFFFFF', fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '700' },
  date: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  instructions: { color: '#6B8E8A', fontSize: 10, marginTop: 4 },
  downloadBtn: { backgroundColor: 'rgba(0,230,118,0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: '#00E676' },
  downloadText: { color: '#00E676', fontSize: 11, fontWeight: '700' },
});
