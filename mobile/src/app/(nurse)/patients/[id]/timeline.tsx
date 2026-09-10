// f:/class Data/FYP Project/Proposal/Project/Healix/mobile/src/app/(nurse)/patients/[id]/timeline.tsx
import React from 'react';
import { SafeAreaView, StyleSheet, View, Text, FlatList } from 'react-native';
import { Card, Divider } from 'react-native-paper';

// Mock timeline data – replace with real API data later
const timelineData = [
  { id: '1', date: '2024-09-01', event: 'Visit completed – Vitals, Symptoms, Remarks', risk: 'Low' },
  { id: '2', date: '2024-08-15', event: 'Prescription issued – Metformin, Lisinopril', risk: 'Medium' },
  { id: '3', date: '2024-07-20', event: 'AI Risk Assessment – Score 0.12, Tier: Low', risk: 'Low' },
];

export default function PatientTimelineScreen() {
  const renderItem = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.row}>
          <Text style={styles.date}>{item.date}</Text>
          <Text style={styles.risk}>Risk: {item.risk}</Text>
        </View>
        <Divider style={styles.divider} />
        <Text style={styles.event}>{item.event}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList data={timelineData} keyExtractor={item => item.id} renderItem={renderItem} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#061C19', padding: 16 },
  card: { backgroundColor: '#0A2D28', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  date: { color: '#00E676', fontWeight: '600' },
  risk: { color: '#F1F5F9' },
  divider: { backgroundColor: '#1E2D4A', marginVertical: 4 },
  event: { color: '#F1F5F9' },
});
