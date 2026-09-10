import React, { useState } from 'react';
import { View, StyleSheet, Modal, Alert, ActivityIndicator } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useAddQualification } from '../../hooks/useNurse';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  nurseId: string;
}

export function EditQualificationModal({ visible, onClose, nurseId }: Props) {
  const [qualTitle, setQualTitle] = useState('');
  const [qualIssuingBody, setQualIssuingBody] = useState('');
  const [qualYear, setQualYear] = useState('');

  const { mutate: addQualification, isPending } = useAddQualification();

  const handleAdd = () => {
    if (!qualTitle.trim() || !qualIssuingBody.trim()) {
      Alert.alert('Error', 'Title and Issuing Body are required.');
      return;
    }
    
    addQualification(
      {
        nurseId,
        data: {
          title: qualTitle.trim(),
          issuingBody: qualIssuingBody.trim(),
          yearObtained: parseInt(qualYear, 10) || new Date().getFullYear(),
        },
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Qualification added.');
          setQualTitle('');
          setQualIssuingBody('');
          setQualYear('');
          onClose();
        },
        onError: (err: any) => {
          Alert.alert('Error', err.message || 'Failed to add qualification.');
        },
      }
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Qualification</Text>

          <TextInput
            label="Degree / Title"
            value={qualTitle}
            onChangeText={setQualTitle}
            mode="outlined"
            style={styles.input}
            outlineColor="#E2E8F0"
            activeOutlineColor="#00E676"
          />

          <TextInput
            label="Issuing Body / University"
            value={qualIssuingBody}
            onChangeText={setQualIssuingBody}
            mode="outlined"
            style={styles.input}
            outlineColor="#E2E8F0"
            activeOutlineColor="#00E676"
          />

          <TextInput
            label="Year Obtained"
            value={qualYear}
            onChangeText={setQualYear}
            mode="outlined"
            keyboardType="number-pad"
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
