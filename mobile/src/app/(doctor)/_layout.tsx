import React from 'react';
import { View, StyleSheet, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { Slot, Tabs, usePathname } from 'expo-router';
import { navigate } from '../../utils/navigation';
import { Text, Avatar } from 'react-native-paper';
import { useAuthStore } from '../../store/auth';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../theme';

export default function DoctorLayout() {
  const { user, logout } = useAuthStore();
  const { width } = useWindowDimensions();

  const pathname = usePathname();

  const isLargeScreen = Platform.OS === 'web' || width > 768;

  if (isLargeScreen) {
    const navItems = [
      { name: 'Case Queue', path: '/(doctor)/home', icon: '🏠' },
      
      { name: 'Diagnosis Engine', path: '/(doctor)/diagnosis', icon: '📋' },
      { name: 'Messages & Consults', path: '/(doctor)/messages', icon: '💬' },
      { name: 'Profile & PMDC', path: '/(doctor)/profile', icon: '👤' },
    ];

    const currentActive = pathname;

    return (
      <View style={styles.webContainer}>
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.brandTitle}>Healix Care</Text>
            <Text style={styles.brandSub}>Doctor Portal</Text>
          </View>

          <View style={styles.sidebarProfile}>
            <Avatar.Icon size={40} icon="doctor" color="#00E676" style={styles.avatarBg} />
            <View style={styles.profileTextWrap}>
              <Text style={styles.sidebarProfileName} numberOfLines={1}>{user?.fullName ?? 'Doctor'}</Text>
              <Text style={styles.sidebarProfileRole}>Medical Consultant</Text>
            </View>
          </View>

          <View style={styles.navMenu}>
            {navItems.map((item: any) => {
              const isActive = currentActive.startsWith(item.path) || (item.path === '/(doctor)/home' && (currentActive === '/' || currentActive === '/(doctor)'));
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
            <TouchableOpacity
              style={styles.sidebarNavItem}
              onPress={() => logout()}
            >
              <Text style={styles.sidebarNavIcon}>🚪</Text>
              <Text style={[styles.sidebarNavLabel, { color: '#EF4444' }]}>
                Sign Out
              </Text>
            </TouchableOpacity>
            <Text style={styles.encryptionNotice}>🔒 HIPAA Secure Connection</Text>
          </View>
        </View>

        <View style={styles.webContent}>
          <Slot />
        </View>
      </View>
    );
  }

  // Doctor Mobile Bottom Bar: 5 Tabs (Cases, Reviews, Diagnosis, Messages, Profile)
  return (
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
      <Tabs.Screen
        name="home"
        options={{
          title: 'Cases',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, color }}>{focused ? '🏠' : '🏡'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="reviews"
        options={{
          title: 'Reviews',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, color }}>{focused ? '🩺' : '🩺'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="diagnosis"
        options={{
          title: 'Diagnosis',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, color }}>{focused ? '📋' : '📝'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, color }}>{focused ? '💬' : '🗨️'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, color }}>{focused ? '👤' : '👤'}</Text>
          ),
        }}
      />

      {/* Hidden screens accessible via navigation but not shown in tab bar */}
      <Tabs.Screen name="action" options={{ href: null }} />
      <Tabs.Screen name="careplan" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#061C19',
  },
  sidebar: {
    width: 260,
    backgroundColor: '#0A2723',
    borderRightWidth: 1,
    borderRightColor: 'rgba(0, 230, 118, 0.15)',
    padding: SPACING.lg,
    justifyContent: 'space-between',
  },
  sidebarHeader: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  brandSub: {
    color: '#00E676',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
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
