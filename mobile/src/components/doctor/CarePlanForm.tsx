import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, Platform } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import { useSubmitCarePlan } from '../../hooks/useDoctor';

const COLORS = {
  bg: '#0A1628', card: '#111D35', border: '#1E2D4A', teal: '#0D9488',
  textPrimary: '#F1F5F9', textSecondary: '#94A3B8', textMuted: '#475569'
};

export function CarePlanForm({ caseId, onComplete, onCancel }: { caseId: string, onComplete: () => void, onCancel: () => void }) {
  const { mutateAsync: submitCarePlan, isPending } = useSubmitCarePlan();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [milestone, setMilestone] = useState('');

  const handleSubmit = async () => {
    if (!title.trim()) {
      if (Platform.OS === 'web') alert('Care Plan title is required.');
      else Alert.alert('Validation Error', 'Care Plan title is required.');
      return;
    }
    try {
      const milestones = milestone.trim() ? [{ title: milestone.trim(), targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }] : [];
      await submitCarePlan({ caseId, data: { title: title.trim(), description: description.trim() || undefined, milestones } });
      if (Platform.OS === 'web') alert('Care Plan created successfully.');
      else Alert.alert('Success', 'Care Plan created successfully.');
      onComplete();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create care plan';
      if (Platform.OS === 'web') alert('Error: ' + msg);
      else Alert.alert('Error', msg);
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>Create Care Plan</Text>
        <Text style={styles.label}>Plan Title</Text>
        <TextInput style={styles.input} placeholder="e.g. Post-Hypertension Monitoring" placeholderTextColor={COLORS.textMuted} value={title} onChangeText={setTitle} />
        
        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Describe the care plan goals..." placeholderTextColor={COLORS.textMuted} multiline value={description} onChangeText={setDescription} />

        <Text style={styles.label}>First Milestone (Optional)</Text>
        <TextInput style={styles.input} placeholder="e.g. Blood pressure check in 1 week" placeholderTextColor={COLORS.textMuted} value={milestone} onChangeText={setMilestone} />

        <View style={styles.actions}>
          <Button mode="text" onPress={onCancel} textColor={COLORS.textSecondary} disabled={isPending}>Cancel</Button>
          <Button mode="contained" onPress={handleSubmit} buttonColor={COLORS.teal} loading={isPending} disabled={isPending}>Save Care Plan</Button>
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
