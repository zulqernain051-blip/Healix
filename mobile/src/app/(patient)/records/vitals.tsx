import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../store/auth';
import { useVitalsHistory } from '../../../hooks/useRecords';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../../theme';
import { LoadingState } from '../../../components/common/LoadingState';
import { ErrorState } from '../../../components/common/ErrorState';

export default function VitalsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const patientId = user?.patientId || '';
  
  const { data: vitalsHistory, isLoading, error, refetch } = useVitalsHistory(patientId);
  const [selectedRange, setSelectedRange] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Week');

  if (isLoading && !vitalsHistory) return <LoadingState message="Loading vitals..." />;
  if (error) return <ErrorState error={error as Error} onRetry={refetch} />;

  // Process data for UI based on vitalsHistory from backend
  const vitalsMetrics = [
    {
      title: 'Heart Rate',
      value: vitalsHistory?.find(v => v.type === 'HEART_RATE')?.value || '--',
      unit: 'bpm',
      status: 'Normal',
      sparkHeights: [45, 60, 35, 75, 50, 80, 65, 70, 85, 60, 78], // Mocked sparkline for now
    },
    {
      title: 'Blood Pressure',
      value: (vitalsHistory?.find(v => (v as any).systolic) as any) 
        ? `${(vitalsHistory?.find(v => (v as any).systolic) as any).systolic}/${(vitalsHistory?.find(v => (v as any).diastolic) as any).diastolic}` 
        : '--/--',
      unit: 'mmHg',
      status: 'Normal',
      sparkHeights: [60, 55, 65, 70, 60, 65, 75, 70, 65, 60, 72],
    },
    {
      title: 'Temperature',
      value: vitalsHistory?.find(v => v.type === 'TEMPERATURE')?.value || '--',
      unit: '°C',
      status: 'Normal',
      sparkHeights: [50, 52, 50, 54, 50, 52, 51, 50, 53, 50, 51],
    },
    {
      title: 'Oxygen Saturation',
      value: vitalsHistory?.find(v => v.type === 'SPO2')?.value || '--',
      unit: '%',
      status: 'Normal',
      sparkHeights: [85, 90, 88, 92, 90, 95, 92, 94, 96, 95, 98],
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#061C19" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vitals</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Time Filter Pills */}
        <View style={styles.timeFilterContainer}>
          {(['Day', 'Week', 'Month', 'Year'] as const).map(range => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timePill,
                selectedRange === range && styles.timePillActive,
              ]}
              onPress={() => setSelectedRange(range)}
            >
              <Text
                style={[
                  styles.timePillText,
                  selectedRange === range && styles.timePillTextActive,
                ]}
              >
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Vitals Metric Cards with Waveform Bars */}
        <View style={styles.metricsList}>
          {vitalsMetrics.map((item, index) => (
            <View key={index} style={styles.metricCard}>
              <View style={styles.cardTopRow}>
                <View>
                  <Text style={styles.metricTitle}>{item.title}</Text>
                  <View style={styles.valUnitRow}>
                    <Text style={styles.metricVal}>{item.value}</Text>
                    <Text style={styles.metricUnit}> {item.unit}</Text>
                  </View>
                </View>

                <View style={styles.normalPill}>
                  <Text style={styles.greenDot}>●</Text>
                  <Text style={styles.normalText}>{item.status}</Text>
                </View>
              </View>

              {/* Sparkline Visual Bar Waveform */}
              <View style={styles.sparklineRow}>
                {item.sparkHeights.map((h, i) => (
                  <View
                    key={i}
                    style={[
                      styles.sparkBar,
                      {
                        height: (h / 100) * 32,
                        backgroundColor: i === item.sparkHeights.length - 1 ? '#00E676' : 'rgba(0, 230, 118, 0.4)',
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#061C19',
  },
  container: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
  },
  timeFilterContainer: {
    flexDirection: 'row',
    backgroundColor: '#0A2D28',
    borderRadius: RADIUS.md,
    padding: 4,
    marginBottom: SPACING.xl,
  },
  timePill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  timePillActive: {
    backgroundColor: '#00E676',
  },
  timePillText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  timePillTextActive: {
    color: '#061C19',
    fontWeight: '700',
  },
  metricsList: {
    gap: SPACING.lg,
  },
  metricCard: {
    backgroundColor: '#0A2D28',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  metricTitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 4,
  },
  valUnitRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricVal: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '800',
  },
  metricUnit: {
    color: '#94A3B8',
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  normalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  greenDot: {
    color: '#00E676',
    fontSize: 8,
    marginRight: 4,
  },
  normalText: {
    color: '#00E676',
    fontSize: 11,
    fontWeight: '600',
  },
  sparklineRow: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  sparkBar: {
    width: 6,
    borderRadius: 3,
  },
});
