
import { useAppTheme, useThemeValue } from '../../../theme/ThemeProvider';
import type { ThemeColors } from '../../../theme';
import { appAlert } from '../../../components/common/AppDialogs';
import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { useAuthStore } from '../../../store/auth';
import { navigate } from '../../../utils/navigation';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../../theme';

export default function ProfileScreen() {
  const { dark: isDarkTheme } = useAppTheme();

  const { colors: COLORS } = useAppTheme();
  const styles = useThemeValue(createStyles);

  const { user, logout } = useAuthStore();

  const userName = user?.fullName || 'Patient Profile';
  const userPhone = user?.phone || 'Not provided';
  const userEmail = user?.email || 'Not provided';

  const menuItems = [
    { id: 'support', title: 'Refunds & Care Concerns', icon: '💬', route: '/support' },
    { id: 'analytics', title: 'Analytics & Reports', icon: '📈', route: '/analytics' },
    {
      id: 'personal',
      title: 'Personal Information',
      icon: '👤',
      route: '/(patient)/profile/edit',
    },
    {
      id: 'emergency',
      title: 'Emergency Contacts',
      icon: '🚨',
      route: '/(patient)/profile/emergency-contacts',
    },
    {
      id: 'medical',
      title: 'Medical Information',
      icon: '🩺',
      route: '/(patient)/health/medical',
    },
    {
      id: 'payments',
      title: 'Payment History',
      icon: '💳',
      route: '/(patient)/health/payments',
    },
    {
      id: 'settings',
      title: 'Account Settings',
      icon: '⚙️',
      route: '/(patient)/profile/settings',
    },
  ];

  const handleLogout = () => appAlert('Sign Out', 'Sign out of your Healix account?', [
    {text:'Cancel',style:'cancel'}, {text:'Sign Out',onPress:()=>void logout()}
  ]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={isDarkTheme ? 'light-content' : 'dark-content'} backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>

        {/* Profile Info Card */}
        <View style={styles.profileHeaderCard}>
          <Avatar.Text
            size={72}
            label={userName.split(' ').map(n => n[0]).join('')}
            style={styles.avatarBg}
            color={COLORS.emerald}
          />
          <Text style={styles.nameText}>{userName}</Text>
          <Text style={styles.contactText}>{userPhone}</Text>
          <Text style={styles.contactText}>{userEmail}</Text>
        </View>

        {/* Menu Options List */}
        <View style={styles.menuList}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuCard}
              onPress={() => navigate(item.route as any)}
              activeOpacity={0.8}
            >
              <View style={styles.menuIconBg}>
                <Text style={styles.menuIconText}>{item.icon}</Text>
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (COLORS: ThemeColors) => (StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    color: COLORS.onAccent,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
  },
  profileHeaderCard: {
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.emeraldLight,
  },
  avatarBg: {
    backgroundColor: COLORS.bg,
    borderWidth: 2,
    borderColor: COLORS.emerald,
    marginBottom: SPACING.md,
  },
  nameText: {
    color: COLORS.textDark,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  contactText: {
    color: COLORS.textBody,
    fontSize: 11,
    marginTop: 2,
  },
  menuList: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  menuCard: {
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.emeraldLight,
  },
  menuIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.emeraldLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuIconText: {
    fontSize: 18,
  },
  menuTitle: {
    color: COLORS.textDark,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    flex: 1,
  },
  chevron: {
    color: COLORS.textBody,
    fontSize: 22,
  },
  signOutBtn: {
    backgroundColor: COLORS.redLight,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.red,
  },
  signOutText: {
    color: COLORS.red,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
  },
}));

