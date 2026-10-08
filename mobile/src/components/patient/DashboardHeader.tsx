import React from 'react';
import { StyleSheet, View, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = 260;

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
}) => {
  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'AH';

  return (
    <View style={styles.headerContainer}>
      <ImageBackground
        source={require('../../../assets/images/home-header-bg.jpg')}
        style={styles.headerImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(6, 41, 75, 0.85)', 'rgba(11, 66, 104, 0.6)', 'rgba(11, 66, 104, 0.3)']}
          style={styles.gradientOverlay}
        >
          <View style={styles.headerContent}>
            <View style={styles.textSection}>
              <Text style={styles.greetingText}>{greeting}</Text>
              <Text style={styles.userNameText}>{userName}</Text>
              <Text style={styles.subtitleText}>
                Your health matters. We're here{'\n'}for you.
              </Text>
            </View>

            <TouchableOpacity onPress={onProfilePress} activeOpacity={0.8} style={styles.avatarContainer}>
              <Avatar.Text
                size={50}
                label={initials}
                style={styles.avatar}
                labelStyle={styles.avatarLabel}
                color={COLORS.surfaceCard}
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: HEADER_HEIGHT,
    width: SCREEN_WIDTH,
    marginLeft: -SPACING.lg,
    marginTop: -SPACING.lg,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.xl,
    paddingBottom: 60,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textSection: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  greetingText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.regular,
    marginBottom: 2,
  },
  userNameText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs,
  },
  subtitleText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.regular,
    lineHeight: 20,
  },
  avatarContainer: {
    marginTop: SPACING.xs,
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  avatarLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
});
