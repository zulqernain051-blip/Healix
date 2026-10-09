import { useAppTheme, useThemeValue } from '../../theme/ThemeProvider';
import type { ThemeColors } from '../../theme';
import { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, Alert, ActivityIndicator } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useUpdateProfile } from '../../hooks/useNurse';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  nurseId: string;
  initialBio: string;
  initialExperience: string;
  initialPhotoUrl: string;
}

export function EditBioModal({ visible, onClose, nurseId, initialBio, initialExperience, initialPhotoUrl }: Props) {
  const { colors: COLORS } = useAppTheme();
  const styles = useThemeValue(createStyles);

  const [bio, setBio] = useState(initialBio);
  const [experience, setExperience] = useState(initialExperience);
  const [formError, setFormError] = useState('');
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
    if (bio.trim().length < 20 || !Number.isInteger(Number(experience)) || Number(experience) < 0 || Number(experience) > 50) { setFormError('Enter a biography of at least 20 characters and 0–50 whole years of experience.'); return; }
    setFormError('');
    updateProfile(
      {
        nurseId,
        data: {
          bio: bio.trim(),
          experience: Number(experience),
          photoUrl: photoUrl.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Profile bio & experience updated.');
          onClose();
        },
        onError: (err: any) => {
          setFormError(err.message || 'Failed to update profile.');
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
            outlineColor={COLORS.inputBorder}
            activeOutlineColor={COLORS.emerald}
          />

          <TextInput
            label="Years of Experience"
            value={experience}
            onChangeText={setExperience}
            mode="outlined"
            keyboardType="number-pad"
            style={styles.input}
            outlineColor={COLORS.inputBorder}
            activeOutlineColor={COLORS.emerald}
          />

          <TextInput
            label="Photo URL (Optional)"
            value={photoUrl}
            onChangeText={setPhotoUrl}
            mode="outlined"
            style={styles.input}
            outlineColor={COLORS.inputBorder}
            activeOutlineColor={COLORS.emerald}
          />

          {!!formError && <Text style={{ color: COLORS.red }}>{formError}</Text>}
          <View style={styles.modalActions}>
            <Button mode="text" onPress={onClose} textColor={COLORS.textBody}>Cancel</Button>
            <Button
              mode="contained"
              onPress={handleSaveBio}
              buttonColor={COLORS.emeraldFill} textColor={COLORS.onAccent}
              disabled={savingBio}
            >
              {savingBio ? <ActivityIndicator color={COLORS.textDark} /> : 'Save Changes'}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (COLORS: ThemeColors) => (StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: COLORS.modalBackdrop, justifyContent: 'center', padding: SPACING.md },
  modalContent: { backgroundColor: COLORS.surfaceCard, borderRadius: RADIUS.lg, padding: SPACING.lg },
  modalTitle: { ...TYPOGRAPHY.h3, marginBottom: SPACING.md, color: COLORS.textDark },
  input: { marginBottom: SPACING.sm, backgroundColor: COLORS.surfaceCard },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: SPACING.md, gap: SPACING.sm },
}));
