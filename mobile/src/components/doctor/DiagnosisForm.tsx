import { useAppTheme, useThemeValue } from '../../theme/ThemeProvider';
import type { ThemeColors } from '../../theme';

import { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, Platform } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import { useSubmitDiagnosis } from '../../hooks/useDoctor';


export function DiagnosisForm({ caseId, onComplete, onCancel }: { caseId: string, onComplete: () => void, onCancel: () => void }) {
  const { colors: COLORS } = useAppTheme();
  const styles = useThemeValue(createStyles);

  const { mutateAsync: submitDiagnosis, isPending } = useSubmitDiagnosis();
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!code.trim() || !description.trim()) {
      if (Platform.OS === 'web') alert('ICD Code and Description are required.'); else Alert.alert('Validation Error', 'ICD Code and Description are required.');
      return;
    }
    try {
      await submitDiagnosis({ caseId, data: { code: code.trim(), description: description.trim(), notes: notes.trim() } });
      if (Platform.OS === 'web') alert('Diagnosis added successfully.'); else Alert.alert('Success', 'Diagnosis added successfully.');
      onComplete();
    } catch (err: any) {
      { const msg = err.response?.data?.message || err.message || 'Failed to submit diagnosis'; if (Platform.OS === 'web') alert('Error: ' + msg); else Alert.alert('Error', msg); }
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>Add Diagnosis</Text>
        <Text style={styles.label}>ICD-10 Code</Text>
        <TextInput style={styles.input} placeholder="e.g. I10" placeholderTextColor={COLORS.textMuted} value={code} onChangeText={setCode} />
        
        <Text style={styles.label}>Description</Text>
        <TextInput style={styles.input} placeholder="e.g. Essential Hypertension" placeholderTextColor={COLORS.textMuted} value={description} onChangeText={setDescription} />

        <Text style={styles.label}>Clinical Notes (Optional)</Text>
        <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Additional remarks..." placeholderTextColor={COLORS.textMuted} multiline value={notes} onChangeText={setNotes} />

        <View style={styles.actions}>
          <Button mode="text" onPress={onCancel} textColor={COLORS.textBody} disabled={isPending}>Cancel</Button>
          <Button mode="contained" onPress={handleSubmit} buttonColor={COLORS.navy} loading={isPending} disabled={isPending}>Save Diagnosis</Button>
        </View>
      </Card.Content>
    </Card>
  );
}

const createStyles = (COLORS: ThemeColors) => (StyleSheet.create({
  card: { backgroundColor: COLORS.surfaceCard, borderColor: COLORS.inputBorder, borderWidth: 1, marginBottom: 16 },
  title: { color: COLORS.textDark, fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  label: { color: COLORS.textBody, marginBottom: 6, fontSize: 14 },
  input: { backgroundColor: COLORS.surface, color: COLORS.textDark, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.inputBorder, marginBottom: 16 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 }
}));
