import React, { forwardRef } from 'react';
import { View, ScrollView, Image, StyleSheet, Text } from 'react-native';
import { RADIUS, SPACING } from '../../../theme';
import { MessageItem } from './types';

interface MessageListProps {
  messages: MessageItem[];
}

import { API_URL } from '../../../api/client';
import { Audio } from 'expo-av';

const PatientAudioBubble = ({ uri, isMe, durationMs }: { uri: string; isMe: boolean; durationMs?: number }) => {
  const [sound, setSound] = React.useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [position, setPosition] = React.useState(0);
  const [duration, setDuration] = React.useState(durationMs || 0);

  React.useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  const togglePlayback = async () => {
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
          { uri },
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
    <View style={styles.audioCard}>
      <TouchableOpacity style={[styles.audioPlayBtn, isMe && { backgroundColor: '#051815' }]} onPress={togglePlayback}>
        <Text style={[styles.audioPlayIcon, isMe && { color: '#00E676' }]}>{isPlaying ? '⏸' : '▶'}</Text>
      </TouchableOpacity>
      <View style={styles.audioTrack}>
        <View style={styles.audioProgressBg}>
          <View style={[styles.audioProgressFill, { width: duration > 0 ? `${(position / duration) * 100}%` : '0%' }, isMe && { backgroundColor: '#051815' }]} />
        </View>
        <Text style={[styles.audioTime, isMe && { color: '#051815' }]}>
          {formatTime(position)} / {formatTime(duration)}
        </Text>
      </View>
    </View>
  );
};

export const MessageList = forwardRef<ScrollView, MessageListProps>(({ messages }, ref) => {
  return (
    <ScrollView
      ref={ref}
      style={styles.messagesList}
      contentContainerStyle={styles.messagesContent}
      showsVerticalScrollIndicator={false}
    >
      {messages.map((msg) => {
        const isMe = msg.from === 'me';
        const resolvedMediaUrl = msg.mediaUrl?.startsWith('/') 
          ? `${API_URL.replace('/api/v1', '')}${msg.mediaUrl}` 
          : msg.mediaUrl;

        return (
          <View
            key={msg.id}
            style={[styles.msgRow, isMe ? styles.msgRowRight : styles.msgRowLeft]}
          >
            <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
              {/* IMAGE ATTACHMENT */}
              {msg.type === 'image' && resolvedMediaUrl && (
                <View style={styles.imageWrap}>
                  <Image source={{ uri: resolvedMediaUrl }} style={styles.imageContent} resizeMode="cover" />
                </View>
              )}

              {/* AUDIO ATTACHMENT */}
              {msg.type === 'audio' && resolvedMediaUrl && (
                <PatientAudioBubble uri={resolvedMediaUrl} isMe={isMe} durationMs={(msg as any).fileMetadata?.durationMs || 0} />
              )}

              {/* VIDEO ATTACHMENT */}
              {msg.type === 'video' && (
                <View style={styles.videoCard}>
                  <View style={styles.videoThumbnailPlaceholder}>
                    <Text style={styles.playIcon}>▶</Text>
                  </View>
                  <View style={styles.videoMeta}>
                    <Text style={styles.videoName} numberOfLines={1}>{msg.fileName || 'Clinical_Video.mp4'}</Text>
                    <Text style={styles.videoSize}>{msg.duration || '0:45'} · {msg.fileSize || '3.5 MB'}</Text>
                  </View>
                </View>
              )}

              {/* DOCUMENT ATTACHMENT */}
              {msg.type === 'document' && (
                <View style={styles.docCard}>
                  <View style={styles.docIconBg}>
                    <Text style={{ fontSize: 20 }}>📄</Text>
                  </View>
                  <View style={styles.docMeta}>
                    <Text style={styles.docName} numberOfLines={1}>{msg.fileName || 'Report.pdf'}</Text>
                    <Text style={styles.docSize}>{msg.fileSize || '1.2 MB'} · PDF Document</Text>
                  </View>
                </View>
              )}

              {/* TEXT CONTENT */}
              {msg.text && (
                <Text style={[styles.msgText, isMe ? styles.msgTextMe : styles.msgTextThem]}>
                  {msg.text}
                </Text>
              )}

              {/* TIMESTAMP & TICKS */}
              <View style={styles.timeRow}>
                <Text style={[styles.msgTime, isMe ? { color: 'rgba(255,255,255,0.6)' } : { color: '#6B8E8A' }]}>
                  {msg.time}
                </Text>
                {isMe && (
                  <Text style={[styles.ticks, msg.status === 'read' && { color: '#061C19' }]}>
                    {msg.status === 'sent' ? ' ✓' : ' ✓✓'}
                  </Text>
                )}
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: SPACING.md,
    paddingBottom: 20,
    gap: SPACING.md,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  msgRowLeft: {
    justifyContent: 'flex-start',
  },
  msgRowRight: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  bubbleThem: {
    backgroundColor: '#0A2D28',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
    borderTopLeftRadius: 4,
  },
  bubbleMe: {
    backgroundColor: '#00E676',
    borderTopRightRadius: 4,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 19,
  },
  msgTextThem: {
    color: '#FFFFFF',
  },
  msgTextMe: {
    color: '#061C19',
    fontWeight: '500',
  },
  imageWrap: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginBottom: 6,
  },
  imageContent: {
    width: 220,
    height: 140,
  },
  videoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: RADIUS.md,
    padding: 8,
    marginBottom: 6,
  },
  videoThumbnailPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 2,
  },
  videoMeta: {
    marginLeft: 10,
    flex: 1,
  },
  videoName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  videoSize: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: RADIUS.md,
    padding: 8,
    marginBottom: 6,
  },
  docIconBg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  docMeta: {
    marginLeft: 10,
    flex: 1,
  },
  docName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  docSize: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  audioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: RADIUS.md,
    padding: 8,
    marginBottom: 6,
    width: 220,
  },
  audioPlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  audioPlayIcon: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 2,
  },
  audioTrack: {
    flex: 1,
  },
  audioProgressBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginBottom: 6,
  },
  audioProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  audioTime: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  msgTime: {
    fontSize: 10,
  },
  ticks: {
    fontSize: 10,
    color: '#061C19',
    fontWeight: '800',
  },
});
