import React from 'react';
import { SafeAreaView, StyleSheet, View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { Card, Divider } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { usePrescriptions } from '../../../hooks/useHealth';
import { ErrorState } from '../../../components/common/ErrorState';
import { EmptyState } from '../../../components/common/EmptyState';

export default function PrescriptionViewScreen() {
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const { data: prescriptions, isLoading, error } = usePrescriptions(patientId || '');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color="#00E676" size="large" />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#061C19', padding: 16 },
  header: { marginBottom: 12 },
  title: { color: '#00E676', fontSize: 22, fontWeight: '700' },
  card: { backgroundColor: '#0A2D28', marginBottom: 16 },
  section: { color: '#F1F5F9', marginBottom: 4 },
  sectionHeader: { color: '#00E676', marginTop: 12, marginBottom: 4, fontWeight: '600' },
  divider: { backgroundColor: '#1E2D4A', marginVertical: 8 },
  item: { color: '#F1F5F9', marginLeft: 8 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#94A3B8', marginTop: 10, fontSize: 14 },
});
