import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, TouchableOpacity, Platform } from 'react-native';
import { Text, Button, Card, Divider } from 'react-native-paper';
import { useSubmitClinicalRemarks } from '../../../hooks/useVisits';
import { clinicalRemarkSchema, ClinicalRemark } from '../../../types/visit';
import { RADIUS, SPACING } from '../../../theme';

interface ClinicalRemarksFormProps {
  visitId: string;
  onSuccess: () => void;
  existingRemark?: ClinicalRemark;
}

export const ClinicalRemarksForm: React.FC<ClinicalRemarksFormProps> = ({ visitId, onSuccess, existingRemark }) => {
  const [remarksText, setRemarksText] = useState(existingRemark?.remarksText || '');
  const [confidenceLevel, setConfidenceLevel] = useState(existingRemark?.confidenceLevel || 3);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const submitRemarks = useSubmitClinicalRemarks();

  const handleSubmit = async () => {
    const result = clinicalRemarkSchema.safeParse({ remarksText, confidenceLevel });
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
      await submitRemarks.mutateAsync({ visitId, data: result.data });
      onSuccess();
      setTimeout(() => {
        if (Platform.OS === 'web') {
          alert('✅ Remarks Saved');
        } else {
          Alert.alert('✅ Remarks Saved', 'Clinical remarks have been submitted.');
        }
      }, 100);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit clinical remarks.');
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>📝 Clinical Remarks</Text>
        <Divider style={styles.divider} />

        <Text style={styles.label}>Remarks</Text>
        <TextInput
          style={[styles.textArea, errors.remarksText ? styles.inputError : null]}
          placeholder="Enter your clinical observations (min 10 characters)..."
          placeholderTextColor="#6B8E8A"
          value={remarksText}
          onChangeText={setRemarksText}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
        {errors.remarksText && <Text style={styles.errorText}>{errors.remarksText}</Text>}

        <Text style={[styles.label, { marginTop: 12 }]}>Confidence Level</Text>
        <View style={styles.confidenceRow}>
          {[1, 2, 3, 4, 5].map((level) => (
            <TouchableOpacity
              key={level}
              style={[styles.confidenceBtn, confidenceLevel === level && styles.confidenceBtnActive]}
              onPress={() => setConfidenceLevel(level)}
            >
              <Text style={[styles.confidenceText, confidenceLevel === level && styles.confidenceTextActive]}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.confidenceLabelRow}>
          <Text style={styles.confidenceHelper}>Low</Text>
          <Text style={styles.confidenceHelper}>High</Text>
        </View>
        {errors.confidenceLevel && <Text style={styles.errorText}>{errors.confidenceLevel}</Text>}

        <Button
          mode="contained"
          buttonColor="#8B5CF6"
          textColor="#FFFFFF"
          onPress={handleSubmit}
          loading={submitRemarks.isPending}
          disabled={submitRemarks.isPending}
          style={{ marginTop: 16, borderRadius: RADIUS.md }}
          labelStyle={{ fontWeight: '700' }}
        >
          Submit Remarks
        </Button>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#0A2D28', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.15)', marginBottom: SPACING.lg },
  title: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  divider: { backgroundColor: 'rgba(0, 230, 118, 0.1)', marginVertical: 12 },
  label: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  textArea: { backgroundColor: '#051815', color: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.2)', padding: 12, borderRadius: RADIUS.md, fontSize: 13, minHeight: 120 },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 11, marginTop: 4 },
  confidenceRow: { flexDirection: 'row', gap: 8 },
  confidenceBtn: { flex: 1, paddingVertical: 10, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: '#333', alignItems: 'center', backgroundColor: '#051815' },
  confidenceBtnActive: { borderColor: '#8B5CF6', backgroundColor: 'rgba(139, 92, 246, 0.2)' },
  confidenceText: { color: '#94A3B8', fontSize: 14, fontWeight: '700' },
  confidenceTextActive: { color: '#8B5CF6' },
  confidenceLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  confidenceHelper: { color: '#6B8E8A', fontSize: 11 },
});
