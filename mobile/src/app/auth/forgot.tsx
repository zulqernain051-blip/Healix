import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { TextInput, Button, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { navigate } from '../../utils/navigation';
import { useForgotPassword } from '../../hooks/useAuth';

const COLORS = {
  bg: '#0A1628',
  card: '#111D35',
  border: '#1E2D4A',
  teal: '#0D9488',
  emerald: '#10B981',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#475569'
};

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const forgotMutation = useForgotPassword();
  const isLoading = forgotMutation.isPending;
  const [emailOrPhone, setEmailOrPhone] = useState('');

  const handleSubmit = async () => {
    if (emailOrPhone.trim().length === 0) {
      if (Platform.OS === 'web') alert('Please enter your registered email or phone number.');
      else Alert.alert('Validation Error', 'Please enter your registered email or phone number.');
      return;
    }

    forgotMutation.mutate(
      { emailOrPhone: emailOrPhone.trim() },
      {
        onSuccess: () => {
          if (Platform.OS === 'web') {
            alert('A 6-digit password reset verification code has been generated and sent.');
            navigate('/auth/reset', { emailOrPhone: emailOrPhone.trim() });
          } else {
            Alert.alert(
              'OTP Verification Dispatched',
              'A 6-digit password reset verification code has been generated and sent.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    navigate('/auth/reset', { emailOrPhone: emailOrPhone.trim() });
                  }
                }
              ]
            );
          }
        },
        onError: (err: any) => {
          if (Platform.OS === 'web') alert('Error: ' + err.message);
          else Alert.alert('Error', err.message);
        }
      }
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>🔒 Recover Password</Text>
        <Text style={styles.subtitle}>Enter your details below to request a verification OTP reset code</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <TextInput
            label="Email or Phone Number"
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
            placeholder="e.g. user@gmail.com or 03001234567"
            mode="outlined"
            activeOutlineColor={COLORS.teal}
            style={styles.input}
          />

          <Button
            mode="contained"
            buttonColor={COLORS.teal}
            loading={isLoading}
            disabled={isLoading || emailOrPhone.trim().length === 0}
            onPress={handleSubmit}
            style={styles.btn}
          >
            Request Reset Code
          </Button>

          <Button
            mode="text"
            textColor={COLORS.textSecondary}
            onPress={() => router.back()}
            style={{ marginTop: 12 }}
          >
            ➔ Back to Login
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
