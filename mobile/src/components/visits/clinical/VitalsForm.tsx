import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, ScrollView, Platform } from 'react-native';
import { Text, Button, Card, Divider } from 'react-native-paper';
import { useSubmitVitals } from '../../../hooks/useVisits';
import { vitalsSchema, VitalsRecord } from '../../../types/visit';
import { RADIUS, SPACING } from '../../../theme';

interface VitalsFormProps {
  visitId: string;
  onSuccess: () => void;
  existingVitals?: VitalsRecord[];
}

const FIELDS = [
  { key: 'systolic', label: 'Systolic BP', unit: 'mmHg', placeholder: '120' },
  { key: 'diastolic', label: 'Diastolic BP', unit: 'mmHg', placeholder: '80' },
  { key: 'heartRate', label: 'Heart Rate', unit: 'bpm', placeholder: '72' },
  { key: 'temperature', label: 'Temperature', unit: 'Ã‚Â°C', placeholder: '36.6' },
  { key: 'oxygenSaturation', label: 'SpO2', unit: '%', placeholder: '98' },
  { key: 'bloodSugar', label: 'Blood Sugar (optional)', unit: 'mg/dL', placeholder: '' },
] as const;

type VitalsForm = { [K in typeof FIELDS[number]['key']]: string };

export const VitalsForm: React.FC<VitalsFormProps> = ({ visitId, onSuccess, existingVitals }) => {
  const latest = existingVitals?.[0];
  const [form, setForm] = useState<VitalsForm>({
    systolic: latest?.systolic?.toString() || '',
    diastolic: latest?.diastolic?.toString() || '',
    heartRate: latest?.heartRate?.toString() || '',
    temperature: latest?.temperature?.toString() || '',
    oxygenSaturation: latest?.oxygenSaturation?.toString() || '',
    bloodSugar: latest?.bloodSugar?.toString() || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const submitVitals = useSubmitVitals();

  const handleSubmit = async () => {
    const parsed = {
      systolic: Number(form.systolic),
      diastolic: Number(form.diastolic),
      heartRate: Number(form.heartRate),
      temperature: Number(form.temperature),
      oxygenSaturation: Number(form.oxygenSaturation),
      bloodSugar: form.bloodSugar ? Number(form.bloodSugar) : undefined,
    };

    const result = vitalsSchema.safeParse(parsed);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((e) => {
        const field = e.path[0]?.toString();
        if (field) fieldErrors[field] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    try {
      await submitVitals.mutateAsync({ visitId, data: result.data });
      onSuccess();
      setTimeout(() => {
        if (Platform.OS === 'web') {
          alert('âœ… Vitals Saved');
        } else {
          Alert.alert('âœ… Vitals Saved', 'Patient vitals have been recorded.');
        }
      }, 100);
    } catch (err: any) {
      if (Platform.OS === 'web') alert('Error: ' + (err.message || 'Failed to submit vitals.')); else Alert.alert('Error', err.message || 'Failed to submit vitals.');
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>Ã°Å¸Â©Âº Record Vitals</Text>
        <Divider style={styles.divider} />
        {FIELDS.map((f) => (
          <View key={f.key} style={styles.fieldRow}>
            <Text style={styles.label}>{f.label} <Text style={styles.unit}>({f.unit})</Text></Text>
            <TextInput
              style={[styles.input, errors[f.key] ? styles.inputError : null]}
              value={form[f.key]}
              onChangeText={(v) => setForm((prev) => ({ ...prev, [f.key]: v }))}
              keyboardType="numeric"
              placeholder={f.placeholder}
              placeholderTextColor="#6B8E8A"
            />
            {errors[f.key] && <Text style={styles.errorText}>{errors[f.key]}</Text>}
          </View>
        ))}
        <Button
          mode="contained"
          buttonColor="#3B82F6"
          textColor="#FFFFFF"
          onPress={handleSubmit}
          loading={submitVitals.isPending}
          disabled={submitVitals.isPending}
          style={{ marginTop: 8, borderRadius: RADIUS.md }}
          labelStyle={{ fontWeight: '700' }}
        >
          Submit Vitals
        </Button>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#0A2D28', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.15)', marginBottom: SPACING.lg },
  title: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  divider: { backgroundColor: 'rgba(0, 230, 118, 0.1)', marginVertical: 12 },
  fieldRow: { marginBottom: 12 },
  label: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  unit: { color: '#94A3B8', fontWeight: '400' },
  input: { backgroundColor: '#051815', color: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.2)', padding: 10, borderRadius: RADIUS.md, fontSize: 14 },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 11, marginTop: 2 },
});


