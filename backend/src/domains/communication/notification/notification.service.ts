import { NotificationRepository } from './notification.repository';
import { logger } from '../../../common/utils/logger';

// 5-minute sliding window memory cache for deduplication
const recentDispatches = new Map<string, number>();

export interface DispatchData {
  userId: string;
  category: 'APPOINTMENT' | 'RISK' | 'PAYMENT' | 'EMERGENCY';
  title: string;
  body: string;
  channel?: 'PUSH' | 'SMS' | 'IN_APP';
}

export class NotificationService {
  static async dispatchNotification(data: DispatchData) {
    const { userId, category, title, body, channel = 'IN_APP' } = data;
    const now = Date.now();

    // 1. Deduplication window check (5 minutes)
    const dedupKey = `${userId}:${category}:${title}:${body}`;
    const lastDispatched = recentDispatches.get(dedupKey);
    if (lastDispatched && now - lastDispatched < 5 * 60 * 1000) {
      logger.info(`[NOTIF DEDUP] Dropped duplicate alert for user ${userId}: ${title}`);
      return;
    }
    recentDispatches.set(dedupKey, now);

    // 2. Preference checks (Quiet Hours & Mute Preferences)
    if (category !== 'EMERGENCY') {
      const pref = await NotificationRepository.findPreference(userId, category);

      if (pref) {
        if (!pref.enabled) {
          logger.info(`[NOTIF MUTED] User ${userId} has muted category ${category}`);
          return;
        }

        // Check quiet hours
        if (pref.quietHoursStart && pref.quietHoursEnd) {
          const inQuiet = this.checkQuietHours(pref.quietHoursStart, pref.quietHoursEnd);
          if (inQuiet) {
            logger.info(`[NOTIF QUIET] Muted non-critical notification during quiet hours for user ${userId}`);
            return;
          }
        }
      }
    }

    // 3. Dispatch based on channels
    if (category === 'EMERGENCY') {
      // Emergency category always dispatches both PUSH and SMS simultaneously, bypassing mute settings
      await this.sendPush(userId, title, body);
      await this.sendSms(userId, body);
      await this.saveInAppNotification(userId, category, title, body, 'PUSH');
    } else {
      if (channel === 'PUSH') {
        await this.sendPush(userId, title, body);
      } else if (channel === 'SMS') {
        await this.sendSms(userId, body);
      }
      await this.saveInAppNotification(userId, category, title, body, channel);
    }
  }

  private static async sendPush(userId: string, title: string, body: string) {
    logger.info(`[FCM PUSH] Sending push alert to user ${userId} -> Title: ${title} | Body: ${body}`);
  }

  private static async sendSms(userId: string, body: string) {
    logger.info(`[SMS DISPATCH] Sending SMS alert to user ${userId} -> Body: ${body}`);
  }

  private static async saveInAppNotification(userId: string, category: string, title: string, body: string, channel: string) {
    return NotificationRepository.createNotification(userId, category, title, body, channel);
  }

  private static checkQuietHours(start: string, end: string): boolean {
    try {
      const now = new Date();
      const currentMin = now.getHours() * 60 + now.getMinutes();

      const [startHour, startMin] = start.split(':').map(Number);
      const [endHour, endMin] = end.split(':').map(Number);

      const qStart = startHour * 60 + startMin;
      const qEnd = endHour * 60 + endMin;

      if (qStart < qEnd) {
        return currentMin >= qStart && currentMin <= qEnd;
      } else {
        // Overnight quiet hours range
        return currentMin >= qStart || currentMin <= qEnd;
      }
    } catch {
      return false;
    }
  }

  // API handler logics
  static async getNotifications(userId: string) {
    return NotificationRepository.findNotificationsByUser(userId);
  }

  static async markAsRead(id: string, userId: string) {
    return NotificationRepository.markAsRead(id, userId);
  }

  static async updatePreferences(userId: string, preferences: { category: string; enabled: boolean; quietHoursStart?: string; quietHoursEnd?: string }[]) {
    for (const p of preferences) {
      const data = {
        enabled: p.enabled,
        quietHoursStart: p.quietHoursStart || null,
        quietHoursEnd: p.quietHoursEnd || null
      };

      const existing = await NotificationRepository.findPreference(userId, p.category);

      if (existing) {
        await NotificationRepository.updatePreference(existing.id, data);
      } else {
        await NotificationRepository.createPreference(userId, p.category, data);
      }
    }
  }
}
