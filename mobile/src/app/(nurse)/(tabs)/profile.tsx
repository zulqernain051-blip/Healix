import { useState } from 'react';
import { View } from 'react-native';
import { Text, Avatar, Button, TextInput } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/auth';
import { useNurseProfile, useNurseVerification, useDeleteQualification } from '../../../hooks/useNurse';
import { apiClient } from '../../../api/client';
import { uploadFile } from '../../../utils/fileTransfer';
import { navigate } from '../../../utils/navigation';
import { EditBioModal } from '../../../components/nurse/EditBioModal';
import { EditQualificationModal } from '../../../components/nurse/EditQualificationModal';
import { EditSpecializationModal } from '../../../components/nurse/EditSpecializationModal';
import { WorkflowPage, flowStyles as s } from '../../../components/common/WorkflowPage';
import { COLORS } from '../../../theme';
export default function NurseProfileScreen() {
  const { user, logout } = useAuthStore(); const id = user?.nurseId || ''; const q = useNurseProfile(id); const verification = useNurseVerification(id); const remove = useDeleteQualification(); const qc = useQueryClient();
  const [modal, setModal] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [certificate, setCertificate] = useState<Record<string, string>>({});
  const run = async (task: () => Promise<unknown>) => { setBusy(true); setError(''); try { await task(); await qc.invalidateQueries({ queryKey: ['nurse', id] }); } catch(e: any) { setError(e.message); } finally { setBusy(false); } };
  const photo = async () => { try { const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8 }); if (!result.canceled) await run(() => uploadFile(`/nurses/${id}/photo`, { uri: result.assets[0].uri, name: result.assets[0].fileName || 'photo.jpg', mimeType: result.assets[0].mimeType })); } catch(e: any) { setError(e.message); } };
  const p = q.data;
  return <WorkflowPage title="Nurse Profile" loading={q.isLoading} error={error || q.error?.message || verification.error?.message} retry={() => { void q.refetch(); void verification.refetch(); }}>
    {p && <><View style={s.card}>{p.photoUrl ? <Avatar.Image size={72} source={{ uri: p.photoUrl }} /> : <Avatar.Text size={72} label={(p.user.fullName || 'N').split(' ').map(n => n[0]).join('').slice(0, 2)} style={{ backgroundColor: COLORS.navy }} />}<Text style={s.title}>{p.user.fullName}</Text><Text style={s.body}>{p.user.email} · {p.user.phone}</Text><Text style={s.body}>PNC: {p.pncNumber} · Account: {p.user.status.replaceAll('_', ' ')}</Text><Text style={s.body}>{verification.data?.isFullyVerified ? 'All required verification documents approved' : 'Professional document verification incomplete'}</Text><Text style={s.body}>{p.bio || 'Add your biography.'}</Text><Text style={s.body}>{p.experience || 0} years of experience</Text><Button disabled={busy} loading={busy} onPress={() => void photo()}>Upload profile photo</Button><Button onPress={() => setModal('bio')}>Edit biography & experience</Button><Button onPress={() => navigate('/(nurse)/profile/verification')}>Verification documents</Button></View>
    <View style={s.card}><Text style={s.title}>Qualifications</Text>{p.qualifications.map(qual => <View key={qual.id}><Text style={s.body}>{qual.title} · {qual.issuingBody} · {qual.yearObtained}</Text><Button disabled={busy} onPress={() => void run(() => remove.mutateAsync({ nurseId: id, qualId: qual.id }))}>Remove qualification</Button></View>)}<Button onPress={() => setModal('qual')}>Add qualification</Button></View>
    <View style={s.card}><Text style={s.title}>Specializations</Text>{p.specializations.map(spec => <View key={spec.id}><Text style={s.body}>{spec.specialization.replaceAll('_', ' ')} · {spec.certified ? 'Certificate approved' : 'Certificate not approved'}</Text><TextInput style={s.input} label="Certificate URL" value={certificate[spec.id] ?? spec.certificateUrl ?? ''} onChangeText={value => setCertificate(c => ({ ...c, [spec.id]: value }))} /><Button disabled={busy || !(certificate[spec.id] || spec.certificateUrl)} onPress={() => void run(() => apiClient.put(`/nurses/${id}/specializations/${spec.id}/certificate`, { certificateUrl: (certificate[spec.id] ?? spec.certificateUrl)?.trim() }))}>Submit certificate for review</Button></View>)}<Button onPress={() => setModal('spec')}>Add specialization</Button></View>
    {user?.status === 'ACTIVE' && <View style={s.card}>{[['Analytics & Reports', '/analytics'], ['Availability & time off', '/(nurse)/profile/availability'], ['Recorded earnings', '/(nurse)/profile/earnings'], ['Performance & badges', '/(nurse)/profile/performance'], ['Patient reviews', '/(nurse)/profile/reviews'], ['Change password', '/auth/change-password'], ['Two-step verification', '/auth/security']].map(([label, path]) => <Button key={path} onPress={() => navigate(path as any)}>{label}</Button>)}</View>}
    <EditBioModal visible={modal === 'bio'} onClose={() => setModal('')} nurseId={id} initialBio={p.bio || ''} initialExperience={String(p.experience || 0)} initialPhotoUrl={p.photoUrl || ''} /><EditQualificationModal visible={modal === 'qual'} onClose={() => setModal('')} nurseId={id} /><EditSpecializationModal visible={modal === 'spec'} onClose={() => setModal('')} nurseId={id} /></>}
    <Button onPress={() => void logout()}>Sign out</Button>
  </WorkflowPage>;
}
