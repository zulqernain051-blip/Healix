import { useAppTheme } from '../../../theme/ThemeProvider';

import React from 'react';
import { Stack } from 'expo-router';


export default function DiagnosisStack() {
  const { colors: COLORS } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.bg },
      }}
    >
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
