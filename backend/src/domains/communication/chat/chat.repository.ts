import { prisma } from '../../../common/config/database';

export class ChatRepository {
  static async createAiChatMessage(patientId: string, sender: string, messageText: string, severityFlag: boolean) {
    return prisma.aiChatMessage.create({
      data: {
        patientId,
        sender,
        messageText,
        severityFlag,
      },
    });
  }

  static async findAiChatHistory(patientId: string) {
    return prisma.aiChatMessage.findMany({
      where: { patientId },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async createChatThread(type: string, participantAId: string, participantBId: string, caseAssignmentId?: string) {
    return prisma.chatThread.create({
      data: {
        type,
        participantAId,
        participantBId,
        caseAssignmentId,
      },
    });
  }

  static async findThreadsForUser(userId: string) {
    return prisma.chatThread.findMany({
      where: {
        OR: [{ participantAId: userId }, { participantBId: userId }],
      },
      include: {
        participantA: { select: { id: true, fullName: true, role: true } },
        participantB: { select: { id: true, fullName: true, role: true } },
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: userId },
                status: { not: 'READ' },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  static async findChatThread(id: string) {
    return prisma.chatThread.findUnique({
      where: { id },
      include: {
        participantA: { select: { id: true, fullName: true, role: true } },
        participantB: { select: { id: true, fullName: true, role: true } },
      },
    });
  }

  static async findChatThreadBetweenParticipants(pAId: string, pBId: string, type?: string) {
    const where: any = {
      OR: [
        { participantAId: pAId, participantBId: pBId },
        { participantAId: pBId, participantBId: pAId },
      ],
    };
    if (type) where.type = type;
    return prisma.chatThread.findFirst({ where });
  }

  static async createChatMessage(
    threadId: string, 
    senderId: string, 
    contentType: string, 
    contentUrlOrText: string,
    replyToId?: string,
    fileMetadata?: any
  ) {
    const thread = await prisma.chatThread.update({
      where: { id: threadId },
      data: {
        updatedAt: new Date(),
        messages: {
          create: {
            senderId,
            contentType,
            contentUrlOrText,
            replyToId,
            fileMetadata: fileMetadata ? fileMetadata : undefined
          },
        },
      },
      include: {
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1,
        },
      },
    });
    return thread.messages[0];
  }

  static async findChatMessages(threadId: string, page: number = 1, limit: number = 30) {
    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      prisma.chatMessage.findMany({
        where: { threadId },
        include: {
          sender: { select: { id: true, fullName: true, role: true } },
        },
        orderBy: { sentAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.chatMessage.count({ where: { threadId } }),
    ]);

    return {
      messages,
      page,
      limit,
      total,
      hasMore: skip + messages.length < total,
    };
  }

  static async markMessagesAsRead(threadId: string, userId: string) {
    return prisma.chatMessage.updateMany({
      where: {
        threadId,
        senderId: { not: userId },
        status: { not: 'READ' },
      },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });
  }

  static async markMessageDelivered(messageId: string, userId: string) {
    const msg = await prisma.chatMessage.findUnique({ where: { id: messageId } });
    if (!msg || msg.senderId === userId || msg.status !== 'SENT') {
      return false; // Cannot mark own message, or already read/delivered
    }
    
    await prisma.chatMessage.update({
      where: { id: messageId },
      data: { status: 'DELIVERED' }
    });
    return true;
  }

  static async updateThreadFollowUp(threadId: string, doctorFollowUp: boolean) {
    return prisma.chatThread.update({
      where: { id: threadId },
      data: { doctorFollowUp },
    });
  }

  static async findActiveDisputeCase(patientId: string) {
    return prisma.disputeCase.findFirst({
      where: { patientId, status: 'ACTIVE' },
    });
  }

  static async createDisputeCase(patientId: string, status: string = 'ACTIVE') {
    return prisma.disputeCase.create({
      data: { patientId, status },
    });
  }

  static async createEmergencyEvent(patientId: string, visitId: string | null, source: string, severity: string) {
    return prisma.emergencyEvent.create({
      data: {
        patientId,
        visitId,
        source,
        severity,
      },
    });
  }

  static async findActiveOrRecentContract(patientId: string, nurseId: string) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return prisma.contract.findFirst({
      where: {
        patientId,
        nurseId,
        OR: [
          { status: 'ACTIVE' },
          {
            status: 'COMPLETED',
            updatedAt: { gte: sevenDaysAgo },
          },
        ],
      },
    });
  }

  static async findActiveOrRecentVisit(patientId: string, nurseId: string) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return prisma.visit.findFirst({
      where: {
        nurseId,
        request: { patientId },
        OR: [
          { status: { in: ['ACCEPTED', 'IN_PROGRESS'] } },
          {
            status: 'COMPLETED',
            completedAt: { gte: sevenDaysAgo },
          },
        ],
      },
    });
  }

  static async findActiveCaseOrPlan(patientUserId: string, doctorUserId: string) {
    // Check if there is an active case assignment for a visit involving the patient and doctor
    return prisma.caseAssignment.findFirst({
      where: {
        status: 'ACCEPTED',
        doctor: { userId: doctorUserId },
        visit: { request: { patient: { userId: patientUserId } } },
      },
    });
  }

  static async findConsolidatedHistory(patientId: string) {
    // Find patient's user id
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { userId: true },
    });
    if (!patient) return { aiLogs: [], threadLogs: [] };

    const aiLogs = await prisma.aiChatMessage.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });

    const threadLogs = await prisma.chatMessage.findMany({
      where: {
        thread: {
          OR: [
            { participantAId: patient.userId },
            { participantBId: patient.userId },
          ],
        },
      },
      include: {
        thread: true,
        sender: { select: { fullName: true, role: true } },
      },
      orderBy: { sentAt: 'desc' },
    });

    return { aiLogs, threadLogs };
  }

  static async findPatientUserId(patientId: string): Promise<string | null> {
    const p = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { userId: true },
    });
    return p?.userId || null;
  }

  static async searchClinicalKnowledge(words: string[]) {
    const conditions = words.map(w => ({ content: { contains: w, mode: 'insensitive' as const } }));
    return prisma.clinicalKnowledgeEntry.findMany({
      where: { OR: conditions },
      take: 1
    });
  }

  static async findPatientUser(userIds: string[]) {
    return prisma.user.findFirst({
      where: { id: { in: userIds }, role: 'PATIENT' },
      include: { patient: true }
    });
  }

  static async findNurseUser(userIds: string[]) {
    return prisma.user.findFirst({
      where: { id: { in: userIds }, role: 'NURSE' },
      include: { nurse: true }
    });
  }

  static async findDoctorUser(userIds: string[]) {
    return prisma.user.findFirst({
      where: { id: { in: userIds }, role: 'DOCTOR' }
    });
  }

  static async createAdminAuditLog(data: any) {
    return prisma.adminAuditLog.create({ data });
  }

  static async findUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        patient: true,
        nurse: true,
        doctor: true,
        paramedic: true,
      },
    });
  }

  static async findActiveNurseDoctorCase(nurseId: string, doctorId: string) {
    return prisma.caseAssignment.findFirst({
      where: {
        status: 'ACCEPTED',
        doctor: { id: doctorId },
        visit: { nurseId },
      },
    });
  }

}
