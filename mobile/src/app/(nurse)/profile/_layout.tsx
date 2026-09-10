import React from 'react';
import { Stack } from 'expo-router';
import { COLORS } from '../../../theme';

export default function ProfileStack() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.bg },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="availability" />
      <Stack.Screen name="earnings" />
      <Stack.Screen name="performance" />
      <Stack.Screen name="reviews" />
    </Stack>
  );
}
