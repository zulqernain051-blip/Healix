import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Appbar, Button, Card, Text } from 'react-native-paper';
import { clinicalDrafts, ClinicalDraft } from '../../../services/clinicalDrafts';
import { confirmAction } from '../../../components/common/AppDialogs';
import { goBack } from '../../../utils/navigation';
import { COLORS, SPACING, RADIUS } from '../../../theme';
import { useQueryClient } from '@tanstack/react-query';

export default function NurseSyncScreen() {
 const [drafts, setDrafts] = useState<ClinicalDraft[]>([]);
 const [busy, setBusy] = useState(true); const [error, setError] = useState('');
 const query = useQueryClient();
 const pending = drafts.filter(item => !item.archivedAt);
 const archive = async (item: ClinicalDraft) => { if (!item.archivedAt && !await confirmAction('Archive undelivered draft', 'This observation will remain on this device, but will not be sent. Review it with your care team before archiving.')) return; setBusy(true); try { setDrafts(await clinicalDrafts.archive(item.id, !item.archivedAt)); } catch(e) { setError(e instanceof Error ? e.message : 'Could not archive draft'); } finally { setBusy(false); } }; 
 const refresh = async () => { setBusy(true); setError(''); try { setDrafts(await clinicalDrafts.list()); } catch (e) { setError(e instanceof Error ? e.message : 'Could not read drafts'); } finally { setBusy(false); } };
 useEffect(() => { void refresh(); }, []);
 const sync = async () => { setBusy(true); setError(''); try { const remaining = await clinicalDrafts.sync(); setDrafts(remaining); if (remaining.some(item => !item.archivedAt)) setError('Some drafts need attention. Review the messages below.'); await query.invalidateQueries({ queryKey: ['visits'] }); } catch (e) { setError(e instanceof Error ? e.message : 'Could not sync drafts'); } finally { setBusy(false); } };
 return <SafeAreaView style={styles.page}><Appbar.Header style={{ backgroundColor: COLORS.surfaceCard }}><Appbar.BackAction onPress={goBack}/><Appbar.Content title="Offline drafts" /></Appbar.Header><ScrollView contentContainerStyle={styles.content}>
  <Text variant="headlineSmall" style={styles.title}>Offline clinical drafts</Text>
  <Text style={styles.body}>Vitals and symptoms with unconfirmed delivery are saved on this device for your account. Clinical decisions, verification and emergency escalation require a connection. Sync drafts before completing a visit.</Text>
  <View style={styles.actions}><Button mode="contained" buttonColor={COLORS.navy} textColor={COLORS.headerText} onPress={sync} loading={busy} disabled={busy || !pending.length}>Sync drafts ({pending.length})</Button><Button textColor={COLORS.navy} onPress={refresh} disabled={busy}>Refresh</Button></View>
  {!!error && <Text style={styles.error}>{error}</Text>}
  {!busy && !drafts.length && !error && <Text style={styles.body}>No pending clinical drafts.</Text>}
  {drafts.map(item => <Card key={item.id} style={styles.card}><Card.Content>
   <Text style={styles.title}>{item.kind === 'VITALS' ? 'Vitals' : 'Symptoms'} · {item.archivedAt ? 'Archived on device' : 'awaiting delivery'}</Text>
   <Text style={styles.body}>Visit: {item.visitId}</Text><Text style={styles.body}>Captured: {new Date(item.capturedAt).toLocaleString()}</Text>
   <Text style={styles.body}>{JSON.stringify(item.data, null, 2)}</Text>
   {!!item.error && <Text style={styles.error}>{item.error}</Text>}<Button disabled={busy} textColor={COLORS.navy} onPress={() => void archive(item)}>{item.archivedAt ? 'Restore for sync' : 'Archive on device'}</Button>
  </Card.Content></Card>)}
 </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: COLORS.surface }, content: { padding: SPACING.lg, gap: SPACING.lg }, title: { color: COLORS.textDark }, body: { color: COLORS.textBody, marginTop: SPACING.sm }, error: { color: COLORS.red }, actions: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' }, card: { backgroundColor: COLORS.surfaceCard, borderRadius: RADIUS.lg } });
