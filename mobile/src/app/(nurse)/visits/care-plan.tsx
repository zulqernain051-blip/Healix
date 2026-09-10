import React from 'react';
import { SafeAreaView, StyleSheet, View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { Card, Divider } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { useCarePlans } from '../../../hooks/useHealth';
import { ErrorState } from '../../../components/common/ErrorState';
import { EmptyState } from '../../../components/common/EmptyState';

export default function CarePlanScreen() {
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const { data: carePlans, isLoading, error } = useCarePlans(patientId || '');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color="#00E676" size="large" />
          <Text style={styles.loadingText}>Loading care plan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState error={error?.message || "Failed to load care plan"} />
      </SafeAreaView>
    );
  }

  if (!carePlans || carePlans.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Care Plan</Text>
        </View>
        <EmptyState title="No Care Plan Found" subtitle="This patient doesn't have an active care plan yet." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Care Plans</Text>
        </View>
        {carePlans.map((plan: any) => (
          <Card key={plan.id} style={styles.card}>
            <Card.Content>
              <Text style={styles.planTitle}>{plan.title}</Text>
              <Text style={styles.planDesc}>{plan.description}</Text>
              
              <Text style={styles.sectionHeader}>Goals</Text>
              <Divider style={styles.divider} />
              {(plan.goals || []).map((g: any, i: number) => (
                <Text key={i} style={styles.item}>• {g.description}</Text>
              ))}

              <Text style={styles.sectionHeader}>Interventions / Tasks</Text>
              <Divider style={styles.divider} />
              {(plan.interventions || []).map((t: any, i: number) => (
                <Text key={i} style={styles.item}>• {t.description}</Text>
              ))}

              <Text style={styles.sectionHeader}>Status</Text>
              <Divider style={styles.divider} />
              <Text style={styles.item}>{plan.status}</Text>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#061C19', padding: 16 },
  header: { marginBottom: 16 },
  title: { color: '#00E676', fontSize: 22, fontWeight: '700' },
  planTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  planDesc: { color: '#94A3B8', fontSize: 14, marginBottom: 12 },
  card: { backgroundColor: '#0A2D28', marginBottom: 16 },
  sectionHeader: { color: '#00E676', marginTop: 12, marginBottom: 4, fontWeight: '600' },
  divider: { backgroundColor: '#1E2D4A', marginBottom: 8 },
  item: { color: '#F1F5F9', marginLeft: 8, marginBottom: 4 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#94A3B8', marginTop: 10, fontSize: 14 },
});
