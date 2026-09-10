import React from 'react';
import { SafeAreaView, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { PatientMedicalSummaryCard } from '../../../components/nurse/PatientMedicalSummaryCard';
import { usePatientProfile } from '../../../hooks/usePatient';
import { ErrorState } from '../../../components/common/ErrorState';

export default function PatientSummaryScreen() {
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const { data: patientProfile, isLoading, error } = usePatientProfile(patientId || '');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color="#00E676" size="large" />
          <Text style={styles.loadingText}>Loading patient summary...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !patientProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState error={error?.message || "Patient not found"} />
      </SafeAreaView>
    );
  }

  const formattedPatient = {
    patientName: patientProfile.user?.fullName || 'Unknown',
    dob: patientProfile.dateOfBirth ? new Date(patientProfile.dateOfBirth).toISOString().split('T')[0] : 'N/A',
    gender: patientProfile.gender || 'N/A',
    allergies: patientProfile.allergies || [],
    chronicConditions: patientProfile.medicalConditions?.map((c: any) => ({ name: c })) || [],
    emergencyContacts: patientProfile.emergencyContacts || [],
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Patient Summary</Text>
      </View>
      <PatientMedicalSummaryCard patient={formattedPatient} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#061C19' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#0A2D28' },
  title: { color: '#00E676', fontSize: 20, fontWeight: '700' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#94A3B8', marginTop: 10, fontSize: 14 },
});
