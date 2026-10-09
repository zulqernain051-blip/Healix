
import { useThemeValue } from '../../theme/ThemeProvider';
import type { ThemeColors } from '../../theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon = '📋', title, subtitle }) => {
  const styles = useThemeValue(createStyles);
  return (
  <View style={styles.container}>
    <Text style={styles.icon}>{icon}</Text>
    <Text style={styles.title}>{title}</Text>
    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
  </View>
);
};

const createStyles = (COLORS: ThemeColors) => (StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  icon: {
    fontSize: 40,
    marginBottom: 12,
  },
  title: {
    color: COLORS.textDark,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textBody,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
}));
