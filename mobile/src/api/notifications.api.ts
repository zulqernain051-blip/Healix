import { apiClient } from './client';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  unread: boolean;
  createdAt: string;
  data?: any;
}

export const notificationsApi = {
  getNotifications: () => apiClient.get<Notification[]>('/notifications'),
  markAsRead: (id: string) => apiClient.put(`/notifications/${id}/read`, {}),
  markAllAsRead: () => apiClient.put('/notifications/read-all', {}),
};
