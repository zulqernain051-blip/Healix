import { Server as SocketIOServer, Socket } from 'socket.io';
import * as http from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../../../common/config';
import { ChatRepository } from './chat.repository';
import { AuthRepository } from '../../identity/auth/auth.repository';

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

    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth?.token;
        if (!token) {
          return next(new Error('Authentication error: Missing token'));
        }

        const decoded = jwt.verify(token, config.JWT_SECRET) as any;
        if (!decoded || !decoded.id || typeof decoded.sid !== 'string') {
          return next(new Error('Authentication error: Invalid token payload'));
        }

        const user = await AuthRepository.findUserById(decoded.id);
        if (!user || user.deletedAt || user.status !== 'ACTIVE' || (user.emailVerificationRequired && !user.emailVerifiedAt)) return next(new Error('Authentication error: Account is not active'));
        if (!await AuthRepository.findActiveSession(decoded.sid, user.id)) return next(new Error('Authentication error: Session has ended'));
        (socket as any).userId = user.id;
        (socket as any).role = user.role;
        next();
      } catch (err) {
        return next(new Error('Authentication error: Token verification failed'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      const userId = (socket as any).userId;
      const validateSession = async () => {
        const decoded = jwt.verify(socket.handshake.auth.token, config.JWT_SECRET) as any;
        const user = await AuthRepository.findUserById(userId);
        if (!user || user.deletedAt || user.status !== 'ACTIVE' || (user.emailVerificationRequired && !user.emailVerifiedAt) || !await AuthRepository.findActiveSession(decoded.sid, userId)) throw new Error('Session has ended');
      };
      socket.use((_packet, next) => {
        void validateSession().then(() => next()).catch(() => { socket.disconnect(true); next(new Error('Authentication required')); });
      });
      // Recheck idle connections as well, so revoked sessions stop receiving pushes.
      const sessionCheck = setInterval(() => { void validateSession().catch(() => socket.disconnect(true)); }, 15000);
      sessionCheck.unref();
      socket.once('disconnect', () => clearInterval(sessionCheck));
      
      // Automatically join a personal room for private signaling (like incoming calls)
      socket.join(`user:${userId}`);
      if ((socket as any).role === 'ADMIN') socket.join('role:ADMIN');

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
        if (data && data.threadId && socket.rooms.has(`chat:${data.threadId}`)) {
          socket.to(`chat:${data.threadId}`).emit('user_typing', { threadId: data.threadId, userId });
        }
      });

      socket.on('typing_stop', (data: { threadId: string }) => {
        if (data && data.threadId && socket.rooms.has(`chat:${data.threadId}`)) {
          socket.to(`chat:${data.threadId}`).emit('user_stopped_typing', { threadId: data.threadId, userId });
        }
      });

      socket.on('message_delivered', async (data: { threadId: string, messageId: string }) => {
        try {
          if (!data || !data.threadId || !data.messageId) return;
          
          // Implementation of DB status update will be in ChatRepository
          const updated = await ChatRepository.markMessageDelivered(data.messageId, userId, data.threadId);
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
