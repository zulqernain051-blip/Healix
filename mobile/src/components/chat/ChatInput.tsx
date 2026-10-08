import React, { useState } from 'react';
import { useVoiceRecorder, voiceFileInfo } from '../../hooks/useVoiceRecorder';
import { View, TextInput, TouchableOpacity, StyleSheet, Modal, Text } from 'react-native';
import { RADIUS, SPACING } from '../../theme';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

interface ChatInputProps {
  onSend: (text: string, mediaPreview?: any) => void | Promise<void>;
  disabled?: boolean;
  onTyping?: (isTyping: boolean) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled, onTyping }) => {
  const [inputText, setInputText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<any>(null);

  const { isRecording, recordingDuration, busy, startRecording, stopRecording } = useVoiceRecorder((uri, durationMs) => onSend('', { type: 'audio', uri, durationMs, ...voiceFileInfo() }));

  const handleTextChange = (text: string) => {
    setInputText(text);
    if (onTyping) {
      onTyping(text.length > 0);
    }
  };

  const [sending, setSending] = useState(false);
  const handleSend = async () => {
    const content = inputText.trim();
    if (sending || (!content && !mediaPreview)) return;
    
    if (onTyping) onTyping(false);
    setSending(true);
    try {
      await onSend(content, mediaPreview);
      setInputText('');
      setMediaPreview(null);
      setShowAttachMenu(false);
    } catch {
      // The screen reports the error; retain the draft for retry.
    } finally {
      setSending(false);
    }
  };

  const formatDuration = (ms: number) => {
    const secs = Math.floor(ms / 1000);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const pickImage = async (useCamera: boolean = false) => {
    setShowAttachMenu(false);
    try {
      const result = useCamera 
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setMediaPreview({
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'image',
          mimeType: asset.mimeType || (asset.type === 'video' ? 'video/mp4' : 'image/jpeg'),
          name: asset.fileName || `media-${Date.now()}.${asset.type === 'video' ? 'mp4' : 'jpg'}`,
        });
      }
    } catch (e) {
      console.log('Picker error', e);
    }
  };

  const pickDocument = async () => {
    setShowAttachMenu(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        copyToCacheDirectory: true
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setMediaPreview({
          uri: asset.uri,
          type: 'document',
          mimeType: asset.mimeType || 'application/pdf',
          name: asset.name || `doc-${Date.now()}.pdf`,
        });
      }
    } catch (e) {
      console.log('Document picker error', e);
    }
  };

  return (
    <View style={styles.inputContainer}>
      {mediaPreview && (
        <View style={styles.mediaPreviewBar}>
          <Text style={styles.mediaPreviewIcon}>
            {mediaPreview.type === 'image' ? '📸' : mediaPreview.type === 'video' ? '🎥' : '📄'}
          </Text>
          <Text style={styles.mediaPreviewText} numberOfLines={1}>Attached: {mediaPreview.name}</Text>
          <TouchableOpacity onPress={() => setMediaPreview(null)} style={styles.mediaPreviewClose}>
            <Text style={{ color: '#EF4444', fontWeight: '700' }}>X </Text>
          </TouchableOpacity>
        </View>
      )}

      {isRecording ? (
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.attachBtn} onPress={() => stopRecording(true)}>
            <Text style={{ color: '#EF4444', fontSize: 20 }}>🗑</Text>
          </TouchableOpacity>
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording  {formatDuration(recordingDuration)}</Text>
          </View>
          <TouchableOpacity style={styles.sendBtn} onPress={() => stopRecording(false)}>
            <Text style={styles.sendIcon}>■</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.attachBtn} onPress={() => setShowAttachMenu(true)} disabled={disabled || busy || sending}>
            <Text style={styles.attachIcon}>+</Text>
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            placeholder="Type a clinical note..."
            placeholderTextColor="#64748B"
            value={inputText}
            onChangeText={handleTextChange}
            multiline
            maxLength={500}
            editable={!disabled}
          />
          
          <TouchableOpacity 
            style={[styles.sendBtn, (!inputText.trim() && !mediaPreview) && { backgroundColor: '#1E2D4A' }]} 
            onPress={inputText.trim() || mediaPreview ? handleSend : startRecording}
            disabled={disabled || busy || sending}
          >
            <Text style={styles.sendIcon}>{(inputText.trim() || mediaPreview) ? '➤' : '🎤'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={showAttachMenu} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowAttachMenu(false)}>
          <View style={styles.attachMenu}>
            <Text style={styles.attachMenuTitle}>Secure Clinical Attachment</Text>
            
            <View style={styles.attachGrid}>
              <TouchableOpacity style={styles.attachOption} onPress={() => pickImage(true)}>
                <View style={[styles.attachOptionIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                  <Text style={styles.attachOptionIcon}>📷</Text>
                </View>
                <Text style={styles.attachOptionText}>Camera</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.attachOption} onPress={() => pickImage(false)}>
                <View style={[styles.attachOptionIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                  <Text style={styles.attachOptionIcon}>🖼️</Text>
                </View>
                <Text style={styles.attachOptionText}>Gallery</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.attachOption} onPress={() => pickImage(false)}>
                <View style={[styles.attachOptionIconBg, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                  <Text style={styles.attachOptionIcon}>🎥</Text>
                </View>
                <Text style={styles.attachOptionText}>Video</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.attachOption} onPress={() => pickDocument()}>
                <View style={[styles.attachOptionIconBg, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                  <Text style={styles.attachOptionIcon}>📄</Text>
                </View>
                <Text style={styles.attachOptionText}>Document</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: { backgroundColor: '#111D35', borderTopWidth: 1, borderTopColor: '#1E2D4A', padding: SPACING.md, paddingBottom: 30 },
  mediaPreviewBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E2D4A', padding: 8, borderRadius: RADIUS.md, marginBottom: SPACING.md },
  mediaPreviewIcon: { fontSize: 16, marginRight: 8 },
  mediaPreviewText: { color: '#F1F5F9', flex: 1, fontSize: 13, fontWeight: '500' },
  mediaPreviewClose: { padding: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end' },
  attachBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1E2D4A', alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm },
  attachIcon: { color: '#0D9488', fontSize: 24, fontWeight: '300', marginTop: -2 },
  textInput: { flex: 1, backgroundColor: '#1E2D4A', borderRadius: 20, minHeight: 40, maxHeight: 100, color: '#F1F5F9', paddingHorizontal: 16, paddingVertical: 10, fontSize: 15 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0D9488', alignItems: 'center', justifyContent: 'center', marginLeft: SPACING.sm },
  sendIcon: { color: '#FFF', fontSize: 16, marginLeft: 2 },
  recordingIndicator: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E2D4A', borderRadius: 20, height: 44 },
  recordingDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444', marginRight: 10 },
  recordingText: { color: '#F1F5F9', fontSize: 15, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  attachMenu: { backgroundColor: '#111D35', borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.lg, paddingBottom: 40 },
  attachMenuTitle: { color: '#F1F5F9', fontSize: 16, fontWeight: '700', marginBottom: SPACING.lg, textAlign: 'center' },
  attachGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  attachOption: { alignItems: 'center' },
  attachOptionIconBg: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  attachOptionIcon: { fontSize: 24 },
  attachOptionText: { color: '#94A3B8', fontSize: 12, fontWeight: '500' },
});
