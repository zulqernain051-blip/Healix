import { useState } from 'react';
import { Text, TextInput, Button } from 'react-native-paper';
import { authApi } from '../../api/auth.api';
import { navigate } from '../../utils/navigation';
import { WorkflowPage, flowStyles as s } from '../../components/common/WorkflowPage';
export default function InvitedRegistration() {
 const [fields, setFields] = useState({ invitationToken: '', email: '', phone: '', fullName: '', password: '', cnic: '', professionalId: '' });
 const [busy, setBusy] = useState(false), [error, setError] = useState('');
 const submit = async () => { setBusy(true); setError(''); try { const result: any = await authApi.registerInvited({ ...fields, professionalId: fields.professionalId.trim() || undefined }); if (result.emailVerificationRequired) navigate('/auth/verify-otp', { emailOrPhone: fields.email }); else navigate('/auth/login', { message: 'Account created. You can sign in now.' }); } catch(e: any) { setError(e.message); } finally { setBusy(false); } };
 return <WorkflowPage title="Accept Healix Invitation" error={error}><Text style={s.body}>Use the invitation token provided by your Healix administrator. Your role is determined by the invitation. Doctors and paramedics can sign in after creating their account.</Text>{Object.entries({ invitationToken: 'Invitation token', email: 'Email', phone: 'Pakistan phone number', fullName: 'Full name', password: 'New Healix password', cnic: 'CNIC (xxxxx-xxxxxxx-x)', professionalId: 'Professional credential (clinicians only)' }).map(([key,label]) => <TextInput key={key} label={label} value={fields[key as keyof typeof fields]} onChangeText={v => setFields(f => ({...f,[key]:v}))} secureTextEntry={key === 'password'} autoCapitalize={key === 'fullName' ? 'words' : 'none'} style={s.input} />)}<Button mode="contained" loading={busy} disabled={busy} onPress={() => void submit()}>Create account</Button></WorkflowPage>;
}
