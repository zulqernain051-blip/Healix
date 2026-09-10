import React, { useState } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

interface AddAllergyModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (allergen: string, severity: 'MILD' | 'MODERATE' | 'SEVERE') => Promise<void>;
  isLoading?: boolean;
}

export const AddAllergyModal: React.FC<AddAllergyModalProps> = ({
  visible,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [allergen, setAllergen] = useState('');
  const [severity, setSeverity] = useState<'MILD' | 'MODERATE' | 'SEVERE'>('MILD');

  const handleSubmit = async () => {
    if (!allergen.trim()) return;
    await onSubmit(allergen, severity);
    setAllergen('');
    setSeverity('MILD');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Add Allergy</Text>
          <Text style={styles.sub}>Enter allergen name and select severity level:</Text>

          <TextInput
            style={styles.input}
            placeholder="e.g. Penicillin, Peanuts"
            placeholderTextColor="#6B8E8A"
            value={allergen}
            onChangeText={setAllergen}
          />

          <Text style={styles.label}>Severity Level:</Text>
          <View style={styles.severityRow}>
            {(['MILD', 'MODERATE', 'SEVERE'] as const).map(sev => (
              <TouchableOpacity
                key={sev}
                style={[
                  styles.sevPill,
                  severity === sev && styles.sevPillActive,
                ]}
                onPress={() => setSeverity(sev)}
              >
                <Text style={[styles.sevText, severity === sev && styles.sevTextActive]}>
                  {sev}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={isLoading}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, !allergen.trim() && styles.disabledBtn]}
              onPress={handleSubmit}
              disabled={!allergen.trim() || isLoading}
            >
              <Text style={styles.confirmBtnText}>{isLoading ? 'Saving...' : 'Add Allergy'}</Text>
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
  label: {
    color: '#94A3B8',
    fontSize: 11,
    marginBottom: SPACING.xs,
  },
  severityRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  sevPill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
    backgroundColor: '#051815',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  sevPillActive: {
    backgroundColor: '#00E676',
  },
  sevText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  sevTextActive: {
    color: '#061C19',
    fontWeight: '700',
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
