import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, View, Text, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { Avatar } from 'react-native-paper';
import { navigate } from '../../../utils/navigation';
import { useAuthStore } from '../../../store/auth';
import { useNurseVisits } from '../../../hooks/useVisits';
import { EmptyState } from '../../../components/common/EmptyState';
import { LoadingState } from '../../../components/common/LoadingState';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../../theme';

export default function PatientsListScreen() {
  const { user, accessToken } = useAuthStore();
  const nurseId = user?.nurseId || user?.id || '';
  const { data: assignedVisits, isLoading } = useNurseVisits(nurseId);

  // Extract unique assigned patients from real visits store
  const patientMap = new Map<string, any>();
  (assignedVisits || []).forEach((v: any) => {
    const patientObj = v.request?.patient;
    if (patientObj && !patientMap.has(patientObj.id)) {
      patientMap.set(patientObj.id, {
        id: patientObj.id,
        name: patientObj.user?.fullName || 'Assigned Patient',
        phone: patientObj.user?.phone || 'Not provided',
        address: patientObj.address || 'Location on map',
        gender: patientObj.gender || 'Patient',
        lastVisitDate: v.request?.scheduledAt ? new Date(v.request.scheduledAt).toLocaleDateString() : 'Scheduled',
        status: v.status,
      });
    }
  });

  const patientList = Array.from(patientMap.values());

  if (isLoading && patientList.length === 0) {
    return <LoadingState />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#061C19" />
      <View style={styles.header}>
        <Text style={styles.title}>Assigned Patients Directory</Text>
        <Text style={styles.subtitle}>Patients registered for your home care visits</Text>
      </View>

      <View style={styles.body}>
        {patientList.length === 0 ? (
          <EmptyState title="No Patients Assigned" subtitle="Your assigned patients will appear here once care visits are scheduled." />
        ) : (
          <FlatList
            data={patientList}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => navigate(`/(nurse)/patients/${item.id}`)}
                style={styles.card}
                activeOpacity={0.8}
              >
                <Avatar.Text
                  size={44}
                  label={item.name.split(' ').map((n: string) => n[0]).join('')}
                  style={styles.avatarBg}
                  color="#00E676"
                />
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.subText}>📱 {item.phone} · 📍 {item.address}</Text>
                  <Text style={styles.visitDateText}>Last Visit: {item.lastVisitDate}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#061C19' },
  header: { padding: 20, paddingBottom: 30, backgroundColor: '#061C19' },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  subtitle: { color: '#00E676', fontSize: 14, marginTop: 6, fontWeight: '600' },
  body: { flex: 1, backgroundColor: '#F8FAFC', borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },
  card: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  avatarBg: { backgroundColor: '#F1F5F9', borderWidth: 2, borderColor: '#00E676' },
  name: { color: '#1E293B', fontSize: 16, fontWeight: '700' },
  subText: { color: '#64748B', fontSize: 12, marginTop: 4 },
  visitDateText: { color: '#00E676', fontSize: 11, marginTop: 4, fontWeight: '600' },
  chevron: { color: '#94A3B8', fontSize: 24 },
});
