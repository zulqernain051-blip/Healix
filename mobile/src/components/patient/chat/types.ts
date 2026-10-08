export interface MessageItem {
  id: string;
  from: 'me' | 'them';
  text?: string;
  type?: 'text' | 'image' | 'video' | 'document' | 'audio';
  mediaUrl?: string;
  fileName?: string;
  fileSize?: string;
  duration?: string;
  time: string;
  createdAt?: string;
  status: 'sent' | 'delivered' | 'read';
  fileMetadata?: any;
}

export interface MediaPreview {
  type: 'image' | 'video' | 'document';
  name: string;
  url?: string;
  uri?: string;
  mimeType?: string;
  size?: string;
}
