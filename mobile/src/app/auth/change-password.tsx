import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useChangePassword } from '../../hooks/useAuth';

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

export default function ChangePasswordScreen() {
  const router = useRouter();
  const changeMutation = useChangePassword();
  const isLoading = changeMutation.isPending;

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async () => {
    if (oldPassword.trim().length === 0) {
      Alert.alert('Validation Error', 'Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Validation Error', 'New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }

    changeMutation.mutate(
      { oldPassword, newPassword },
      {
        onSuccess: () => {
          Alert.alert(
            'Password Changed Successfully',
            'Your profile password has been successfully updated.',
            [
              {
                text: 'OK',
                onPress: () => {
                  router.back();
                }
              }
            ]
          );
        },
        onError: (err: any) => {
          Alert.alert('Change Password Failed', err.message);
        }
      }
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>🔑 Change Password</Text>
        <Text style={styles.subtitle}>Update your account security credentials</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <TextInput
            label="Current Password"
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry
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
            disabled={isLoading || oldPassword.trim().length === 0 || newPassword.length === 0}
            onPress={handleSubmit}
            style={styles.btn}
          >
            Update Password
          </Button>

          <Button
            mode="outlined"
            textColor={COLORS.textSecondary}
            style={{ borderColor: COLORS.border, marginTop: 12 }}
            onPress={() => router.back()}
          >
            ➔ Cancel
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
