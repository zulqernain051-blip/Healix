import { Server as SocketIOServer, Socket } from 'socket.io';
import * as http from 'http';
import jwt from 'jsonwebtoken';
import { ChatRepository } from './chat.repository';

export class ChatSocketService {
  private static io: SocketIOServer;

  static getIo() { return this.io; }

  static initialize(server: http.Server) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: '*', // Based on existing Express setup
        methods: ['GET', 'POST']
      }
    });

    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth?.token;
        if (!token) {
          return next(new Error('Authentication error: Missing token'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
        if (!decoded || !decoded.id) {
          return next(new Error('Authentication error: Invalid token payload'));
        }

        (socket as any).userId = decoded.id;
        next();
      } catch (err) {
        return next(new Error('Authentication error: Token verification failed'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      const userId = (socket as any).userId;
      
      // Automatically join a personal room for private signaling (like incoming calls)
      socket.join(`user:${userId}`);

      socket.on('join_thread', async (data: { threadId: string }) => {
        try {
          if (!data || !data.threadId) return;
          const thread = await ChatRepository.findChatThread(data.threadId);
          if (!thread) return;

          if (thread.participantAId !== userId && thread.participantBId !== userId) {
            socket.emit('error', { message: 'Unauthorized to join thread' });
            return;
          }

          socket.join(`chat:${data.threadId}`);
        } catch (e) {
          console.error('Socket join_thread error:', e);
        }
      });

      socket.on('leave_thread', (data: { threadId: string }) => {
        if (data && data.threadId) {
          socket.leave(`chat:${data.threadId}`);
        }
      });

      socket.on('typing_start', (data: { threadId: string }) => {
        if (data && data.threadId) {
          socket.to(`chat:${data.threadId}`).emit('user_typing', { threadId: data.threadId, userId });
        }
      });

      socket.on('typing_stop', (data: { threadId: string }) => {
        if (data && data.threadId) {
          socket.to(`chat:${data.threadId}`).emit('user_stopped_typing', { threadId: data.threadId, userId });
        }
      });

      socket.on('message_delivered', async (data: { threadId: string, messageId: string }) => {
        try {
          if (!data || !data.threadId || !data.messageId) return;
          
          // Implementation of DB status update will be in ChatRepository
          const updated = await ChatRepository.markMessageDelivered(data.messageId, userId);
          if (updated) {
            this.io.to(`chat:${data.threadId}`).emit('message_delivered', { 
              threadId: data.threadId, 
              messageId: data.messageId, 
              userId 
            });
          }
        } catch (e) {
          console.error('Socket message_delivered error:', e);
        }
      });

    });
  }

  static publishNewMessage(threadId: string, message: any) {
    if (!this.io) return;
    this.io.to(`chat:${threadId}`).emit('new_message', message);
  }

  static publishMessageRead(threadId: string, readerUserId: string) {
    if (!this.io) return;
    this.io.to(`chat:${threadId}`).emit('message_read', { threadId, userId: readerUserId });
  }
}
