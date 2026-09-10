import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput, SafeAreaView, StatusBar, FlatList } from 'react-native';
import { Card, Button, Chip, Divider } from 'react-native-paper';
import { navigate } from '../../utils/navigation';
import { useAdminPatients, useUpdateUserStatus } from '../../hooks/useAdmin';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../theme';

export default function AdminPatients() {
  const { data: users = [], isLoading } = useAdminPatients();
  const { mutateAsync: updateUserStatus } = useUpdateUserStatus();

  const [search, setSearch] = useState('');

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const targetStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await updateUserStatus({ userId, status: targetStatus });
      Alert.alert('Status Updated', `Patient account status changed to ${targetStatus}`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Action failed');
    }
  };

  const filteredUsers = users.filter((u: any) => {
    return !search ||
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search);
  });

  const renderItem = ({ item: u }: any) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{u.fullName}</Text>
            <Text style={styles.userSub}>📧 {u.email} · 📱 {u.phone}</Text>
          </View>
          <View style={{ gap: 4, alignItems: 'flex-end' }}>
            <Chip
              textStyle={{ color: '#061C19', fontSize: 10, fontWeight: '800' }}
              style={{ backgroundColor: '#00E676' }}
            >
              {u.role}
            </Chip>
            <Chip
              textStyle={{ color: '#FFF', fontSize: 9, fontWeight: '700' }}
              style={{ backgroundColor: u.status === 'ACTIVE' ? '#10B981' : '#EF4444' }}
            >
              {u.status}
            </Chip>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.actionsRow}>
          <Button
            mode="outlined"
            textColor={u.status === 'ACTIVE' ? '#EF4444' : '#00E676'}
            onPress={() => handleToggleStatus(u.id, u.status)}
            style={{ borderColor: u.status === 'ACTIVE' ? '#EF4444' : '#00E676', borderRadius: RADIUS.md }}
            labelStyle={{ fontWeight: '700' }}
          >
            {u.status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate Account'}
          </Button>
        </View>
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
          <Text style={styles.title}>Patient Management</Text>
          <Text style={styles.subtitle}>Audit, suspend, or reactivate patient accounts</Text>
        </View>

        {/* Search Bar */}
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search name, email, or phone..."
          placeholderTextColor="#6B8E8A"
          style={styles.searchInput}
        />

        {isLoading && filteredUsers.length === 0 ? (
          <ActivityIndicator color="#00E676" size="large" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={() => (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🤕</Text>
                <Text style={styles.emptyTitle}>No Patients Found</Text>
                <Text style={styles.emptySub}>No patient accounts match the current filter options.</Text>
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
  header: { marginBottom: 16 },
  backBtn: { marginBottom: 8 },
  backText: { color: '#00E676', fontSize: 13, fontWeight: '700' },
  title: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  subtitle: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
  searchInput: { backgroundColor: '#0A2D28', color: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.2)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: RADIUS.md, fontSize: 13, marginBottom: 12 },
  card: { backgroundColor: '#0A2D28', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.15)', marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  userName: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  userSub: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  divider: { backgroundColor: 'rgba(0, 230, 118, 0.1)', marginVertical: 10 },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  emptyCard: { backgroundColor: '#0A2D28', borderRadius: RADIUS.lg, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.15)' },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  emptySub: { color: '#94A3B8', fontSize: 12, textAlign: 'center', marginTop: 4 },
});
