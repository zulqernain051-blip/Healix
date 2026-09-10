import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, TouchableOpacity, Platform } from 'react-native';
import { Text, Button, Card, Divider } from 'react-native-paper';
import { useSubmitSymptoms } from '../../../hooks/useVisits';
import { SymptomSeverity, VisitSymptom } from '../../../types/visit';
import { RADIUS, SPACING } from '../../../theme';

interface SymptomsFormProps {
  visitId: string;
  onSuccess: () => void;
  existingSymptoms?: VisitSymptom[];
}

interface SymptomEntry {
  symptomName: string;
  severity: SymptomSeverity;
  notes: string;
}

const SEVERITY_OPTIONS: SymptomSeverity[] = ['MILD', 'MODERATE', 'SEVERE'];
const SEVERITY_COLORS: Record<SymptomSeverity, string> = {
  MILD: '#F59E0B',
  MODERATE: '#F97316',
  SEVERE: '#EF4444',
};

const emptySymptom = (): SymptomEntry => ({ symptomName: '', severity: 'MILD', notes: '' });

export const SymptomsForm: React.FC<SymptomsFormProps> = ({ visitId, onSuccess, existingSymptoms }) => {
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>(
    existingSymptoms?.map((s) => ({ symptomName: s.symptomName, severity: s.severity, notes: s.notes || '' })) || [emptySymptom()]
  );
  const [error, setError] = useState('');
  const submitSymptoms = useSubmitSymptoms();

  const updateSymptom = (idx: number, updates: Partial<SymptomEntry>) => {
    setSymptoms((prev) => prev.map((s, i) => (i === idx ? { ...s, ...updates } : s)));
  };

  const addSymptom = () => setSymptoms((prev) => [...prev, emptySymptom()]);

  const removeSymptom = (idx: number) => {
    if (symptoms.length <= 1) return;
    setSymptoms((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    const valid = symptoms.filter((s) => s.symptomName.trim().length > 0);
    if (valid.length === 0) {
      setError('At least one symptom must be entered.');
      return;
    }
    setError('');

    try {
      await submitSymptoms.mutateAsync({
        visitId,
        data: {
          symptoms: valid.map((s) => ({
            symptomName: s.symptomName.trim(),
            severity: s.severity,
            notes: s.notes || undefined,
          })),
        },
      });
      onSuccess();
      setTimeout(() => {
        if (Platform.OS === 'web') {
          alert('✅ Symptoms Saved');
        } else {
          Alert.alert('✅ Symptoms Saved', 'Patient symptoms have been recorded.');
        }
      }, 100);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit symptoms.');
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>ðŸ“‹ Symptoms Checklist</Text>
        <Divider style={styles.divider} />
        {symptoms.map((symptom, idx) => (
          <View key={idx} style={styles.symptomBlock}>
            <View style={styles.symptomHeader}>
              <Text style={styles.symptomLabel}>Symptom #{idx + 1}</Text>
              {symptoms.length > 1 && (
                <TouchableOpacity onPress={() => removeSymptom(idx)}>
                  <Text style={styles.removeBtn}>âœ• Remove</Text>
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Symptom name (e.g., Headache)"
              placeholderTextColor="#6B8E8A"
              value={symptom.symptomName}
              onChangeText={(v) => updateSymptom(idx, { symptomName: v })}
            />
            <View style={styles.severityRow}>
              {SEVERITY_OPTIONS.map((sev) => (
                <TouchableOpacity
                  key={sev}
                  style={[styles.severityBtn, symptom.severity === sev && { backgroundColor: SEVERITY_COLORS[sev] + '33', borderColor: SEVERITY_COLORS[sev] }]}
                  onPress={() => updateSymptom(idx, { severity: sev })}
                >
                  <Text style={[styles.severityText, symptom.severity === sev && { color: SEVERITY_COLORS[sev] }]}>{sev}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.input, { minHeight: 40 }]}
              placeholder="Notes (optional)"
              placeholderTextColor="#6B8E8A"
              value={symptom.notes}
              onChangeText={(v) => updateSymptom(idx, { notes: v })}
            />
          </View>
        ))}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Button mode="text" textColor="#00E676" onPress={addSymptom} labelStyle={{ fontWeight: '600' }}>
          + Add Another Symptom
        </Button>
        <Button
          mode="contained"
          buttonColor="#10B981"
          textColor="#FFFFFF"
          onPress={handleSubmit}
          loading={submitSymptoms.isPending}
          disabled={submitSymptoms.isPending}
          style={{ marginTop: 8, borderRadius: RADIUS.md }}
          labelStyle={{ fontWeight: '700' }}
        >
          Submit Symptoms
        </Button>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#0A2D28', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.15)', marginBottom: SPACING.lg },
  title: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  divider: { backgroundColor: 'rgba(0, 230, 118, 0.1)', marginVertical: 12 },
  symptomBlock: { marginBottom: 16, padding: 12, backgroundColor: '#051815', borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.1)' },
  symptomHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  symptomLabel: { color: '#00E676', fontSize: 12, fontWeight: '700' },
  removeBtn: { color: '#EF4444', fontSize: 12, fontWeight: '600' },
  input: { backgroundColor: '#0A2D28', color: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.2)', padding: 10, borderRadius: RADIUS.sm, fontSize: 13, marginBottom: 8 },
  severityRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  severityBtn: { flex: 1, paddingVertical: 6, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: '#333', alignItems: 'center' },
  severityText: { fontSize: 11, fontWeight: '700', color: '#94A3B8' },
  errorText: { color: '#EF4444', fontSize: 12, marginBottom: 8 },
});

