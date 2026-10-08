import { useState } from 'react';
import { Text, TextInput, Button } from 'react-native-paper';
import { View } from 'react-native';
import { apiClient } from '../../api/client';
import { WorkflowPage, flowStyles as s } from '../../components/common/WorkflowPage';
export default function Invitations() {
 const [email,setEmail] = useState(''), [role,setRole] = useState('ADMIN'), [token,setToken] = useState(''), [busy,setBusy] = useState(false), [error,setError] = useState('');
 const submit = async () => { setBusy(true); setError(''); setToken(''); try { const result = await apiClient.post<any>('/admin/users/invite',{ email, role },{retry:false}); setToken(result.token); } catch(e:any) { setError(e.message); } finally { setBusy(false); } };
 return <WorkflowPage title="Invite an Account" error={error}><Text style={s.body}>Invite a specific email. Share the resulting token privately with that person; it expires after seven days and can be used once. They accept it from Sign In → Accept an invitation and choose their own password. Doctors and paramedics can sign in immediately afterward.</Text><TextInput label="Recipient email" style={s.input} value={email} onChangeText={setEmail} autoCapitalize="none" /><View style={s.row}>{['ADMIN','DOCTOR','PARAMEDIC','NURSE','PATIENT'].map(r => <Button key={r} mode={role === r ? 'contained' : 'outlined'} onPress={() => setRole(r)}>{r}</Button>)}</View><Button mode="contained" disabled={busy} loading={busy} onPress={() => void submit()}>Create invitation</Button>{!!token && <><Text style={s.title}>One-time invitation token</Text><Text selectable style={s.body}>{token}</Text></>}</WorkflowPage>;
}
