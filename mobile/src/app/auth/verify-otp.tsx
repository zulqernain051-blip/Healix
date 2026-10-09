import { useAppTheme, useThemeValue } from '../../theme/ThemeProvider';
import type { ThemeColors } from '../../theme';

import { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { navigate } from '../../utils/navigation';
import { useVerifyOtp, useResendOtp } from '../../hooks/useAuth';
import { ApiError } from '../../types/api';

/**
 * OTP Verification Screen.
 * Accepts a 6-digit verification code and registers activation status.
 */
export default function VerifyOtpScreen() {
  const { colors: COLORS } = useAppTheme();
  const styles = useThemeValue(createStyles);

  const params = useLocalSearchParams();
  const emailOrPhone = (params.emailOrPhone as string) || '';

  const [code, setCode] = useState('');
  const resend = useResendOtp();
  const verifyOtpMutation = useVerifyOtp();
  const isLoading = verifyOtpMutation.isPending;
  const error = verifyOtpMutation.error as ApiError | null;
  

  const handleVerify = () => {
    if (!/^\d{6}$/.test(code) || !emailOrPhone) return;
    verifyOtpMutation.mutate(
      { emailOrPhone, code },
      {
        onSuccess: (result) => {
          navigate('/auth/login', { message: result.status === 'ACTIVE' ? 'Email verified. You can now sign in.' : result.role === 'NURSE' ? 'Email verified. Sign in to submit your professional verification documents.' : 'Email verified. Your account awaits administrator approval.' });
        },
      }
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Verify Account</Text>
      <Text style={styles.subtitle}>Enter the 6-digit verification code sent to {emailOrPhone}</Text>

      <View style={styles.card}>
        <TextInput
          label="6-Digit Verification Code"
          value={code}
          maxLength={6}
          keyboardType="number-pad"
          onChangeText={(val) => {
            setCode(val);
            if (error) verifyOtpMutation.reset();
          }}
          mode="outlined"
          style={styles.input}
          outlineColor={COLORS.inputBorder}
          activeOutlineColor={COLORS.teal}
        />

        {error && (
          <HelperText type="error" visible={true} style={styles.errorText}>
            {error.message}
          </HelperText>
        )}

        <Button
          mode="contained"
          onPress={handleVerify}
          loading={isLoading}
          disabled={isLoading || !/^\d{6}$/.test(code) || !emailOrPhone}
          style={styles.button}
          contentStyle={styles.buttonContent}
          buttonColor={COLORS.tealFill} textColor={COLORS.onAccent}>
          Verify Code
        </Button>

        <Button mode="text" textColor={COLORS.primaryText} loading={resend.isPending} disabled={resend.isPending || !emailOrPhone} onPress={() => resend.mutate({ emailOrPhone })}>Resend code</Button>
        {resend.isSuccess && <Text>New verification code sent.</Text>}
        {resend.error && <HelperText type="error">{resend.error.message}</HelperText>}
        <Button
          mode="text"
          onPress={() => navigate('/auth/login')}
          textColor={COLORS.textBody}
          style={styles.backButton}>
          Back to Login
        </Button>
      </View>
    </ScrollView>
  );
}

const createStyles = (COLORS: ThemeColors) => (StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: COLORS.surfaceCard,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textBody,
    textAlign: 'center',
    marginBottom: 32,
    marginTop: 6,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 16,
    padding: 24,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  input: {
    marginBottom: 16,
    backgroundColor: COLORS.surfaceCard,
    textAlign: 'center',
    fontSize: 20,
    letterSpacing: 4,
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  errorText: {
    marginBottom: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 16,
  },
}));
