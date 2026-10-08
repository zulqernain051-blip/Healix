import { View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/auth';
import { apiClient } from '../../api/client';
import { navigate } from '../../utils/navigation';
import { WorkflowPage, flowStyles as s } from '../../components/common/WorkflowPage';
export default function PatientCarePlans() {
 const params = useLocalSearchParams<{ patientId?: string }>(); const user = useAuthStore(state => state.user); const patientId = params.patientId || user?.patientId || '';
 const plans = useQuery({ queryKey: ['carePlans', patientId], queryFn: () => apiClient.get<any[]>(`/patients/${patientId}/care-plans`), enabled: !!patientId });
 return <WorkflowPage title="Care plans and revisions" loading={plans.isLoading} error={plans.error?.message} retry={() => void plans.refetch()}>{!patientId && <Text style={s.body}>Choose a patient from your care workflow.</Text>}{plans.data?.length === 0 && <Text style={s.body}>No care plans have been recorded.</Text>}{plans.data?.map(plan => <View key={plan.id} style={s.card}><Text style={s.title}>{plan.title}</Text><Text style={s.body}>Version {plan.version} · {Math.round(plan.progress)}% complete</Text><Button onPress={() => navigate(`/care-plans/${plan.id}`)}>View plan and history</Button></View>)}</WorkflowPage>;
}
