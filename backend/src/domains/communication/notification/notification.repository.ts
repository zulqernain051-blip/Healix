import { prisma } from '../../../common/config/database';

export class NotificationRepository {
  static async findPreference(userId: string, category: string) {
    return prisma.notificationPreference.findFirst({
      where: { userId, category }
    });
  }

  static async createNotification(userId: string, category: string, title: string, body: string, channel: string) {
    return prisma.notification.create({
      data: {
        userId,
        category,
        title,
        body,
        channel,
        read: false
      }
    });
  }

  static async findNotificationsByUser(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true }
    });
  }

  static async updatePreference(id: string, data: any) {
    return prisma.notificationPreference.update({
      where: { id },
      data
    });
  }

  static async createPreference(userId: string, category: string, data: any) {
    return prisma.notificationPreference.create({
      data: {
        userId,
        category,
        ...data
      }
    });
  }
}
