import { Router } from 'express';
import { protect } from '../../../common/middleware/authMiddleware';
import { ChatController } from './chat.controller';

const router = Router();

router.use(protect);

// AI Symptom Chat Assistant
router.post('/chat/ai/:patientId/messages', ChatController.sendAiMessage);
router.get('/chat/ai/:patientId/messages', ChatController.getAiChatHistory);

// Secure Peer Threads
router.get('/chat/threads', ChatController.getUserConversations);
router.post('/chat/threads', ChatController.getOrCreateThread);
router.post('/chat/threads/:threadId/messages', ChatController.sendPeerMessage);

import { chatUploadMiddleware } from './chat.upload';
router.post(
  '/chat/threads/:threadId/messages/media', 
  chatUploadMiddleware.single('file'), 
  ChatController.sendMediaMessage
);

router.get('/chat/threads/:threadId/messages', ChatController.getThreadMessages);
router.put('/chat/threads/:threadId/messages/read', ChatController.markMessagesAsRead);
router.put('/chat/threads/:threadId/follow-up', ChatController.toggleThreadFollowUp);

// Consolidated Patient Chat History
router.get('/patients/:id/communication-history', ChatController.getConsolidatedHistory);

export default router;
