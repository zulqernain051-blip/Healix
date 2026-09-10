import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Card, HelperText } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/auth';

const COLORS = {
  bg: '#F9FAFB',
  card: '#FFFFFF',
  teal: '#0D9488',
  textPrimary: '#111827',
  textSecondary: '#6B7280'
};

export default function MfaVerifyScreen() {
  const { emailOrPhone } = useLocalSearchParams<{ emailOrPhone: string }>();
  const [code, setCode] = useState('');
  const setSession = useAuthStore((state) => state.setSession);

  const mfaMutation = useMutation({
    mutationFn: (data: { emailOrPhone: string; code: string }) => authApi.verifyMfaLogin(data),
    onSuccess: async (res) => {
      await setSession(res.user, res.tokens.accessToken, res.tokens.refreshToken);
    }
  });

  const handleVerify = () => {
    if (code.length !== 6) return;
    mfaMutation.mutate({ emailOrPhone: emailOrPhone as string, code });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Two-Factor Authentication</Text>
      <Text style={styles.subtitle}>Enter the 6-digit code sent to {emailOrPhone}</Text>
      
      <Card style={styles.card}>
        <TextInput
          label="6-digit MFA Code"
          value={code}
          onChangeText={setCode}
          mode="outlined"
          keyboardType="number-pad"
          maxLength={6}
          style={styles.input}
          outlineColor="#E5E7EB"
          activeOutlineColor={COLORS.teal}
        />
        {mfaMutation.error && (
          <HelperText type="error" visible={true}>
            {(mfaMutation.error as any).message || 'Invalid code'}
          </HelperText>
        )}
        <Button
          mode="contained"
          onPress={handleVerify}
          loading={mfaMutation.isPending}
          disabled={mfaMutation.isPending || code.length !== 6}
          style={styles.button}
          buttonColor={COLORS.teal}>
          Verify & Login
        </Button>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center', backgroundColor: COLORS.bg },
  header: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24 },
  card: { padding: 20, backgroundColor: COLORS.card, borderRadius: 12 },
  input: { marginBottom: 16, backgroundColor: COLORS.card },
  button: { paddingVertical: 6, marginTop: 16, borderRadius: 8 }
});
