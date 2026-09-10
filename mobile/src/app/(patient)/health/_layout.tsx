import React from 'react';
import { Stack } from 'expo-router';
import { COLORS } from '../../../theme';

export default function HealthStack() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.bg },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="vitals" />
      <Stack.Screen name="medical" />
      <Stack.Screen name="careplans" />
      <Stack.Screen name="prescriptions" />
      <Stack.Screen name="caregivers" />
      <Stack.Screen name="recurring" />
    </Stack>
  );
}
