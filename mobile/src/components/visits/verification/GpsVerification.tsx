import React from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { Text, Button, Card, ActivityIndicator } from 'react-native-paper';
import * as Location from 'expo-location';
import { useVerifyGps } from '../../../hooks/useVisits';
import { RADIUS, SPACING } from '../../../theme';

interface GpsVerificationProps {
  visitId: string;
  onSuccess: () => void;
}

export const GpsVerification: React.FC<GpsVerificationProps> = ({ visitId, onSuccess }) => {
  const verifyGps = useVerifyGps();

  const handleVerify = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required for GPS verification.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      await verifyGps.mutateAsync({
        visitId,
        data: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      });

      if (Platform.OS === 'web') {
        alert('Location verified via GPS proximity.');
        onSuccess();
      } else {
        Alert.alert('Verified', 'Location verified via GPS proximity.', [
          { text: 'Continue', onPress: onSuccess },
        ]);
      }
    } catch (err: any) {
      if (Platform.OS === 'web') {
        alert('GPS Verification Failed: ' + (err.message || 'Could not verify location.'));
      } else {
        Alert.alert('GPS Verification Failed', err.message || 'Could not verify location.');
      }
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>📍 GPS Proximity Verification</Text>
        <Text style={styles.description}>
          Verify you are within proximity of the patient's registered location.
        </Text>
        {verifyGps.isPending ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#00E676" />
            <Text style={styles.loadingText}>Acquiring location & verifying...</Text>
          </View>
        ) : (
          <Button
            mode="outlined"
            textColor="#00E676"
            style={styles.btn}
            onPress={handleVerify}
            labelStyle={{ fontWeight: '700' }}
          >
            Verify via GPS
          </Button>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#0A2D28', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.2)', marginBottom: SPACING.md },
  title: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  description: { color: '#94A3B8', fontSize: 12, marginBottom: 16 },
  btn: { borderColor: '#00E676', borderRadius: RADIUS.md },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  loadingText: { color: '#94A3B8', fontSize: 13 },
});
