import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../../store/auth';
import { useClinicalOutcomes } from '../../../hooks/useHealth';

export default function ClinicalOutcomesScreen() {
  const { user } = useAuthStore();
  const { data: outcomes = [], isLoading } = useClinicalOutcomes(user?.patientId || '');

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00E676" />
      </View>
    );
  }

  if (!outcomes.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No clinical outcomes found.</Text>
      </View>
    );
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'Case Resolved';
      case 'IN_REVIEW': return 'Under Doctor Review';
      case 'ACCEPTED': return 'Doctor Assigned';
      default: return 'Pending';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Clinical History</Text>
      
      {outcomes.map((c: any) => (
        <View key={c.caseId} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.doctorName}>Dr. {c.doctorName}</Text>
            <Text style={styles.dateText}>
              {c.visitDate ? new Date(c.visitDate).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Outcome:</Text>
            <Text style={[styles.statusValue, c.status === 'RESOLVED' && styles.resolved]}>
              {getStatusText(c.status)}
            </Text>
          </View>

          {c.diagnoses?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Diagnoses</Text>
              {c.diagnoses.map((d: any) => (
                <View key={d.id} style={styles.item}>
                  <Text style={styles.itemText}>• {d.description} ({d.code})</Text>
                </View>
              ))}
            </View>
          )}

          {c.decisions?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Decisions</Text>
              {c.decisions.map((d: any) => (
                <View key={d.id} style={styles.item}>
                  <Text style={styles.itemText}>• {d.decisionType.replace(/_/g, ' ')}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#061C19',
    padding: 16,
  },
  center: {
    flex: 1,
    backgroundColor: '#061C19',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  emptyText: {
    color: '#A0AEC0',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  doctorName: {
    color: '#00E676',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    color: '#E2E8F0',
    fontSize: 14,
    marginRight: 8,
  },
  statusValue: {
    color: '#FCD34D',
    fontWeight: 'bold',
  },
  resolved: {
    color: '#34D399',
  },
  section: {
    marginTop: 8,
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 8,
  },
  sectionTitle: {
    color: '#CBD5E1',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  item: {
    marginBottom: 4,
  },
  itemText: {
    color: '#F1F5F9',
    fontSize: 14,
  },
});
