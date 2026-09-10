import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { RADIUS, SPACING } from '../../theme';

export interface WorkflowStep {
  key: 'summary' | 'checkin' | 'vitals' | 'symptoms' | 'remarks' | 'risk' | 'complete';
  label: string;
  completed: boolean;
  active: boolean;
}

interface VisitProgressBarProps {
  steps: WorkflowStep[];
}

export const VisitProgressBar: React.FC<VisitProgressBarProps> = ({ steps }) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {steps.map((step, idx) => (
          <View key={step.key} style={styles.stepGroup}>
            <View
              style={[
                styles.stepChip,
                step.completed && styles.completedChip,
                step.active && styles.activeChip,
              ]}
            >
              <Text
                style={[
                  styles.stepIcon,
                  step.completed && styles.completedText,
                  step.active && styles.activeText,
                ]}
              >
                {step.completed ? '✓' : step.active ? '●' : '○'}
              </Text>
              <Text
                style={[
                  styles.stepLabel,
                  step.completed && styles.completedText,
                  step.active && styles.activeText,
                ]}
              >
                {step.label}
              </Text>
            </View>

            {idx < steps.length - 1 && (
              <View style={[styles.connector, step.completed && styles.completedConnector]} />
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A2D28',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  scrollContent: {
    alignItems: 'center',
  },
  stepGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.round,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  completedChip: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
  },
  activeChip: {
    backgroundColor: '#00E676',
  },
  stepIcon: {
    color: '#6B8E8A',
    fontSize: 10,
    marginRight: 4,
    fontWeight: '700',
  },
  stepLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },
  completedText: {
    color: '#00E676',
    fontWeight: '700',
  },
  activeText: {
    color: '#061C19',
    fontWeight: '800',
  },
  connector: {
    width: 12,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 4,
  },
  completedConnector: {
    backgroundColor: '#00E676',
  },
});
