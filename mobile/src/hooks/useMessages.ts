import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesApi, ChatMessage } from '../api/messages.api';
import { getSocket, initSocket } from '../services/socket';
import { useAuthStore } from '../store/auth';

export function useConversations() {
  return useQuery({
    queryKey: ['messages', 'conversations'],
    queryFn: () => messagesApi.getConversations(),
  });
}

export function useChatHistory(threadId: string, page: number = 1) {
  return useQuery({
    queryKey: ['messages', 'history', threadId, page],
    queryFn: () => messagesApi.getMessagesUrl(threadId, page),
    enabled: !!threadId,
  });
}

export function useChatSocket(threadId: string) {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!accessToken || !threadId) return;
    const socket = initSocket(accessToken);

    socket.emit('join_thread', { threadId });

    const handleNewMessage = (msg: ChatMessage) => {
      if (msg.threadId !== threadId) return;
      queryClient.setQueryData(['messages', 'history', threadId, 1], (old: any) => {
        if (!old?.messages || old.messages.some((m: ChatMessage) => m.id === msg.id)) return old;
        return { ...old, messages: [msg, ...old.messages], total: old.total + 1 };
      });
      void queryClient.invalidateQueries({ queryKey: ['messages', 'conversations'] });
      const { user } = useAuthStore.getState();
      if (user && msg.senderId !== user.id) socket.emit('message_delivered', { threadId, messageId: msg.id });
    };
    const handleDelivered = (data: { threadId: string; messageId: string }) => {
      if (data.threadId !== threadId) return;
      queryClient.setQueryData(['messages', 'history', threadId, 1], (old: any) => old?.messages ? {
        ...old, messages: old.messages.map((m: ChatMessage) => m.id === data.messageId && m.status !== 'READ' ? { ...m, status: 'DELIVERED' } : m),
      } : old);
    };
    const handleRead = (data: { threadId: string }) => {
      if (data.threadId !== threadId) return;
      void queryClient.invalidateQueries({ queryKey: ['messages', 'history', threadId] });
      void queryClient.invalidateQueries({ queryKey: ['messages', 'conversations'] });
    };
    const handleTypingStart = (data: { threadId: string; userId: string }) => {
      if (data.threadId === threadId) setTypingUsers(prev => prev.includes(data.userId) ? prev : [...prev, data.userId]);
    };
    const handleTypingStop = (data: { threadId: string; userId: string }) => {
      if (data.threadId === threadId) setTypingUsers(prev => prev.filter(id => id !== data.userId));
    };
    const handleReconnect = () => {
      setTypingUsers([]);
      socket.emit('join_thread', { threadId });
      void queryClient.invalidateQueries({ queryKey: ['messages', 'history', threadId] });
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_delivered', handleDelivered);
    socket.on('message_read', handleRead);
    socket.on('user_typing', handleTypingStart);
    socket.on('user_stopped_typing', handleTypingStop);
    socket.on('connect', handleReconnect);

    return () => {
      socket.emit('leave_thread', { threadId });
      socket.off('new_message', handleNewMessage);
      socket.off('message_delivered', handleDelivered);
      socket.off('message_read', handleRead);
      socket.off('user_typing', handleTypingStart);
      socket.off('user_stopped_typing', handleTypingStop);
      socket.off('connect', handleReconnect);

    };
  }, [threadId, accessToken, queryClient]);

  const sendTypingEvent = (isTyping: boolean) => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit(isTyping ? 'typing_start' : 'typing_stop', { threadId });
    }
  };

  return { typingUsers, sendTypingEvent };
}

export function useGetOrCreateThread() {
  return useMutation({
    mutationFn: (participantId: string) => messagesApi.getOrCreateThread(participantId),
  });
}

export function useSearchUserByPhone() {
  return useMutation({
    mutationFn: (phone: string) => messagesApi.searchUserByPhone(phone),
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof messagesApi.sendMessage>[0]) =>
      messagesApi.sendMessage(data),
    onSuccess: (newMessage, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', 'history', variables.threadId, 1] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'conversations'] });
    },
  });
}

export function useSendMediaMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { threadId: string; uri: string; mimeType: string; filename: string; replyToId?: string; durationMs?: number }) =>
      messagesApi.sendMediaMessage(data.threadId, data.uri, data.mimeType, data.filename, data.replyToId, data.durationMs),
    onSuccess: (newMessage, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', 'history', variables.threadId, 1] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'conversations'] });
    },
  });
}

export function useMarkMessagesAsRead(threadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => messagesApi.markAsRead(threadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', 'conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'history', threadId] });
    },
  });
}
