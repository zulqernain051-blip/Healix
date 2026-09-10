import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { Text, Card, Chip, Appbar, Button, Portal, Dialog, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAdminEmergencies, useEscalateEmergency, useAssignEmergencyDoctor } from '../../hooks/useAdmin';
import { COLORS, SPACING, RADIUS } from '../../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AdminEmergencyCenter() {
  const router = useRouter();

  // Active emergencies automatically refetch every 5000ms as per hook definition
  const { data: emergencies, isLoading } = useAdminEmergencies();
  
  const escalateMutation = useEscalateEmergency();
  const assignMutation = useAssignEmergencyDoctor();

  const [selectedEmergencyId, setSelectedEmergencyId] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState('');

  const handleAssign = () => {
    if (!selectedEmergencyId || !doctorId) return;
    assignMutation.mutate({ id: selectedEmergencyId, doctorId }, {
      onSuccess: () => {
        setSelectedEmergencyId(null);
        setDoctorId('');
      }
    });
  };

  const renderContent = () => {
    if (isLoading && !emergencies) return <ActivityIndicator color="#EF4444" style={{ marginTop: 20 }} />;
    if (!emergencies?.length) return <Text style={styles.emptyText}>No active emergencies</Text>;
    
    return emergencies.map(em => (
      <Card key={em.id} style={[styles.card, em.status === 'ADMIN_ESCALATED' && styles.escalatedCard]}>
        <Card.Content>
          <View style={styles.row}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MaterialCommunityIcons name="alert-decagram" size={20} color={em.status === 'ADMIN_ESCALATED' ? '#EF4444' : '#F59E0B'} />
              <Text style={styles.cardTitle}>Emergency: {em.id.slice(0, 8)}</Text>
            </View>
            <Chip textStyle={{ fontSize: 10, color: '#FFF' }} style={{ backgroundColor: em.status === 'ADMIN_ESCALATED' ? '#EF4444' : '#F59E0B' }}>
              {em.status}
            </Chip>
          </View>
          <Text style={styles.cardSub}>Patient ID: {em.patientId?.slice(0, 8)}</Text>
          <Text style={styles.cardSub}>SLA Breach: {em.slaBreach ? 'YES' : 'NO'}</Text>
          
          {em.assignedDoctorId && (
            <Text style={styles.cardSub}>Assigned Dr: {em.assignedDoctorId.slice(0, 8)}</Text>
          )}

          <View style={styles.actionRow}>
            {em.status !== 'ADMIN_ESCALATED' && (
              <Button 
                mode="text" 
                textColor="#F59E0B"
                onPress={() => escalateMutation.mutate(em.id)}
                loading={escalateMutation.isPending}
              >
                Escalate
              </Button>
            )}
            {em.status === 'ADMIN_ESCALATED' && !em.assignedDoctorId && (
              <Button 
                mode="contained" 
                style={{ backgroundColor: '#EF4444', marginTop: 10 }}
                onPress={() => setSelectedEmergencyId(em.id)}
              >
                Assign Doctor Manually
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={{ backgroundColor: '#1A0505' }}>
        <Appbar.BackAction onPress={() => router.back()} color="#EF4444" />
        <Appbar.Content title="Emergency Center" titleStyle={{ color: '#EF4444', fontWeight: 'bold' }} />
        <Appbar.Action icon="refresh" color="#EF4444" />
      </Appbar.Header>
      
      <View style={styles.liveIndicator}>
        <View style={styles.dot} />
        <Text style={styles.liveText}>LIVE MONITORING (Updates every 5s)</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {renderContent()}
      </ScrollView>

      <Portal>
        <Dialog visible={!!selectedEmergencyId} onDismiss={() => setSelectedEmergencyId(null)} style={{ backgroundColor: '#2A0808' }}>
          <Dialog.Title style={{ color: '#FFF' }}>Assign Emergency Doctor</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Doctor ID"
              value={doctorId}
              onChangeText={setDoctorId}
              style={styles.input}
              textColor="#FFF"
              theme={{ colors: { primary: '#EF4444', text: '#FFF', placeholder: '#94A3B8' } }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSelectedEmergencyId(null)} textColor="#94A3B8">Cancel</Button>
            <Button onPress={handleAssign} textColor="#EF4444" loading={assignMutation.isPending}>Assign</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A0505' },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', marginRight: 8 },
  liveText: { color: '#EF4444', fontSize: 12, fontWeight: '700' },
  content: { padding: SPACING.md, gap: 12, paddingBottom: 40 },
  card: { backgroundColor: '#2A0808', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)' },
  escalatedCard: { borderColor: '#EF4444', borderWidth: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  cardSub: { color: '#94A3B8', fontSize: 13, marginTop: 2 },
  actionRow: { marginTop: 10, alignItems: 'flex-start' },
  emptyText: { color: '#94A3B8', textAlign: 'center', marginTop: 40, fontSize: 16 },
  input: { backgroundColor: 'rgba(0,0,0,0.3)', marginBottom: 10 },
});
