import { Platform } from 'react-native';
import { apiClient } from '../api/client';
export async function uploadFile(endpoint: string, asset: { uri: string; name?: string; mimeType?: string }, fields: Record<string, string> = {}) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.append(key, value);
  const name = asset.name || 'photo.jpg';
  if (Platform.OS === 'web') form.append('file', await (await fetch(asset.uri)).blob(), name);
  else form.append('file', { uri: asset.uri, name, type: asset.mimeType || 'image/jpeg' } as any);
  return apiClient.post(endpoint, form);
}
export async function downloadPrivateFile(endpoint: string, filename: string) {
  const response = await apiClient.fetch(endpoint);
  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a'); link.href = url; link.download = filename;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } else {
    const { File, Paths } = await import('expo-file-system');
    const Sharing = await import('expo-sharing');
    if (!await Sharing.isAvailableAsync()) throw new Error('File sharing is unavailable on this device');
    const file = new File(Paths.cache, filename);
    file.write(new Uint8Array(await response.arrayBuffer()));
    try { await Sharing.shareAsync(file.uri); } finally { if (file.exists) file.delete(); }
  }
}
