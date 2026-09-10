import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import { Text } from 'react-native-paper';
import { navigate } from '../../../utils/navigation';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../../theme';

export default function SettingsScreen() {
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLanguageSelect = () => {
    Alert.alert('Language', 'Current system language: English (US)', [
      { text: 'English (US)', style: 'default' },
      { text: 'Urdu (اردو)', style: 'default' },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const handleThemeAlert = () => {
    Alert.alert('Theme Settings', 'Healix is optimized for Dark Teal mode for reduced ocular strain and clinical clarity.');
  };

  const handlePrivacyInfo = () => {
    Alert.alert('HIPAA Privacy & Security', 'All clinical records and vitals data are end-to-end encrypted under HIPAA compliance standards.');
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'A secure password reset link has been sent to your registered email.');
  };

  const handleHelpCenter = () => {
    Alert.alert('Healix Support', 'Need help with your visits or care plans? Contact support@healix.care or call 0800-HEALIX.');
  };

  const handleAbout = () => {
    Alert.alert('About Healix', 'Healix Mobile Patient App v2.4.0\nAI-Powered Home Healthcare & Emergency Dispatch System.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#061C19" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Account Settings</Text>
        </View>

        {/* Section: General */}
        <Text style={styles.sectionHeader}>General Settings</Text>
        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.settingRow} onPress={handleLanguageSelect}>
            <Text style={styles.settingIcon}>🌐</Text>
            <Text style={styles.settingLabel}>Language</Text>
            <Text style={styles.settingVal}>English</Text>
            <Text style={styles.chevron}> ›</Text>
          </TouchableOpacity>
          <View style={styles.rowDivider} />

          <TouchableOpacity style={styles.settingRow} onPress={handleThemeAlert}>
            <Text style={styles.settingIcon}>🎨</Text>
            <Text style={styles.settingLabel}>Theme Mode</Text>
            <Text style={styles.settingVal}>Dark Teal</Text>
            <Text style={styles.chevron}> ›</Text>
          </TouchableOpacity>
          <View style={styles.rowDivider} />

          <View style={styles.settingRow}>
            <Text style={styles.settingIcon}>🔔</Text>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#0E3630', true: 'rgba(0, 230, 118, 0.4)' }}
              thumbColor={notificationsEnabled ? '#00E676' : '#6B8E8A'}
            />
          </View>
          <View style={styles.rowDivider} />

          <TouchableOpacity style={styles.settingRow} onPress={handlePrivacyInfo}>
            <Text style={styles.settingIcon}>🔒</Text>
            <Text style={styles.settingLabel}>HIPAA Privacy Policy</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Section: Security */}
        <Text style={styles.sectionHeader}>Security</Text>
        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.settingRow} onPress={handleChangePassword}>
            <Text style={styles.settingIcon}>🔑</Text>
            <Text style={styles.settingLabel}>Change Password</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.rowDivider} />

          <View style={styles.settingRow}>
            <Text style={styles.settingIcon}>👆</Text>
            <Text style={styles.settingLabel}>Biometric Quick Unlock</Text>
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: '#0E3630', true: 'rgba(0, 230, 118, 0.4)' }}
              thumbColor={biometricEnabled ? '#00E676' : '#6B8E8A'}
            />
          </View>
        </View>

        {/* Section: Help & Support */}
        <Text style={styles.sectionHeader}>Help & Support</Text>
        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.settingRow} onPress={handleHelpCenter}>
            <Text style={styles.settingIcon}>❓</Text>
            <Text style={styles.settingLabel}>Help Center & Support</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.rowDivider} />

          <TouchableOpacity style={styles.settingRow} onPress={handleAbout}>
            <Text style={styles.settingIcon}>ℹ️</Text>
            <Text style={styles.settingLabel}>About Healix App</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

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
  sectionHeader: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#0A2D28',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  settingIcon: {
    fontSize: 18,
    marginRight: SPACING.md,
    width: 24,
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    flex: 1,
  },
  settingVal: {
    color: '#6B8E8A',
    fontSize: 12,
  },
  chevron: {
    color: '#6B8E8A',
    fontSize: 20,
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
});
