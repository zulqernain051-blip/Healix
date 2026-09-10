import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput, SafeAreaView, StatusBar, FlatList } from 'react-native';
import { Card, Button, Chip, Divider } from 'react-native-paper';
import { navigate } from '../../utils/navigation';
import { useAdminUsers, useUpdateUserStatus } from '../../hooks/useAdmin';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../theme';

export default function AdminUsers() {
  const { data: users = [], isLoading } = useAdminUsers();
  const { mutateAsync: updateUserStatus } = useUpdateUserStatus();

  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const targetStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await updateUserStatus({ userId, status: targetStatus });
      Alert.alert('Status Updated', `User account status changed to ${targetStatus}`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Action failed');
    }
  };

  const filteredUsers = users.filter((u: any) => {
    const matchesSearch = !search ||
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search);
    const matchesRole = !role || u.role === role;
    return matchesSearch && matchesRole;
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
          <Text style={styles.title}>User Account Management</Text>
          <Text style={styles.subtitle}>Audit, suspend, or reactivate accounts across all platform roles</Text>
        </View>

        {/* Search Bar */}
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search name, email, or phone..."
          placeholderTextColor="#6B8E8A"
          style={styles.searchInput}
        />

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {(['', 'PATIENT', 'NURSE', 'DOCTOR', 'ADMIN'] as const).map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.filterChip, role === r && styles.filterChipActive]}
              onPress={() => setRole(r)}
            >
              <Text style={[styles.filterText, role === r && styles.filterTextActive]}>
                {r === '' ? 'All Roles' : r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading && filteredUsers.length === 0 ? (
          <ActivityIndicator color="#00E676" size="large" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item: any) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={() => (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>👥</Text>
                <Text style={styles.emptyTitle}>No Users Found</Text>
                <Text style={styles.emptySub}>No user accounts match the current filter options.</Text>
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
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  filterChip: { backgroundColor: '#0A2D28', paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.round, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.15)' },
  filterChipActive: { backgroundColor: '#00E676', borderColor: '#00E676' },
  filterText: { color: '#94A3B8', fontSize: 11, fontWeight: '600' },
  filterTextActive: { color: '#061C19', fontWeight: '800' },
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
