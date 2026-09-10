import React from 'react';
import { Stack } from 'expo-router';

export default function CarePlanStack() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A1628' } }}>
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
