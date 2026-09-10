import React, { useState } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useVerifyQr } from '../../../hooks/useVisits';
import { RADIUS, SPACING } from '../../../theme';

interface QrScannerProps {
  visitId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const QrScanner: React.FC<QrScannerProps> = ({ visitId, onSuccess, onCancel }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const verifyQr = useVerifyQr();

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || verifyQr.isPending) return;
    setScanned(true);

    try {
      await verifyQr.mutateAsync({ visitId, data: { token: data } });
      if (Platform.OS === 'web') {
        alert('Patient identity verified via QR code.');
        onSuccess();
      } else {
        Alert.alert('Verified', 'Patient identity verified via QR code.', [
          { text: 'Continue', onPress: onSuccess },
        ]);
      }
    } catch (err: any) {
      if (Platform.OS === 'web') {
        alert('Verification Failed: ' + (err.message || 'QR verification failed'));
        setScanned(false);
      } else {
        Alert.alert('Verification Failed', err.message || 'QR verification failed', [
          { text: 'Try Again', onPress: () => setScanned(false) },
        ]);
      }
    }
  };

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Camera Permission Required</Text>
        <Text style={styles.subtitle}>Grant camera access to scan patient QR codes.</Text>
        <Button mode="contained" buttonColor="#00E676" textColor="#061C19" onPress={requestPermission}>
          Grant Permission
        </Button>
        <Button mode="text" textColor="#94A3B8" onPress={onCancel} style={{ marginTop: 12 }}>
          Cancel
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan Patient's QR Code</Text>
      <Text style={styles.subtitle}>Position the QR code within the frame.</Text>

      <View style={styles.cameraFrame}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {verifyQr.isPending && <ActivityIndicator size="large" color="#00E676" style={{ marginTop: 20 }} />}

      {scanned && !verifyQr.isPending && (
        <Button mode="contained" buttonColor="#00E676" textColor="#061C19" onPress={() => setScanned(false)} style={{ marginTop: 16 }}>
          Scan Again
        </Button>
      )}

      <Button mode="text" textColor="#94A3B8" onPress={onCancel} style={{ marginTop: 12 }}>
        ‹ Back to Method Selection
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: SPACING.lg },
  title: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: '#94A3B8', fontSize: 14, marginBottom: 20 },
  cameraFrame: { width: 280, height: 280, borderRadius: RADIUS.xl, overflow: 'hidden', borderWidth: 2, borderColor: '#00E676' },
});

