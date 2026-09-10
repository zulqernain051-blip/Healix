import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../theme';

interface LocationInfo {
  address: string;
  latitude: number;
  longitude: number;
}

interface Props {
  location: LocationInfo;
  onChange: (loc: LocationInfo) => void;
  savedAddress?: string;
}

export const LocationPicker: React.FC<Props> = ({ location, onChange, savedAddress }) => {
  const [mode, setMode] = useState<'SAVED' | 'GPS' | 'MANUAL'>('SAVED');
  const [isCapturing, setIsCapturing] = useState(false);

  const handleModeChange = (newMode: 'SAVED' | 'GPS' | 'MANUAL') => {
    setMode(newMode);
    
    if (newMode === 'SAVED') {
      onChange({
        address: savedAddress || 'Default Home Address',
        latitude: 31.5204, // Default fallback
        longitude: 74.3587,
      });
    } else if (newMode === 'GPS') {
      setIsCapturing(true);
      // Simulate GPS fetch or actually use expo-location here if needed
      setTimeout(() => {
        onChange({
          address: 'GPS: 31.5204°N, 74.3587°E (Current Location)',
          latitude: 31.5204,
          longitude: 74.3587,
        });
        setIsCapturing(false);
      }, 1000);
    } else {
      // Manual input
      onChange({
        address: '',
        latitude: 0,
        longitude: 0,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Service Location *</Text>
      
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.button, mode === 'SAVED' && styles.buttonActive]}
          onPress={() => handleModeChange('SAVED')}
          activeOpacity={0.8}
        >
          <Text style={[styles.text, mode === 'SAVED' && styles.textActive]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, mode === 'GPS' && styles.buttonActive]}
          onPress={() => handleModeChange('GPS')}
          activeOpacity={0.8}
        >
          <Text style={[styles.text, mode === 'GPS' && styles.textActive]}>
            {isCapturing ? 'Locating...' : 'Current GPS'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, mode === 'MANUAL' && styles.buttonActive]}
          onPress={() => handleModeChange('MANUAL')}
          activeOpacity={0.8}
        >
          <Text style={[styles.text, mode === 'MANUAL' && styles.textActive]}>Other</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter detailed address..."
          placeholderTextColor={COLORS.textSecondary}
          value={location.address}
          onChangeText={(text) => onChange({ ...location, address: text })}
          editable={mode === 'MANUAL'}
          multiline
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.sm,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  buttonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  text: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  textActive: {
    color: COLORS.primary,
  },
  inputContainer: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
    borderRadius: RADIUS.md,
    minHeight: 80,
  },
  input: {
    ...TYPOGRAPHY.bodyMedium,
    color: '#FFFFFF',
    padding: SPACING.md,
    textAlignVertical: 'top',
    height: '100%',
  },
});
