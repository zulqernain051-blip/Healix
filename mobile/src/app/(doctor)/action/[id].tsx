import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { Card, Button, Text, Divider, Portal, Dialog } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { navigate, goBack } from '../../../utils/navigation';
import { useCaseReview, useResolveCase } from '../../../hooks/useDoctor';
import { DiagnosisForm } from '../../../components/doctor/DiagnosisForm';
import { PrescriptionForm } from '../../../components/doctor/PrescriptionForm';
import { FollowUpForm } from '../../../components/doctor/FollowUpForm';
import { CarePlanForm } from '../../../components/doctor/CarePlanForm';

const COLORS = {
  bg: '#0A1628', card: '#111D35', border: '#1E2D4A', teal: '#0D9488',
  emerald: '#10B981', amber: '#F59E0B', blue: '#3B82F6', red: '#EF4444',
  textPrimary: '#F1F5F9', textSecondary: '#94A3B8', textMuted: '#475569'
};

export default function DoctorActionScreen() {
  const { id, form } = useLocalSearchParams();
  const caseId = id as string;
  const initialForm = (form as string) || 'NONE';

  const { data: caseReview, isLoading } = useCaseReview(caseId);
  const { mutateAsync: resolveCase, isPending: isResolving } = useResolveCase();

  // Map the form query param to the correct form state
  const getInitialForm = () => {
    switch (initialForm) {
      case 'DIAGNOSIS': return 'DIAGNOSIS' as const;
      case 'PRESCRIPTION': return 'PRESCRIPTION' as const;
      case 'FOLLOWUP': return 'FOLLOWUP' as const;
      case 'CAREPLAN': return 'CAREPLAN' as const;
      case 'DECISION': return 'DECISION' as const;
      default: return 'NONE' as const;
    }
  };

  const [activeForm, setActiveForm] = useState<'NONE' | 'DIAGNOSIS' | 'PRESCRIPTION' | 'FOLLOWUP' | 'CAREPLAN' | 'DECISION'>(getInitialForm());
  const [showResolveDialog, setShowResolveDialog] = useState(false);

  if (isLoading || !caseReview) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.teal} />
      </View>
    );
  }

  const handleResolve = async () => {
    try {
      await resolveCase({ caseId });
      setShowResolveDialog(false);
      if (Platform.OS === 'web') {
        alert('You have successfully resolved this clinical case.');
        navigate('/(doctor)/home');
      } else {
        Alert.alert('Case Resolved', 'You have successfully resolved this clinical case.', [
          { text: 'OK', onPress: () => navigate('/(doctor)/home') }
        ]);
      }
    } catch (err: any) {
      if (Platform.OS === 'web') alert('Error: ' + (err.response?.data?.message || err.message || 'Failed to resolve case'));
      else Alert.alert('Error', err.response?.data?.message || err.message || 'Failed to resolve case');
    }
  };

  const patientName = caseReview.case.visit?.request?.patient?.user?.fullName || 'Unknown Patient';
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button icon="arrow-left" labelStyle={{ color: COLORS.teal }} onPress={() => goBack()}>Back</Button>
        <Text style={styles.headerTitle}>Clinical Actions</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Case Summary */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Case Summary</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Patient:</Text>
              <Text style={styles.value}>{patientName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Risk Tier:</Text>
              <Text style={[styles.value, { color: COLORS.amber }]}>{caseReview.case.riskTier}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Status:</Text>
              <Text style={styles.value}>{caseReview.case.status}</Text>
            </View>
          </Card.Content>
        </Card>

        <Text style={styles.sectionTitle}>Available Actions</Text>

        {activeForm === 'NONE' && (
          <View style={styles.actionGrid}>
            <Button 
              mode="outlined" 
              icon="stethoscope" 
              style={styles.actionBtn} 
              textColor={COLORS.teal} 
              onPress={() => setActiveForm('DIAGNOSIS')}
            >
              Add Diagnosis
            </Button>
            
            <Button 
              mode="outlined" 
              icon="pill" 
              style={styles.actionBtn} 
              textColor={COLORS.teal} 
              onPress={() => setActiveForm('PRESCRIPTION')}
            >
              Add Prescription
            </Button>
            
            <Button 
              mode="outlined" 
              icon="clipboard-pulse" 
              style={styles.actionBtn} 
              textColor={COLORS.teal} 
              onPress={() => setActiveForm('CAREPLAN')}
            >
              Create Care Plan
            </Button>

            <Button 
              mode="outlined" 
              icon="calendar-plus" 
              style={styles.actionBtn} 
              textColor={COLORS.teal} 
              onPress={() => setActiveForm('FOLLOWUP')}
            >
              Schedule Follow-up
            </Button>
            </View>
        )}

        {/* Dynamic Forms */}
        {activeForm === 'DIAGNOSIS' && (
          <DiagnosisForm 
            caseId={caseId} 
            onComplete={() => setActiveForm('NONE')} 
            onCancel={() => setActiveForm('NONE')} 
          />
        )}

        {activeForm === 'FOLLOWUP' && (
          <FollowUpForm 
            caseId={caseId} 
            hasCurrentNurse={false}
            onComplete={() => setActiveForm('NONE')} 
            onCancel={() => setActiveForm('NONE')} 
          />
        )}
  

        {activeForm === 'PRESCRIPTION' && (
          <PrescriptionForm 
            caseId={caseId} 
            onComplete={() => setActiveForm('NONE')} 
            onCancel={() => setActiveForm('NONE')} 
          />
        )}

        {activeForm === 'CAREPLAN' && (
          <CarePlanForm 
            caseId={caseId} 
            onComplete={() => setActiveForm('NONE')} 
            onCancel={() => setActiveForm('NONE')} 
          />
        )}

        {activeForm === 'DECISION' && (
          <Card style={{ backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, marginBottom: 16 }}>
            <Card.Content>
              <Text style={{ color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Final Clinical Decision</Text>
              <Text style={{ color: COLORS.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: 16 }}>
                Once you have completed all diagnoses, prescriptions, and care plans, use the "Resolve Case" button below to close this case from your active queue.
              </Text>
              <Button mode="contained" buttonColor={COLORS.emerald} onPress={() => setShowResolveDialog(true)}>
                Resolve Case
              </Button>
              <Button mode="text" onPress={() => setActiveForm('NONE')} textColor={COLORS.textSecondary} style={{ marginTop: 8 }}>
                Back to Actions
              </Button>
            </Card.Content>
          </Card>
        )}

        {activeForm === 'NONE' && (
          <View style={styles.resolveSection}>
            <Divider style={styles.divider} />
            <Text style={styles.helperText}>
              Once you have finished adding diagnoses, prescriptions, or care plans, resolve the case to remove it from your active queue.
            </Text>
            <Button 
              mode="contained" 
              buttonColor={COLORS.emerald} 
              style={styles.resolveBtn}
              onPress={() => setShowResolveDialog(true)}
            >
              Resolve Case
            </Button>
          </View>
        )}

      </ScrollView>

      {/* Confirmation Dialog */}
      <Portal>
        <Dialog visible={showResolveDialog} onDismiss={() => setShowResolveDialog(false)} style={{ backgroundColor: COLORS.card }}>
          <Dialog.Title style={{ color: COLORS.textPrimary }}>Resolve Clinical Case?</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: COLORS.textSecondary }}>
              You have completed your review and clinical actions.
              Resolving this case will remove it from your active queue.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowResolveDialog(false)} textColor={COLORS.textSecondary} disabled={isResolving}>Cancel</Button>
            <Button onPress={handleResolve} textColor={COLORS.emerald} loading={isResolving} disabled={isResolving}>Resolve Case</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { color: COLORS.textSecondary, fontSize: 14 },
  value: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '500' },
  actionGrid: { gap: 12, marginBottom: 24 },
  actionBtn: { borderColor: COLORS.teal, borderWidth: 1, paddingVertical: 4 },
  resolveSection: { marginTop: 16 },
  divider: { backgroundColor: COLORS.border, marginBottom: 16 },
  helperText: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center', marginBottom: 16 },
  resolveBtn: { paddingVertical: 6 }
});
