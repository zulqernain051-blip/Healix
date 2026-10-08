import { useState } from 'react';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/auth';
import { useNurseVerification } from '../../../hooks/useNurse';
import { WorkflowPage, flowStyles as s } from '../../../components/common/WorkflowPage';
import { uploadFile, downloadPrivateFile } from '../../../utils/fileTransfer';
import { navigate } from '../../../utils/navigation';
import { Linking } from 'react-native';
const documents = [['CNIC_FRONT', 'Identity document (front)'], ['CNIC_BACK', 'Identity document (back)'], ['NURSE_LICENSE', 'Nursing license'], ['DEGREE', 'Degree'], ['BACKGROUND_CHECK', 'Background check']];
export default function VerificationScreen() {
  const user = useAuthStore(state => state.user); const logout = useAuthStore(state => state.logout); const id = user?.nurseId || ''; const q = useNurseVerification(id); const qc = useQueryClient();
  const [busy, setBusy] = useState(''); const [error, setError] = useState('');
  const upload = async (documentType: string) => { setError(''); try { const selected = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/png', 'image/jpeg'], copyToCacheDirectory: true }); if (selected.canceled) return; setBusy(documentType); await uploadFile(`/nurses/${id}/verification/file`, selected.assets[0], { documentType }); await qc.invalidateQueries({ queryKey: ['nurse', id, 'verification'] }); } catch(e: any) { setError(e.message); } finally { setBusy(''); } };
  const view = async (url: string, key: string) => { setBusy(key); setError(''); try { const parsed = new URL(url); if (parsed.pathname.startsWith(`/api/v1/nurses/${id}/documents/`)) await downloadPrivateFile(parsed.pathname.replace('/api/v1', ''), parsed.pathname.split('/').pop()!); else if (['https:', 'http:'].includes(parsed.protocol)) await Linking.openURL(url); } catch(e: any) { setError(e.message); } finally { setBusy(''); } };
  return <WorkflowPage title="Professional Verification" loading={q.isLoading} error={error || q.error?.message} retry={() => void q.refetch()}><Text style={s.body}>{q.data?.isFullyVerified ? 'All required documents are approved.' : 'Submit each document for administrator review. Pending accounts cannot accept care work.'}</Text><Button onPress={() => navigate('/(nurse)/(tabs)/profile')}>Complete professional profile</Button>{documents.map(([key, label]) => { const check = q.data?.checks[key]; return <View key={key} style={s.card}><Text style={s.title}>{label}</Text><Text style={s.body}>{check?.status || 'NOT SUBMITTED'}</Text>{check?.rejectionReason && <Text style={s.body}>Review note: {check.rejectionReason}</Text>}{check?.fileUrl && <Button disabled={!!busy} onPress={() => void view(check.fileUrl!, key)}>View submitted document</Button>}<Button mode="contained" loading={busy === key} disabled={!!busy} onPress={() => void upload(key)}>{check?.fileUrl ? 'Replace document' : 'Choose & upload document'}</Button></View>; })}<Button onPress={() => void useAuthStore.getState().loadUser()}>Refresh account approval</Button><Button onPress={() => void logout()}>Sign out</Button></WorkflowPage>;
}
