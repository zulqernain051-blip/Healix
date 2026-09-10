import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, Platform } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useVerifyManual } from '../../../hooks/useVisits';
import { verifyManualSchema } from '../../../types/visit';
import { RADIUS, SPACING } from '../../../theme';

interface ManualVerificationProps {
  visitId: string;
  onSuccess: () => void;
}

export const ManualVerification: React.FC<ManualVerificationProps> = ({ visitId, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const verifyManual = useVerifyManual();

  // Only available in development
  if (!__DEV__) return null;

  const handleSubmit = async () => {
    const result = verifyManualSchema.safeParse({ reason });
    if (!result.success) {
      setError(result.error.errors[0]?.message || 'Invalid input');
      return;
    }
    setError('');

    try {
      await verifyManual.mutateAsync({ visitId, data: { reason } });
      if (Platform.OS === 'web') {
        alert('Manual verification applied (dev mode).');
        onSuccess();
      } else {
        Alert.alert('Verified', 'Manual verification applied (dev mode).', [
          { text: 'Continue', onPress: onSuccess },
        ]);
      }
    } catch (err: any) {
      if (Platform.OS === 'web') {
        alert('Verification Failed: ' + (err.message || 'Manual verification failed.'));
      } else {
        Alert.alert('Verification Failed', err.message || 'Manual verification failed.');
      }
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>??? Manual Verification (Dev Only)</Text>
        <Text style={styles.description}>Bypass verification for testing. Requires a reason (min 10 characters).</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter verification bypass reason..."
          placeholderTextColor="#6B8E8A"
          value={reason}
          onChangeText={setReason}
          multiline
          numberOfLines={3}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Button
          mode="contained"
          buttonColor="#F59E0B"
          textColor="#061C19"
          onPress={handleSubmit}
          loading={verifyManual.isPending}
          disabled={verifyManual.isPending}
          style={styles.btn}
          labelStyle={{ fontWeight: '700' }}
        >
          Force Bypass
        </Button>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#0A2D28', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: '#F59E0B', marginBottom: SPACING.md },
  title: { color: '#F59E0B', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  description: { color: '#94A3B8', fontSize: 12, marginBottom: 12 },
  input: {
    backgroundColor: '#051815',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    padding: 12,
    borderRadius: RADIUS.md,
    fontSize: 13,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  errorText: { color: '#EF4444', fontSize: 12, marginBottom: 8 },
  btn: { borderRadius: RADIUS.md },
});
