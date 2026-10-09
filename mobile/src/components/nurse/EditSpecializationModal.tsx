import { useAppTheme, useThemeValue } from '../../theme/ThemeProvider';
import type { ThemeColors } from '../../theme';
import { useState } from 'react';
import { View, StyleSheet, Modal, Alert, ActivityIndicator } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useAddSpecialization } from '../../hooks/useNurse';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  nurseId: string;
}

export function EditSpecializationModal({ visible, onClose, nurseId }: Props) {
  const { colors: COLORS } = useAppTheme();
  const styles = useThemeValue(createStyles);

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
            outlineColor={COLORS.inputBorder}
            activeOutlineColor={COLORS.emerald}
          />

          <View style={styles.modalActions}>
            <Button mode="text" onPress={onClose} textColor={COLORS.textBody}>Cancel</Button>
            <Button
              mode="contained"
              onPress={handleAdd}
              buttonColor={COLORS.emeraldFill} textColor={COLORS.onAccent}
              disabled={isPending}
            >
              {isPending ? <ActivityIndicator color={COLORS.textDark} /> : 'Add'}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (COLORS: ThemeColors) => (StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: COLORS.modalBackdrop, justifyContent: 'center', padding: SPACING.md },
  modalContent: { backgroundColor: COLORS.surfaceCard, borderRadius: RADIUS.lg, padding: SPACING.lg },
  modalTitle: { ...TYPOGRAPHY.h3, marginBottom: SPACING.md, color: COLORS.text },
  input: { marginBottom: SPACING.sm, backgroundColor: COLORS.surfaceCard },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: SPACING.md, gap: SPACING.sm },
}));
