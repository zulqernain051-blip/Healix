import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { navigate } from '../../../utils/navigation';
import { useAuthStore } from '../../../store/auth';
import { usePatientProfile, useUpdatePatientProfile } from '../../../hooks/usePatient';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../../theme';
import { LoadingState } from '../../../components/common/LoadingState';
import { ErrorState } from '../../../components/common/ErrorState';

export default function ProfileEditScreen() {
  const { user, loadUser } = useAuthStore();
  const patientId = user?.patientId || '';

  const { data: patientProfile, isLoading: isFetching, error: fetchError, refetch } = usePatientProfile(patientId);
  const { mutateAsync: updateProfile, isPending: isUpdating } = useUpdatePatientProfile();

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  useEffect(() => {
    if (patientProfile) {
      setFullName(patientProfile.user?.fullName || user?.fullName || '');
      setDob(patientProfile.dob ? new Date(patientProfile.dob).toISOString().split('T')[0] : '');
      setGender(patientProfile.gender || '');
      setAddress(patientProfile.address || '');
      setLatitude(patientProfile.latitude?.toString() || '');
      setLongitude(patientProfile.longitude?.toString() || '');
    }
  }, [patientProfile, user]);

  const isDobValid = (val: string) => {
    if (!val) return true;
    return /^\d{4}-\d{2}-\d{2}$/.test(val);
  };

  const isFormValid = () => {
    if (fullName.trim().length < 3) return false;
    if (dob && !isDobValid(dob)) return false;
    if (latitude && isNaN(Number(latitude))) return false;
    if (longitude && isNaN(Number(longitude))) return false;
    return true;
  };

  const handleSave = async () => {
    if (!isFormValid() || !patientId) return;

    const payload: any = {
      fullName: fullName.trim(),
      gender: gender.trim() || undefined,
      address: address.trim() || undefined,
      dob: dob ? new Date(dob) : undefined,
    };

    if (latitude.trim()) payload.latitude = Number(latitude);
    if (longitude.trim()) payload.longitude = Number(longitude);

    try {
      await updateProfile({ patientId, data: payload });
      await loadUser(); // Update global auth user name just in case
      Alert.alert('Success', 'Profile updated successfully.');
      navigate('/(patient)/profile');
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Could not update profile.');
    }
  };

  if (isFetching && !patientProfile) return <LoadingState message="Loading profile data..." />;
  if (fetchError) return <ErrorState error={fetchError as Error} onRetry={refetch} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#061C19" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Edit Profile</Text>
        </View>

        <Text style={styles.subtitle}>Update your personal details and routing coordinates</Text>

        <View style={styles.card}>
          <TextInput
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            mode="outlined"
            error={fullName.length > 0 && fullName.trim().length < 3}
            style={styles.input}
            outlineColor="rgba(0, 230, 118, 0.2)"
            activeOutlineColor="#00E676"
            textColor="#FFFFFF"
            theme={{ colors: { onSurfaceVariant: '#94A3B8' } }}
          />
          {fullName.length > 0 && fullName.trim().length < 3 && (
            <HelperText type="error" visible={true} style={styles.errorHelper}>
              Full name must be at least 3 characters long
            </HelperText>
          )}

          <TextInput
            label="Date of Birth (YYYY-MM-DD)"
            value={dob}
            placeholder="e.g. 1995-12-30"
            placeholderTextColor="#6B8E8A"
            onChangeText={setDob}
            mode="outlined"
            error={dob.length > 0 && !isDobValid(dob)}
            style={styles.input}
            outlineColor="rgba(0, 230, 118, 0.2)"
            activeOutlineColor="#00E676"
            textColor="#FFFFFF"
            theme={{ colors: { onSurfaceVariant: '#94A3B8' } }}
          />
          {dob.length > 0 && !isDobValid(dob) && (
            <HelperText type="error" visible={true} style={styles.errorHelper}>
              Must be YYYY-MM-DD format
            </HelperText>
          )}

          <TextInput
            label="Gender"
            value={gender}
            placeholder="e.g. Male, Female"
            placeholderTextColor="#6B8E8A"
            onChangeText={setGender}
            mode="outlined"
            style={styles.input}
            outlineColor="rgba(0, 230, 118, 0.2)"
            activeOutlineColor="#00E676"
            textColor="#FFFFFF"
            theme={{ colors: { onSurfaceVariant: '#94A3B8' } }}
          />

          <TextInput
            label="Address"
            value={address}
            placeholder="e.g. House 12, Street 5, DHA Phase 6"
            placeholderTextColor="#6B8E8A"
            onChangeText={setAddress}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={styles.input}
            outlineColor="rgba(0, 230, 118, 0.2)"
            activeOutlineColor="#00E676"
            textColor="#FFFFFF"
            theme={{ colors: { onSurfaceVariant: '#94A3B8' } }}
          />

          <View style={styles.row}>
            <TextInput
              label="Latitude"
              value={latitude}
              placeholder="e.g. 31.5204"
              placeholderTextColor="#6B8E8A"
              onChangeText={setLatitude}
              mode="outlined"
              keyboardType="numeric"
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              error={latitude.length > 0 && isNaN(Number(latitude))}
              outlineColor="rgba(0, 230, 118, 0.2)"
              activeOutlineColor="#00E676"
              textColor="#FFFFFF"
              theme={{ colors: { onSurfaceVariant: '#94A3B8' } }}
            />
            <TextInput
              label="Longitude"
              value={longitude}
              placeholder="e.g. 74.3587"
              placeholderTextColor="#6B8E8A"
              onChangeText={setLongitude}
              mode="outlined"
              keyboardType="numeric"
              style={[styles.input, { flex: 1, marginLeft: 8 }]}
              error={longitude.length > 0 && isNaN(Number(longitude))}
              outlineColor="rgba(0, 230, 118, 0.2)"
              activeOutlineColor="#00E676"
              textColor="#FFFFFF"
              theme={{ colors: { onSurfaceVariant: '#94A3B8' } }}
            />
          </View>
          {(latitude.length > 0 && isNaN(Number(latitude))) || (longitude.length > 0 && isNaN(Number(longitude))) ? (
            <HelperText type="error" visible={true} style={styles.errorHelper}>
              Coordinates must be valid numbers
            </HelperText>
          ) : null}

          <Button
            mode="contained"
            onPress={handleSave}
            loading={isUpdating}
            disabled={isUpdating || !isFormValid()}
            style={styles.saveBtn}
            buttonColor="#00E676"
            textColor="#061C19"
          >
            Save Profile
          </Button>

          <Button
            mode="outlined"
            onPress={() => navigate('/(patient)/profile')}
            style={styles.cancelBtn}
            textColor="#00E676"
          >
            Cancel
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#061C19' },
  container: { flexGrow: 1, padding: SPACING.lg, paddingBottom: 60, maxWidth: 800, width: '100%', alignSelf: 'center' },
  headerRow: { marginTop: SPACING.md, marginBottom: SPACING.xs },
  headerTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#94A3B8', fontSize: 14, marginBottom: SPACING.xl },
  card: { backgroundColor: '#0A2D28', borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.1)' },
  input: { marginBottom: 4, marginTop: 8, backgroundColor: '#061C19' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  errorHelper: { color: '#FF5252', fontSize: 12, marginBottom: 8 },
  saveBtn: { marginTop: SPACING.xl, paddingVertical: 6, borderRadius: RADIUS.md },
  cancelBtn: { marginTop: SPACING.sm, paddingVertical: 6, borderRadius: RADIUS.md, borderColor: 'rgba(0, 230, 118, 0.3)' },
});
