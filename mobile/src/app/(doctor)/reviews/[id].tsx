import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert, TextInput, TouchableOpacity } from 'react-native';
import { Card, Button, Divider, List, Chip } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { navigate } from '../../../utils/navigation';
import { useCaseReview, useConsultationDoctors, useStartCaseReview, useRequestSecondOpinion, useSubmitAiFeedback } from '../../../hooks/useDoctor';

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

import { useComplianceMetrics } from '../../../hooks/useClinical';

export default function CaseReviewScreen() {

  const { id } = useLocalSearchParams(); // CaseAssignment ID
  const caseId = id as string;

  const { data: selectedCaseReview, isLoading } = useCaseReview(caseId);
  const patientId = selectedCaseReview?.case?.visit?.request?.patient?.id;
  const { data: complianceData } = useComplianceMetrics(patientId || '');
  const compliance = complianceData?.data;

  const { data: consultationDoctors = [] } = useConsultationDoctors();
  const { mutateAsync: acceptCase } = useStartCaseReview();
  const { mutateAsync: requestSecondOpinion } = useRequestSecondOpinion();
  const { mutateAsync: submitAiFeedback } = useSubmitAiFeedback();

  const [aiFeedback, setAiFeedback] = useState('');
  const [showOpinionModal, setShowOpinionModal] = useState(false);

  const handleAccept = async () => {
    if (!caseId) return;
    try {
      await acceptCase(caseId);
      Alert.alert('Accepted', 'You have accepted ownership of this case.');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleConsultOpinion = async (docId: string) => {
    if (!caseId) return;
    try {
      await requestSecondOpinion({ caseId, consultedDoctorId: docId });
      Alert.alert('Consultation Opened', 'Second opinion request has been successfully dispatched.');
      setShowOpinionModal(false);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleFlagAi = async () => {
    if (!caseId || aiFeedback.trim().length < 5) return;
    try {
      await submitAiFeedback({ caseId, data: { targetType: 'SUMMARY', comment: aiFeedback.trim() } });
      Alert.alert('Feedback Recorded', 'AI advisory metrics flagged. Feedback sent to model training evaluation logs.');
      setAiFeedback('');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  if (isLoading && !selectedCaseReview) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.teal} />
        <Text style={styles.loadingText}>Fetching consolidated case file...</Text>
      </View>
    );
  }

  if (!selectedCaseReview) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Case details not found.</Text>
      </View>
    );
  }

  const { case: caseData, clinicalData, aiInsights } = selectedCaseReview;
  const patient = caseData.visit.request.patient;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📂 Consolidated Case File</Text>
        <Text style={styles.subtitle}>Escalated Case: {patient.user.fullName}</Text>
      </View>

      {/* Case Locker status / accept */}
      {(caseData.status === 'PENDING' || caseData.status === 'PROFESSIONAL_BROADCAST' || caseData.status === 'GENERAL_BROADCAST' || caseData.status === 'ADMIN_ESCALATED') ? (
        <Card style={[styles.card, { borderColor: COLORS.amber, borderWidth: 1 }]}>
          <Card.Content>
            <Text style={styles.warningTitle}>⚠️ Pending Case Ownership</Text>
            <Text style={styles.warningDesc}>
              This case is in the broadcast pool. Accept it to gain edit lock privileges and access diagnosis/prescribing tools.
            </Text>
            <Button mode="contained" buttonColor={COLORS.amber} onPress={handleAccept} style={{ marginTop: 12 }}>
              Accept Case Assignment
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <Card style={[styles.card, { borderColor: COLORS.emerald, borderWidth: 1 }]}>
          <Card.Content>
            <Text style={styles.emeraldTitle}>✓ Case Locked to You</Text>
            <Text style={styles.warningDesc}>
              You have active ownership of this case. You can diagnose, treatment plan, and prescribe.
            </Text>
            
            <Divider style={styles.divider} />
            <Text style={styles.label}>Clinical Tools Menu</Text>
            
            <View style={styles.toolsGrid}>
              <Button
                mode="contained"
                buttonColor={COLORS.blue}
                onPress={() => navigate(`/(doctor)/action/${id}`, { form: 'DIAGNOSIS' })}
                style={styles.toolBtn}
              >
                ICD Diagnoses
              </Button>
              
              <Button
                mode="contained"
                buttonColor={COLORS.teal}
                onPress={() => navigate(`/(doctor)/action/${id}`, { form: 'CAREPLAN' })}
                style={styles.toolBtn}
              >
                Care Plans
              </Button>
            </View>

            <View style={styles.toolsGrid}>
              <Button
                mode="contained"
                buttonColor={COLORS.emerald}
                onPress={() => navigate(`/(doctor)/action/${id}`, { form: 'PRESCRIPTION' })}
                style={styles.toolBtn}
              >
                Prescriptions
              </Button>

              <Button
                mode="contained"
                buttonColor={COLORS.red}
                onPress={() => navigate(`/(doctor)/action/${id}`, { form: 'DECISION' })}
                style={styles.toolBtn}
              >
                Final Decision
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {compliance && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionHeader}>📈 Patient Adherence & Compliance</Text>
            <Divider style={styles.divider} />
            <View style={styles.complianceRow}>
              <View style={styles.complianceCol}>
                <Text style={styles.complianceLabel}>Visit Compliance (30 Days):</Text>
                <Text style={[styles.complianceValue, { color: compliance.complianceFlag === 'AT_RISK' ? COLORS.red : COLORS.emerald }]}>
                  {compliance.visitCompliance}% ({compliance.complianceFlag === 'AT_RISK' ? 'At Risk' : 'On Track'})
                </Text>
              </View>
              <View style={styles.complianceCol}>
                <Text style={styles.complianceLabel}>Medication Log Compliance:</Text>
                <Text style={styles.complianceValue}>
                  {compliance.medicationCompliance}% {compliance.trend === 'UP' ? '📈' : compliance.trend === 'STABLE' ? '➡️' : '📉'}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Vitals records */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionHeader}>🩺 physiological Vitals Trend</Text>
          <Divider style={styles.divider} />
          {clinicalData.vitals.length === 0 ? (
            <Text style={styles.emptyText}>No vitals recorded.</Text>
          ) : (
            clinicalData.vitals.map((v: any, index: number) => (
              <View key={v.id} style={styles.vitalsItem}>
                <Text style={styles.vitalsTime}>Reading #{clinicalData.vitals.length - index}</Text>
                <Text style={styles.vitalsText}>
                  BP: {v.systolic}/{v.diastolic} mmHg | HR: {v.heartRate} bpm | Temp: {v.temperature}°C | SpO2: {v.oxygenSaturation}%
                </Text>
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      {/* Symptoms Checklist */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionHeader}>🤒 Symptoms Checklist</Text>
          <Divider style={styles.divider} />
          {clinicalData.symptoms.length === 0 ? (
            <Text style={styles.emptyText}>No symptoms selected by nurse.</Text>
          ) : (
            <View style={styles.badgeContainer}>
              {clinicalData.symptoms.map((s: any) => (
                <Chip key={s.id} style={styles.symptomChip} textStyle={{ color: '#FFF', fontSize: 11 }}>
                  {s.symptomName} ({s.severity})
                </Chip>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Nurse Clinical notes */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionHeader}>👩‍⚕️ Nurse Assessment Remarks</Text>
          <Divider style={styles.divider} />
          <Text style={styles.nurseRemarksText}>
            "{clinicalData.nurseRemarks || 'No qualitative remarks provided.'}"
          </Text>
          {clinicalData.nurseConfidence && (
            <Text style={styles.nurseConfidence}>
              Nurse Self-Declared Confidence: {clinicalData.nurseConfidence}/5
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* AI Decision Support (CDSS) Panel */}
      <Card style={[styles.card, { borderColor: COLORS.teal, borderWidth: 1 }]}>
        <Card.Content>
          <View style={styles.aiInsightsHeader}>
            <Text style={styles.aiTitle}>🤖 AI Decision Support (Advisory)</Text>
            <Chip style={{ backgroundColor: COLORS.teal }} textStyle={{ color: '#FFF', fontSize: 9 }}>CDSS</Chip>
          </View>
          <Text style={styles.aiDisclaimer}>{aiInsights.disclaimer}</Text>
          <Divider style={styles.divider} />

          <Text style={styles.aiSubLabel}>Automated Synthesis Summary:</Text>
          <Text style={styles.aiSummary}>{aiInsights.summary}</Text>

          <Text style={styles.aiSubLabel}>Clinical Guideline Recommendations:</Text>
          {aiInsights.recommendations.map((rec, i) => (
            <View key={i} style={styles.recRow}>
              <Text style={styles.recText}>• {rec.text}</Text>
              <Text style={styles.recSource}>Source: {rec.source}</Text>
            </View>
          ))}

          {/* AI Feedback Form */}
          <Divider style={[styles.divider, { marginTop: 16 }]} />
          <Text style={styles.aiFeedbackLabel}>Flag AI Output discrepancy (Log model feedback)</Text>
          <TextInput
            value={aiFeedback}
            onChangeText={setAiFeedback}
            placeholder="Help improve accuracy by commenting on discrepancy..."
            placeholderTextColor={COLORS.textMuted}
            style={styles.feedbackInput}
            multiline
            numberOfLines={2}
          />
          <Button
            mode="outlined"
            textColor={COLORS.red}
            style={{ borderColor: COLORS.red, marginTop: 8 }}
            onPress={handleFlagAi}
            disabled={aiFeedback.trim().length < 5}
          >
            Flag Discrepancy
          </Button>
        </Card.Content>
      </Card>

      {/* Second Opinion / Consultation sections */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionHeader}>🛡️ Peer Consultations (Second Opinion)</Text>
          <Divider style={styles.divider} />
          
          {caseData.secondOpinions.length === 0 ? (
            <Text style={styles.emptyText}>No peer opinions requested yet.</Text>
          ) : (
            caseData.secondOpinions.map((o: any) => (
              <View key={o.id} style={styles.opinionRow}>
                <Text style={styles.opinionDoc}>Consulted: Dr. {o.consultedDoctor.user.fullName}</Text>
                <Text style={[styles.opinionStatus, { color: o.status === 'PENDING' ? COLORS.amber : COLORS.emerald }]}>
                  Status: {o.status}
                </Text>
              </View>
            ))
          )}

          <Button
            mode="outlined"
            textColor={COLORS.teal}
            style={{ borderColor: COLORS.border, marginTop: 12 }}
            onPress={() => setShowOpinionModal(!showOpinionModal)}
          >
            {showOpinionModal ? 'Close List' : '🤝 Consult Verified Peer'}
          </Button>

          {showOpinionModal && (
            <View style={styles.docList}>
              <Text style={styles.label}>Select Doctor to invite:</Text>
              {consultationDoctors.map((doc: any) => (
                <TouchableOpacity
                  key={doc.id}
                  onPress={() => handleConsultOpinion(doc.id)}
                  style={styles.docRow}
                >
                  <Text style={styles.docRowName}>Dr. {doc.user.fullName}</Text>
                  <Text style={styles.docRowInvite}>Invite ➔</Text>
                </TouchableOpacity>
              ))}
            </View>
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
  loadingText: { color: COLORS.textSecondary, marginTop: 12 },
  errorText: { color: COLORS.red, fontSize: 16 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 20 },
  warningTitle: { color: COLORS.amber, fontSize: 15, fontWeight: '700' },
  emeraldTitle: { color: COLORS.emerald, fontSize: 15, fontWeight: '700' },
  warningDesc: { color: COLORS.textSecondary, fontSize: 13, marginTop: 4, lineHeight: 18 },
  divider: { backgroundColor: COLORS.border, marginVertical: 12 },
  label: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  toolsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  toolBtn: { flex: 0.48, borderRadius: 8 },
  sectionHeader: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
  emptyText: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', marginVertical: 8 },
  vitalsItem: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  vitalsTime: { color: COLORS.teal, fontSize: 11, fontWeight: '700' },
  vitalsText: { color: COLORS.textPrimary, fontSize: 13, marginTop: 2 },
  badgeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingVertical: 4 },
  symptomChip: { backgroundColor: '#1E2D4A' },
  nurseRemarksText: { color: COLORS.textPrimary, fontSize: 14, fontStyle: 'italic', lineHeight: 20 },
  nurseConfidence: { color: COLORS.textSecondary, fontSize: 12, marginTop: 8 },
  aiInsightsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  aiTitle: { color: COLORS.teal, fontSize: 15, fontWeight: '700' },
  aiDisclaimer: { color: COLORS.textMuted, fontSize: 11, fontStyle: 'italic', marginTop: 4 },
  aiSubLabel: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700', marginTop: 12 },
  aiSummary: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18, marginTop: 4 },
  recRow: { marginVertical: 6 },
  recText: { color: COLORS.textPrimary, fontSize: 13, lineHeight: 18 },
  recSource: { color: COLORS.textMuted, fontSize: 11, marginLeft: 10, marginTop: 2 },
  aiFeedbackLabel: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 8 },
  feedbackInput: {
    backgroundColor: '#0F1A2C',
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 8,
    borderRadius: 6,
    fontSize: 13,
    textAlignVertical: 'top'
  },
  opinionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  opinionDoc: { color: COLORS.textPrimary, fontSize: 13 },
  opinionStatus: { fontSize: 12, fontWeight: '700' },
  docList: { marginTop: 10 },
  docRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  docRowName: { color: COLORS.textPrimary, fontSize: 13 },
  docRowInvite: { color: COLORS.teal, fontSize: 12, fontWeight: '700' },
  complianceRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  complianceCol: { flex: 0.48 },
  complianceLabel: { color: COLORS.textSecondary, fontSize: 12 },
  complianceValue: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700', marginTop: 4 }
});
