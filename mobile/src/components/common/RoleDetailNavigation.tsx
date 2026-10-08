import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { Text } from 'react-native-paper';
import { COLORS, SPACING, TYPOGRAPHY } from '../../theme';

type Role = 'patient' | 'nurse';

export function RoleDetailNavigation({ role }: { role: Role }) {
  const router = useRouter();
  const segments = useSegments() as string[];
  if (segments.includes('(tabs)')) return null;

  const tabs = role === 'patient'
    ? [['Home', 'home'], ['Care', 'requests'], ['Records', 'records'], ['Messages', 'messages'], ['Profile', 'profile']]
    : [['Home', 'home'], ['Visits', 'visits'], ['Market', 'marketplace'], ['Messages', 'messages'], ['Profile', 'profile']];

  return <View>
    <TouchableOpacity accessibilityRole="button" onPress={() => router.canGoBack() ? router.back() : router.replace(`/${role}/(tabs)/home` as any)} style={styles.back}>
      <Text style={styles.backText}>Back</Text>
    </TouchableOpacity>
    <View style={styles.tabs}>
      {tabs.map(([label, screen]) => <TouchableOpacity key={screen} accessibilityRole="button" onPress={() => router.replace(`/${role}/(tabs)/${screen}` as any)} style={styles.tab}>
        <Text style={styles.tabText}>{label}</Text>
      </TouchableOpacity>)}
    </View>
  </View>;
}

const styles = StyleSheet.create({
  back: { backgroundColor: COLORS.surfaceCard, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.inputBorder },
  backText: { color: COLORS.navy, ...TYPOGRAPHY.bodyMedium, fontWeight: '700' },
  tabs: { flexDirection: 'row', backgroundColor: COLORS.surfaceCard, borderTopWidth: 1, borderTopColor: COLORS.inputBorder, paddingBottom: SPACING.sm },
  tab: { flex: 1, alignItems: 'center', paddingVertical: SPACING.sm },
  tabText: { color: COLORS.navy, ...TYPOGRAPHY.bodySmall, fontWeight: '600' },
});
