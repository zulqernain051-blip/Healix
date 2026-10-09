
import { useAppTheme, useThemeValue } from '../../../theme/ThemeProvider';
import type { ThemeColors } from '../../../theme';
import React from 'react';
import { useVoiceRecorder } from '../../../hooks/useVoiceRecorder';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { RADIUS, SPACING } from '../../../theme';
import { MediaPreview } from './types';

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
  const { colors: COLORS } = useAppTheme();
  const styles = useThemeValue(createStyles);

  const { isRecording, recordingDuration, busy, startRecording, stopRecording } = useVoiceRecorder(async (uri, durationMs) => { await onSendAudio?.(uri, durationMs); });

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
            <Text style={{ color: COLORS.red, fontSize: 22 }}>🗑</Text>
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
            placeholderTextColor={COLORS.textBody}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />

          <TouchableOpacity
            style={[styles.sendBtn, (!inputText.trim() && !mediaPreview) && styles.sendBtnDisabled]}
            disabled={busy || (!inputText.trim() && !mediaPreview && !onSendAudio)}
            onPress={inputText.trim() || mediaPreview ? onSend : startRecording}
          >
            <Text style={styles.sendIcon}>{(inputText.trim() || mediaPreview) ? '➤' : '🎤'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

const createStyles = (COLORS: ThemeColors) => (StyleSheet.create({
  previewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.emeraldLight,
  },
  previewIcon: {
    fontSize: 20,
  },
  previewTitle: {
    color: COLORS.textDark,
    fontSize: 13,
    fontWeight: '700',
  },
  previewSub: {
    color: COLORS.emerald,
    fontSize: 11,
  },
  previewCancel: {
    color: COLORS.red,
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 8,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: COLORS.emeraldLight,
  },
  attachBtn: {
    padding: SPACING.sm,
  },
  attachIcon: {
    fontSize: 22,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.bg,
    color: COLORS.textDark,
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
    backgroundColor: COLORS.emeraldFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.surfaceMuted,
  },
  sendIcon: {
    fontSize: 18,
    color: COLORS.onAccent,
    fontWeight: '900',
  },
  recordingIndicator: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.round,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    marginHorizontal: SPACING.xs,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.red,
    marginRight: 10,
  },
  recordingText: {
    color: COLORS.textDark,
    fontSize: 14,
    fontWeight: '600',
  },
}));
