import { z } from 'zod';

export const sendAiMessageSchema = z.object({
  messageText: z.string().min(1, 'Message text is required'),
});

export const sendPeerMessageSchema = z.object({
  contentType: z.enum(['TEXT', 'IMAGE', 'FILE', 'VOICE', 'VIDEO', 'DOCUMENT', 'AUDIO', 'CALL', 'EMERGENCY_REQUEST']),
  contentUrlOrText: z.string().min(1, 'Content URL or text is required'),
  replyToId: z.string().uuid().optional()
});
