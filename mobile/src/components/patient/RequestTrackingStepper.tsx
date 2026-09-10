import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

interface Step {
  title: string;
  sub?: string;
  time: string;
  status: 'completed' | 'current' | 'pending';
}

interface RequestTrackingStepperProps {
  steps: Step[];
}

export const RequestTrackingStepper: React.FC<RequestTrackingStepperProps> = ({ steps }) => {
  return (
    <View style={styles.card}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <View key={index} style={styles.item}>
            <View style={styles.leftCol}>
              <View
                style={[
                  styles.dot,
                  step.status === 'completed' && styles.dotCompleted,
                  step.status === 'current' && styles.dotCurrent,
                  step.status === 'pending' && styles.dotPending,
                ]}
              >
                {step.status === 'completed' ? (
                  <Text style={styles.checkIcon}>✓</Text>
                ) : step.status === 'current' ? (
                  <View style={styles.innerDot} />
                ) : null}
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.line,
                    step.status === 'completed' && styles.lineActive,
                  ]}
                />
              )}
            </View>

            <View style={styles.rightCol}>
              <Text
                style={[
                  styles.stepTitle,
                  step.status === 'current' && styles.stepTitleCurrent,
                ]}
              >
                {step.title}
              </Text>
              {step.sub && <Text style={styles.stepSub}>{step.sub}</Text>}
              <Text style={styles.stepTime}>{step.time}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0A2D28',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  item: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  leftCol: {
    alignItems: 'center',
    marginRight: SPACING.md,
    width: 24,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotCompleted: {
    backgroundColor: '#00E676',
  },
  dotCurrent: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#00E676',
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00E676',
  },
  dotPending: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#6B8E8A',
  },
  checkIcon: {
    color: '#061C19',
    fontSize: 12,
    fontWeight: '800',
  },
  line: {
    width: 2,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 4,
  },
  lineActive: {
    backgroundColor: '#00E676',
  },
  rightCol: {
    flex: 1,
    paddingBottom: SPACING.md,
  },
  stepTitle: {
    color: '#E2E8F0',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  stepTitleCurrent: {
    color: '#00E676',
    fontWeight: '700',
  },
  stepSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  stepTime: {
    color: '#6B8E8A',
    fontSize: 10,
    marginTop: 2,
  },
});
