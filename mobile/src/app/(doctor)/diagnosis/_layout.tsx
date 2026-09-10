import React from 'react';
import { Stack } from 'expo-router';
import { COLORS } from '../../../theme';

export default function DiagnosisStack() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.bg },
      }}
    >
      <Stack.Screen name="[id]" />
      <Stack.Screen name="careplan" />
      <Stack.Screen name="prescription" />
    </Stack>
  );
}
