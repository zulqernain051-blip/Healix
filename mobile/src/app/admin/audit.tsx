import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, StatusBar, FlatList } from 'react-native';
import { Card } from 'react-native-paper';
import { navigate } from '../../utils/navigation';
import { useAdminAuditLogs } from '../../hooks/useAdmin';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../theme';

export default function AdminAuditLogs() {
  const { data: auditLogs = [], isLoading } = useAdminAuditLogs();

  const renderItem = ({ item: log }: any) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.logHeader}>
          <Text style={styles.logAction}>{log.action}</Text>
          <Text style={styles.logTime}>{new Date(log.createdAt).toLocaleString()}</Text>
        </View>
        <Text style={styles.logDesc}>{log.details || 'System operation executed'}</Text>
        {log.userId && <Text style={styles.logUser}>User ID: {log.userId}</Text>}
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#061C19' }}>
      <StatusBar barStyle="light-content" backgroundColor="#061C19" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigate('/admin')} style={styles.backBtn}>
            <Text style={styles.backText}>‹ Back to Command Center</Text>
          </TouchableOpacity>
          <Text style={styles.title}>System Audit Trail</Text>
          <Text style={styles.subtitle}>HIPAA-compliant logs of administrative actions and overrides</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color="#00E676" size="large" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={auditLogs}
            keyExtractor={(item) => item.id || Math.random().toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={() => (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>📜</Text>
                <Text style={styles.emptyTitle}>Audit Log Active</Text>
                <Text style={styles.emptySub}>No audit logs found yet. All administrative actions and credential overrides will be securely recorded here.</Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#061C19', padding: SPACING.lg },
  listContent: { paddingBottom: 40 },
  header: { marginBottom: 20 },
  backBtn: { marginBottom: 8 },
  backText: { color: '#00E676', fontSize: 13, fontWeight: '700' },
  title: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  subtitle: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
  card: { backgroundColor: '#0A2D28', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.15)', marginBottom: 12 },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logAction: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  logTime: { color: '#00E676', fontSize: 10 },
  logDesc: { color: '#94A3B8', fontSize: 12, marginTop: 6 },
  logUser: { color: '#6B8E8A', fontSize: 10, marginTop: 4 },
  emptyCard: { backgroundColor: '#0A2D28', borderRadius: RADIUS.lg, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.15)' },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  emptySub: { color: '#94A3B8', fontSize: 12, textAlign: 'center', marginTop: 4 },
});
