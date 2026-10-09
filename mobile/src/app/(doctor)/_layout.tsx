import { useAppTheme, useThemeValue, usePaperTheme } from '../../theme/ThemeProvider';
import type { ThemeColors } from '../../theme';
import React from 'react';
import { View, StyleSheet, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { Stack, usePathname } from 'expo-router';
import { navigate } from '../../utils/navigation';
import { Text, Avatar, Provider as PaperProvider } from 'react-native-paper';
import { useAuthStore } from '../../store/auth';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

function DoctorRootLayout() {
  const { colors: COLORS } = useAppTheme();
  const styles = useThemeValue(createStyles);

  const { user } = useAuthStore();
  const { width } = useWindowDimensions();
  const pathname = usePathname();

  const isLargeScreen = width > 768;

  if (isLargeScreen) {
    const navItems = [
      { name: 'Case Queue', path: '/(doctor)/(tabs)/home', icon: 'medkit-outline' },
      { name: 'Messages & Consults', path: '/(doctor)/(tabs)/messages', icon: 'chatbubbles-outline' },
      { name: 'Emergency Transport', path: '/(doctor)/emergency', icon: 'car-outline' },
      { name: 'Profile & PMDC', path: '/(doctor)/(tabs)/profile', icon: 'person-outline' },
    ];

    const currentActive = pathname;

    return (
      <View style={styles.webContainer}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.brandTitle}>Healix Pro</Text>
            <Text style={styles.brandSub}>Doctor Portal</Text>
          </View>

          <View style={styles.sidebarProfile}>
            <Avatar.Icon size={40} icon="stethoscope" color={COLORS.headerText} style={styles.avatarBg} />
            <View style={styles.profileTextWrap}>
              <Text style={styles.sidebarProfileName} numberOfLines={1}>{user?.fullName ?? 'Doctor'}</Text>
              <Text style={styles.sidebarProfileRole}>Doctor account</Text>
            </View>
          </View>

          <View style={styles.navMenu}>
            {navItems.map((item: any) => {
              const leaf = item.path.split('/').pop();
              const isActive = currentActive.includes(`/${leaf}`) || (leaf === 'home' && !['messages', 'profile', 'emergency'].some(part => currentActive.includes(part)));
              return (
                <TouchableOpacity
                  key={item.path}
                  style={[styles.sidebarNavItem, isActive && styles.sidebarNavItemActive]}
                  onPress={() => navigate(item.path as any)}
                >
                  <Ionicons name={item.icon} size={20} color={isActive ? COLORS.headerText : COLORS.headerText} style={{ width: 24 }} />
                  <Text style={[styles.sidebarNavLabel, isActive && styles.sidebarNavLabelActive]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.sidebarFooter}>
            <Text style={styles.encryptionNotice}>Healix clinical workspace</Text>
          </View>
        </View>

        {/* Content Area */}
        <View style={styles.webContent}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="action" />
            <Stack.Screen name="careplan" />
            <Stack.Screen name="diagnosis" />
            <Stack.Screen name="reviews" />
          </Stack>
        </View>
      </View>
    );
  }

  // Mobile Layout
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="action" />
      <Stack.Screen name="careplan" />
      <Stack.Screen name="diagnosis" />
      <Stack.Screen name="reviews" />
    </Stack>
  );
}

const createStyles = (COLORS: ThemeColors) => (StyleSheet.create({
  webContainer: { flex: 1, flexDirection: 'row', backgroundColor: COLORS.surface },
  sidebar: { width: 250, backgroundColor: COLORS.navyDark, borderRightWidth: 1, borderRightColor: COLORS.inputBorder, paddingVertical: SPACING.xl, paddingHorizontal: SPACING.md, justifyContent: 'space-between' },
  sidebarHeader: { marginBottom: SPACING.xl, paddingHorizontal: SPACING.sm },
  brandTitle: { ...TYPOGRAPHY.h2, color: COLORS.headerText, fontWeight: 'bold', letterSpacing: -0.5 },
  brandSub: { marginTop: 2 },
  sidebarProfile: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, backgroundColor: COLORS.navy, borderRadius: RADIUS.md, marginBottom: SPACING.xl, borderWidth: 0.5, borderColor: COLORS.navy },
  avatarBg: { backgroundColor: COLORS.navy },
  profileTextWrap: { marginLeft: SPACING.sm, flex: 1 },
  sidebarProfileName: { color: COLORS.headerText, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: 'bold' },
  sidebarProfileRole: { color: COLORS.headerText, fontSize: 10, marginTop: 2 },
  navMenu: { flex: 1, gap: SPACING.xs },
  sidebarNavItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, paddingHorizontal: SPACING.md, borderRadius: RADIUS.sm, backgroundColor: COLORS.transparent },
  sidebarNavItemActive: { backgroundColor: COLORS.navy },
  sidebarNavLabel: { color: COLORS.headerText, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '500', marginLeft: SPACING.sm },
  sidebarNavLabelActive: { color: COLORS.headerText, fontWeight: 'bold' },
  sidebarFooter: { borderTopWidth: 1, borderTopColor: COLORS.glassBorder, paddingTop: SPACING.md },
  encryptionNotice: { color: COLORS.headerText, fontSize: 11, textAlign: 'center' },
  webContent: { flex: 1, backgroundColor: COLORS.surface },
}));


export default function DoctorLayout() {
  const { colors: COLORS } = useAppTheme();
  const paperTheme = usePaperTheme();
 return <PaperProvider theme={paperTheme}><DoctorRootLayout /></PaperProvider>; }
