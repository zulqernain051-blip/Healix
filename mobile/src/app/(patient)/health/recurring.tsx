import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Card, TextInput, Button, Divider, SegmentedButtons } from 'react-native-paper';
import { navigate } from '../../../utils/navigation';
import { useAuthStore } from '../../../store/auth';
// import { useCareStore } from '../../../store/care';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../../theme';

export default function RecurringVisitSetupScreen() {
  const { user, accessToken } = useAuthStore();
  // const { scheduleRecurring, isLoading } = useCareStore();
  // TODO: Phase 10 - Implement these using React Query
  const isLoading = false;

  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY' | 'BIWEEKLY'>('WEEKLY');
  const [occurrences, setOccurrences] = useState('4');
  const [weeksAhead, setWeeksAhead] = useState('4');

  const handleSubmit = async () => {
    const patientId = user?.patientId;
    if (!patientId || !accessToken) {
      Alert.alert('Error', 'Patient profile not verified.');
      return;
    }

    const count = parseInt(occurrences, 10);
    if (isNaN(count) || count <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid positive number of occurrences.');
      return;
    }

    const weeks = parseInt(weeksAhead, 10);
    if (isNaN(weeks) || weeks <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid positive number of weeks ahead.');
      return;
    }

    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + weeks * 7);

      /*
      await scheduleRecurring(
        {
          patientId,
          frequency,
          endDate: endDate.toISOString(),
          occurrences: count
        },
        accessToken
      );

      Alert.alert(
        'Recurring Pattern Seeded',
        `Successfully generated recurring visits!\n\nFrequency: ${frequency}\nVisits generated 4 weeks in advance: ${count}`,
        [
          {
            text: 'OK',
            onPress: () => {
              navigate('/(patient)/requests');
            }
          }
        ]
      );
      */
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to schedule recurring visits.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#061C19" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Setup Recurring Visits</Text>
        </View>

        <Text style={styles.subtitle}>Configure a repeat cycle schedule for clinical checkups</Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Choose Frequency</Text>
            <Divider style={styles.divider} />

            <SegmentedButtons
              value={frequency}
              onValueChange={(val) => setFrequency(val as any)}
              buttons={[
                { value: 'DAILY', label: 'Daily' },
                { value: 'WEEKLY', label: 'Weekly' },
                { value: 'BIWEEKLY', label: 'Bi-Weekly' }
              ]}
              theme={{
                colors: {
                  secondaryContainer: '#00E676',
                  onSecondaryContainer: '#061C19',
                }
              }}
              style={{ marginBottom: 20 }}
            />

            <TextInput
              label="Total Occurrences"
              value={occurrences}
              onChangeText={setOccurrences}
              keyboardType="numeric"
              placeholder="e.g. 4 or 8 visits"
              placeholderTextColor="#6B8E8A"
              mode="outlined"
              activeOutlineColor="#00E676"
              outlineColor="rgba(0, 230, 118, 0.2)"
              textColor="#FFFFFF"
              style={styles.input}
              theme={{ colors: { onSurfaceVariant: '#94A3B8' } }}
            />

            <TextInput
              label="Generate Weeks Ahead"
              value={weeksAhead}
              onChangeText={setWeeksAhead}
              keyboardType="numeric"
              placeholder="e.g. 4 weeks"
              placeholderTextColor="#6B8E8A"
              mode="outlined"
              activeOutlineColor="#00E676"
              outlineColor="rgba(0, 230, 118, 0.2)"
              textColor="#FFFFFF"
              style={styles.input}
              theme={{ colors: { onSurfaceVariant: '#94A3B8' } }}
            />

            <Button
              mode="contained"
              buttonColor="#00E676"
              textColor="#061C19"
              loading={isLoading}
              disabled={isLoading || occurrences.trim().length === 0}
              onPress={handleSubmit}
              style={styles.btn}
              labelStyle={{ fontWeight: '700' }}
            >
              Create Recurring Series
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#061C19',
  },
  container: { flex: 1, backgroundColor: '#061C19' },
  content: { padding: SPACING.lg, paddingBottom: 40 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
  },
  subtitle: { color: '#94A3B8', fontSize: 13, marginBottom: SPACING.lg },
  card: { backgroundColor: '#0A2D28', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.15)' },
  cardTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  divider: { backgroundColor: 'rgba(0, 230, 118, 0.1)', marginVertical: 12 },
  input: { backgroundColor: '#051815', marginBottom: 16 },
  btn: { borderRadius: RADIUS.md, marginTop: 8, paddingVertical: 4 }
});
