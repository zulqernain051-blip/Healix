import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TextInput, Switch, TouchableOpacity } from 'react-native';
import { Button, Card, Divider } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { navigate, goBack } from '../../../utils/navigation';
import { useSubmitCarePlan } from '../../../hooks/useDoctor';

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

export default function CreateCarePlanScreen() {
  const { id } = useLocalSearchParams(); // CaseAssignment ID
  const caseId = id as string;
  
  const { mutateAsync: submitCarePlan } = useSubmitCarePlan();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [milestones, setMilestones] = useState([{ title: '', targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }]);
  
  const [needsNursingCare, setNeedsNursingCare] = useState(false);
  const [frequency, setFrequency] = useState('WEEKLY');
  const [occurrences, setOccurrences] = useState('4');
  const [keepCurrentNurse, setKeepCurrentNurse] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addMilestone = () => {
    setMilestones([...milestones, { title: '', targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }]);
  };

  const updateMilestone = (index: number, value: string) => {
    const newMilestones = [...milestones];
    newMilestones[index].title = value;
    setMilestones(newMilestones);
  };

  const removeMilestone = (index: number) => {
    const newMilestones = [...milestones];
    newMilestones.splice(index, 1);
    setMilestones(newMilestones);
  };

  const handleSubmit = async () => {
    if (!title) {
      Alert.alert('Validation Error', 'Care Plan title is required.');
      return;
    }
    const validMilestones = milestones.filter(m => m.title.trim() !== '');
    if (validMilestones.length === 0) {
      Alert.alert('Validation Error', 'At least one milestone is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await submitCarePlan({
        caseId,
        data: {
          title,
          description,
          milestones: validMilestones
        }
      });
      
      Alert.alert('Success', 'Care Plan has been created.', [
        { text: 'OK', onPress: () => goBack() }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Failed to submit care plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button icon="arrow-left" labelStyle={{ color: COLORS.teal }} onPress={() => goBack()}>Back</Button>
        <Text style={styles.headerTitle}>Create Care Plan</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={{ paddingBottom: 40 }}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.label}>Plan Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Hypertension Management"
              placeholderTextColor={COLORS.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Detailed treatment strategy..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </Card.Content>
        </Card>

        <Text style={styles.sectionTitle}>Clinical Milestones</Text>
        {milestones.map((milestone, index) => (
          <Card key={index} style={[styles.card, { marginBottom: 8 }]}>
            <Card.Content style={styles.milestoneRow}>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={[styles.input, { marginBottom: 0 }]}
                  placeholder="e.g. Blood pressure stabilized below 130/80"
                  placeholderTextColor={COLORS.textMuted}
                  value={milestone.title}
                  onChangeText={(val) => updateMilestone(index, val)}
                />
              </View>
              {milestones.length > 1 && (
                <TouchableOpacity onPress={() => removeMilestone(index)} style={styles.removeBtn}>
                  <Text style={{ color: COLORS.red }}>X</Text>
                </TouchableOpacity>
              )}
            </Card.Content>
          </Card>
        ))}

        <Button mode="text" textColor={COLORS.teal} onPress={addMilestone} style={{ alignSelf: 'flex-start' }}>
          + Add Milestone
        </Button>

        <Divider style={{ backgroundColor: COLORS.border, marginVertical: 20 }} />

        <View style={styles.toggleRow}>
          <Text style={styles.sectionTitle}>Requires Nursing Care</Text>
          <Switch
            value={needsNursingCare}
            onValueChange={setNeedsNursingCare}
            trackColor={{ false: COLORS.border, true: COLORS.teal }}
          />
        </View>

        {needsNursingCare && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.label}>Frequency</Text>
              <View style={styles.radioGroup}>
                {['DAILY', 'WEEKLY', 'BIWEEKLY'].map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    style={[styles.radio, frequency === freq && styles.radioActive]}
                    onPress={() => setFrequency(freq)}
                  >
                    <Text style={[styles.radioText, frequency === freq && { color: '#FFF' }]}>{freq}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Occurrences (Duration)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 4"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                value={occurrences}
                onChangeText={setOccurrences}
              />

              <View style={styles.toggleRow}>
                <Text style={styles.label}>Keep Current Nurse (if valid)</Text>
                <Switch
                  value={keepCurrentNurse}
                  onValueChange={setKeepCurrentNurse}
                  trackColor={{ false: COLORS.border, true: COLORS.teal }}
                />
              </View>
              <Text style={styles.helperText}>If unchecked or unavailable, this will go to the general marketplace.</Text>
            </Card.Content>
          </Card>
        )}

      </ScrollView>

      <View style={styles.footer}>
        <Button mode="contained" buttonColor={COLORS.teal} onPress={handleSubmit} loading={isSubmitting} disabled={isSubmitting}>
          Create Care Plan
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: 16 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 12 },
  card: { backgroundColor: COLORS.card, marginBottom: 16, borderColor: COLORS.border, borderWidth: 1 },
  label: { color: COLORS.textSecondary, marginBottom: 6, fontSize: 14 },
  input: { backgroundColor: COLORS.bg, color: COLORS.textPrimary, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  milestoneRow: { flexDirection: 'row', alignItems: 'center' },
  removeBtn: { padding: 12, marginLeft: 8 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  helperText: { color: COLORS.textMuted, fontSize: 12, marginTop: -4 },
  radioGroup: { flexDirection: 'row', marginBottom: 16 },
  radio: { flex: 1, padding: 10, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', backgroundColor: COLORS.bg },
  radioActive: { backgroundColor: COLORS.teal, borderColor: COLORS.teal },
  radioText: { color: COLORS.textSecondary, fontSize: 12 },
  footer: { padding: 16, backgroundColor: COLORS.card, borderTopWidth: 1, borderTopColor: COLORS.border }
});
