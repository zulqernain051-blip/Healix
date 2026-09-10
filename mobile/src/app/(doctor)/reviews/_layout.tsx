import React from 'react';
import { Stack } from 'expo-router';
import { COLORS } from '../../../theme';

export default function ReviewsStack() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.bg },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="second-opinion" />
    </Stack>
  );
}
