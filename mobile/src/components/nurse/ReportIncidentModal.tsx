import React, { useState } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

interface ReportIncidentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (incidentType: string, description: string) => Promise<void>;
  isLoading?: boolean;
}

export const ReportIncidentModal: React.FC<ReportIncidentModalProps> = ({
  visible,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [incidentType, setIncidentType] = useState('PATIENT_DETERIORATION');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    if (!description.trim()) return;
    await onSubmit(incidentType, description.trim());
    setDescription('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>🚨 Report Field Emergency / Incident</Text>
          <Text style={styles.subText}>Logs an emergency incident report immediately alerting Healix Operations & Attending Doctor.</Text>

          <Text style={styles.label}>Incident Type:</Text>
          <View style={styles.typeRow}>
            {[
              { id: 'PATIENT_DETERIORATION', label: 'Patient Deterioration' },
              { id: 'EQUIPMENT_FAILURE', label: 'Equipment Failure' },
              { id: 'SAFETY_CONCERN', label: 'Safety Concern' },
            ].map(item => (
              <TouchableOpacity
                key={item.id}
                style={[styles.typePill, incidentType === item.id && styles.typePillActive]}
                onPress={() => setIncidentType(item.id)}
              >
                <Text style={[styles.typeText, incidentType === item.id && styles.typeTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Description & Immediate Actions Taken:</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Describe what occurred and any immediate care given..."
            placeholderTextColor="#6B8E8A"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={isLoading}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, (!description.trim() || isLoading) && styles.disabledBtn]}
              onPress={handleSubmit}
              disabled={!description.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>Submit Report</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: '#0A2D28',
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  title: {
    color: '#EF4444',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    marginBottom: 4,
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
  typeRow: {
    gap: 6,
    marginBottom: SPACING.md,
  },
  typePill: {
    backgroundColor: '#051815',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  typePillActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#EF4444',
  },
  typeText: {
    color: '#94A3B8',
    fontSize: 11,
  },
  typeTextActive: {
    color: '#EF4444',
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#051815',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: '#FFFFFF',
    fontSize: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
    marginBottom: SPACING.lg,
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
  btnRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  submitBtn: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
