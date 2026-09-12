import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { RADIUS, SPACING } from '../../../theme';
import { MediaPreview } from './types';
const Audio = { Sound: { createAsync: async () => ({ sound: null }) } } as any;

interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  mediaPreview: MediaPreview | null;
  setMediaPreview: (preview: MediaPreview | null) => void;
  onSend: () => void;
  onAttachPress: () => void;
  onSendAudio?: (uri: string, durationMs: number) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputText,
  setInputText,
  mediaPreview,
  setMediaPreview,
  onSend,
  onAttachPress,
  onSendAudio,
}) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setInterval(() => setRecordingDuration(prev => prev + 1000), 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(newRecording);
        setIsRecording(true);
        setRecordingDuration(0);
      } else {
        alert('Microphone permission is required to record a voice message.');
      }
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async (cancel: boolean = false) => {
    if (!recording) return;
    setIsRecording(false);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!cancel && uri && onSendAudio) {
        onSendAudio(uri, recordingDuration);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
    setRecording(null);
    setRecordingDuration(0);
  };

  const formatDuration = (ms: number) => {
    const secs = Math.floor(ms / 1000);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Media Preview Bar if ready to send */}
      {mediaPreview && (
        <View style={styles.previewBar}>
          <Text style={styles.previewIcon}>
            {mediaPreview.type === 'image' ? '📸' : mediaPreview.type === 'video' ? '🎥' : '📄'}
          </Text>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.previewTitle} numberOfLines={1}>{mediaPreview.name}</Text>
            <Text style={styles.previewSub}>Ready to attach</Text>
          </View>
          <TouchableOpacity onPress={() => setMediaPreview(null)}>
            <Text style={styles.previewCancel}>X </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Input Bar */}
      {isRecording ? (
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn} onPress={() => stopRecording(true)}>
            <Text style={{ color: '#EF4444', fontSize: 22 }}>🗑</Text>
          </TouchableOpacity>
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording {formatDuration(recordingDuration)}</Text>
          </View>
          <TouchableOpacity style={styles.sendBtn} onPress={() => stopRecording(false)}>
            <Text style={styles.sendIcon}>■</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn} onPress={onAttachPress}>
            <Text style={styles.attachIcon}>+</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor="#6B8E8A"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />

          <TouchableOpacity
            style={[styles.sendBtn, (!inputText.trim() && !mediaPreview) && styles.sendBtnDisabled]}
            onPress={inputText.trim() || mediaPreview ? onSend : startRecording}
          >
            <Text style={styles.sendIcon}>{(inputText.trim() || mediaPreview) ? '➤' : '🎤'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  previewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E3630',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 230, 118, 0.3)',
  },
  previewIcon: {
    fontSize: 20,
  },
  previewTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  previewSub: {
    color: '#00E676',
    fontSize: 11,
  },
  previewCancel: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 8,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: '#0A2D28',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 230, 118, 0.15)',
  },
  attachBtn: {
    padding: SPACING.sm,
  },
  attachIcon: {
    fontSize: 22,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#051815',
    color: '#FFFFFF',
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    fontSize: 14,
    maxHeight: 100,
    marginHorizontal: SPACING.xs,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00E676',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#6B8E8A',
  },
  sendIcon: {
    fontSize: 18,
    color: '#061C19',
    fontWeight: '900',
  },
  recordingIndicator: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#051815',
    borderRadius: RADIUS.round,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    marginHorizontal: SPACING.xs,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    marginRight: 10,
  },
  recordingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
