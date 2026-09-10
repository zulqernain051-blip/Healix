import { Request, Response } from 'express';
import { NotificationService } from './notification.service';

export class NotificationController {
  static async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const list = await NotificationService.getNotifications(userId);
      res.status(200).json({ success: true, data: list });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message || 'Failed to fetch notifications' });
    }
  }

  static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      await NotificationService.markAsRead(id, userId);
      res.status(200).json({ success: true, message: 'Notification marked as read' });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message || 'Failed to update notification' });
    }
  }

  static async updatePreferences(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { preferences } = req.body;
      if (!Array.isArray(preferences)) {
        res.status(400).json({ success: false, message: 'Preferences must be an array' });
        return;
      }
      await NotificationService.updatePreferences(userId, preferences);
      res.status(200).json({ success: true, message: 'Preferences updated successfully' });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message || 'Failed to update preferences' });
    }
  }
}
