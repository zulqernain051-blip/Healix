import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import { useSubmitDiagnosis } from '../../hooks/useDoctor';

const COLORS = {
  bg: '#0A1628', card: '#111D35', border: '#1E2D4A', teal: '#0D9488',
  textPrimary: '#F1F5F9', textSecondary: '#94A3B8', textMuted: '#475569'
};

export function DiagnosisForm({ caseId, onComplete, onCancel }: { caseId: string, onComplete: () => void, onCancel: () => void }) {
  const { mutateAsync: submitDiagnosis, isPending } = useSubmitDiagnosis();
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!code || !description) {
      if (Platform.OS === 'web') alert('ICD Code and Description are required.'); else Alert.alert('Validation Error', 'ICD Code and Description are required.');
      return;
    }
    try {
      await submitDiagnosis({ caseId, data: { code, description, notes } });
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
          <Button mode="text" onPress={onCancel} textColor={COLORS.textSecondary} disabled={isPending}>Cancel</Button>
          <Button mode="contained" onPress={handleSubmit} buttonColor={COLORS.teal} loading={isPending} disabled={isPending}>Save Diagnosis</Button>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, marginBottom: 16 },
  title: { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  label: { color: COLORS.textSecondary, marginBottom: 6, fontSize: 14 },
  input: { backgroundColor: COLORS.bg, color: COLORS.textPrimary, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 }
});
