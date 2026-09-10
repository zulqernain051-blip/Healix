import React, { useState } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

interface AddMedicationModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string, dosage: string, frequency: string) => Promise<void>;
  isLoading?: boolean;
}

export const AddMedicationModal: React.FC<AddMedicationModalProps> = ({ visible, onClose, onSubmit, isLoading = false }) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');

  const handleSubmit = async () => {
    if (!name.trim() || !dosage.trim() || !frequency.trim()) return;
    await onSubmit(name, dosage, frequency);
    setName(''); setDosage(''); setFrequency('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Add Medication</Text>
          <TextInput style={styles.input} placeholder="Medication Name" placeholderTextColor="#6B8E8A" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Dosage (e.g. 500mg)" placeholderTextColor="#6B8E8A" value={dosage} onChangeText={setDosage} />
          <TextInput style={styles.input} placeholder="Frequency (e.g. Twice daily)" placeholderTextColor="#6B8E8A" value={frequency} onChangeText={setFrequency} />
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={isLoading}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.confirmBtn, (!name.trim() || !dosage.trim() || !frequency.trim()) && styles.disabled]} onPress={handleSubmit} disabled={!name.trim() || !dosage.trim() || !frequency.trim() || isLoading}>
              <Text style={styles.confirmText}>{isLoading ? 'Saving...' : 'Add Medication'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', padding: SPACING.lg },
  modal: { backgroundColor: '#0A2D28', borderRadius: RADIUS.lg, padding: SPACING.xl, borderWidth: 1, borderColor: 'rgba(0,230,118,0.2)' },
  title: { color: '#FFFFFF', fontSize: TYPOGRAPHY.sizes.md, fontWeight: '700', marginBottom: SPACING.md },
  input: { backgroundColor: '#051815', borderRadius: RADIUS.md, padding: SPACING.md, color: '#FFFFFF', fontSize: 12, borderWidth: 1, borderColor: 'rgba(0,230,118,0.15)', marginBottom: SPACING.md },
  btnRow: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm },
  cancelBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', paddingVertical: SPACING.md, borderRadius: RADIUS.md, alignItems: 'center' },
  cancelText: { color: '#94A3B8', fontSize: 11, fontWeight: '600' },
  confirmBtn: { flex: 1, backgroundColor: '#00E676', paddingVertical: SPACING.md, borderRadius: RADIUS.md, alignItems: 'center' },
  disabled: { opacity: 0.5 },
  confirmText: { color: '#061C19', fontSize: 11, fontWeight: '700' },
});
