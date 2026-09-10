import React, { useState } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

interface AddConditionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string, diagnosedDate?: string, notes?: string) => Promise<void>;
  isLoading?: boolean;
}

export const AddConditionModal: React.FC<AddConditionModalProps> = ({
  visible,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [diagnosedDate, setDiagnosedDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) return;
    await onSubmit(name, diagnosedDate || undefined, notes || undefined);
    setName('');
    setDiagnosedDate('');
    setNotes('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Add Chronic Condition</Text>
          <Text style={styles.sub}>Enter condition details:</Text>

          <TextInput
            style={styles.input}
            placeholder="Condition Name (e.g. Hypertension, Diabetes)"
            placeholderTextColor="#6B8E8A"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Diagnosed Date (e.g. 2022-05-10)"
            placeholderTextColor="#6B8E8A"
            value={diagnosedDate}
            onChangeText={setDiagnosedDate}
          />

          <TextInput
            style={styles.input}
            placeholder="Notes (optional)"
            placeholderTextColor="#6B8E8A"
            value={notes}
            onChangeText={setNotes}
          />

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={isLoading}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, !name.trim() && styles.disabledBtn]}
              onPress={handleSubmit}
              disabled={!name.trim() || isLoading}
            >
              <Text style={styles.confirmBtnText}>{isLoading ? 'Saving...' : 'Add Condition'}</Text>
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
    marginBottom: SPACING.md,
  },
  btnRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
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
