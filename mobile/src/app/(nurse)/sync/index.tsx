// f:/class Data/FYP Project/Proposal/Project/Healix/mobile/src/app/(nurse)/sync/index.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OfflineSyncStatusBanner } from '../../../components/common/OfflineSyncStatusBanner';
import { EmptyState } from '../../../components/common/EmptyState';
import { LoadingState } from '../../../components/common/LoadingState';
import { ErrorState } from '../../../components/common/ErrorState';

// Mock sync queue data
const initialQueue = [
  { id: '1', description: 'Vitals for Visit #101', status: 'Pending' },
  { id: '2', description: 'Symptom checklist for Visit #102', status: 'Failed' },
];

export default function NurseSyncScreen() {
  const [queue, setQueue] = useState(initialQueue);
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const retry = (id: string) => {
    setLoading(true);
    setTimeout(() => {
      setQueue(prev =>
        prev.map(item => (item.id === id ? { ...item, status: 'Pending' } : item))
      );
      setLoading(false);
    }, 800);
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  const pendingCount = queue.filter(i => i.status !== 'Success').length;

  return (
    <SafeAreaView style={styles.container}>
      <OfflineSyncStatusBanner isOnline={false} pendingSyncCount={pendingCount} />
      <View style={styles.content}>
        {queue.length === 0 ? (
          <EmptyState title="All data synced" subtitle="No pending uploads." />
        ) : (
          <FlatList
            data={queue}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Text style={styles.desc}>{item.description}</Text>
                <Text style={[styles.status, item.status === 'Failed' && styles.failed]}>{item.status}</Text>
                {item.status === 'Failed' && (
                  <TouchableOpacity onPress={() => retry(item.id)} style={styles.retryBtn}>
                    <Text style={styles.retryText}>Retry</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#061C19' },
  content: { flex: 1, padding: 16 },
  item: { backgroundColor: '#0A2D28', padding: 12, marginBottom: 10, borderRadius: 6 },
  desc: { color: '#00E676', fontSize: 14 },
  status: { color: '#FFFFFF', marginTop: 4 },
  failed: { color: '#FF5252' },
  retryBtn: { marginTop: 6, alignSelf: 'flex-start', backgroundColor: '#00E676', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 },
  retryText: { color: '#061C19', fontWeight: '600' },
});
