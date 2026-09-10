import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { Text, Card, Chip, Appbar, Button, Portal, Dialog, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAdminCases, useOverrideCaseAssignment } from '../../hooks/useAdmin';
import { COLORS, SPACING, RADIUS } from '../../theme';

type TabType = 'UNASSIGNED' | 'ASSIGNED' | 'IN_REVIEW' | 'RESOLVED';

export default function AdminClinicalOperations() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('UNASSIGNED');

  const { data: cases, isLoading } = useAdminCases(activeTab);
  const overrideMutation = useOverrideCaseAssignment();

  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState('');
  const [reason, setReason] = useState('');

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
        {['UNASSIGNED', 'ASSIGNED', 'IN_REVIEW', 'RESOLVED'].map((tab) => (
          <Chip 
            key={tab}
            selected={activeTab === tab} 
            onPress={() => setActiveTab(tab as TabType)}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            textStyle={activeTab === tab ? styles.activeTabText : styles.tabText}
          >
            {tab}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const handleOverride = () => {
    if (!selectedCase || !doctorId || !reason) return;
    overrideMutation.mutate({ caseId: selectedCase, doctorId, reason }, {
      onSuccess: () => {
        setSelectedCase(null);
        setDoctorId('');
        setReason('');
      }
    });
  };

  const renderContent = () => {
    if (isLoading) return <ActivityIndicator color="#00E676" style={{ marginTop: 20 }} />;
    if (!cases?.length) return <Text style={styles.emptyText}>No cases found for {activeTab}</Text>;
    
    return cases.map(c => (
      <Card key={c.id} style={styles.card}>
        <Card.Content>
          <View style={styles.row}>
            <Text style={styles.cardTitle}>Case: {c.id.slice(0, 8)}</Text>
            <Chip textStyle={{ fontSize: 10 }}>{c.status}</Chip>
          </View>
          <Text style={styles.cardSub}>Patient ID: {c.patientId?.slice(0, 8)}</Text>
          <Text style={styles.cardSub}>Symptoms: {c.symptoms || 'N/A'}</Text>
          
          {c.assignedDoctorId && (
            <Text style={styles.cardSub}>Assigned Dr: {c.assignedDoctorId.slice(0, 8)}</Text>
          )}

          {activeTab === 'UNASSIGNED' && (
            <Button 
              mode="contained" 
              style={{ marginTop: 10, backgroundColor: 'rgba(0, 230, 118, 0.2)' }}
              labelStyle={{ color: '#00E676' }}
              onPress={() => setSelectedCase(c.id)}
            >
              Override Assignment
            </Button>
          )}
        </Card.Content>
      </Card>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={{ backgroundColor: '#061C19' }}>
        <Appbar.BackAction onPress={() => router.back()} color="#FFF" />
        <Appbar.Content title="Clinical Operations" titleStyle={{ color: '#FFF' }} />
      </Appbar.Header>
      
      {renderTabs()}
      
      <ScrollView contentContainerStyle={styles.content}>
        {renderContent()}
      </ScrollView>

      <Portal>
        <Dialog visible={!!selectedCase} onDismiss={() => setSelectedCase(null)} style={{ backgroundColor: '#0A2D28' }}>
          <Dialog.Title style={{ color: '#FFF' }}>Assign Doctor</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Doctor ID"
              value={doctorId}
              onChangeText={setDoctorId}
              style={styles.input}
              textColor="#FFF"
              theme={{ colors: { primary: '#00E676', text: '#FFF', placeholder: '#94A3B8' } }}
            />
            <TextInput
              label="Reason for Override"
              value={reason}
              onChangeText={setReason}
              style={styles.input}
              textColor="#FFF"
              theme={{ colors: { primary: '#00E676', text: '#FFF', placeholder: '#94A3B8' } }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSelectedCase(null)} textColor="#94A3B8">Cancel</Button>
            <Button onPress={handleOverride} textColor="#00E676" loading={overrideMutation.isPending}>Assign</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#061C19' },
  tabsContainer: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0, 230, 118, 0.15)' },
  tabsScroll: { paddingHorizontal: SPACING.md, gap: 10 },
  tab: { backgroundColor: '#0A2D28' },
  activeTab: { backgroundColor: '#00E676' },
  tabText: { color: '#94A3B8' },
  activeTabText: { color: '#061C19', fontWeight: 'bold' },
  content: { padding: SPACING.md, gap: 12, paddingBottom: 40 },
  card: { backgroundColor: '#0A2D28', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.15)' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  cardSub: { color: '#94A3B8', fontSize: 13, marginTop: 2 },
  emptyText: { color: '#94A3B8', textAlign: 'center', marginTop: 40, fontSize: 16 },
  input: { backgroundColor: 'rgba(0,0,0,0.2)', marginBottom: 10 },
});
