import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

interface ClinicalRemarksFormProps {
  onSubmit: (remarksText: string, confidenceLevel: number) => Promise<void>;
  isLoading?: boolean;
}

export const ClinicalRemarksForm: React.FC<ClinicalRemarksFormProps> = ({ onSubmit, isLoading = false }) => {
  const [remarksText, setRemarksText] = useState('');
  const [confidenceLevel, setConfidenceLevel] = useState<number>(4);

  const handleSubmit = async () => {
    if (remarksText.trim().length < 10) return;
    await onSubmit(remarksText.trim(), confidenceLevel);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Clinical Remarks & AI Risk Trigger (Feature 3.7)</Text>
      <Text style={styles.subText}>
        Enter nurse observations. Submitting remarks triggers automated AI risk scoring & doctor escalation evaluation.
      </Text>

      <Text style={styles.label}>Clinical Remarks (min 10 characters):</Text>
      <TextInput
        style={[styles.input, styles.multilineInput]}
        placeholder="Document patient progress, clinical observations, or physical examination findings..."
        placeholderTextColor="#6B8E8A"
        value={remarksText}
        onChangeText={setRemarksText}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Clinical Assessment Confidence Level (1-5):</Text>
      <View style={styles.confidenceRow}>
        {[1, 2, 3, 4, 5].map(level => (
          <TouchableOpacity
            key={level}
            style={[styles.confPill, confidenceLevel === level && styles.confPillActive]}
            onPress={() => setConfidenceLevel(level)}
          >
            <Text style={[styles.confText, confidenceLevel === level && styles.confTextActive]}>
              {level} {level === 1 ? '(Low)' : level === 5 ? '(High)' : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, (remarksText.trim().length < 10 || isLoading) && styles.disabledBtn]}
        onPress={handleSubmit}
        disabled={remarksText.trim().length < 10 || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#061C19" />
        ) : (
          <Text style={styles.submitBtnText}>Submit Remarks & Trigger AI Assessment ✨</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0A2D28',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    marginBottom: 2,
  },
  subText: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: SPACING.md,
  },
  label: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: SPACING.xs,
  },
  input: {
    backgroundColor: '#051815',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: '#FFFFFF',
    fontSize: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
    marginBottom: SPACING.md,
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
  confidenceRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: SPACING.lg,
  },
  confPill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
    backgroundColor: '#051815',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  confPillActive: {
    backgroundColor: '#00E676',
  },
  confText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },
  confTextActive: {
    color: '#061C19',
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: '#00E676',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#061C19',
    fontSize: 12,
    fontWeight: '700',
  },
});
