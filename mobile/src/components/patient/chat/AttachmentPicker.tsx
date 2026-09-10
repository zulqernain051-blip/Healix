import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Modal } from 'react-native';
import { RADIUS, SPACING } from '../../../theme';

interface AttachmentPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: 'image' | 'video' | 'document') => void;
}

export const AttachmentPicker: React.FC<AttachmentPickerProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.attachOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.attachMenuCard}>
          <Text style={styles.attachMenuTitle}>Share Clinical Attachment</Text>
          <View style={styles.attachGrid}>
            <TouchableOpacity style={styles.attachOption} onPress={() => onSelect('image')}>
              <View style={[styles.attachIconBg, { backgroundColor: '#3B82F6' }]}>
                <Text style={styles.optionEmoji}>📷</Text>
              </View>
              <Text style={styles.optionLabel}>Photo / Image</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.attachOption} onPress={() => onSelect('video')}>
              <View style={[styles.attachIconBg, { backgroundColor: '#EF4444' }]}>
                <Text style={styles.optionEmoji}>🎥</Text>
              </View>
              <Text style={styles.optionLabel}>Video Clip</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.attachOption} onPress={() => onSelect('document')}>
              <View style={[styles.attachIconBg, { backgroundColor: '#10B981' }]}>
                <Text style={styles.optionEmoji}>📄</Text>
              </View>
              <Text style={styles.optionLabel}>Document / PDF</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  attachOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  attachMenuCard: {
    backgroundColor: '#0A2D28',
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 230, 118, 0.3)',
  },
  attachMenuTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  attachGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
  },
  attachOption: {
    alignItems: 'center',
  },
  attachIconBg: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  optionEmoji: {
    fontSize: 24,
  },
  optionLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
