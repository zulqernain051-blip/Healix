import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { navigate } from '../../utils/navigation';
import { useLogin } from '../../hooks/useAuth';
import { ApiError } from '../../types/api';

/**
 * Premium Login Screen.
 * Supports email or phone inputs with secure password checking and 
 * redirects unverified users to OTP verification.
 */
export default function LoginScreen() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  
  const loginMutation = useLogin();
  const isLoading = loginMutation.isPending;
  const error = loginMutation.error as ApiError | null;

  const handleLogin = () => {
    if (!emailOrPhone || !password) return;
    loginMutation.mutate(
      { emailOrPhone, password },
      {
        onSuccess: (data: any) => {
          if (data.mfaRequired) {
            navigate('/auth/mfa-verify', { emailOrPhone });
          }
        },
        onError: (err: any) => {
          if (err.message && err.message.includes('verify your OTP')) {
            navigate('/auth/verify-otp', { emailOrPhone });
          }
        },
      }
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logoText}>Healix</Text>
        <Text style={styles.subtitle}>Your Digital Healthcare Ecosystem</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.hint}>Sign in to access your secure portal</Text>

        <TextInput
          label="Email or Phone Number"
          value={emailOrPhone}
          onChangeText={(val) => {
            setEmailOrPhone(val);
            if (error) loginMutation.reset();
          }}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          outlineColor="#E5E7EB"
          activeOutlineColor="#0D9488"
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={(val) => {
            setPassword(val);
            if (error) loginMutation.reset();
          }}
          mode="outlined"
          secureTextEntry={secureTextEntry}
          right={
            <TextInput.Icon
              icon={secureTextEntry ? 'eye' : 'eye-off'}
              onPress={() => setSecureTextEntry(!secureTextEntry)}
            />
          }
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
          onPress={handleLogin}
          loading={isLoading}
          disabled={isLoading || !emailOrPhone || !password}
          style={styles.button}
          contentStyle={styles.buttonContent}
          buttonColor="#0D9488">
          Sign In
        </Button>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Text
            style={styles.link}
            onPress={() => {
              loginMutation.reset();
              navigate('/auth/role-select');
            }}>
            Sign Up
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            loginMutation.reset();
            navigate('/auth/forgot');
          }}
          style={{ marginTop: 12, alignItems: 'center' }}
        >
          <Text style={{ color: '#0D9488', fontWeight: '600', fontSize: 13 }}>
            Forgot Password?
          </Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    marginBottom: 32,
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#0D9488',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  hint: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    marginTop: 4,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
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
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 14,
  },
  link: {
    color: '#0D9488',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
