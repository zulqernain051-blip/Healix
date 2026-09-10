import React from 'react';
import { Stack } from 'expo-router';
import { COLORS } from '../../../theme';

export default function VisitsStack() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.bg },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="check-in" />
      <Stack.Screen name="patient-summary" />
      <Stack.Screen name="vitals" />
      <Stack.Screen name="symptoms" />
      <Stack.Screen name="remarks" />
      <Stack.Screen name="verification" />
      <Stack.Screen name="risk-assess" />
      <Stack.Screen name="care-plan" />
      <Stack.Screen name="prescription-view" />
      <Stack.Screen name="visit-complete" />
    </Stack>
  );
}
