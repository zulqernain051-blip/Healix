import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, TouchableOpacity, Platform } from 'react-native';
import { Button, Text, Card, Checkbox } from 'react-native-paper';
import { useScheduleFollowUp } from '../../hooks/useDoctor';

const COLORS = {
  bg: '#0A1628', card: '#111D35', border: '#1E2D4A', teal: '#0D9488',
  textPrimary: '#F1F5F9', textSecondary: '#94A3B8', textMuted: '#475569'
};

export function FollowUpForm({ caseId, hasCurrentNurse, onComplete, onCancel }: { caseId: string, hasCurrentNurse: boolean, onComplete: () => void, onCancel: () => void }) {
  const { mutateAsync: scheduleFollowUp, isPending } = useScheduleFollowUp();
  const [daysFromNow, setDaysFromNow] = useState('7');
  const [instructions, setInstructions] = useState('');
  const [preferCurrentNurse, setPreferCurrentNurse] = useState(false);

  const handleSubmit = async () => {
    const days = parseInt(daysFromNow, 10);
    if (isNaN(days) || days <= 0) {
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
              color={COLORS.teal}
            />
            <Text style={styles.checkboxLabel}>Prefer keeping the current nurse</Text>
          </TouchableOpacity>
        )}

        <View style={styles.actions}>
          <Button mode="text" onPress={onCancel} textColor={COLORS.textSecondary} disabled={isPending}>Cancel</Button>
          <Button mode="contained" onPress={handleSubmit} buttonColor={COLORS.teal} loading={isPending} disabled={isPending}>Schedule Follow-up</Button>
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
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  checkboxLabel: { color: COLORS.textPrimary, fontSize: 14, marginLeft: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 }
});
