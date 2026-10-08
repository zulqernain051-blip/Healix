import { ScrollView, StyleSheet } from 'react-native';
import { Appbar, Avatar, Button, Card, Text } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/auth';
import { authApi } from '../../../api/auth.api';
import { navigate } from '../../../utils/navigation';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../../theme';

export default function DoctorProfileScreen() {
  const { user, logout } = useAuthStore();
  const profile = useQuery({ queryKey: ['doctor', 'profile', user?.id], queryFn: authApi.getMe });
  const current = profile.data || user;
  const doctor = profile.data?.doctor;
  return <ScrollView style={styles.root} contentContainerStyle={styles.content}>
    <Appbar.Header style={styles.header}><Appbar.Content title="Doctor Profile" color={COLORS.headerText} /></Appbar.Header>
    <Card style={styles.card}><Card.Content><Avatar.Text size={SPACING.xxxl * 2} label={(current?.fullName || 'Doctor').split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('')} style={styles.avatar} color={COLORS.headerText} /><Text style={styles.title}>{current?.fullName || 'Doctor'}</Text><Text style={styles.body}>{current?.email || 'Email not provided'}</Text><Text style={styles.body}>{current?.phone || 'Phone not provided'}</Text><Text style={styles.body}>Account: {current?.status || 'Unavailable'}</Text></Card.Content></Card>
    <Card style={styles.card}><Card.Content><Text style={styles.title}>Professional credentials</Text>{profile.isLoading ? <Text>Loading credentials…</Text> : profile.error ? <><Text accessibilityRole="alert" style={styles.error}>{(profile.error as Error).message}</Text><Button onPress={() => void profile.refetch()}>Retry</Button></> : <><Text style={styles.body}>PMDC number: {doctor?.pmdcNumber || 'Not provided'}</Text><Text style={styles.body}>Verification: {doctor?.verificationStatus || 'Unavailable'}</Text><Text style={styles.body}>Emergency availability: {doctor ? doctor.emergencyAvailable ? 'Available' : 'Unavailable' : 'Unknown'}</Text>{doctor?.bio && <Text style={styles.body}>{doctor.bio}</Text>}</>}</Card.Content></Card>
    <Button mode="contained" buttonColor={COLORS.navy} onPress={() => navigate('/(doctor)/(tabs)/home')}>Review patient cases</Button>
    <Button textColor={COLORS.navy} icon="ambulance" onPress={() => navigate('/(doctor)/emergency')}>Emergency dispatches & admissions</Button>
    <Button textColor={COLORS.navy} icon="message-outline" onPress={() => navigate('/(doctor)/(tabs)/messages')}>Messages</Button>
    <Button textColor={COLORS.navy} icon="lock-outline" onPress={() => navigate('/auth/change-password')}>Change password</Button>
    <Button mode="outlined" textColor={COLORS.red} onPress={() => void logout()}>Sign out</Button>
  </ScrollView>;
}
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: COLORS.surface }, content: { padding: SPACING.lg, gap: SPACING.lg }, header: { backgroundColor: COLORS.navy, borderRadius: RADIUS.lg }, card: { backgroundColor: COLORS.surfaceCard }, avatar: { backgroundColor: COLORS.navy, marginBottom: SPACING.md }, title: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.textDark, marginBottom: SPACING.sm }, body: { color: COLORS.textBody, marginBottom: SPACING.sm }, error: { color: COLORS.red } });
