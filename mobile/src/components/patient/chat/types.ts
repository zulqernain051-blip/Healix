export interface MessageItem {
  id: string;
  from: 'me' | 'them';
  text?: string;
  type?: 'text' | 'image' | 'video' | 'document';
  mediaUrl?: string;
  fileName?: string;
  fileSize?: string;
  duration?: string;
  time: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface MediaPreview {
  type: 'image' | 'video' | 'document';
  name: string;
  url?: string;
  size?: string;
}
