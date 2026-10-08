import { COLORS } from '../../theme';
import { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, TouchableOpacity, Platform } from 'react-native';
import { Button, Text, Card, Checkbox } from 'react-native-paper';
import { useScheduleFollowUp } from '../../hooks/useDoctor';


export function FollowUpForm({ caseId, hasCurrentNurse, onComplete, onCancel }: { caseId: string, hasCurrentNurse: boolean, onComplete: () => void, onCancel: () => void }) {
  const { mutateAsync: scheduleFollowUp, isPending } = useScheduleFollowUp();
  const [daysFromNow, setDaysFromNow] = useState('7');
  const [instructions, setInstructions] = useState('');
  const [preferCurrentNurse, setPreferCurrentNurse] = useState(false);

  const handleSubmit = async () => {
    const days = Number(daysFromNow);
    if (!Number.isInteger(days) || days <= 0 || days > 365) {
      if (Platform.OS === 'web') alert('Please enter a valid number of days in the future.'); else Alert.alert('Validation Error', 'Please enter a valid number of days in the future.');
      return;
    }

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    try {
      await scheduleFollowUp({ 
        caseId, 
        data: { 
          targetDate: targetDate.toISOString(), 
          instructions: instructions.trim() || undefined,
          preferCurrentNurse: hasCurrentNurse ? preferCurrentNurse : undefined
        } 
      });
      if (Platform.OS === 'web') alert('Follow-up scheduled successfully.'); else Alert.alert('Success', 'Follow-up scheduled successfully. The current case can now be resolved.');
      onComplete();
    } catch (err: any) {
      { const msg = err.response?.data?.message || err.message || 'Failed to schedule follow-up'; if (Platform.OS === 'web') alert('Error: ' + msg); else Alert.alert('Error', msg); }
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>Schedule Follow-up Visit</Text>
        
        <Text style={styles.label}>When should the nurse visit? (Days from today)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. 7" 
          placeholderTextColor={COLORS.textMuted} 
          keyboardType="numeric"
          value={daysFromNow} 
          onChangeText={setDaysFromNow} 
        />
        
        <Text style={styles.label}>Clinical Instructions for Nurse (Optional)</Text>
        <TextInput 
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
          placeholder="Check blood pressure, monitor wound..." 
          placeholderTextColor={COLORS.textMuted} 
          multiline 
          value={instructions} 
          onChangeText={setInstructions} 
        />

        {hasCurrentNurse && (
          <TouchableOpacity 
            style={styles.checkboxRow} 
            activeOpacity={0.7} 
            onPress={() => setPreferCurrentNurse(!preferCurrentNurse)}
          >
            <Checkbox.Android 
              status={preferCurrentNurse ? 'checked' : 'unchecked'} 
              onPress={() => setPreferCurrentNurse(!preferCurrentNurse)}
              color={COLORS.navy}
            />
            <Text style={styles.checkboxLabel}>Prefer keeping the current nurse</Text>
          </TouchableOpacity>
        )}

        <View style={styles.actions}>
          <Button mode="text" onPress={onCancel} textColor={COLORS.textBody} disabled={isPending}>Cancel</Button>
          <Button mode="contained" onPress={handleSubmit} buttonColor={COLORS.navy} loading={isPending} disabled={isPending}>Schedule Follow-up</Button>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.surfaceCard, borderColor: COLORS.inputBorder, borderWidth: 1, marginBottom: 16 },
  title: { color: COLORS.textDark, fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  label: { color: COLORS.textBody, marginBottom: 6, fontSize: 14 },
  input: { backgroundColor: COLORS.surface, color: COLORS.textDark, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.inputBorder, marginBottom: 16 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  checkboxLabel: { color: COLORS.textDark, fontSize: 14, marginLeft: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 }
});
