import React, { useState } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

interface RescheduleRequestModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (newScheduledAt: string) => Promise<void>;
  isLoading?: boolean;
}

export const RescheduleRequestModal: React.FC<RescheduleRequestModalProps> = ({
  visible,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [scheduledAt, setScheduledAt] = useState('');

  const handleSubmit = async () => {
    if (!scheduledAt.trim()) return;
    await onConfirm(scheduledAt);
    setScheduledAt('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Reschedule Visit</Text>
          <Text style={styles.sub}>Enter preferred date and time (e.g. 14 May 2025 - 10:00 AM):</Text>

          <TextInput
            style={styles.input}
            placeholder="e.g. 14 May 2025 - 10:00 AM"
            placeholderTextColor="#6B8E8A"
            value={scheduledAt}
            onChangeText={setScheduledAt}
          />

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={isLoading}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, !scheduledAt.trim() && styles.disabledBtn]}
              onPress={handleSubmit}
              disabled={!scheduledAt.trim() || isLoading}
            >
              <Text style={styles.confirmBtnText}>{isLoading ? 'Saving...' : 'Reschedule'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: '#0A2D28',
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    marginBottom: 4,
  },
  sub: {
    color: '#94A3B8',
    fontSize: 11,
    marginBottom: SPACING.md,
  },
  input: {
    backgroundColor: '#051815',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: '#FFFFFF',
    fontSize: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
    marginBottom: SPACING.lg,
  },
  btnRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#00E676',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  confirmBtnText: {
    color: '#061C19',
    fontSize: 11,
    fontWeight: '700',
  },
});
