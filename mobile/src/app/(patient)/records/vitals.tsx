import { useState } from 'react';
import { View } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { useAuthStore } from '../../../store/auth';
import { useVitalsHistory } from '../../../hooks/useRecords';
import { WorkflowPage, flowStyles as s } from '../../../components/common/WorkflowPage';
const ranges = { Day: 1, Week: 7, Month: 30, Year: 365, All: Infinity };
export default function VitalsScreen() {
  const id = useAuthStore(state => state.user?.patientId) || ''; const q = useVitalsHistory(id); const [range, setRange] = useState<keyof typeof ranges>('Week');
  const rows = q.data?.filter(v => Date.parse(v.recordedAt) >= Date.now() - ranges[range] * 86400000) || [];
  return <WorkflowPage title="Vitals History" loading={q.isLoading} error={q.error?.message} retry={() => void q.refetch()}><View style={s.row}>{Object.keys(ranges).map(r => <Chip key={r} selected={range === r} onPress={() => setRange(r as keyof typeof ranges)}>{r}</Chip>)}</View><Text style={s.body}>Measurements recorded during care visits. Your care team interprets these readings.</Text>{rows.map(v => <View key={v.id} style={s.card}><Text style={s.title}>{new Date(v.recordedAt).toLocaleString()}</Text><Text style={s.body}>Blood pressure: {v.systolic}/{v.diastolic} mmHg</Text><Text style={s.body}>Heart rate: {v.heartRate} bpm</Text><Text style={s.body}>Temperature: {v.temperature} °C</Text><Text style={s.body}>Oxygen saturation: {v.oxygenSaturation}%</Text>{v.bloodSugar != null && <Text style={s.body}>Blood glucose: {v.bloodSugar}</Text>}</View>)}{!q.isLoading && !q.error && !rows.length && <Text style={s.body}>No readings recorded in this period. Select All to check older visits.</Text>}</WorkflowPage>;
}
