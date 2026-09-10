import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { RADIUS, SPACING } from '../../theme';

interface QuickActionsGridProps {
  onRequestPress: () => void;
  onRecordsPress: () => void;
  onAIPress: () => void;
  onPrescriptionsPress: () => void;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
  onRequestPress,
  onRecordsPress,
  onAIPress,
  onPrescriptionsPress,
}) => {
  return (
    <View style={styles.quickGrid}>
      <TouchableOpacity style={styles.quickCard} onPress={onRequestPress} activeOpacity={0.8}>
        <View style={[styles.quickIconBg, { backgroundColor: 'rgba(0, 230, 118, 0.12)' }]}>
          <Text style={styles.quickIconText}>🩺</Text>
        </View>
        <Text style={styles.quickLabel}>Request Healthcare</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.quickCard} onPress={onRecordsPress} activeOpacity={0.8}>
        <View style={[styles.quickIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
          <Text style={styles.quickIconText}>📁</Text>
        </View>
        <Text style={styles.quickLabel}>Health Records</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.quickCard} onPress={onAIPress} activeOpacity={0.8}>
        <View style={[styles.quickIconBg, { backgroundColor: 'rgba(168, 85, 247, 0.12)' }]}>
          <Text style={styles.quickIconText}>🤖</Text>
        </View>
        <Text style={styles.quickLabel}>AI Assistant</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.quickCard} onPress={onPrescriptionsPress} activeOpacity={0.8}>
        <View style={[styles.quickIconBg, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
          <Text style={styles.quickIconText}>💊</Text>
        </View>
        <Text style={styles.quickLabel}>Prescriptions</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#0A2D28',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  quickIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickIconText: {
    fontSize: 20,
  },
  quickLabel: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});
