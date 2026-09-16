import React from 'react';
import { View, StyleSheet, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { Stack, usePathname } from 'expo-router';
import { navigate } from '../../utils/navigation';
import { Text, Avatar } from 'react-native-paper';
import { useAuthStore } from '../../store/auth';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

export default function DoctorRootLayout() {
  const { user } = useAuthStore();
  const { width } = useWindowDimensions();
  const pathname = usePathname();

  const isLargeScreen = Platform.OS === 'web' || width > 768;

  if (isLargeScreen) {
    const navItems = [
      { name: 'Case Queue', path: '/(doctor)/(tabs)/home', icon: 'medkit-outline' },
      { name: 'Diagnosis Engine', path: '/(doctor)/diagnosis', icon: 'bulb-outline' },
      { name: 'Messages & Consults', path: '/(doctor)/(tabs)/messages', icon: 'chatbubbles-outline' },
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
            <Avatar.Icon size={40} icon="stethoscope" color="#00E676" style={styles.avatarBg} />
            <View style={styles.profileTextWrap}>
              <Text style={styles.sidebarProfileName} numberOfLines={1}>Dr. {user?.fullName ?? 'Doctor'}</Text>
              <Text style={styles.sidebarProfileRole}>Verified PMDC</Text>
            </View>
          </View>

          <View style={styles.navMenu}>
            {navItems.map((item: any) => {
              const isActive = currentActive.startsWith(item.path) || (item.path === '/(doctor)/(tabs)/home' && (currentActive === '/' || currentActive === '/(doctor)'));
              return (
                <TouchableOpacity
                  key={item.path}
                  style={[styles.sidebarNavItem, isActive && styles.sidebarNavItemActive]}
                  onPress={() => navigate(item.path as any)}
                >
                  <Ionicons name={item.icon} size={20} color={isActive ? '#00E676' : '#94A3B8'} style={{ width: 24 }} />
                  <Text style={[styles.sidebarNavLabel, isActive && styles.sidebarNavLabelActive]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.sidebarFooter}>
            <Text style={styles.encryptionNotice}>?? HIPAA Secure Connection</Text>
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
            <Stack.Screen name="messages" />
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
      <Stack.Screen name="messages" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  webContainer: { flex: 1, flexDirection: 'row', backgroundColor: '#031210' },
  sidebar: { width: 250, backgroundColor: '#061C19', borderRightWidth: 1, borderRightColor: 'rgba(0, 230, 118, 0.1)', paddingVertical: SPACING.xl, paddingHorizontal: SPACING.md, justifyContent: 'space-between' },
  sidebarHeader: { marginBottom: SPACING.xl, paddingHorizontal: SPACING.sm },
  brandTitle: { ...TYPOGRAPHY.h2, color: COLORS.primary, fontWeight: 'bold', letterSpacing: -0.5 },
  brandSub: { marginTop: 2 },
  sidebarProfile: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, backgroundColor: '#0E3630', borderRadius: RADIUS.md, marginBottom: SPACING.xl, borderWidth: 0.5, borderColor: 'rgba(0, 230, 118, 0.2)' },
  avatarBg: { backgroundColor: 'rgba(0, 230, 118, 0.15)' },
  profileTextWrap: { marginLeft: SPACING.sm, flex: 1 },
  sidebarProfileName: { color: '#FFFFFF', fontSize: TYPOGRAPHY.sizes.sm, fontWeight: 'bold' },
  sidebarProfileRole: { color: '#00E676', fontSize: 10, marginTop: 2 },
  navMenu: { flex: 1, gap: SPACING.xs },
  sidebarNavItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, paddingHorizontal: SPACING.md, borderRadius: RADIUS.sm, backgroundColor: 'transparent' },
  sidebarNavItemActive: { backgroundColor: 'rgba(0, 230, 118, 0.15)' },
  sidebarNavLabel: { color: '#94A3B8', fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '500', marginLeft: SPACING.sm },
  sidebarNavLabelActive: { color: '#00E676', fontWeight: 'bold' },
  sidebarFooter: { borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.08)', paddingTop: SPACING.md },
  encryptionNotice: { color: '#6B8E8A', fontSize: 11, textAlign: 'center' },
  webContent: { flex: 1, backgroundColor: '#061C19' },
});

