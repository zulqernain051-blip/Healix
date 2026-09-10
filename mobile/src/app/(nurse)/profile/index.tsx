import React, { useState } from 'react';
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
import { useNurseProfile } from '../../../hooks/useNurse';
import { navigate } from '../../../utils/navigation';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../../theme';

import { EditBioModal } from '../../../components/nurse/EditBioModal';
import { EditQualificationModal } from '../../../components/nurse/EditQualificationModal';
import { EditSpecializationModal } from '../../../components/nurse/EditSpecializationModal';
import { LoadingState } from '../../../components/common/LoadingState';
import { ErrorState } from '../../../components/common/ErrorState';

export default function NurseProfileScreen() {
  const { user, accessToken, logout } = useAuthStore();
  const nurseId = user?.nurseId || user?.id || '';
  const { data: nurseProfile, isLoading, error } = useNurseProfile(nurseId);

  const nurseName = user?.fullName || 'Nurse Profile';
  const nursePhone = user?.phone || 'Not provided';
  const nurseEmail = user?.email || 'Not provided';

  // Modals State
  const [showEditBioModal, setShowEditBioModal] = useState(false);
  const [showQualModal, setShowQualModal] = useState(false);
  const [showSpecModal, setShowSpecModal] = useState(false);

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to sign out from Healix?')) {
        await logout();
      }
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to sign out from Healix?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
      ]);
    }
  };

  if (isLoading && !nurseProfile) return <LoadingState />;
  if (error) return <ErrorState error={error.message} />;

  const menuItems = [
    {
      id: 'bio',
      title: 'Nurse Bio & Clinical Experience',
      subtitle: `${nurseProfile?.experience || 0} Years Experience · PNC Registered`,
      icon: '🩺',
      onPress: () => setShowEditBioModal(true),
    },
    {
      id: 'qualifications',
      title: 'Qualifications & Certifications',
      subtitle: `${nurseProfile?.qualifications?.length || 0} Registered Diplomas / Degrees`,
      icon: '🎓',
      onPress: () => setShowQualModal(true),
    },
    {
      id: 'specializations',
      title: 'Clinical Specializations',
      subtitle: `${nurseProfile?.specializations?.length || 0} Active Clinical Specialties`,
      icon: '🎖️',
      onPress: () => setShowSpecModal(true),
    },
    {
      id: 'availability',
      title: 'Availability & Shift Schedule',
      subtitle: 'Manage visit slots and working hours',
      icon: '📅',
      onPress: () => navigate('/(nurse)/profile/availability'),
    },
    {
      id: 'earnings',
      title: 'My Earnings & Financial Payouts',
      subtitle: 'Track visit revenue and payment history',
      icon: '💰',
      onPress: () => navigate('/(nurse)/profile/earnings'),
    },
    {
      id: 'performance',
      title: 'Performance Score & Badges',
      subtitle: 'Skill scores and clinical achievement badges',
      icon: '⭐',
      onPress: () => navigate('/(nurse)/profile/performance'),
    },
    {
      id: 'reviews',
      title: 'Patient Reviews & Feedback',
      subtitle: 'Read patient ratings and clinical reviews',
      icon: '💬',
      onPress: () => navigate('/(nurse)/profile/reviews'),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#061C19" />
      <View style={styles.headerBox}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Nurse Profile</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Profile Info Card (Identical Structure to Patient Profile) */}
        <View style={styles.profileHeaderCard}>
          <Avatar.Text
            size={72}
            label={nurseName.split(' ').map(n => n[0]).join('')}
            style={styles.avatarBg}
            color="#00E676"
          />
          <Text style={styles.nameText}>{nurseName}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.pncBadge}>
              <Text style={styles.pncBadgeText}>✓ PNC Verified Nurse</Text>
            </View>
            <View style={[styles.statusBadge, nurseProfile?.available ? styles.statusGreen : styles.statusRed]}>
              <Text style={styles.statusBadgeText}>
                {nurseProfile?.available ? 'Available' : 'Unavailable'}
              </Text>
            </View>
          </View>
          <Text style={styles.contactText}>{nursePhone}</Text>
          <Text style={styles.contactText}>{nurseEmail}</Text>
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

      {/* Modals */}
      <EditBioModal
        visible={showEditBioModal}
        onClose={() => setShowEditBioModal(false)}
        nurseId={nurseId}
        initialBio={nurseProfile?.bio || ''}
        initialExperience={nurseProfile?.experience?.toString() || ''}
        initialPhotoUrl={nurseProfile?.photoUrl || ''}
      />

      <EditQualificationModal
        visible={showQualModal}
        onClose={() => setShowQualModal(false)}
        nurseId={nurseId}
      />

      <EditSpecializationModal
        visible={showSpecModal}
        onClose={() => setShowSpecModal(false)}
        nurseId={nurseId}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#061C19' },
  headerBox: { padding: SPACING.md, paddingBottom: SPACING.lg, backgroundColor: '#061C19' },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: '#FFF', ...TYPOGRAPHY.h2 },
  container: { backgroundColor: '#F8FAFC', borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.md, paddingBottom: 100 },
  profileHeaderCard: { backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center', marginBottom: SPACING.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  avatarBg: { backgroundColor: '#F1F5F9', borderWidth: 2, borderColor: '#00E676', marginBottom: SPACING.sm },
  nameText: { ...TYPOGRAPHY.h3, color: COLORS.text, marginBottom: SPACING.xs },
  badgeRow: { flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.sm },
  pncBadge: { backgroundColor: '#DBEAFE', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  pncBadgeText: { color: '#1D4ED8', fontSize: 12, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  statusGreen: { backgroundColor: '#DCFCE7' },
  statusRed: { backgroundColor: '#FEE2E2' },
  statusBadgeText: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  contactText: { color: COLORS.textMuted, fontSize: 14, marginTop: 2 },
  menuList: { gap: SPACING.sm, marginBottom: SPACING.xl },
  menuCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#E2E8F0' },
  menuIconBg: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  menuIconText: { fontSize: 20 },
  menuTitle: { ...TYPOGRAPHY.bodyMedium, fontWeight: '700', color: COLORS.text },
  menuSubtitle: { ...TYPOGRAPHY.bodySmall, color: COLORS.textMuted, marginTop: 2 },
  chevron: { fontSize: 24, color: COLORS.textMuted, marginLeft: SPACING.sm },
  signOutBtn: { backgroundColor: '#FFF', padding: SPACING.md, borderRadius: RADIUS.md, alignItems: 'center', borderWidth: 1, borderColor: '#FEE2E2' },
  signOutText: { color: '#EF4444', fontWeight: '700', fontSize: 16 },
});
