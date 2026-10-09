import { useAppTheme, useThemeValue } from '../../../theme/ThemeProvider';
import type { ThemeColors } from '../../../theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

export const VerificationSubmit: React.FC = () => {
  const styles = useThemeValue(createStyles);

  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        🔒 Your documents are encrypted and reviewed by Healix administrators within 24–48 hours.
      </Text>
    </View>
  );
};

const createStyles = (COLORS: ThemeColors) => (StyleSheet.create({
  footer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
}));
