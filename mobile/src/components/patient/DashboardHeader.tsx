import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { SPACING, TYPOGRAPHY } from '../../theme';

interface DashboardHeaderProps {
  userName: string;
  greeting: string;
  onProfilePress: () => void;
  onNotificationPress: () => void;
  unreadCount?: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName,
  greeting,
  onProfilePress,
  onNotificationPress,
  unreadCount = 0,
}) => {
  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').substring(0, 2)
    : 'AH';

  return (
    <View style={styles.header}>
      <View style={styles.profileRow}>
        <TouchableOpacity onPress={onProfilePress} activeOpacity={0.8}>
          <Avatar.Text
            size={48}
            label={initials}
            style={styles.avatarBg}
            color="#00E676"
          />
        </TouchableOpacity>
        <View style={styles.greetingWrap}>
          <Text style={styles.greetingText}>{greeting}</Text>
          <Text style={styles.userNameText}>{userName}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.notificationBellBtn}
        onPress={onNotificationPress}
        activeOpacity={0.8}
        accessibilityLabel="Notifications"
        accessibilityRole="button"
      >
        <Text style={styles.bellIcon}>🔔</Text>
        {unreadCount > 0 && <View style={styles.unreadBadgeDot} />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBg: {
    backgroundColor: '#0A332C',
    borderWidth: 1.5,
    borderColor: '#00E676',
  },
  greetingWrap: {
    marginLeft: SPACING.md,
  },
  greetingText: {
    color: '#94A3B8',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
  },
  userNameText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
  },
  notificationBellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0E3630',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
  },
  bellIcon: {
    fontSize: 18,
  },
  unreadBadgeDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
});
