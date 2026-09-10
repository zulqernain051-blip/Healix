import React, { useState } from 'react';
import { View, StyleSheet, Modal, Alert, ActivityIndicator } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useAddSpecialization } from '../../hooks/useNurse';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  nurseId: string;
}

export function EditSpecializationModal({ visible, onClose, nurseId }: Props) {
  const [spec, setSpec] = useState('');

  const { mutate: addSpecialization, isPending } = useAddSpecialization();

  const handleAdd = () => {
    if (!spec.trim()) {
      Alert.alert('Error', 'Specialization is required.');
      return;
    }
    
    addSpecialization(
      {
        nurseId,
        data: { specialization: spec.trim() },
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Specialization added.');
          setSpec('');
          onClose();
        },
        onError: (err: any) => {
          Alert.alert('Error', err.message || 'Failed to add specialization.');
        },
      }
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Specialization</Text>

          <TextInput
            label="Specialization (e.g. ICU, Pediatrics)"
            value={spec}
            onChangeText={setSpec}
            mode="outlined"
            style={styles.input}
            outlineColor="#E2E8F0"
            activeOutlineColor="#00E676"
          />

          <View style={styles.modalActions}>
            <Button mode="text" onPress={onClose} textColor="#64748B">Cancel</Button>
            <Button
              mode="contained"
              onPress={handleAdd}
              buttonColor="#00E676"
              disabled={isPending}
            >
              {isPending ? <ActivityIndicator color="#FFF" /> : 'Add'}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: SPACING.md },
  modalContent: { backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.lg },
  modalTitle: { ...TYPOGRAPHY.h3, marginBottom: SPACING.md, color: COLORS.text },
  input: { marginBottom: SPACING.sm, backgroundColor: '#FFF' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: SPACING.md, gap: SPACING.sm },
});
