import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, TextInput, Button, Divider, List } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCaseReview, useSubmitDiagnosis } from '../../../hooks/useDoctor';

const COLORS = {
  bg: '#0A1628',
  card: '#111D35',
  border: '#1E2D4A',
  teal: '#0D9488',
  emerald: '#10B981',
  amber: '#F59E0B',
  blue: '#3B82F6',
  red: '#EF4444',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#475569'
};

export default function DiagnosisScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Case ID
  const caseId = id as string;

  const { data: selectedCaseReview } = useCaseReview(caseId);
  const { mutateAsync: submitDiagnosis } = useSubmitDiagnosis();

  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const diagnosesHistory = selectedCaseReview?.case?.visit?.request?.patient?.diagnoses || [];

  const handleSelectCorrection = (diag: any) => {
    setCode(diag.code);
    setDescription(diag.description);
    setNotes(`[Correction of version ${diag.version}] `);
    setParentId(diag.id);
    Alert.alert('Correction Mode Active', `Correcting Diagnosis: ${diag.code}. A new versioned audit entry will be generated.`);
  };

  const handleClearCorrection = () => {
    setCode('');
    setDescription('');
    setNotes('');
    setParentId(undefined);
  };

  const handleSubmit = async () => {
    if (!caseId) return;
    if (code.trim().length === 0 || description.trim().length === 0) {
      Alert.alert('Validation Error', 'ICD Code and Description are required.');
      return;
    }

    setSubmitting(true);
    try {
      await submitDiagnosis({
        caseId,
        data: {
          code: code.trim(),
          description: description.trim(),
          notes: notes.trim() || undefined,
          parentId
        }
      });
      Alert.alert('Success', parentId ? 'Correction version saved!' : 'Diagnosis appended to medical history');
      handleClearCorrection();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>🔬 Diagnosis Management</Text>
        <Text style={styles.subtitle}>Log ICD-10 diagnoses or issue versioned audit corrections</Text>
      </View>

      {/* Entry Form Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>
            {parentId ? '✍️ Edit Correction Entry' : '➕ Add Diagnosis Entry'}
          </Text>
          <Divider style={styles.divider} />

          {parentId && (
            <View style={styles.correctionBanner}>
              <Text style={{ color: COLORS.amber, fontSize: 12, fontWeight: '700' }}>
                Mode: AUDIT CORRECTION (Version correction)
              </Text>
              <Button compact mode="text" textColor={COLORS.red} onPress={handleClearCorrection}>
                Cancel Correction Mode
              </Button>
            </View>
          )}

          <TextInput
            label="ICD-10 Code"
            value={code}
            onChangeText={setCode}
            placeholder="e.g. I10 (Essential Hypertension)"
            mode="outlined"
            activeOutlineColor={COLORS.teal}
            style={styles.input}
          />

          <TextInput
            label="Diagnosis description"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            activeOutlineColor={COLORS.teal}
            style={styles.input}
          />

          <TextInput
            label="Clinical findings / Qualitative remarks (Optional)"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            activeOutlineColor={COLORS.teal}
            style={styles.input}
            multiline
            numberOfLines={3}
          />

          <Button
            mode="contained"
            buttonColor={COLORS.emerald}
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting || code.trim().length === 0 || description.trim().length === 0}
            style={{ marginTop: 12 }}
          >
            {parentId ? 'Issue Versioned Correction' : 'Append Diagnosis'}
          </Button>
        </Card.Content>
      </Card>

      {/* History timeline card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>📜 Audit Timeline History</Text>
          <Divider style={styles.divider} />

          {diagnosesHistory.length === 0 ? (
            <Text style={styles.emptyText}>No diagnoses logged yet.</Text>
          ) : (
            diagnosesHistory.map((diag: any) => (
              <List.Item
                key={diag.id}
                title={`${diag.code} - ${diag.description}`}
                titleStyle={{ color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' }}
                description={`Version: ${diag.version} | Notes: ${diag.notes || 'None'}\nLogged: ${new Date(diag.diagnosedAt).toLocaleDateString()}`}
                descriptionStyle={{ color: COLORS.textSecondary, fontSize: 12, lineHeight: 18 }}
                right={(props) => (
                  <Button
                    compact
                    mode="outlined"
                    textColor={COLORS.teal}
                    style={{ alignSelf: 'center', borderColor: COLORS.border }}
                    onPress={() => handleSelectCorrection(diag)}
                  >
                    Correct
                  </Button>
                )}
                style={styles.historyRow}
              />
            ))
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  title: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '700' },
  subtitle: { color: COLORS.textSecondary, fontSize: 13, marginTop: 4 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 20 },
  cardTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  divider: { backgroundColor: COLORS.border, marginVertical: 10 },
  input: { backgroundColor: COLORS.card, color: COLORS.textPrimary, marginBottom: 12 },
  correctionBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F59E0B1A', padding: 8, borderRadius: 6, marginBottom: 12 },
  emptyText: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', marginVertical: 12 },
  historyRow: { borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingVertical: 8 }
});
