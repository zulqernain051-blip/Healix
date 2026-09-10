import React, { useState } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

interface AddEmergencyContactModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string, phone: string, relationship: string) => Promise<void>;
  isLoading?: boolean;
}

export const AddEmergencyContactModal: React.FC<AddEmergencyContactModalProps> = ({ visible, onClose, onSubmit, isLoading = false }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim() || !relationship.trim()) return;
    await onSubmit(name, phone, relationship);
    setName(''); setPhone(''); setRelationship('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Add Emergency Contact</Text>
          <TextInput style={styles.input} placeholder="Contact Name" placeholderTextColor="#6B8E8A" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor="#6B8E8A" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <TextInput style={styles.input} placeholder="Relationship (e.g. Sister, Brother)" placeholderTextColor="#6B8E8A" value={relationship} onChangeText={setRelationship} />
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={isLoading}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.confirmBtn, (!name.trim() || !phone.trim() || !relationship.trim()) && styles.disabled]} onPress={handleSubmit} disabled={!name.trim() || !phone.trim() || !relationship.trim() || isLoading}>
              <Text style={styles.confirmText}>{isLoading ? 'Saving...' : 'Add Contact'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', padding: SPACING.lg },
  modal: { backgroundColor: '#0A2D28', borderRadius: RADIUS.lg, padding: SPACING.xl, borderWidth: 1, borderColor: 'rgba(0,230,118,0.2)' },
  title: { color: '#FFFFFF', fontSize: TYPOGRAPHY.sizes.md, fontWeight: '700', marginBottom: SPACING.md },
  input: { backgroundColor: '#051815', borderRadius: RADIUS.md, padding: SPACING.md, color: '#FFFFFF', fontSize: 12, borderWidth: 1, borderColor: 'rgba(0,230,118,0.15)', marginBottom: SPACING.md },
  btnRow: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm },
  cancelBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', paddingVertical: SPACING.md, borderRadius: RADIUS.md, alignItems: 'center' },
  cancelText: { color: '#94A3B8', fontSize: 11, fontWeight: '600' },
  confirmBtn: { flex: 1, backgroundColor: '#00E676', paddingVertical: SPACING.md, borderRadius: RADIUS.md, alignItems: 'center' },
  disabled: { opacity: 0.5 },
  confirmText: { color: '#061C19', fontSize: 11, fontWeight: '700' },
});
