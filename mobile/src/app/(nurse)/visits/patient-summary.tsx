
import { useAppTheme, useThemeValue } from '../../../theme/ThemeProvider';
import type { ThemeColors } from '../../../theme';
import React from 'react';
import { SafeAreaView, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { PatientMedicalSummaryCard } from '../../../components/nurse/PatientMedicalSummaryCard';
import { usePatientProfile } from '../../../hooks/usePatient';
import { ErrorState } from '../../../components/common/ErrorState';

export default function PatientSummaryScreen() {
  const { colors: COLORS } = useAppTheme();
  const styles = useThemeValue(createStyles);

  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const { data: patientProfile, isLoading, error } = usePatientProfile(patientId || '');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.emerald} size="large" />
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
    dob: (patientProfile.dob || patientProfile.dateOfBirth) ? new Date(patientProfile.dob || patientProfile.dateOfBirth!).toISOString().split('T')[0] : 'N/A',
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

const createStyles = (COLORS: ThemeColors) => (StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.inputBorder },
  title: { color: COLORS.emerald, fontSize: 20, fontWeight: '700' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: COLORS.textBody, marginTop: 10, fontSize: 14 },
}));


