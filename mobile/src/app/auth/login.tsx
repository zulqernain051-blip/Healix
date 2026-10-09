
import { useAppTheme, useThemeValue } from '../../theme/ThemeProvider';
import type { ThemeColors } from '../../theme';
import { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { navigate } from '../../utils/navigation';
import { useLogin } from '../../hooks/useAuth';
import { ApiError } from '../../types/api';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/auth';

/**
 * Premium Login Screen.
 * Supports email or phone inputs with secure password checking and 
 * redirects unverified users to OTP verification.
 */
export default function LoginScreen() {
  const { colors: COLORS } = useAppTheme();
  const styles = useThemeValue(createStyles);

  const params = useLocalSearchParams<{ message?: string }>();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const setSession = useAuthStore(state => state.setSession);
  
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

  const handleGoogleCredential = async (credential: string) => {
    setGoogleBusy(true);
    setGoogleError('');
    try {
      const result = await authApi.googleLogin({ credential });
      if (result.mfaRequired) {
        navigate('/auth/mfa-verify', { emailOrPhone: result.email });
      } else {
        await setSession(result.user, result.tokens.accessToken, result.tokens.refreshToken);
      }
    } catch (err: any) {
      setGoogleError(err.message || 'Google sign-in failed.');
    } finally {
      setGoogleBusy(false);
    }
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
        {!!params.message && <HelperText type="info" visible>{params.message}</HelperText>}

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
          outlineColor={COLORS.inputBorder}
          activeOutlineColor={COLORS.teal}
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
          onPress={handleLogin}
          loading={isLoading}
          disabled={isLoading || !emailOrPhone || !password}
          style={styles.button}
          contentStyle={styles.buttonContent}
          buttonColor={COLORS.tealFill} textColor={COLORS.onAccent}>
          Sign In
        </Button>
        <GoogleSignInButton onCredential={handleGoogleCredential} onError={setGoogleError} disabled={googleBusy || isLoading} />
        {!!googleError && <HelperText type="error" visible>{googleError}</HelperText>}

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
          <Text style={{ color: COLORS.teal, fontWeight: '600', fontSize: 13 }}>
            Forgot Password?
          </Text>
        </TouchableOpacity>
      <Button onPress={() => navigate('/auth/invited')}>Accept an invitation</Button></View>
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
    alignItems: 'center',
    marginBottom: 32,
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.teal,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textBody,
    marginTop: 4,
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textMuted,
  },
  hint: {
    fontSize: 14,
    color: COLORS.textBody,
    marginBottom: 24,
    marginTop: 4,
  },
  input: {
    marginBottom: 16,
    backgroundColor: COLORS.surfaceCard,
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
    color: COLORS.textBody,
    fontSize: 14,
  },
  link: {
    color: COLORS.teal,
    fontWeight: 'bold',
    fontSize: 14,
  },
}));
