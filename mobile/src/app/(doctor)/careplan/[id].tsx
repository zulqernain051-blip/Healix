import { appAlert } from '../../../components/common/AppDialogs';
import { localDateTime } from '../../../utils/dates';
import { COLORS } from '../../../theme';
import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TextInput, Switch, TouchableOpacity } from 'react-native';
import { Button, Card, Divider } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { goBack } from '../../../utils/navigation';
import { useSubmitCarePlan, useCaseReview } from '../../../hooks/useDoctor';


export default function CreateCarePlanScreen() {
  const { id } = useLocalSearchParams(); // CaseAssignment ID
  const caseId = id as string;

  const review = useCaseReview(caseId);
  const canEdit = !!review.data?.case.doctorId && ['ASSIGNED', 'IN_REVIEW'].includes(review.data.case.status);
  const { mutateAsync: submitCarePlan } = useSubmitCarePlan();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [milestones, setMilestones] = useState([{ title: '', targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }]);

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
    if (!canEdit) return;
    if (!title) {
      appAlert('Validation Error', 'Care Plan title is required.');
      return;
    }
    const validMilestones = milestones.filter(m => m.title.trim() !== '');
    if (validMilestones.length === 0) {
      appAlert('Validation Error', 'At least one milestone is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await submitCarePlan({
        caseId,
        data: {
          title,
          description,
          milestones: validMilestones.map(m => { const date = localDateTime(m.targetDate); if (!date) throw new Error('Choose a valid milestone date (YYYY-MM-DD).'); return { title: m.title.trim(), targetDate: date.toISOString() }; })
        }
      });

      appAlert('Success', 'Care Plan has been created.', [
        { text: 'OK', onPress: () => goBack() }
      ]);
    } catch (err: any) {
      appAlert('Error', err.response?.data?.message || err.message || 'Failed to submit care plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button icon="arrow-left" labelStyle={{ color: COLORS.navy }} onPress={() => goBack()}>Back</Button>
        <Text style={styles.headerTitle}>Create Care Plan</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={{ paddingBottom: 40 }}>
        {review.isLoading && <Text style={styles.label}>Loading case...</Text>}
        {review.error && <View><Text style={styles.label}>{(review.error as Error).message}</Text><Button onPress={() => void review.refetch()}>Retry</Button></View>}
        {!review.isLoading && !canEdit && <Text style={styles.label}>Care plans require an active case assigned to you.</Text>}
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
                /><Text style={styles.label}>Target date (YYYY-MM-DD)</Text><TextInput style={styles.input} value={milestone.targetDate} onChangeText={targetDate => setMilestones(previous => previous.map((item,i) => i === index ? { ...item,targetDate } : item))} placeholder="YYYY-MM-DD"/>
              </View>
              {milestones.length > 1 && (
                <TouchableOpacity onPress={() => removeMilestone(index)} style={styles.removeBtn}>
                  <Text style={{ color: COLORS.red }}>X</Text>
                </TouchableOpacity>
              )}
            </Card.Content>
          </Card>
        ))}

        <Button mode="text" textColor={COLORS.navy} onPress={addMilestone} style={{ alignSelf: 'flex-start' }}>
          + Add Milestone
        </Button>

        <Divider style={{ backgroundColor: COLORS.inputBorder, marginVertical: 20 }} />

        <Text style={styles.helperText}>For nursing follow-up, use Schedule Follow-up in Clinical Actions.</Text>

      </ScrollView>

      <View style={styles.footer}>
        <Button mode="contained" buttonColor={COLORS.navy} onPress={handleSubmit} loading={isSubmitting} disabled={isSubmitting || !canEdit}>
          Create Care Plan
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: COLORS.surfaceCard, borderBottomWidth: 1, borderBottomColor: COLORS.inputBorder },
  headerTitle: { color: COLORS.textDark, fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: 16 },
  sectionTitle: { color: COLORS.textDark, fontSize: 16, fontWeight: '600', marginBottom: 12 },
  card: { backgroundColor: COLORS.surfaceCard, marginBottom: 16, borderColor: COLORS.inputBorder, borderWidth: 1 },
  label: { color: COLORS.textBody, marginBottom: 6, fontSize: 14 },
  input: { backgroundColor: COLORS.surface, color: COLORS.textDark, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.inputBorder, marginBottom: 16 },
  milestoneRow: { flexDirection: 'row', alignItems: 'center' },
  removeBtn: { padding: 12, marginLeft: 8 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  helperText: { color: COLORS.textMuted, fontSize: 12, marginTop: -4 },
  radioGroup: { flexDirection: 'row', marginBottom: 16 },
  radio: { flex: 1, padding: 10, borderWidth: 1, borderColor: COLORS.inputBorder, alignItems: 'center', backgroundColor: COLORS.surface },
  radioActive: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  radioText: { color: COLORS.textBody, fontSize: 12 },
  footer: { padding: 16, backgroundColor: COLORS.surfaceCard, borderTopWidth: 1, borderTopColor: COLORS.inputBorder }
});
