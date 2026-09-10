import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, TouchableOpacity, Platform } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import { useSubmitPrescription } from '../../hooks/useDoctor';

const COLORS = {
  bg: '#0A1628', card: '#111D35', border: '#1E2D4A', teal: '#0D9488',
  red: '#EF4444', textPrimary: '#F1F5F9', textSecondary: '#94A3B8', textMuted: '#475569'
};

export function PrescriptionForm({ caseId, onComplete, onCancel }: { caseId: string, onComplete: () => void, onCancel: () => void }) {
  const { mutateAsync: submitPrescription, isPending } = useSubmitPrescription();
  const [instructions, setInstructions] = useState('');
  const [items, setItems] = useState([{ medicationName: '', dosage: '', frequency: '', durationDays: '7' }]);

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { medicationName: '', dosage: '', frequency: '', durationDays: '7' }]);
  
  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleSubmit = async (bypassAllergyCheck = false) => {
    const validItems = items.filter(i => i.medicationName.trim() !== '' && i.dosage.trim() !== '');
    if (validItems.length === 0) {
      if (Platform.OS === 'web') alert('At least one valid medication is required.'); else Alert.alert('Validation Error', 'At least one valid medication is required.');
      return;
    }

    try {
      await submitPrescription({ 
        caseId, 
        data: { 
          instructions, 
          bypassAllergyCheck,
          items: validItems.map(i => ({
            ...i,
            durationDays: parseInt(i.durationDays, 10) || 7
          })) 
        } 
      });
      if (Platform.OS === 'web') alert('Prescription added successfully.'); else Alert.alert('Success', 'Prescription added successfully.');
      onComplete();
    } catch (err: any) {
      if (err.response?.status === 409) {
        Alert.alert(
          'Allergy Conflict Detected',
          err.response?.data?.message || 'A medication conflicts with a known patient allergy.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Override & Prescribe', style: 'destructive', onPress: () => handleSubmit(true) }
          ]
        );
      } else {
        Alert.alert('Error', err.response?.data?.message || err.message || 'Failed to submit prescription');
      }
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>Add Prescription</Text>
        
        {items.map((item, index) => (
          <View key={index} style={styles.itemBlock}>
            <View style={styles.rowBetween}>
              <Text style={styles.itemTitle}>Medication #{index + 1}</Text>
              {items.length > 1 && (
                <TouchableOpacity onPress={() => removeItem(index)}>
                  <Text style={{ color: COLORS.red }}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
            <TextInput style={styles.input} placeholder="Medication Name" placeholderTextColor={COLORS.textMuted} value={item.medicationName} onChangeText={v => updateItem(index, 'medicationName', v)} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Dosage (e.g. 50mg)" placeholderTextColor={COLORS.textMuted} value={item.dosage} onChangeText={v => updateItem(index, 'dosage', v)} />
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Freq (e.g. 1x/day)" placeholderTextColor={COLORS.textMuted} value={item.frequency} onChangeText={v => updateItem(index, 'frequency', v)} />
            </View>
            <TextInput style={styles.input} placeholder="Duration (Days)" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" value={item.durationDays} onChangeText={v => updateItem(index, 'durationDays', v)} />
          </View>
        ))}

        <Button mode="text" onPress={addItem} textColor={COLORS.teal} style={{ alignSelf: 'flex-start' }}>+ Add Medication</Button>

        <Text style={[styles.label, { marginTop: 16 }]}>General Instructions (Optional)</Text>
        <TextInput style={[styles.input, { height: 60, textAlignVertical: 'top' }]} placeholder="Take after meals..." placeholderTextColor={COLORS.textMuted} multiline value={instructions} onChangeText={setInstructions} />

        <View style={styles.actions}>
          <Button mode="text" onPress={onCancel} textColor={COLORS.textSecondary} disabled={isPending}>Cancel</Button>
          <Button mode="contained" onPress={() => handleSubmit(false)} buttonColor={COLORS.teal} loading={isPending} disabled={isPending}>Save Prescription</Button>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, marginBottom: 16 },
  title: { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  label: { color: COLORS.textSecondary, marginBottom: 6, fontSize: 14 },
  input: { backgroundColor: COLORS.bg, color: COLORS.textPrimary, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 16 },
  itemBlock: { backgroundColor: COLORS.bg, padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  itemTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
});
