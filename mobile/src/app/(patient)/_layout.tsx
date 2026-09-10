import React from 'react';
import { View, StyleSheet, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { Slot, Tabs, usePathname } from 'expo-router';
import { navigate } from '../../utils/navigation';
import { Text, Avatar } from 'react-native-paper';
import { useAuthStore } from '../../store/auth';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../theme';

export default function PatientLayout() {
  const { user } = useAuthStore();
  const { width } = useWindowDimensions();
  const pathname = usePathname();

  const isLargeScreen = Platform.OS === 'web' || width > 768;

  // Responsive sidebar for Web / Tablet layout
  if (isLargeScreen) {
    const navItems = [
      { name: 'Dashboard', path: '/(patient)/home', icon: '🏠' },
      { name: 'Requests', path: '/(patient)/requests', icon: '📋' },
      { name: 'Marketplace', path: '/(patient)/marketplace', icon: '🛒' },
      { name: 'Visits', path: '/(patient)/visits', icon: '🩺' },
      { name: 'Profile', path: '/(patient)/profile', icon: '👤' },
    ];

    const currentActive = pathname;

    return (
      <View style={styles.webContainer}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.brandTitle}>Healix Care</Text>
            <Text style={styles.brandSub}>Patient Portal</Text>
          </View>

          <View style={styles.sidebarProfile}>
            <Avatar.Icon size={40} icon="account" color="#00E676" style={styles.avatarBg} />
            <View style={styles.profileTextWrap}>
              <Text style={styles.sidebarProfileName} numberOfLines={1}>{user?.fullName ?? 'Patient'}</Text>
              <Text style={styles.sidebarProfileRole}>Verified Patient</Text>
            </View>
          </View>

          <View style={styles.navMenu}>
            {navItems.map((item: any) => {
              const isActive = currentActive.startsWith(item.path) || (item.path === '/(patient)/home' && (currentActive === '/' || currentActive === '/(patient)'));
              return (
                <TouchableOpacity
                  key={item.path}
                  style={[styles.sidebarNavItem, isActive && styles.sidebarNavItemActive]}
                  onPress={() => navigate(item.path as any)}
                >
                  <Text style={styles.sidebarNavIcon}>{item.icon}</Text>
                  <Text style={[styles.sidebarNavLabel, isActive && styles.sidebarNavLabelActive]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.sidebarFooter}>
            <Text style={styles.encryptionNotice}>🔒 HIPAA Secure Connection</Text>
          </View>
        </View>

        {/* Content Area */}
        <View style={styles.webContent}>
                    <Slot />
        </View>
      </View>
    );
  }

  // Mobile Bottom Tabs
  return (
    <View style={{ flex: 1 }}>
            <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#071E1C',
            borderTopWidth: 1,
            borderTopColor: 'rgba(0, 230, 118, 0.15)',
            height: 65,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarActiveTintColor: '#00E676',
          tabBarInactiveTintColor: '#6B8E8A',
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        {/* Tab 1: Dashboard */}
        <Tabs.Screen
          name="home"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, color }}>{focused ? '🏠' : '🏡'}</Text>
          ),
        }}
      />

      {/* Tab 2: Requests */}
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Requests',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, color }}>{focused ? '📋' : '📄'}</Text>
          ),
        }}
      />

      {/* Tab 3: Marketplace */}
      <Tabs.Screen
        name="marketplace"
        options={{
          title: 'Marketplace',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, color }}>{focused ? '🛒' : '🛒'}</Text>
          ),
        }}
      />

      {/* Tab 4: Visits */}
      <Tabs.Screen
        name="visits"
        options={{
          title: 'Visits',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, color }}>{focused ? '🩺' : '🩺'}</Text>
          ),
        }}
      />

      {/* Tab 5: Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, color }}>{focused ? '👤' : '👤'}</Text>
          ),
        }}
      />

      {/* Hide unused screens from bottom tabs */}
      <Tabs.Screen name="health" options={{ href: null }} />
      <Tabs.Screen name="ai" options={{ href: null }} />
      <Tabs.Screen name="messages" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="records" options={{ href: null }} />
    </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  // Web specific styles
  webContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#031210',
  },
  sidebar: {
    width: 250,
    backgroundColor: '#061C19',
    borderRightWidth: 1,
    borderRightColor: 'rgba(0, 230, 118, 0.1)',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
    justifyContent: 'space-between',
  },
  sidebarHeader: {
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.sm,
  },
  brandTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  brandSub: {
    marginTop: 2,
  },
  sidebarProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: '#0E3630',
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xl,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 230, 118, 0.2)',
  },
  avatarBg: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
  },
  profileTextWrap: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  sidebarProfileName: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  sidebarProfileRole: {
    color: '#00E676',
    fontSize: 10,
    marginTop: 2,
  },
  navMenu: {
    flex: 1,
    gap: SPACING.xs,
  },
  sidebarNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    backgroundColor: 'transparent',
  },
  sidebarNavItemActive: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
  },
  sidebarNavIcon: {
    fontSize: 18,
    width: 24,
  },
  sidebarNavLabel: {
    color: '#94A3B8',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginLeft: SPACING.sm,
  },
  sidebarNavLabelActive: {
    color: '#00E676',
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: SPACING.md,
  },
  encryptionNotice: {
    color: '#6B8E8A',
    fontSize: 11,
    textAlign: 'center',
  },
  webContent: {
    flex: 1,
    backgroundColor: '#061C19',
  },
});
