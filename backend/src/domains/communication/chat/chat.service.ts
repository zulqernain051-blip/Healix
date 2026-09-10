import { AppError } from '../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../common/constants/index';
import { ChatRepository } from './chat.repository';
import { NotificationService } from '../notification/notification.service';

export class ChatService {
  static async sendAiMessage(patientId: string, messageText: string) {
    const textLower = messageText.toLowerCase();
    
    // Symptom deterioration keywords
    const severeKeywords = [
      'chest pain', 'unconscious', 'heavy bleeding', 
      'choking', 'severe shortness of breath', 
      'difficulty breathing', 'loss of consciousness'
    ];

    const isSevere = severeKeywords.some(kw => textLower.includes(kw));

    // Save patient message
    await ChatRepository.createAiChatMessage(patientId, 'PATIENT', messageText, isSevere);

    if (isSevere) {
      // Create emergency event
      await ChatRepository.createEmergencyEvent(patientId, null, 'CHAT', 'CRITICAL');

      // Dispatch E2E emergency notification
      await NotificationService.dispatchNotification({
        userId: await this.getPatientUserId(patientId),
        category: 'EMERGENCY',
        title: '🚨 Acute Deterioration Alert',
        body: 'Critical symptom language detected in AI Chat. Patient needs immediate help.',
        channel: 'PUSH' // Service will automatically duplicate to SMS for EMERGENCY category
      });

      const replyText = 'URGENT ALARM: Acute deterioration detected. Emergency pipeline activated. Please seek immediate professional medical care.';
      
      // Save AI response
      const aiMsg = await ChatRepository.createAiChatMessage(patientId, 'AI', replyText, true);
      return aiMsg;
    }

    // Ground RAG symptom database entries
    const words = textLower.split(/\s+/).filter(w => w.length > 3);
    let matchedEntry = null;

    if (words.length > 0) {
      // Find matching knowledge base entry
      const entries = await ChatRepository.searchClinicalKnowledge(words);
      if (entries.length > 0) {
        matchedEntry = entries[0];
      }
    }

    let replyText = '';
    if (matchedEntry) {
      replyText = `Based on clinical references for ${matchedEntry.topic}: ${matchedEntry.content}`;
    } else {
      replyText = "I'm here to help with general health education. Could you describe your symptoms in more detail?";
    }

    // Append standard clinical warning disclaimer
    replyText += '\n\nDisclaimer: This is general guidance. Consult a doctor or nurse for diagnosis.';

    // Save AI response
    const aiMsg = await ChatRepository.createAiChatMessage(patientId, 'AI', replyText, false);
    return aiMsg;
  }

  static async getAiChatHistory(patientId: string) {
    return ChatRepository.findAiChatHistory(patientId);
  }

  private static assertThreadParticipant(thread: any, userId: string) {
    if (thread.participantAId !== userId && thread.participantBId !== userId) {
      throw new AppError('Unauthorized access to this conversation', HTTP_STATUS.FORBIDDEN);
    }
  }

  static async sendPeerMessage(
    threadId: string, 
    senderId: string, 
    contentType: string, 
    contentUrlOrText: string, 
    replyToId?: string,
    fileMetadata?: any
  ) {
    const thread = await ChatRepository.findChatThread(threadId);
    if (!thread) throw new AppError('Thread not found', HTTP_STATUS.NOT_FOUND);

    this.assertThreadParticipant(thread, senderId);

    if (thread.type === 'PATIENT_NURSE') {
      const patientUser = await ChatRepository.findPatientUser([thread.participantAId, thread.participantBId]);
      const nurseUser = await ChatRepository.findNurseUser([thread.participantAId, thread.participantBId]);

      if (patientUser?.patient && nurseUser?.nurse) {
        const contract = await ChatRepository.findActiveOrRecentContract(patientUser.patient.id, nurseUser.nurse.id);
        const visit = await ChatRepository.findActiveOrRecentVisit(patientUser.patient.id, nurseUser.nurse.id);

        if (!contract && !visit) {
          throw new AppError('Thread is read-only. Visit completed more than 7 days ago.', HTTP_STATUS.BAD_REQUEST);
        }
      }
    } else if (thread.type === 'PATIENT_DOCTOR') {
      const patientUser = await ChatRepository.findPatientUser([thread.participantAId, thread.participantBId]);
      const doctorUser = await ChatRepository.findDoctorUser([thread.participantAId, thread.participantBId]);

      if (patientUser && doctorUser) {
        const caseRecord = await ChatRepository.findActiveCaseOrPlan(patientUser.id, doctorUser.id);
        if (!caseRecord) {
          throw new AppError('No active care plan or assignment exists for this doctor.', HTTP_STATUS.BAD_REQUEST);
        }
      }
    }

    const message = await ChatRepository.createChatMessage(threadId, senderId, contentType, contentUrlOrText, replyToId, fileMetadata);
    
    // Publish via Socket.IO
    const { ChatSocketService } = require('./chat.socket');
    ChatSocketService.publishNewMessage(threadId, message);

    return message;
  }

  static async getUserConversations(userId: string) {
    const threads = await ChatRepository.findThreadsForUser(userId);
    return threads.map(t => {
      const otherParticipant = t.participantAId === userId ? t.participantB : t.participantA;
      return {
        threadId: t.id,
        type: t.type,
        readOnly: t.readOnly,
        doctorFollowUp: t.doctorFollowUp,
        caseAssignmentId: t.caseAssignmentId,
        updatedAt: t.updatedAt,
        unreadCount: t._count.messages,
        otherParticipant: {
          id: otherParticipant.id,
          name: otherParticipant.fullName,
          role: otherParticipant.role,
        },
        latestMessage: t.messages.length > 0 ? t.messages[0] : null,
      };
    });
  }

  static async getOrCreateThread(userId: string, participantId: string) {
    if (userId === participantId) throw new AppError('Cannot create a thread with yourself', HTTP_STATUS.BAD_REQUEST);

    // See if thread already exists
    const existing = await ChatRepository.findChatThreadBetweenParticipants(userId, participantId);
    if (existing) return existing;

    const user1 = await ChatRepository.findUserById(userId);
    const user2 = await ChatRepository.findUserById(participantId);

    if (!user1 || !user2) throw new AppError('Participant not found', HTTP_STATUS.NOT_FOUND);

    const roles = new Set([user1.role, user2.role]);
    let type = '';
    let caseAssignmentId = undefined;

    if (roles.has('PATIENT') && roles.has('NURSE')) {
      type = 'PATIENT_NURSE';
      const patientId = user1.role === 'PATIENT' ? user1.patient?.id : user2.patient?.id;
      const nurseId = user1.role === 'NURSE' ? user1.nurse?.id : user2.nurse?.id;
      if (!patientId || !nurseId) throw new AppError('Invalid patient/nurse record', HTTP_STATUS.BAD_REQUEST);

      const contract = await ChatRepository.findActiveOrRecentContract(patientId, nurseId);
      const visit = await ChatRepository.findActiveOrRecentVisit(patientId, nurseId);
      if (!contract && !visit) {
        throw new AppError('No active or recent healthcare relationship found', HTTP_STATUS.FORBIDDEN);
      }
    } else if (roles.has('PATIENT') && roles.has('DOCTOR')) {
      type = 'PATIENT_DOCTOR';
      const patientId = user1.role === 'PATIENT' ? user1.patient?.id : user2.patient?.id;
      const doctorId = user1.role === 'DOCTOR' ? user1.doctor?.id : user2.doctor?.id;
      if (!patientId || !doctorId) throw new AppError('Invalid patient/doctor record', HTTP_STATUS.BAD_REQUEST);

      const caseRecord = await ChatRepository.findActiveCaseOrPlan(user1.role === 'PATIENT' ? user1.id : user2.id, user1.role === 'DOCTOR' ? user1.id : user2.id);
      if (!caseRecord) {
        throw new AppError('No active care plan or assignment exists', HTTP_STATUS.FORBIDDEN);
      }
    } else if (roles.has('NURSE') && roles.has('DOCTOR')) {
      type = 'NURSE_DOCTOR';
      const nurseId = user1.role === 'NURSE' ? user1.nurse?.id : user2.nurse?.id;
      const doctorId = user1.role === 'DOCTOR' ? user1.doctor?.id : user2.doctor?.id;
      if (!nurseId || !doctorId) throw new AppError('Invalid nurse/doctor record', HTTP_STATUS.BAD_REQUEST);

      const activeCase = await ChatRepository.findActiveNurseDoctorCase(nurseId, doctorId);
      if (!activeCase) {
        throw new AppError('No active case assignment connecting this nurse and doctor', HTTP_STATUS.FORBIDDEN);
      }
      caseAssignmentId = activeCase.id;
    } else if (roles.has('PATIENT') && roles.has('PARAMEDIC')) {
      type = 'PATIENT_PARAMEDIC';
      const patientId = user1.role === 'PATIENT' ? user1.patient?.id : user2.patient?.id;
      const paramedicId = user1.role === 'PARAMEDIC' ? user1.paramedic?.id : user2.paramedic?.id;
      if (!patientId || !paramedicId) throw new AppError('Invalid patient/paramedic record', 400);

      const { prisma } = require('../../../common/config/database');
      const dispatch = await prisma.ambulanceDispatch.findFirst({
        where: {
          patientId,
          paramedicId,
          status: { in: ['PENDING', 'IN_TRANSIT', 'ACCEPTED', 'DISPATCHED'] }
        }
      });
      if (!dispatch) {
        throw new AppError('No active ambulance dispatch found', 403);
      }
    } else {
      throw new AppError('Communication between these roles is not supported', HTTP_STATUS.BAD_REQUEST);
    }

    return ChatRepository.createChatThread(type, userId, participantId, caseAssignmentId);
  }

  static async getThreadMessages(threadId: string, userId: string, page: number = 1, limit: number = 30) {
    const thread = await ChatRepository.findChatThread(threadId);
    if (!thread) throw new AppError('Thread not found', HTTP_STATUS.NOT_FOUND);
    
    this.assertThreadParticipant(thread, userId);
    
    return ChatRepository.findChatMessages(threadId, page, limit);
  }

  static async markMessagesAsRead(threadId: string, userId: string) {
    const thread = await ChatRepository.findChatThread(threadId);
    if (!thread) throw new AppError('Thread not found', HTTP_STATUS.NOT_FOUND);
    
    this.assertThreadParticipant(thread, userId);

    const result = await ChatRepository.markMessagesAsRead(threadId, userId);
    
    if (result.count > 0) {
      const { ChatSocketService } = require('./chat.socket');
      ChatSocketService.publishMessageRead(threadId, userId);
    }

    return { updatedCount: result.count };
  }

  static async toggleThreadFollowUp(threadId: string, doctorFollowUp: boolean) {
    return ChatRepository.updateThreadFollowUp(threadId, doctorFollowUp);
  }

  static async getConsolidatedHistory(patientId: string, requestingUser: any) {
    if (requestingUser.role === 'ADMIN') {
      const dispute = await ChatRepository.findActiveDisputeCase(patientId);
      if (!dispute) {
        throw new AppError('Access denied. Communication history only accessible during active dispute audit investigations.', HTTP_STATUS.BAD_REQUEST);
      }
      await ChatRepository.createAdminAuditLog({
        adminId: requestingUser.id,
        targetUserId: await this.getPatientUserId(patientId),
        action: 'COMMUNICATION_HISTORY_AUDITED',
        entityType: 'USER',
        entityId: patientId,
        reason: 'Accessing chat logs under active dispute case ' + dispute.id
      });
    } else {
      const targetUserId = await this.getPatientUserId(patientId);
      if (requestingUser.id !== targetUserId) {
        throw new AppError('Unauthorized access to communication history', HTTP_STATUS.FORBIDDEN);
      }
    }
    return ChatRepository.findConsolidatedHistory(patientId);
  }

  private static async getPatientUserId(patientId: string): Promise<string> {
    const userId = await ChatRepository.findPatientUserId(patientId);
    return userId || '';
  }

}
