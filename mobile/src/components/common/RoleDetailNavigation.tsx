import { useAppTheme, useThemeValue } from '../../theme/ThemeProvider';
import type { ThemeColors } from '../../theme';
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { Text } from 'react-native-paper';
import { SPACING, TYPOGRAPHY } from '../../theme';

type Role = 'patient' | 'nurse';

export function RoleDetailNavigation({ role }: { role: Role }) {
  const { colors: COLORS } = useAppTheme();
  const styles = useThemeValue(createStyles);

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

const createStyles = (COLORS: ThemeColors) => (StyleSheet.create({
  back: { backgroundColor: COLORS.surfaceCard, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.inputBorder },
  backText: { color: COLORS.primaryText, ...TYPOGRAPHY.bodyMedium, fontWeight: '700' },
  tabs: { flexDirection: 'row', backgroundColor: COLORS.surfaceCard, borderTopWidth: 1, borderTopColor: COLORS.inputBorder, paddingBottom: SPACING.sm },
  tab: { flex: 1, alignItems: 'center', paddingVertical: SPACING.sm },
  tabText: { color: COLORS.primaryText, ...TYPOGRAPHY.bodySmall, fontWeight: '600' },
}));
