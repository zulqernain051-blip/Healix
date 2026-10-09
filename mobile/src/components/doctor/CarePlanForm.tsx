import { useAppTheme, useThemeValue } from '../../theme/ThemeProvider';
import type { ThemeColors } from '../../theme';

import { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, Platform } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import { useSubmitCarePlan } from '../../hooks/useDoctor';


export function CarePlanForm({ caseId, onComplete, onCancel }: { caseId: string, onComplete: () => void, onCancel: () => void }) {
  const { colors: COLORS } = useAppTheme();
  const styles = useThemeValue(createStyles);

  const { mutateAsync: submitCarePlan, isPending } = useSubmitCarePlan();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [milestone, setMilestone] = useState('');

  const handleSubmit = async () => {
    if (!title.trim() || !milestone.trim()) {
      if (Platform.OS === 'web') alert('Care Plan title and a milestone are required.');
      else Alert.alert('Validation Error', 'Care Plan title and a milestone are required.');
      return;
    }
    try {
      const milestones = milestone.trim() ? [{ title: milestone.trim(), targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }] : [];
      await submitCarePlan({ caseId, data: { title: title.trim(), description: description.trim() || undefined, milestones } });
      if (Platform.OS === 'web') alert('Care Plan created successfully.');
      else Alert.alert('Success', 'Care Plan created successfully.');
      onComplete();
    } catch (err: any) {
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
          <Button mode="text" onPress={onCancel} textColor={COLORS.textBody} disabled={isPending}>Cancel</Button>
          <Button mode="contained" onPress={handleSubmit} buttonColor={COLORS.navy} loading={isPending} disabled={isPending}>Save Care Plan</Button>
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
