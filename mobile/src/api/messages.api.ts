import { apiClient } from './client';

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  contentType: string;
  contentUrlOrText: string;
  status: string;
  sentAt: string;
  readAt?: string;
  sender: {
    id: string;
    fullName: string;
    role: string;
  };
}

export interface ThreadConversation {
  threadId: string;
  type: string;
  readOnly: boolean;
  updatedAt: string;
  unreadCount: number;
  otherParticipant: {
    id: string;
    name: string;
    role: string;
  };
  latestMessage?: ChatMessage;
}

export interface PaginatedMessages {
  messages: ChatMessage[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export const messagesApi = {
  getAiChatHistory: (patientId: string) => apiClient.get<any>(`/chat/ai/${patientId}/messages`),
  sendAiMessage: (patientId: string, messageText: string) => apiClient.post<any>(`/chat/ai/${patientId}/messages`, { messageText }),
  getConversations: () => 
    apiClient.get<ThreadConversation[]>(`/chat/threads`),

  getOrCreateThread: (participantId: string) => 
    apiClient.post<any>(`/chat/threads`, { participantId }),
  
  getMessagesUrl: (threadId: string, page: number = 1, limit: number = 30) => 
    apiClient.get<PaginatedMessages>(`/chat/threads/${threadId}/messages?page=${page}&limit=${limit}`),

  sendMessage: async (data: { threadId: string; contentType: 'TEXT' | 'IMAGE' | 'FILE' | 'VIDEO' | 'DOCUMENT'; contentUrlOrText: string; replyToId?: string }): Promise<ChatMessage> => {
    const response = await apiClient.post(`/chat/threads/${data.threadId}/messages`, data);
    return response.data.data;
  },

  sendMediaMessage: async (threadId: string, uri: string, mimeType: string, filename: string, replyToId?: string, durationMs?: number): Promise<ChatMessage> => {
    const formData = new FormData();
    formData.append('file', {
      uri,
      name: filename,
      type: mimeType
    } as any);

    if (replyToId) {
      formData.append('replyToId', replyToId);
    }
    
    if (durationMs !== undefined) {
      formData.append('durationMs', durationMs.toString());
    }

    const response = await apiClient.post(`/chat/threads/${threadId}/messages/media`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  markAsRead: async (threadId: string): Promise<void> => {
    await apiClient.put<{ updatedCount: number }>(`/chat/threads/${threadId}/messages/read`, {});
  },
};
