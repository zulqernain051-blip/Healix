import { Request, Response } from 'express';
import { ChatService } from './chat.service';
import { sendAiMessageSchema, sendPeerMessageSchema } from './chat.validation';

export class ChatController {
  static async sendAiMessage(req: Request, res: Response): Promise<void> {
    try {
      const { patientId } = req.params;
      const valid = sendAiMessageSchema.parse(req.body);
      const msg = await ChatService.sendAiMessage(patientId, valid.messageText);
      res.status(200).json({ success: true, data: msg });
    } catch (e: any) {
      res.status(e.statusCode || 500).json({ success: false, message: e.message || 'Failed to send AI message' });
    }
  }

  static async getAiChatHistory(req: Request, res: Response): Promise<void> {
    try {
      const { patientId } = req.params;
      const history = await ChatService.getAiChatHistory(patientId);
      res.status(200).json({ success: true, data: history });
    } catch (e: any) {
      res.status(e.statusCode || 500).json({ success: false, message: e.message || 'Failed to fetch AI chat history' });
    }
  }

  static async sendPeerMessage(req: Request, res: Response): Promise<void> {
    try {
      const { threadId } = req.params;
      const valid = sendPeerMessageSchema.parse(req.body);
      const senderId = (req as any).user.id;
      const msg = await ChatService.sendPeerMessage(threadId, senderId, valid.contentType, valid.contentUrlOrText, valid.replyToId);
      res.status(201).json({ success: true, data: msg });
    } catch (e: any) {
      res.status(e.statusCode || 500).json({ success: false, message: e.message || 'Failed to send message' });
    }
  }

  static async sendMediaMessage(req: Request, res: Response): Promise<void> {
    try {
      const { threadId } = req.params;
      const senderId = (req as any).user.id;
      
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
      }

      const file = req.file;
      let contentType = 'FILE';
      if (file.mimetype.startsWith('image/')) contentType = 'IMAGE';
      else if (file.mimetype.startsWith('video/')) contentType = 'VIDEO';
      else if (file.mimetype.startsWith('audio/')) contentType = 'AUDIO';
      else if (file.mimetype === 'application/pdf') contentType = 'DOCUMENT';
      else if (file.mimetype.includes('document')) contentType = 'DOCUMENT';
      
      const fileUrl = `/uploads/chat/${file.filename}`;
      const fileMetadata: any = {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      };

      if (req.body.durationMs) {
        fileMetadata.durationMs = parseInt(req.body.durationMs, 10);
      }

      const msg = await ChatService.sendPeerMessage(threadId, senderId, contentType, fileUrl, req.body.replyToId, fileMetadata);
      res.status(201).json({ success: true, data: msg });
    } catch (e: any) {
      res.status(e.statusCode || 500).json({ success: false, message: e.message || 'Failed to send media message' });
    }
  }

  static async getUserConversations(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const threads = await ChatService.getUserConversations(userId);
      res.status(200).json({ success: true, data: threads });
    } catch (e: any) {
      res.status(e.statusCode || 500).json({ success: false, message: e.message || 'Failed to fetch conversations' });
    }
  }

  static async getOrCreateThread(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { participantId } = req.body;
      if (!participantId) {
        res.status(400).json({ success: false, message: 'participantId is required' });
        return;
      }
      const thread = await ChatService.getOrCreateThread(userId, participantId);
      res.status(200).json({ success: true, data: thread });
    } catch (e: any) {
      res.status(e.statusCode || 500).json({ success: false, message: e.message || 'Failed to create or fetch thread' });
    }
  }

  static async getThreadMessages(req: Request, res: Response): Promise<void> {
    try {
      const { threadId } = req.params;
      const userId = (req as any).user.id;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 30;
      const msgs = await ChatService.getThreadMessages(threadId, userId, page, limit);
      res.status(200).json({ success: true, data: msgs });
    } catch (e: any) {
      res.status(e.statusCode || 500).json({ success: false, message: e.message || 'Failed to fetch thread messages' });
    }
  }

  static async markMessagesAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { threadId } = req.params;
      const userId = (req as any).user.id;
      const result = await ChatService.markMessagesAsRead(threadId, userId);
      res.status(200).json({ success: true, data: result });
    } catch (e: any) {
      res.status(e.statusCode || 500).json({ success: false, message: e.message || 'Failed to mark messages as read' });
    }
  }

  static async toggleThreadFollowUp(req: Request, res: Response): Promise<void> {
    try {
      const { threadId } = req.params;
      const { doctorFollowUp } = req.body;
      const updated = await ChatService.toggleThreadFollowUp(threadId, !!doctorFollowUp);
      res.status(200).json({ success: true, data: updated });
    } catch (e: any) {
      res.status(e.statusCode || 500).json({ success: false, message: e.message || 'Failed to toggle follow-up status' });
    }
  }

  static async getConsolidatedHistory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const history = await ChatService.getConsolidatedHistory(id, (req as any).user);
      res.status(200).json({ success: true, data: history });
    } catch (e: any) {
      res.status(e.statusCode || 500).json({ success: false, message: e.message || 'Failed to fetch consolidated history' });
    }
  }

}
