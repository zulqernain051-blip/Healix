import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { PALETTE } from './constants';

export const VerificationSubmit: React.FC = () => {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        🔒 Your documents are encrypted and reviewed by Healix administrators within 24–48 hours.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: PALETTE.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  footerText: {
    color: PALETTE.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});
