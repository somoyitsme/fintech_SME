import { api } from './client';

export interface DbNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger' | 'order' | 'stock' | 'system';
  isRead: number;
  link?: string;
  actionUrl?: string;
  metadata?: string;
  createdAt: string;
  readAt?: string | null;
}

export const notificationsApi = {
  getAll: (unreadOnly?: boolean): Promise<DbNotification[]> =>
    api.get(`/notifications${unreadOnly ? '?unreadOnly=true' : ''}`),

  create: (data: {
    title: string;
    message: string;
    type?: string;
    userId?: string;
    link?: string;
    actionUrl?: string;
    metadata?: any;
  }): Promise<DbNotification> =>
    api.post('/notifications', data),

  markAsRead: (id: string): Promise<{ success: boolean; id: string; readAt: string }> =>
    api.patch(`/notifications/${id}/read`, {}),

  markAllAsRead: (): Promise<{ success: boolean; markedAt: string }> =>
    api.post('/notifications/mark-all-read', {}),

  delete: (id: string): Promise<{ success: boolean; id: string }> =>
    api.delete(`/notifications/${id}`),
};
