import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { navigate } from '../../utils/navigation';
import { useVerifyOtp } from '../../hooks/useAuth';
import { ApiError } from '../../types/api';

/**
 * OTP Verification Screen.
 * Accepts a 6-digit verification code and registers activation status.
 */
export default function VerifyOtpScreen() {
  const params = useLocalSearchParams();
  const emailOrPhone = (params.emailOrPhone as string) || '';

  const [code, setCode] = useState('');
  const verifyOtpMutation = useVerifyOtp();
  const isLoading = verifyOtpMutation.isPending;
  const error = verifyOtpMutation.error as ApiError | null;
  

  const handleVerify = () => {
    if (code.length !== 6) return;
    verifyOtpMutation.mutate(
      { emailOrPhone, code },
      {
        onSuccess: () => {
          navigate('/auth/login', { message: 'OTP verified successfully. You can now log in.' });
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
          outlineColor="#E5E7EB"
          activeOutlineColor="#0D9488"
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
          disabled={isLoading || code.length !== 6}
          style={styles.button}
          contentStyle={styles.buttonContent}
          buttonColor="#0D9488">
          Verify Code
        </Button>

        <Button
          mode="text"
          onPress={() => navigate('/auth/login')}
          textColor="#6B7280"
          style={styles.backButton}>
          Back to Login
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    marginTop: 6,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
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
});
