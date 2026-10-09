import { useAppTheme, useThemeValue } from '../../theme/ThemeProvider';
import type { ThemeColors } from '../../theme';
import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Avatar, Card, Button, Text } from 'react-native-paper';
import { navigate } from '../../utils/navigation';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../theme';

/**
 * Role Selection Screen.
 * Guides the user to register under one of the three core system roles.
 */
export default function RoleSelectScreen() {
  const { colors: COLORS } = useAppTheme();
  const styles = useThemeValue(createStyles);

  

  const handleSelectRole = (role: 'PATIENT' | 'NURSE') => {
    navigate('/auth/register', { role });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Join Healix As</Text>
      <Text style={styles.subtitle}>Select your primary system role to continue</Text>

      <Card style={styles.card} onPress={() => handleSelectRole('PATIENT')}>
        <Card.Title
          title="Patient"
          subtitle="Book visits, view prescriptions & track vitals"
          left={(props) => <Avatar.Icon {...props} icon="account" color={COLORS.teal} style={{ backgroundColor: COLORS.transparent }} />}
        />
      </Card>

      <Card style={styles.card} onPress={() => handleSelectRole('NURSE')}>
        <Card.Title
          title="Nurse Practitioner"
          subtitle="Provide home care visits & earn professional scores"
          left={(props) => <Avatar.Icon {...props} icon="medical-bag" color={COLORS.teal} style={{ backgroundColor: COLORS.transparent }} />}
        />
      </Card>

      <Button
        mode="text"
        onPress={() => navigate('/auth/login')}
        textColor={COLORS.textBody}
        style={styles.backButton}>
        Back to Sign In
      </Button>
    </ScrollView>
  );
}

const createStyles = (COLORS: ThemeColors) => (StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.surface,
  },
  header: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textDark,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textDarkSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
    marginTop: SPACING.xs,
  },
  card: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surfaceCard,
    borderRadius: RADIUS.lg,
  },
  backButton: {
    marginTop: 16,
  },
}));
