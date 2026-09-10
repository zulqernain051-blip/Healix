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
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../../theme';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const userName = user?.fullName || 'Patient Profile';
  const userPhone = user?.phone || 'Not provided';
  const userEmail = user?.email || 'Not provided';

  const menuItems = [
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
      id: 'insurance',
      title: 'Insurance Information',
      icon: '💳',
      route: '/(patient)/profile/edit',
    },
    {
      id: 'settings',
      title: 'Account Settings',
      icon: '⚙️',
      route: '/(patient)/profile/settings',
    },
  ];

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out?')) {
        await logout();
      }
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#061C19" />
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
            color="#00E676"
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#061C19',
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
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
  },
  profileHeaderCard: {
    backgroundColor: '#0A2D28',
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  avatarBg: {
    backgroundColor: '#051815',
    borderWidth: 2,
    borderColor: '#00E676',
    marginBottom: SPACING.md,
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  contactText: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  menuList: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  menuCard: {
    backgroundColor: '#0A2D28',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  menuIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuIconText: {
    fontSize: 18,
  },
  menuTitle: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    flex: 1,
  },
  chevron: {
    color: '#6B8E8A',
    fontSize: 22,
  },
  signOutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  signOutText: {
    color: '#EF4444',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
  },
});
