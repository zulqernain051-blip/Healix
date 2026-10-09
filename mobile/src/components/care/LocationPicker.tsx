import { useAppTheme, useThemeValue } from '../../theme/ThemeProvider';
import type { ThemeColors } from '../../theme';
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Text } from 'react-native-paper';
import * as Location from 'expo-location';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../theme';
import { hasValidCoordinates } from '../../utils/location';
interface LocationInfo { address: string; latitude: number; longitude: number }
interface Props { location: LocationInfo; onChange: (loc: LocationInfo) => void; savedLocation?: LocationInfo }
export const LocationPicker: React.FC<Props> = ({ location, onChange, savedLocation }) => {
  const { colors: COLORS } = useAppTheme();
  const styles = useThemeValue(createStyles);

  const [mode, setMode] = useState<'SAVED' | 'GPS' | 'MANUAL'>('SAVED');
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState('');
  const [manualLatitude, setManualLatitude] = useState('');
  const [manualLongitude, setManualLongitude] = useState('');
  const requestId = useRef(0);
  useEffect(() => () => { requestId.current += 1; }, []);
  const handleModeChange = async (newMode: typeof mode) => {
    const current = ++requestId.current;
    setMode(newMode); setError(''); setIsCapturing(false);
    if (newMode === 'SAVED') {
      onChange(savedLocation || { address: '', latitude: NaN, longitude: NaN });
      if (!savedLocation || !hasValidCoordinates(savedLocation)) setError('Add your home location in your profile, or use GPS or Other.');
    } else if (newMode === 'MANUAL') {
      setManualLatitude(''); setManualLongitude('');
      onChange({ address: '', latitude: NaN, longitude: NaN });
    } else {
      onChange({ address: '', latitude: NaN, longitude: NaN });
      setIsCapturing(true);
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== 'granted') throw new Error('Location permission was denied. Enter your location using Other.');
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        if (current !== requestId.current) return;
        const { latitude, longitude } = position.coords;
        onChange({ address: 'Current location (' + latitude.toFixed(5) + ', ' + longitude.toFixed(5) + ')', latitude, longitude });
      } catch (err) {
        if (current === requestId.current) setError(err instanceof Error ? err.message : 'Could not get your location.');
      } finally { if (current === requestId.current) setIsCapturing(false); }
    }
  };
  return <View style={styles.container}>
    <Text style={styles.label}>Service location *</Text>
    <View style={styles.row}>
      {(['SAVED', 'GPS', 'MANUAL'] as const).map(value => <TouchableOpacity key={value} accessibilityRole="button" accessibilityState={{ selected: mode === value }} activeOpacity={0.8} style={[styles.button, mode === value && styles.active]} onPress={() => void handleModeChange(value)}>
        <Text style={styles.label}>{value === 'SAVED' ? 'Home' : value === 'GPS' ? (isCapturing ? 'Locating...' : 'Current GPS') : 'Other'}</Text>
      </TouchableOpacity>)}
    </View>
    <TextInput accessibilityLabel="Service address" style={styles.input} placeholder="Enter detailed address" placeholderTextColor={COLORS.textMuted} value={location.address} onChangeText={address => onChange({ ...location, address })} editable={!isCapturing} multiline />
    {mode === 'MANUAL' && <View style={styles.row}>
      <TextInput accessibilityLabel="Latitude" style={[styles.input, styles.coordinate]} placeholder="Latitude" placeholderTextColor={COLORS.textMuted} keyboardType="numbers-and-punctuation" value={manualLatitude} onChangeText={value => { setManualLatitude(value); onChange({ ...location, latitude: value.trim() ? Number(value) : NaN }); }} />
      <TextInput accessibilityLabel="Longitude" style={[styles.input, styles.coordinate]} placeholder="Longitude" placeholderTextColor={COLORS.textMuted} keyboardType="numbers-and-punctuation" value={manualLongitude} onChangeText={value => { setManualLongitude(value); onChange({ ...location, longitude: value.trim() ? Number(value) : NaN }); }} />
    </View>}
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    {!isCapturing && !hasValidCoordinates(location) && <Text style={styles.hint}>Choose a saved location, capture GPS, or enter valid coordinates.</Text>}
  </View>;
};
const createStyles = (COLORS: ThemeColors) => (StyleSheet.create({
  container: { marginBottom: SPACING.md, gap: SPACING.sm },
  label: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.textDark },
  row: { flexDirection: 'row', gap: SPACING.sm },
  button: { flex: 1, minHeight: SPACING.lg * 3, justifyContent: 'center', alignItems: 'center', padding: SPACING.sm, borderRadius: RADIUS.md, backgroundColor: COLORS.surfaceMuted },
  active: { backgroundColor: COLORS.quickBlue, borderWidth: 1, borderColor: COLORS.accentBlue },
  input: { minHeight: SPACING.lg * 3, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.inputBorder, borderRadius: RADIUS.md, backgroundColor: COLORS.surfaceCard, color: COLORS.textDark, fontSize: TYPOGRAPHY.sizes.md },
  coordinate: { flex: 1 }, error: { color: COLORS.red }, hint: { color: COLORS.textBody, fontSize: TYPOGRAPHY.sizes.sm },
}));
