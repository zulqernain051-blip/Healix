import { useEffect, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
export function useVoiceRecorder(onRecorded: (uri: string, durationMs: number) => void | Promise<void>) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const state = useAudioRecorderState(recorder);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  useEffect(() => () => { void setAudioModeAsync({ allowsRecording: false }).catch(() => {}); }, []);
  const startRecording = async () => {
    if (pending.current || state.isRecording) return;
    pending.current = true; setBusy(true);
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) throw new Error('Allow microphone access to record a voice message.');
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (err) {
      Alert.alert('Recording unavailable', err instanceof Error ? err.message : 'Could not start recording.');
    } finally { pending.current = false; setBusy(false); }
  };
  const stopRecording = async (cancel = false) => {
    if (pending.current) return;
    pending.current = true; setBusy(true);
    try {
      const duration = recorder.getStatus().durationMillis;
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false });
      if (!cancel && recorder.uri) await onRecorded(recorder.uri, duration);
    } catch (err) {
      Alert.alert('Voice message failed', err instanceof Error ? err.message : 'Could not finish recording.');
    } finally { pending.current = false; setBusy(false); }
  };
  return { isRecording: state.isRecording, recordingDuration: state.durationMillis, busy, startRecording, stopRecording };
}
export const voiceFileInfo = () => Platform.OS === 'web'
  ? { mimeType: 'audio/webm', name: 'voice-' + Date.now() + '.webm' }
  : { mimeType: 'audio/mp4', name: 'voice-' + Date.now() + '.m4a' };
