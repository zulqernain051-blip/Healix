import { Alert } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
export function useVoicePlayback(uri?: string, durationMs = 0) {
  const player = useAudioPlayer(uri || null);
  const status = useAudioPlayerStatus(player);
  const togglePlayback = async () => {
    if (!uri) return;
    try {
      if (status.playing) player.pause();
      else {
        if (status.didJustFinish || (status.duration > 0 && status.currentTime >= status.duration)) await player.seekTo(0);
        player.play();
      }
    } catch (err) { Alert.alert('Playback unavailable', err instanceof Error ? err.message : 'Could not play this message.'); }
  };
  return { isPlaying: status.playing, position: status.currentTime * 1000, duration: status.duration * 1000 || durationMs, togglePlayback };
}
