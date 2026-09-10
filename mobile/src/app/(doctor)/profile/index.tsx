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

export default function DoctorProfileScreen() {
  const { user, logout } = useAuthStore();

  const doctorName = user?.fullName || 'Dr. Medical Consultant';
  const doctorPhone = user?.phone || 'Not provided';
  const doctorEmail = user?.email || 'Not provided';

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to sign out from Healix Doctor Portal?')) {
        await logout();
      }
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to sign out from Healix Doctor Portal?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
      ]);
    }
  };

  const menuItems = [
    {
      id: 'pmdc',
      title: 'PMDC License & Credentials',
      subtitle: 'PMDC-99201-P · Verified Specialist Physician',
      icon: '🩺',
      onPress: () => Alert.alert('PMDC Verification', 'Status: VERIFIED\nLicense No: PMDC-99201-P\nSpeciality: Cardiology & Internal Medicine'),
    },
    {
      id: 'cases',
      title: 'High-Risk Escalation Queue',
      subtitle: 'Review assigned nurse cases and AI fused scores',
      icon: '🚨',
      onPress: () => navigate('/(doctor)/home'),
    },
    {
      id: 'diagnosis',
      title: 'ICD-10 Clinical Diagnosis Engine',
      subtitle: 'Issue formal diagnoses & care plans',
      icon: '📋',
      onPress: () => Alert.alert('Action Required', 'Please select a case from the queue first.'),
    },
    {
      id: 'messages',
      title: 'Messages & Tele-Consults',
      subtitle: 'HIPAA encrypted direct communication',
      icon: '💬',
      onPress: () => navigate('/(doctor)/messages'),
    },
    {
      id: 'settings',
      title: 'Account Settings & Security',
      subtitle: 'Password management and session security',
      icon: '⚙️',
      onPress: () => navigate('/auth/change-password'),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#061C19" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Doctor Profile</Text>
        </View>

        {/* Profile Info Card */}
        <View style={styles.profileHeaderCard}>
          <Avatar.Text
            size={72}
            label={doctorName.replace('Dr. ', '').split(' ').map(n => n[0]).join('')}
            style={styles.avatarBg}
            color="#00E676"
          />
          <Text style={styles.nameText}>{doctorName}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.pmdcBadge}>
              <Text style={styles.pmdcBadgeText}>✓ PMDC Verified Doctor</Text>
            </View>
          </View>
          <Text style={styles.contactText}>{doctorPhone}</Text>
          <Text style={styles.contactText}>{doctorEmail}</Text>
        </View>

        {/* Menu Options List */}
        <View style={styles.menuList}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuCard}
              onPress={item.onPress}
              activeOpacity={0.8}
            >
              <View style={styles.menuIconBg}>
                <Text style={styles.menuIconText}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout}>
          <Text style={styles.signOutText}>🚪 Sign Out from Healix</Text>
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
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  avatarBg: {
    backgroundColor: '#051815',
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: '#00E676',
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '800',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  pmdcBadge: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: '#00E676',
  },
  pmdcBadgeText: {
    color: '#00E676',
    fontSize: 11,
    fontWeight: '700',
  },
  contactText: {
    color: '#94A3B8',
    fontSize: 12,
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
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: '#051815',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuIconText: {
    fontSize: 20,
  },
  menuTitle: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
  },
  menuSubtitle: {
    color: '#6B8E8A',
    fontSize: 11,
    marginTop: 2,
  },
  chevron: {
    color: '#6B8E8A',
    fontSize: 24,
    fontWeight: '300',
  },
  signOutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: RADIUS.lg,
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
