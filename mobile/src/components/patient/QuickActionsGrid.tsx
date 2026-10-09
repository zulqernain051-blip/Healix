import { useAppTheme, useThemeValue } from '../../theme/ThemeProvider';
import type { ThemeColors } from '../../theme';
import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

interface QuickActionsGridProps {
  onRequestPress: () => void;
  onRecordsPress: () => void;
  onMessagesPress: () => void;
  onHealthPress: () => void;
}

interface QuickActionItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  bgColor: string;
  iconColor: string;
  onPress: () => void;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
  onRequestPress,
  onRecordsPress,
  onMessagesPress,
  onHealthPress,
}) => {
  const { colors: COLORS } = useAppTheme();
  const styles = useThemeValue(createStyles);

  const actions: QuickActionItem[] = [
    {
      icon: 'add-circle',
      title: 'Request Care',
      subtitle: 'Get the support you need',
      bgColor: COLORS.quickBlue,
      iconColor: COLORS.iconBlue,
      onPress: onRequestPress,
    },
    {
      icon: 'document-text',
      title: 'View Records',
      subtitle: 'Access your medical history',
      bgColor: COLORS.quickGreen,
      iconColor: COLORS.iconGreen,
      onPress: onRecordsPress,
    },
    {
      icon: 'chatbubble-ellipses',
      title: 'Message Team',
      subtitle: 'Chat with your care team',
      bgColor: COLORS.quickPurple,
      iconColor: COLORS.iconPurple,
      onPress: onMessagesPress,
    },
    {
      icon: 'heart',
      title: 'Health Info',
      subtitle: 'Learn & stay informed',
      bgColor: COLORS.quickPink,
      iconColor: COLORS.iconPink,
      onPress: onHealthPress,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.grid}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.card, { backgroundColor: action.bgColor }]}
            onPress={action.onPress}
            activeOpacity={0.75}
          >
            <View style={styles.cardTop}>
              <View style={[styles.iconCircle, { backgroundColor: `${action.iconColor}20` }]}>
                <Ionicons name={action.icon} size={22} color={action.iconColor} />
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textBody} />
            </View>
            <Text style={styles.cardTitle}>{action.title}</Text>
            <Text style={styles.cardSubtitle}>{action.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const createStyles = (COLORS: ThemeColors) => (StyleSheet.create({
  container: {
    paddingVertical: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.textDark,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  card: {
    width: '47.5%',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    minHeight: 130,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    color: COLORS.textDark,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: 4,
  },
  cardSubtitle: {
    color: COLORS.textBody,
    fontSize: TYPOGRAPHY.sizes.xs,
    lineHeight: 16,
  },
}));
