import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { Text, Card, Appbar, Button, Portal, Dialog, TextInput, IconButton, Switch } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { 
  useAdminHospitals, useCreateHospital, useUpdateHospital, useDeleteHospital
} from '../../hooks/useAdmin';
import { COLORS, SPACING, RADIUS } from '../../theme';

export default function AdminNetworkOperations() {
  const router = useRouter();

  const { data: hospitals, isLoading: loadHosp } = useAdminHospitals();
  const createHosp = useCreateHospital();
  const updateHosp = useUpdateHospital();
  const deleteHosp = useDeleteHospital();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Hospital Form
  const [hName, setHName] = useState('');
  const [hLat, setHLat] = useState('');
  const [hLng, setHLng] = useState('');
  const [hCapStatus, setHCapStatus] = useState('NORMAL');
  const [hAffordability, setHAffordability] = useState('STANDARD');
  const [hIsCharity, setHIsCharity] = useState(false);

  const openModal = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setHName(item.name);
      setHLat(String(item.latitude || ''));
      setHLng(String(item.longitude || ''));
      setHCapStatus(item.capacityStatus || 'NORMAL');
      setHAffordability(item.affordabilityTier || 'STANDARD');
      setHIsCharity(!!item.isCharity);
    } else {
      setEditingId(null);
      setHName(''); setHLat(''); setHLng('');
      setHCapStatus('NORMAL'); setHAffordability('STANDARD'); setHIsCharity(false);
    }
    setModalVisible(true);
  };

  const handleSave = () => {
    const data = { 
      name: hName, 
      latitude: parseFloat(hLat) || 0, 
      longitude: parseFloat(hLng) || 0,
      capacityStatus: hCapStatus,
      affordabilityTier: hAffordability,
      isCharity: hIsCharity
    };
    if (editingId) updateHosp.mutate({ id: editingId, data });
    else createHosp.mutate(data);
    setModalVisible(false);
  };

  const renderContent = () => {
    if (loadHosp) return <ActivityIndicator color="#00E676" style={{ marginTop: 20 }} />;
    return hospitals?.map(h => (
      <Card key={h.id} style={styles.card}>
        <Card.Content>
          <View style={styles.row}>
            <Text style={styles.cardTitle}>{h.name}</Text>
            <View style={{ flexDirection: 'row' }}>
              <IconButton icon="pencil" size={20} iconColor="#3B82F6" onPress={() => openModal(h)} />
              <IconButton icon="delete" size={20} iconColor="#EF4444" onPress={() => deleteHosp.mutate(h.id)} />
            </View>
          </View>
          <Text style={styles.cardSub}>Location: {h.latitude}, {h.longitude}</Text>
          <Text style={styles.cardSub}>Capacity Status: {h.capacityStatus}</Text>
          <Text style={styles.cardSub}>Affordability: {h.affordabilityTier} {h.isCharity ? '(Charity)' : ''}</Text>
        </Card.Content>
      </Card>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={{ backgroundColor: '#061C19' }}>
        <Appbar.BackAction onPress={() => router.back()} color="#FFF" />
        <Appbar.Content title="Healthcare Network" titleStyle={{ color: '#FFF' }} />
        <Appbar.Action icon="plus" color="#00E676" onPress={() => openModal()} />
      </Appbar.Header>
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Hospitals & Medical Centers</Text>
        {renderContent()}
      </ScrollView>

      <Portal>
        <Dialog visible={modalVisible} onDismiss={() => setModalVisible(false)} style={{ backgroundColor: '#0A2D28' }}>
          <Dialog.Title style={{ color: '#FFF' }}>
            {editingId ? 'Edit Hospital' : 'Add Hospital'}
          </Dialog.Title>
          <Dialog.Content>
            <ScrollView>
              <TextInput label="Name" value={hName} onChangeText={setHName} style={styles.input} textColor="#FFF" theme={{ colors: { primary: '#00E676', text: '#FFF', placeholder: '#94A3B8' } }} />
              <TextInput label="Latitude" value={hLat} onChangeText={setHLat} keyboardType="numeric" style={styles.input} textColor="#FFF" theme={{ colors: { primary: '#00E676', text: '#FFF', placeholder: '#94A3B8' } }} />
              <TextInput label="Longitude" value={hLng} onChangeText={setHLng} keyboardType="numeric" style={styles.input} textColor="#FFF" theme={{ colors: { primary: '#00E676', text: '#FFF', placeholder: '#94A3B8' } }} />
              <TextInput label="Capacity Status (e.g. NORMAL, FULL)" value={hCapStatus} onChangeText={setHCapStatus} style={styles.input} textColor="#FFF" theme={{ colors: { primary: '#00E676', text: '#FFF', placeholder: '#94A3B8' } }} />
              <TextInput label="Affordability (e.g. STANDARD, PREMIUM)" value={hAffordability} onChangeText={setHAffordability} style={styles.input} textColor="#FFF" theme={{ colors: { primary: '#00E676', text: '#FFF', placeholder: '#94A3B8' } }} />
              <View style={styles.switchRow}>
                <Text style={{ color: '#FFF' }}>Is Charity Hospital?</Text>
                <Switch value={hIsCharity} onValueChange={setHIsCharity} color="#00E676" />
              </View>
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setModalVisible(false)} textColor="#94A3B8">Cancel</Button>
            <Button onPress={handleSave} textColor="#00E676">Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#061C19' },
  content: { padding: SPACING.md, gap: 12, paddingBottom: 40 },
  sectionTitle: { color: '#00E676', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  card: { backgroundColor: '#0A2D28', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.15)' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingRight: 10 },
  cardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  cardSub: { color: '#94A3B8', fontSize: 13, marginTop: 2 },
  input: { backgroundColor: 'rgba(0,0,0,0.2)', marginBottom: 10 },
});
