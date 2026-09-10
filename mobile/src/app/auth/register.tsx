import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { navigate } from '../../utils/navigation';
import { useRegister } from '../../hooks/useAuth';
import { ApiError } from '../../types/api';

/**
 * Registration Screen.
 * Dynamically presents fields based on selected role, performs strict 
 * frontend validations, and displays detailed error messages.
 */
export default function RegisterScreen() {
  const params = useLocalSearchParams();
  const role = (params.role as string) || 'PATIENT';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [cnic, setCnic] = useState('');
  const [pncNumber, setPncNumber] = useState('');
  const [pmdcNumber, setPmdcNumber] = useState('');
  
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const registerMutation = useRegister();
  const isLoading = registerMutation.isPending;
  const error = registerMutation.error as ApiError | null;


  // ─── CNIC Auto-Formatter ────────────────────────────────────────────────
  /**
   * Format rule: XXXXX-XXXXXXX-X  (5 digits, dash, 7 digits, dash, 1 digit)
   * Hyphens are inserted automatically and removed automatically on backspace.
   */
  const formatCnic = (raw: string) => {
    // Strip everything that is not a digit
    const digits = raw.replace(/\D/g, '').slice(0, 13);
    let result = '';
    if (digits.length <= 5) {
      result = digits;
    } else if (digits.length <= 12) {
      result = digits.slice(0, 5) + '-' + digits.slice(5);
    } else {
      result = digits.slice(0, 5) + '-' + digits.slice(5, 12) + '-' + digits.slice(12);
    }
    return result;
  };

  const handleCnicChange = (val: string) => {
    const formatted = formatCnic(val);
    setCnic(formatted);
    if (error) registerMutation.reset();
  };
  // ────────────────────────────────────────────────────────────────────────

  // Local validation checks
  const isEmailValid = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const isPhoneValid = (val: string) => {
    // Pakistan phone: 11 digits starting with 03, e.g. 03001234567
    return /^03\d{9}$/.test(val.trim());
  };

  const isCnicValid = (val: string) => {
    // Pakistani CNIC format: xxxxx-xxxxxxx-x
    return /^\d{5}-\d{7}-\d{1}$/.test(val.trim());
  };

  const isPasswordValid = (val: string) => {
    // 8+ characters, at least 1 number, 1 special character
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*()[\]{}|_+=;:"'<>,.?/~`\-]).{8,}$/;
    return passwordRegex.test(val);
  };

  const isFormValid = () => {
    if (!fullName.trim() || fullName.trim().length < 3) return false;
    if (!isEmailValid(email)) return false;
    if (!isPhoneValid(phone)) return false;
    if (!isPasswordValid(password)) return false;
    
    if (role !== 'ADMIN') {
      if (!isCnicValid(cnic)) return false;
    }
    if (role === 'NURSE') {
      if (!pncNumber.trim()) return false;
    }
    if (role === 'DOCTOR') {
      if (!pmdcNumber.trim()) return false;
    }
    
    return true;
  };

  const handleRegister = async () => {
    if (!isFormValid()) return;
    
    const payload: any = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      role,
    };

    if (role !== 'ADMIN') {
      payload.cnic = cnic.trim();
    }
    if (role === 'NURSE') {
      payload.pncNumber = pncNumber.trim();
    }
    if (role === 'DOCTOR') {
      payload.pmdcNumber = pmdcNumber.trim();
    }

    registerMutation.mutate(payload, {
      onSuccess: () => {
        navigate('/auth/verify-otp', { emailOrPhone: email.trim() });
      }
    });
  };

  const getRoleLabel = () => {
    switch (role) {
      case 'NURSE': return 'Nurse Practitioner';
      default: return 'Patient';
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Register Profile</Text>
      <Text style={styles.subtitle}>Creating account as a {getRoleLabel()}</Text>

      <View style={styles.card}>
        <TextInput
          label="Full Name"
          value={fullName}
          onChangeText={(val) => { setFullName(val); if (error) registerMutation.reset(); }}
          mode="outlined"
          error={fullName.length > 0 && fullName.trim().length < 3}
          style={styles.input}
          outlineColor="#E5E7EB"
          activeOutlineColor="#0D9488"
        />
        {fullName.length > 0 && fullName.trim().length < 3 && (
          <HelperText type="error" visible={true} style={styles.fieldError}>
            Full name must be at least 3 characters long
          </HelperText>
        )}

        <TextInput
          label="Email Address"
          value={email}
          onChangeText={(val) => { setEmail(val); if (error) registerMutation.reset(); }}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          error={email.length > 0 && !isEmailValid(email)}
          style={styles.input}
          outlineColor="#E5E7EB"
          activeOutlineColor="#0D9488"
        />
        {email.length > 0 && !isEmailValid(email) && (
          <HelperText type="error" visible={true} style={styles.fieldError}>
            Enter a valid email address
          </HelperText>
        )}

        <TextInput
          label="Phone Number"
          value={phone}
          placeholder="e.g. 03001234567"
          onChangeText={(val) => { setPhone(val); if (error) registerMutation.reset(); }}
          mode="outlined"
          keyboardType="phone-pad"
          error={phone.length > 0 && !isPhoneValid(phone)}
          style={styles.input}
          outlineColor="#E5E7EB"
          activeOutlineColor="#0D9488"
        />
        {phone.length > 0 && !isPhoneValid(phone) && (
          <HelperText type="error" visible={true} style={styles.fieldError}>
            Phone must be a valid Pakistan mobile starting with 03 (11 digits)
          </HelperText>
        )}

        <TextInput
          label="Password"
          value={password}
          onChangeText={(val) => { setPassword(val); if (error) registerMutation.reset(); }}
          mode="outlined"
          secureTextEntry={secureTextEntry}
          error={password.length > 0 && !isPasswordValid(password)}
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
        {password.length > 0 && !isPasswordValid(password) && (
          <HelperText type="error" visible={true} style={styles.fieldError}>
            Requires 8+ characters with at least one number & one symbol
          </HelperText>
        )}

        {role !== 'ADMIN' && (
          <>
            <TextInput
              label="CNIC Number"
              value={cnic}
              placeholder="e.g. 37405-1234567-1"
              onChangeText={handleCnicChange}
              mode="outlined"
              keyboardType="numeric"
              maxLength={15}
              error={cnic.length > 0 && !isCnicValid(cnic)}
              style={styles.input}
              outlineColor="#E5E7EB"
              activeOutlineColor="#0D9488"
            />
            {cnic.length > 0 && !isCnicValid(cnic) && (
              <HelperText type="error" visible={true} style={styles.fieldError}>
                CNIC format: XXXXX-XXXXXXX-X (hyphens added automatically)
              </HelperText>
            )}
          </>
        )}

        {role === 'NURSE' && (
          <>
            <TextInput
              label="PNC Registration Number"
              value={pncNumber}
              onChangeText={(val) => { setPncNumber(val); if (error) registerMutation.reset(); }}
              mode="outlined"
              error={pncNumber.length > 0 && !pncNumber.trim()}
              style={styles.input}
              outlineColor="#E5E7EB"
              activeOutlineColor="#0D9488"
            />
            {pncNumber.length > 0 && !pncNumber.trim() && (
              <HelperText type="error" visible={true} style={styles.fieldError}>
                PNC registration number is required
              </HelperText>
            )}
          </>
        )}

        {role === 'DOCTOR' && (
          <>
            <TextInput
              label="PMDC Registration Number"
              value={pmdcNumber}
              onChangeText={(val) => { setPmdcNumber(val); if (error) registerMutation.reset(); }}
              mode="outlined"
              error={pmdcNumber.length > 0 && !pmdcNumber.trim()}
              style={styles.input}
              outlineColor="#E5E7EB"
              activeOutlineColor="#0D9488"
            />
            {pmdcNumber.length > 0 && !pmdcNumber.trim() && (
              <HelperText type="error" visible={true} style={styles.fieldError}>
                PMDC registration number is required
              </HelperText>
            )}
          </>
        )}

          {error && (
          <HelperText type="error" visible={true} style={styles.errorText}>
            {error.message}
          </HelperText>
        )}

        <Button
          mode="contained"
          onPress={handleRegister}
          loading={isLoading}
          disabled={isLoading || !isFormValid()}
          style={styles.button}
          contentStyle={styles.buttonContent}
          buttonColor="#0D9488">
          Register Account
        </Button>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Text
            style={styles.link}
            onPress={() => {
              registerMutation.reset();
              navigate('/auth/login');
            }}>
            Sign In
          </Text>
        </View>
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
    alignSelf: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 480 : '100%',
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
    marginBottom: 4,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
  },
  fieldError: {
    marginBottom: 4,
    fontSize: 12,
  },
  button: {
    marginTop: 16,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  errorText: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 14,
    textAlign: 'center',
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
