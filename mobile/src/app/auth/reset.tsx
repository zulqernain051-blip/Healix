import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { TextInput, Button, Card } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { navigate } from '../../utils/navigation';
import { useResetPassword } from '../../hooks/useAuth';

const COLORS = {
  bg: '#0A1628',
  card: '#111D35',
  border: '#1E2D4A',
  teal: '#0D9488',
  emerald: '#10B981',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  error: '#EF4444'
};

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { emailOrPhone } = useLocalSearchParams<{ emailOrPhone: string }>();
  const resetMutation = useResetPassword();
  const isLoading = resetMutation.isPending;

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async () => {
    if (code.trim().length !== 6) {
      if (Platform.OS === 'web') alert('Verification code must be exactly 6 digits.');
      else Alert.alert('Validation Error', 'Verification code must be exactly 6 digits.');
      return;
    }
    if (newPassword.length < 8) {
      if (Platform.OS === 'web') alert('New password must be at least 8 characters long.');
      else Alert.alert('Validation Error', 'New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      if (Platform.OS === 'web') alert('Passwords do not match.');
      else Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }

    resetMutation.mutate(
      { emailOrPhone, code: code.trim(), password: newPassword },
      {
        onSuccess: () => {
          if (Platform.OS === 'web') {
            alert('Your account password has been updated. Please login with your new credentials.');
            navigate('/auth/login');
          } else {
            Alert.alert(
              'Password Reset Successful',
              'Your account password has been updated. Please login with your new credentials.',
              [
                {
                  text: 'Go to Login',
                  onPress: () => {
                    navigate('/auth/login');
                  }
                }
              ]
            );
          }
        },
        onError: (err: any) => {
          if (Platform.OS === 'web') alert('Reset Failed: ' + err.message);
          else Alert.alert('Reset Failed', err.message);
        }
      }
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>✍️ Reset Password</Text>
        <Text style={styles.subtitle}>Enter the 6-digit OTP code sent for: {emailOrPhone}</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <TextInput
            label="6-Digit OTP Reset Code"
            value={code}
            onChangeText={setCode}
            keyboardType="numeric"
            placeholder="e.g. 123456"
            maxLength={6}
            mode="outlined"
            activeOutlineColor={COLORS.teal}
            style={styles.input}
          />

          <TextInput
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholder="Min 8 chars, 1 number, 1 symbol"
            mode="outlined"
            activeOutlineColor={COLORS.teal}
            style={styles.input}
          />

          <TextInput
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            mode="outlined"
            activeOutlineColor={COLORS.teal}
            style={styles.input}
          />

          <Button
            mode="contained"
            buttonColor={COLORS.emerald}
            loading={isLoading}
            disabled={isLoading || code.trim().length !== 6 || newPassword.length === 0}
            onPress={handleSubmit}
            style={styles.btn}
          >
            Confirm & Save Password
          </Button>

          <Button
            mode="text"
            textColor={COLORS.textSecondary}
            onPress={() => router.replace('/auth/login')}
            style={{ marginTop: 12 }}
          >
            ➔ Cancel & Back to Login
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, justifyContent: 'center', minHeight: '80%' },
  header: { marginBottom: 24, alignItems: 'center' },
  title: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '800' },
  subtitle: { color: COLORS.textSecondary, fontSize: 13, marginTop: 6, textAlign: 'center', lineHeight: 18 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  input: { backgroundColor: COLORS.card, color: COLORS.textPrimary, marginBottom: 16 },
  btn: { borderRadius: 8, paddingVertical: 4 }
});
