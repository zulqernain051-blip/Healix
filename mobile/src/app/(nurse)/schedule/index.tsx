import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../store/auth';
import { useNurseVisits } from '../../../hooks/useVisits';
import { VisitSummaryCard } from '../../../components/visits/VisitSummaryCard';
import { navigate } from '../../../utils/navigation';
import { scheduleRange, shiftScheduleDate, ScheduleView } from '../../../utils/schedule';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../../theme';
export default function NurseScheduleScreen() {
  const nurseId = useAuthStore(state => state.user?.nurseId);
  const { data = [], isLoading, isRefetching, error, refetch } = useNurseVisits(nurseId || '');
  const [view, setView] = useState<ScheduleView>('DAY');
  const [date, setDate] = useState(new Date());
  const { start, end } = scheduleRange(date, view);
  const visits = data.filter(visit => {
    const time = new Date(visit.request?.scheduledAt || '').getTime();
    return time >= start.getTime() && time < end.getTime();
  }).sort((a, b) => new Date(a.request!.scheduledAt!).getTime() - new Date(b.request!.scheduledAt!).getTime());
  const lastDay = new Date(end); lastDay.setDate(lastDay.getDate() - 1);
  const label = view === 'DAY' ? start.toLocaleDateString() : start.toLocaleDateString() + ' ? ' + lastDay.toLocaleDateString();
  return <SafeAreaView style={styles.container}>
    <Text style={styles.title}>Schedule</Text>
    <View style={styles.row}>{(['DAY', 'WEEK', 'MONTH'] as const).map(item => <TouchableOpacity key={item} accessibilityRole="button" accessibilityState={{ selected: view === item }} activeOpacity={0.8} style={[styles.button, view === item && styles.active]} onPress={() => setView(item)}><Text style={styles.text}>{item === 'DAY' ? 'Day' : item === 'WEEK' ? 'Week' : 'Month'}</Text></TouchableOpacity>)}</View>
    <View style={styles.row}>
      <TouchableOpacity accessibilityLabel="Previous period" activeOpacity={0.8} style={styles.button} onPress={() => setDate(shiftScheduleDate(date, view, -1))}><Text style={styles.text}>Previous</Text></TouchableOpacity>
      <TouchableOpacity activeOpacity={0.8} style={styles.button} onPress={() => setDate(new Date())}><Text style={styles.text}>Today</Text></TouchableOpacity>
      <TouchableOpacity accessibilityLabel="Next period" activeOpacity={0.8} style={styles.button} onPress={() => setDate(shiftScheduleDate(date, view, 1))}><Text style={styles.text}>Next</Text></TouchableOpacity>
    </View>
    <Text style={styles.caption}>{label}</Text>
    <ScrollView refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => { void refetch(); }} />}>
      {isLoading ? <Text style={styles.text}>Loading visits...</Text> : error ? <TouchableOpacity activeOpacity={0.8} onPress={() => { void refetch(); }}><Text style={styles.error}>Unable to load schedule. Tap to retry.</Text></TouchableOpacity> : !nurseId ? <Text style={styles.text}>Your nurse profile is unavailable.</Text> : visits.length === 0 ? <Text style={styles.text}>No visits scheduled for this period.</Text> : visits.map(visit => <VisitSummaryCard key={visit.id} visit={visit} onPress={() => navigate('/(nurse)/visits/' + visit.id)} />)}
    </ScrollView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: SPACING.lg, gap: SPACING.md, backgroundColor: COLORS.surface },
  title: { color: COLORS.navy, fontSize: TYPOGRAPHY.sizes.xxl, fontWeight: TYPOGRAPHY.weights.bold },
  row: { flexDirection: 'row', gap: SPACING.sm },
  button: { flex: 1, minHeight: SPACING.lg * 3, padding: SPACING.sm, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.md, backgroundColor: COLORS.surfaceMuted },
  active: { backgroundColor: COLORS.quickBlue, borderWidth: 1, borderColor: COLORS.accentBlue },
  text: { color: COLORS.textDark, fontSize: TYPOGRAPHY.sizes.md },
  caption: { color: COLORS.textBody, fontSize: TYPOGRAPHY.sizes.sm }, error: { color: COLORS.red, padding: SPACING.lg },
});
