


import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { Contract } from '../../types/contract';
import { useFlowStyles } from '../common/WorkflowPage';
export function ContractHistory({contract}:{contract:Contract}) {
  const s = useFlowStyles();

 return <View style={s.card}><Text style={s.title}>Contract history</Text>
  <Text style={s.body}>Approval deadline: {new Date(contract.expiresAt).toLocaleString()}</Text>
  {contract.auditLogs?.length ? contract.auditLogs.map(log => <View key={log.id}><Text style={s.title}>{log.action.replaceAll('_',' ')} · {log.actorRole}</Text><Text style={s.body}>{new Date(log.createdAt).toLocaleString()}</Text>{log.note && <Text style={s.body}>{log.note}</Text>}</View>) : <Text style={s.body}>No audit events recorded.</Text>}
 </View>;
}
