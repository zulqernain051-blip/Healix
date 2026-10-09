import { useAppTheme } from '../../../theme/ThemeProvider';

import React from 'react';
import { Stack } from 'expo-router';


export default function HealthStack() {
  const { colors: COLORS } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.bg },
      }}
    >
      <Stack.Screen name="index" />
      
      <Stack.Screen name="medical" />
      <Stack.Screen name="careplans" />
      <Stack.Screen name="prescriptions" />
      <Stack.Screen name="caregivers" />
      <Stack.Screen name="recurring" />
    </Stack>
  );
}
