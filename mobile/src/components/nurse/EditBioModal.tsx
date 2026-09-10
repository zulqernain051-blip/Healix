import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, Alert, ActivityIndicator } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useUpdateProfile } from '../../hooks/useNurse';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  nurseId: string;
  initialBio: string;
  initialExperience: string;
  initialPhotoUrl: string;
}

export function EditBioModal({ visible, onClose, nurseId, initialBio, initialExperience, initialPhotoUrl }: Props) {
  const [bio, setBio] = useState(initialBio);
  const [experience, setExperience] = useState(initialExperience);
  const [photoUrl, setPhotoUrl] = useState(initialPhotoUrl);
  
  const { mutate: updateProfile, isPending: savingBio } = useUpdateProfile();

  useEffect(() => {
    if (visible) {
      setBio(initialBio);
      setExperience(initialExperience);
      setPhotoUrl(initialPhotoUrl);
    }
  }, [visible, initialBio, initialExperience, initialPhotoUrl]);

  const handleSaveBio = () => {
    updateProfile(
      {
        nurseId,
        data: {
          bio: bio.trim(),
          experience: parseInt(experience, 10) || 0,
          photoUrl: photoUrl.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Profile bio & experience updated.');
          onClose();
        },
        onError: (err: any) => {
          Alert.alert('Error', err.message || 'Failed to update profile.');
        },
      }
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Profile Info</Text>

          <TextInput
            label="Bio (About You)"
            value={bio}
            onChangeText={setBio}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
            outlineColor="#E2E8F0"
            activeOutlineColor="#00E676"
          />

          <TextInput
            label="Years of Experience"
            value={experience}
            onChangeText={setExperience}
            mode="outlined"
            keyboardType="number-pad"
            style={styles.input}
            outlineColor="#E2E8F0"
            activeOutlineColor="#00E676"
          />

          <TextInput
            label="Photo URL (Optional)"
            value={photoUrl}
            onChangeText={setPhotoUrl}
            mode="outlined"
            style={styles.input}
            outlineColor="#E2E8F0"
            activeOutlineColor="#00E676"
          />

          <View style={styles.modalActions}>
            <Button mode="text" onPress={onClose} textColor="#64748B">Cancel</Button>
            <Button
              mode="contained"
              onPress={handleSaveBio}
              buttonColor="#00E676"
              disabled={savingBio}
            >
              {savingBio ? <ActivityIndicator color="#FFF" /> : 'Save Changes'}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: SPACING.md },
  modalContent: { backgroundColor: '#FFF', borderRadius: RADIUS.lg, padding: SPACING.lg },
  modalTitle: { ...TYPOGRAPHY.h3, marginBottom: SPACING.md, color: COLORS.text },
  input: { marginBottom: SPACING.sm, backgroundColor: '#FFF' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: SPACING.md, gap: SPACING.sm },
});
