import { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet, Linking } from 'react-native';
import { Appbar, Button, Card, Chip, Dialog, Portal, Text, TextInput, ActivityIndicator, Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { useAuthStore } from '../../store/auth';
import { emergencyApi, Ambulance } from '../../api/emergency.api';
import { ClinicalDecisionForm } from '../doctor/ClinicalDecisionForm';
import { apiClient } from '../../api/client';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../theme';
import { goBack } from '../../utils/navigation';

const nextStatus: Record<string, string[]> = { PENDING: ['DISPATCHED', 'CANCELLED'], DISPATCHED: ['EN_ROUTE', 'ARRIVED', 'CANCELLED'], EN_ROUTE: ['ARRIVED', 'CANCELLED'], ARRIVED: ['COMPLETED', 'CANCELLED'] };
export function EmergencyWorkspace({ fleet = false }: { fleet?: boolean }) {
  const { user, logout } = useAuthStore();
  const role = user?.role;
  const admin = role === 'ADMIN';
  const readOnly = role === 'PATIENT';
  const client = useQueryClient();
  const dispatches = useQuery({ queryKey: ['emergency', 'dispatches', user?.id], queryFn: emergencyApi.list, refetchInterval: 5000 });
  const vehicles = useQuery({ queryKey: ['emergency', 'fleet'], queryFn: emergencyApi.fleet, enabled: admin, refetchInterval: 10000 });
  const paramedics = useQuery({ queryKey: ['emergency', 'paramedics'], queryFn: () => apiClient.get<any>('/admin/users?role=PARAMEDIC&limit=100'), enabled: admin });
  const events = useQuery({ queryKey: ['emergency', 'events', user?.id], queryFn: () => apiClient.get<any[]>('/emergency/events'), enabled: role === 'DOCTOR', refetchInterval: 5000 });
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sharing, setSharing] = useState<string | null>(null);
  const [edit, setEdit] = useState<Partial<Ambulance> | null>(null);
  const [confirmation, setConfirmation] = useState<{ label: string; run: (notes: string) => Promise<unknown> } | null>(null);
  const [notes, setNotes] = useState('');
  const [eta, setEta] = useState('15');
  const refresh = async () => { await client.invalidateQueries({ queryKey: ['emergency'] }); await client.invalidateQueries({ queryKey: ['admin'] }); };
  const run = async (task: () => Promise<unknown>) => {
    setBusy(true); setError('');
    try { await task(); await refresh(); setConfirmation(null); } catch (e: any) { setError(e.message || 'Operation failed'); } finally { setBusy(false); }
  };
  useEffect(() => {
    if (sharing && dispatches.data && !dispatches.data.some(d => d.id === sharing && nextStatus[d.status])) setSharing(null);
  }, [sharing, dispatches.data]);
  useEffect(() => {
    if (!sharing) return;
    let disposed = false;
    let subscription: Location.LocationSubscription | undefined;
    let sending = false;
    void (async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!permission.granted) throw new Error('Location permission denied. Enable permission to share your vehicle location.');
        if (disposed) return;
        subscription = await Location.watchPositionAsync({ accuracy: Location.Accuracy.High, timeInterval: 10000, distanceInterval: 10 }, async position => {
          if (disposed || sending) return;
          sending = true;
          try { await emergencyApi.location(sharing, position.coords.latitude, position.coords.longitude); await refresh(); }
          catch (e: any) { if (!disposed) setError(e.message); }
          finally { sending = false; }
        });
        if (disposed) subscription.remove();
      } catch (e: any) { if (!disposed) { setError(e.message); setSharing(null); } }
    })();
    return () => { disposed = true; subscription?.remove(); };
  }, [sharing]);
  const confirm = (label: string, task: (notes: string) => Promise<unknown>) => { setNotes(''); setConfirmation({ label, run: task }); };
  const dataError = dispatches.error || vehicles.error || paramedics.error || events.error;
  return <PaperProvider theme={{ ...MD3LightTheme, colors: { ...MD3LightTheme.colors, primary: COLORS.navy } }}><View style={styles.root}>
    <Appbar.Header style={styles.header}><Appbar.BackAction onPress={goBack} color={COLORS.headerText} /><Appbar.Content title={fleet ? 'Ambulance Fleet' : 'Emergency Dispatches'} color={COLORS.headerText} />{role === 'PARAMEDIC' && <Appbar.Action icon="logout" onPress={() => void logout()} color={COLORS.headerText} />}</Appbar.Header>
    <ScrollView contentContainerStyle={styles.content}>
      {(error || dataError) && <Text accessibilityRole="alert" style={styles.error}>{error || (dataError as Error).message}</Text>}
      <Button onPress={() => void refresh()} loading={dispatches.isFetching}>Refresh</Button>
      {dispatches.isLoading && <ActivityIndicator />}
      {fleet && <>
        <Text style={styles.title}>Available {vehicles.data?.filter(v => v.status === 'AVAILABLE').length || 0} · Dispatched {vehicles.data?.filter(v => v.status === 'DISPATCHED').length || 0} · Inactive {vehicles.data?.filter(v => v.status === 'INACTIVE').length || 0}</Text>
        <Button mode="contained" onPress={() => setEdit({ vehicleNumber: '', plateNumber: '', type: 'BASIC', status: 'AVAILABLE' })}>Register Ambulance</Button>
        {vehicles.data?.map(v => <Card key={v.id} style={styles.card}><Card.Content><Text style={styles.title}>{v.vehicleNumber} · {v.plateNumber}</Text><Text>{v.type} · {v.status} · {v.provider || 'Healix Fleet'}</Text><Text>{v.dispatches?.length || 0} active dispatches</Text></Card.Content><Card.Actions><Button disabled={busy} onPress={() => setEdit(v)}>Edit</Button><Button disabled={busy} onPress={() => confirm('Delete unused vehicle?', () => emergencyApi.deleteVehicle(v.id))}>Delete</Button></Card.Actions></Card>)}
        {!vehicles.isLoading && !vehicles.data?.length && <Text>No ambulances registered.</Text>}
      </>}
      {role === 'DOCTOR' && events.data?.filter(e => !e.dispatches.length).map(e => <Card key={e.id} style={styles.card}><Card.Content><Text style={styles.title}>{e.patient.user.fullName} · {e.severity}</Text><Text>Assigned emergency · {new Date(e.createdAt).toLocaleString()}</Text><Button onPress={() => setSelectedEvent(e)}>Review Emergency Transport</Button></Card.Content></Card>)}
      {selectedEvent && <ClinicalDecisionForm patient={selectedEvent.patient} onCancel={() => { setSelectedEvent(null); void refresh(); }} />}
      <Text style={styles.title}>Dispatch records</Text>
      {!dispatches.isLoading && !dispatches.data?.length && <Text>No dispatch records available.</Text>}
      {dispatches.data?.map(d => {
        const active = !!nextStatus[d.status];
        const stale = !d.locationUpdatedAt || Date.now() - Date.parse(d.locationUpdatedAt) > 120000;
        const elapsed = Math.floor((Date.now() - Date.parse(d.etaUpdatedAt || d.dispatchedAt)) / 60000);
        return <Card key={d.id} style={styles.card}><Card.Content>
          <Text style={styles.title}>{d.patient.user.fullName}</Text><Text>{d.status} · {d.ambulance?.vehicleNumber || 'No vehicle'} · {d.paramedic?.user.fullName || 'No paramedic'}</Text>
          <Text>Destination: {d.hospital.name}</Text><Text>ETA estimate: {active ? Math.max(0, d.etaMinutes - elapsed) : 0} min · {d.etaUpdatedAt ? 'Paramedic estimate' : 'Initial estimate'}</Text>
          {d.latitude != null && d.longitude != null ? <><Text>Vehicle location: {stale ? 'STALE' : 'recent'} · {new Date(d.locationUpdatedAt!).toLocaleString()}</Text><Button onPress={() => void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${d.latitude},${d.longitude}`)}>View vehicle on map</Button></> : <Text>Vehicle location has not been shared.</Text>}
          {d.notes && <Text>Notes: {d.notes}</Text>}
          {!readOnly && <>
            <View style={styles.row}>{nextStatus[d.status]?.map(status => <Button key={status} disabled={busy} mode="outlined" onPress={() => confirm(`Mark dispatch ${status.toLowerCase().replace('_', ' ')}?`, note => emergencyApi.status(d.id, status, note))}>{status.replace('_', ' ')}</Button>)}</View>
            {role === 'PARAMEDIC' && active && <><Button disabled={busy} onPress={() => setSharing(sharing === d.id ? null : d.id)}>{sharing === d.id ? 'Stop sharing location' : 'Share location while this screen is open'}</Button><TextInput label="ETA estimate (minutes)" value={eta} onChangeText={setEta} keyboardType="number-pad" /><Button disabled={busy} onPress={() => void run(async () => { const n = Number(eta); if (!eta.trim() || !Number.isInteger(n) || n < 0 || n > 1440) throw new Error('Enter a valid ETA'); const permission = await Location.requestForegroundPermissionsAsync(); if (!permission.granted) throw new Error('Location permission denied'); const p = await Location.getCurrentPositionAsync({}); return emergencyApi.location(d.id, p.coords.latitude, p.coords.longitude, n); })}>Update ETA and current location</Button></>}
            {admin && active && <><Text style={styles.title}>Reassign ambulance</Text><View style={styles.row}>{vehicles.data?.filter(v => v.status === 'AVAILABLE').map(v => <Chip key={v.id} disabled={busy} onPress={() => confirm(`Assign ${v.vehicleNumber}?`, () => apiClient.post(`/admin/emergencies/${d.id}/assign-ambulance`, { ambulanceId: v.id }))}>{v.vehicleNumber}</Chip>)}</View><Text style={styles.title}>Reassign paramedic</Text><View style={styles.row}>{paramedics.data?.users?.filter((u: any) => u.status === 'ACTIVE' && u.paramedic?.verificationStatus === 'VERIFIED').map((u: any) => <Chip key={u.id} disabled={busy} onPress={() => confirm(`Assign ${u.fullName}?`, () => apiClient.post(`/admin/emergencies/${d.id}/assign-paramedic`, { paramedicId: u.paramedic.id }))}>{u.fullName}</Chip>)}</View></>}
            {d.status !== 'CANCELLED' && !d.admissions.length && <Button disabled={busy} onPress={() => confirm('Record hospital admission request?', () => emergencyApi.admission(d.id))}>Request Admission</Button>}
          </>}
            {d.admissions.map(a => <View key={a.id}><Text>Admission: {a.status}</Text>{a.dischargeNotes && <Text>{a.dischargeNotes}</Text>}{!readOnly && a.status !== 'DISCHARGED' && <Button disabled={busy} onPress={() => confirm(a.status === 'REQUESTED' ? 'Confirm hospital admission?' : 'Record discharge and draft follow-up care?', note => emergencyApi.admissionStatus(a.id, a.status === 'REQUESTED' ? 'ADMITTED' : 'DISCHARGED', note))}>{a.status === 'REQUESTED' ? 'Confirm Admitted' : 'Record Discharge'}</Button>}</View>)}
        </Card.Content></Card>;
      })}
    </ScrollView>
    <Portal><Dialog visible={!!edit} onDismiss={() => !busy && setEdit(null)}><Dialog.Title>{edit?.id ? 'Edit Ambulance' : 'Register Ambulance'}</Dialog.Title><Dialog.Content>
      {(['vehicleNumber', 'plateNumber', 'provider', 'contactNumber'] as const).map(key => <TextInput key={key} label={({ vehicleNumber: 'Vehicle number', plateNumber: 'Plate number', provider: 'Provider', contactNumber: 'Contact number' } as Record<string, string>)[key]} value={edit?.[key] || ''} onChangeText={value => setEdit(current => ({ ...current, [key]: value }))} style={styles.input} />)}
      <View style={styles.row}>{['BASIC', 'ADVANCED', 'ICU'].map(type => <Chip key={type} selected={edit?.type === type} onPress={() => setEdit(current => ({ ...current, type }))}>{type}</Chip>)}</View>
      {edit?.status !== 'DISPATCHED' && <View style={styles.row}>{['AVAILABLE', 'INACTIVE'].map(status => <Chip key={status} selected={edit?.status === status} onPress={() => setEdit(current => ({ ...current, status }))}>{status}</Chip>)}</View>}
      {error && <Text style={styles.error}>{error}</Text>}
    </Dialog.Content><Dialog.Actions><Button disabled={busy} onPress={() => setEdit(null)}>Cancel</Button><Button loading={busy} disabled={busy} onPress={() => void run(async () => { if (!edit?.vehicleNumber?.trim() || !edit.plateNumber?.trim()) throw new Error('Vehicle and plate numbers are required'); const { id, dispatches: _dispatches, status, ...fields } = edit; await emergencyApi.saveVehicle(id, { vehicleNumber: fields.vehicleNumber, plateNumber: fields.plateNumber, provider: fields.provider, contactNumber: fields.contactNumber, type: fields.type, ...(status !== 'DISPATCHED' ? { status } : {}) }); setEdit(null); })}>Save</Button></Dialog.Actions></Dialog>
    <Dialog visible={!!confirmation} onDismiss={() => !busy && setConfirmation(null)}><Dialog.Title>{confirmation?.label}</Dialog.Title><Dialog.Content><TextInput label="Notes (optional)" value={notes} onChangeText={setNotes} multiline />{error && <Text style={styles.error}>{error}</Text>}</Dialog.Content><Dialog.Actions><Button disabled={busy} onPress={() => setConfirmation(null)}>Cancel</Button><Button disabled={busy} loading={busy} onPress={() => confirmation && void run(() => confirmation.run(notes))}>Confirm</Button></Dialog.Actions></Dialog></Portal>
  </View></PaperProvider>;
}
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: COLORS.surface }, header: { backgroundColor: COLORS.navy }, content: { padding: SPACING.lg, gap: SPACING.md }, card: { backgroundColor: COLORS.surfaceCard, borderRadius: RADIUS.lg }, title: { color: COLORS.textDark, fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, marginVertical: SPACING.sm }, error: { color: COLORS.red }, row: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginVertical: SPACING.md }, input: { marginBottom: SPACING.sm } });
