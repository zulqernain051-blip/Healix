
import { useAppTheme, useThemeValue } from '../../../theme/ThemeProvider';
import type { ThemeColors } from '../../../theme';
import React from 'react';
import { SafeAreaView, StyleSheet, View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { Card, Divider } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { usePrescriptions } from '../../../hooks/useHealth';
import { ErrorState } from '../../../components/common/ErrorState';
import { EmptyState } from '../../../components/common/EmptyState';

export default function PrescriptionViewScreen() {
  const { colors: COLORS } = useAppTheme();
  const styles = useThemeValue(createStyles);

  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const { data: prescriptions, isLoading, error } = usePrescriptions(patientId || '');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.emerald} size="large" />
          <Text style={styles.loadingText}>Loading prescriptions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState error={error?.message || "Failed to load prescriptions"} />
      </SafeAreaView>
    );
  }

  if (!prescriptions || prescriptions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Prescriptions</Text>
        </View>
        <EmptyState title="No Prescriptions" subtitle="This patient doesn't have any prescriptions." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Prescriptions</Text>
        </View>
        {prescriptions.map((prescription: any) => (
          <Card key={prescription.id} style={styles.card}>
            <Card.Content>
              <Text style={styles.section}>Doctor: {prescription.doctorId || 'Unknown'}</Text>
              <Text style={styles.section}>Date: {new Date(prescription.issuedAt).toLocaleDateString()}</Text>
              <Divider style={styles.divider} />
              <Text style={styles.sectionHeader}>Medications</Text>
              {(prescription.medications || []).map((m: any, i: number) => (
                <Text key={i} style={styles.item}>• {m.medicationName} – {m.dosage} – {m.frequency}</Text>
              ))}
              {prescription.notes && (
                <>
                  <Divider style={styles.divider} />
                  <Text style={styles.sectionHeader}>Notes</Text>
                  <Text style={styles.item}>{prescription.notes}</Text>
                </>
              )}
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (COLORS: ThemeColors) => (StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: 16 },
  header: { marginBottom: 12 },
  title: { color: COLORS.emerald, fontSize: 22, fontWeight: '700' },
  card: { backgroundColor: COLORS.bg, marginBottom: 16 },
  section: { color: COLORS.textDark, marginBottom: 4 },
  sectionHeader: { color: COLORS.emerald, marginTop: 12, marginBottom: 4, fontWeight: '600' },
  divider: { backgroundColor: COLORS.bg, marginVertical: 8 },
  item: { color: COLORS.textDark, marginLeft: 8 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: COLORS.textBody, marginTop: 10, fontSize: 14 },
}));


