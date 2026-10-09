import { useAppTheme, useThemeValue } from '../../../theme/ThemeProvider';
import type { ThemeColors } from '../../../theme';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

interface VerificationHeaderProps {
  userName: string;
  isFullyVerified: boolean | null;
}

export const VerificationHeader: React.FC<VerificationHeaderProps> = ({ userName, isFullyVerified }) => {
  const { colors: COLORS } = useAppTheme();
  const styles = useThemeValue(createStyles);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const statusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(statusAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerAnim, statusAnim]);

  return (
    <>
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.headerIconWrap}>
          <Text style={styles.headerIcon}>🏥</Text>
        </View>
        <View>
          <Text style={styles.headerTitle}>Verification Checklist</Text>
          <Text style={styles.headerSub}>
            {userName} · Submit all documents to go live
          </Text>
        </View>
      </Animated.View>

      <Animated.View style={{ opacity: statusAnim }}>
        <View
          style={[
            styles.statusBanner,
            {
              borderColor: isFullyVerified ? COLORS.emerald : COLORS.amber,
              backgroundColor: isFullyVerified ? COLORS.emerald + '18' : COLORS.amber + '18',
            },
          ]}
        >
          <Text style={styles.statusEmoji}>{isFullyVerified ? '✅' : '⚠️'}</Text>
          <View style={styles.statusInfo}>
            <Text
              style={[
                styles.statusTitle,
                { color: isFullyVerified ? COLORS.emerald : COLORS.amber },
              ]}
            >
              {isFullyVerified ? 'Fully Verified' : 'Pending / Action Required'}
            </Text>
            <Text style={styles.statusDesc}>
              {isFullyVerified
                ? 'All documents have been approved. You are ready to accept patients.'
                : 'Please submit or re-upload the documents marked below.'}
            </Text>
          </View>
        </View>
      </Animated.View>
    </>
  );
};

const createStyles = (COLORS: ThemeColors) => (StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 14,
  },
  headerIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.teal + '30',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.teal + '55',
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textDark,
    letterSpacing: 0.2,
  },
  headerSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  statusEmoji: {
    fontSize: 24,
    marginTop: 2,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 19,
  },
}));
