import { useState } from 'react';
import { Text, TextInput, Button } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '../../api/auth.api';
import { WorkflowPage, flowStyles as s } from '../../components/common/WorkflowPage';
export default function SecurityScreen() {
 const q = useQuery({ queryKey: ['auth', 'security'], queryFn: authApi.getMe });
 const enabled = !!(q.data as any)?.mfaEnabled;
 const [requested, setRequested] = useState(false), [code, setCode] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState('');
 const run = async (confirm: boolean) => { setBusy(true); setError(''); try {
  if (confirm) { if (!/^\d{6}$/.test(code)) throw new Error('Enter the six-digit email code.'); if (enabled) await authApi.disableMfa(code); else await authApi.verifyEnableMfa(code); setRequested(false); setCode(''); await q.refetch(); }
  else { if (enabled) await authApi.requestDisableMfa(); else await authApi.enableMfa(); setRequested(true); }
 } catch(e: any) { setError(e.message); } finally { setBusy(false); } };
 return <WorkflowPage title="Account Security" loading={q.isLoading} error={error || q.error?.message} retry={() => void q.refetch()}><Text style={s.title}>Email two-step verification: {enabled ? 'enabled' : 'disabled'}</Text><Text style={s.body}>When enabled, sign-in requires your password and a code sent to your email. Changing this setting also requires an email code.</Text><Button mode="contained" disabled={busy || q.isLoading || !!q.error} loading={busy} onPress={() => void run(false)}>{requested ? 'Resend code' : enabled ? 'Request disable code' : 'Request enable code'}</Button>{requested && <><TextInput label="Six-digit email code" style={s.input} value={code} onChangeText={v => setCode(v.replace(/\D/g,'').slice(0,6))} keyboardType="number-pad" autoComplete="one-time-code" /><Button mode="contained" disabled={busy || code.length !== 6} onPress={() => void run(true)}>{enabled ? 'Confirm disable' : 'Confirm enable'}</Button></>}</WorkflowPage>;
}
