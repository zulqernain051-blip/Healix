import { useState } from 'react';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useAuthStore } from '../../../store/auth';
import { usePrescriptions } from '../../../hooks/useHealth';
import { WorkflowPage, flowStyles as s } from '../../../components/common/WorkflowPage';
import { downloadPrivateFile } from '../../../utils/fileTransfer';
export default function PrescriptionsScreen() {
  const patientId = useAuthStore(state => state.user?.patientId) || '';
  const query = usePrescriptions(patientId);
  const [busy, setBusy] = useState(''); const [error, setError] = useState('');
  const download = async (id: string) => { setBusy(id); setError(''); try { await downloadPrivateFile(`/patients/${patientId}/prescriptions/${id}/pdf`, `healix-prescription-${id}.pdf`); } catch(e: any) { setError(e.message); } finally { setBusy(''); } };
  return <WorkflowPage title="Prescriptions" loading={query.isLoading} error={error || query.error?.message} retry={() => void query.refetch()}>
    {!query.isLoading && !query.error && !query.data?.length && <Text style={s.body}>No doctor-issued prescriptions yet.</Text>}
    {query.data?.map(rx => <View key={rx.id} style={s.card}><Text style={s.title}>{rx.doctor?.user.fullName || 'Doctor'}</Text><Text style={s.body}>{new Date(rx.prescribedAt).toLocaleString()} · {rx.corrections?.length ? 'Superseded' : 'Issued'}</Text>{rx.items.map(item => <View key={item.id}><Text style={s.title}>{item.medicationName}</Text><Text style={s.body}>{item.dosage} · {item.frequency} · {item.durationDays} days</Text></View>)}<Text style={s.body}>{rx.instructions || 'No additional instructions.'}</Text><Button mode="contained" loading={busy === rx.id} disabled={!!busy} onPress={() => void download(rx.id)}>Download / share PDF</Button></View>)}
  </WorkflowPage>;
}
