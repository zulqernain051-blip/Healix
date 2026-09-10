import React, { useState } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

interface CancelRequestModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isLoading?: boolean;
}

export const CancelRequestModal: React.FC<CancelRequestModalProps> = ({
  visible,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [reason, setReason] = useState('');

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    await onConfirm(reason);
    setReason('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Cancel Care Request</Text>
          <Text style={styles.sub}>Please state the reason for cancellation:</Text>

          <TextInput
            style={styles.input}
            placeholder="Reason for cancellation..."
            placeholderTextColor="#6B8E8A"
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
          />

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={isLoading}>
              <Text style={styles.cancelBtnText}>Keep Request</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, !reason.trim() && styles.disabledBtn]}
              onPress={handleSubmit}
              disabled={!reason.trim() || isLoading}
            >
              <Text style={styles.confirmBtnText}>{isLoading ? 'Cancelling...' : 'Cancel Request'}</Text>
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
    textAlignVertical: 'top',
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
    backgroundColor: '#EF4444',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
