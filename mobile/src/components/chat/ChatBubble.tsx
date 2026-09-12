import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MessageItem } from '../../api/messages.api';
import { COLORS, RADIUS, TYPOGRAPHY } from '../../theme';
import { API_URL } from '../../api/client';
const Audio = { Sound: { createAsync: async () => ({ sound: null }) } } as any;

interface ChatBubbleProps {
  message: MessageItem;
  isMe: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isMe }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(message.fileMetadata?.durationMs || 0);

  const resolvedMediaUrl = message.mediaUrl?.startsWith('/') 
    ? `${API_URL.replace('/api/v1', '')}${message.mediaUrl}` 
    : message.mediaUrl;

  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  const togglePlayback = async () => {
    if (!resolvedMediaUrl) return;

    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
        } else {
          if (position >= duration && duration > 0) {
            await sound.playFromPositionAsync(0);
          } else {
            await sound.playAsync();
          }
        }
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: resolvedMediaUrl },
          { shouldPlay: true },
          (status) => {
            if (status.isLoaded) {
              setPosition(status.positionMillis);
              if (status.durationMillis) setDuration(status.durationMillis);
              setIsPlaying(status.isPlaying);
              if (status.didJustFinish) {
                setIsPlaying(false);
                setPosition(status.durationMillis || 0);
              }
            }
          }
        );
        setSound(newSound);
      }
    } catch (err) {
      console.log('Error playing audio', err);
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.msgRow, isMe ? styles.msgRowRight : styles.msgRowLeft]}>
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
        {message.type === 'image' && resolvedMediaUrl && (
          <View style={styles.imageWrap}>
            <Image source={{ uri: resolvedMediaUrl }} style={styles.imageContent} resizeMode="cover" />
          </View>
        )}

        {message.type === 'audio' && resolvedMediaUrl && (
          <View style={styles.audioCard}>
            <TouchableOpacity style={styles.audioPlayBtn} onPress={togglePlayback}>
              <Text style={styles.audioPlayIcon}>{isPlaying ? '⏸' : '▶'}</Text>
            </TouchableOpacity>
            <View style={styles.audioTrack}>
              <View style={styles.audioProgressBg}>
                <View style={[styles.audioProgressFill, { width: duration > 0 ? `${(position / duration) * 100}%` : '0%' }]} />
              </View>
              <Text style={styles.audioTime}>
                {formatTime(position)} / {formatTime(duration)}
              </Text>
            </View>
          </View>
        )}

        {message.type === 'video' && (
          <View style={styles.videoCard}>
            <View style={styles.videoThumbnailPlaceholder}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
            <View style={styles.videoMeta}>
              <Text style={styles.videoName} numberOfLines={1}>{message.fileName || 'Clinical_Video.mp4'}</Text>
              <Text style={styles.videoSize}>{message.duration || '0:30'} • {message.fileSize || '3.5 MB'}</Text>
            </View>
          </View>
        )}

        {message.type === 'document' && (
          <View style={styles.docCard}>
            <View style={styles.docIconBg}>
              <Text style={styles.docIcon}>📄</Text>
            </View>
            <View style={styles.docMeta}>
              <Text style={styles.docName} numberOfLines={1}>{message.fileName}</Text>
              <Text style={styles.docSize}>{message.fileSize}</Text>
            </View>
          </View>
        )}

        {!!message.text && (
          <Text style={[styles.msgText, isMe ? styles.msgTextMe : styles.msgTextThem]}>
            {message.text}
          </Text>
        )}
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.timeText}>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        {isMe && (
          <Text style={[styles.statusIcon, message.status === 'read' && styles.statusRead]}>
            {message.status === 'sent' ? '✓' : '✓✓'}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  msgRow: { marginBottom: 16, maxWidth: '85%' },
  msgRowLeft: { alignSelf: 'flex-start' },
  msgRowRight: { alignSelf: 'flex-end' },
  bubble: { padding: 12, borderRadius: RADIUS.lg },
  bubbleThem: { backgroundColor: '#111D35', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#1E2D4A' },
  bubbleMe: { backgroundColor: '#0D9488', borderBottomRightRadius: 4 },
  msgText: { fontSize: 15, lineHeight: 22 },
  msgTextThem: { color: '#F1F5F9' },
  msgTextMe: { color: '#FFF' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, paddingHorizontal: 4 },
  timeText: { fontSize: 11, color: '#64748B' },
  statusIcon: { fontSize: 11, color: '#64748B', marginLeft: 4, fontWeight: '700' },
  statusRead: { color: '#10B981' },
  imageWrap: { borderRadius: RADIUS.md, overflow: 'hidden', marginBottom: 8, backgroundColor: '#1E2D4A', width: 220, height: 160 },
  imageContent: { width: '100%', height: '100%' },
  videoCard: { width: 240, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: RADIUS.md, overflow: 'hidden', marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  videoThumbnailPlaceholder: { height: 120, backgroundColor: '#1E2D4A', alignItems: 'center', justifyContent: 'center' },
  playIcon: { fontSize: 32, color: '#FFF', opacity: 0.8 },
  videoMeta: { padding: 8, backgroundColor: 'rgba(0,0,0,0.4)' },
  videoName: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  videoSize: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  docCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: RADIUS.md, marginBottom: 8, width: 220 },
  docIconBg: { width: 36, height: 36, borderRadius: RADIUS.sm, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  docIcon: { fontSize: 18 },
  docMeta: { flex: 1 },
  docName: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  docSize: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
  audioCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: RADIUS.md, marginBottom: 8, width: 220 },
  audioPlayBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0D9488', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  audioPlayIcon: { color: '#FFF', fontSize: 16, marginLeft: 2 },
  audioTrack: { flex: 1 },
  audioProgressBg: { height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, marginBottom: 6 },
  audioProgressFill: { height: '100%', backgroundColor: '#0D9488', borderRadius: 2 },
  audioTime: { color: '#FFF', fontSize: 10, fontWeight: '600' },
});
