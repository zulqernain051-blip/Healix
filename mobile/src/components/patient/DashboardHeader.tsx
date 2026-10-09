import { useAppTheme, useThemeValue } from '../../theme/ThemeProvider';
import type { ThemeColors } from '../../theme';
import React from 'react';
import { StyleSheet, View, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, TYPOGRAPHY } from '../../theme';

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
  const { colors: COLORS } = useAppTheme();
  const styles = useThemeValue(createStyles);

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
          colors={[COLORS.headerOverlayStart, COLORS.headerOverlayMid, COLORS.headerOverlayEnd]}
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
                color={COLORS.onAccent}
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const createStyles = (COLORS: ThemeColors) => (StyleSheet.create({
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
    color: COLORS.inverseMuted,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.regular,
    marginBottom: 2,
  },
  userNameText: {
    color: COLORS.onAccent,
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs,
  },
  subtitleText: {
    color: COLORS.inverseMuted,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.regular,
    lineHeight: 20,
  },
  avatarContainer: {
    marginTop: SPACING.xs,
  },
  avatar: {
    backgroundColor: COLORS.headerAvatarBg,
    borderWidth: 2,
    borderColor: COLORS.glassBorder,
  },
  avatarLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
}));
