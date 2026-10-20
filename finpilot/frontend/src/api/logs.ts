import { api } from './client';

export interface DbAuthLog {
  id: string;
  userId?: string | null;
  username: string;
  action: 'login_success' | 'login_failed' | 'logout' | 'token_refresh';
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failed';
  failureReason?: string | null;
  createdAt: string;
}

export interface DbActivityLog {
  id: string;
  userId?: string | null;
  username: string;
  role: string;
  entityType: string;
  entityId?: string | null;
  action: string;
  description: string;
  changes?: string | null;
  ipAddress?: string;
  createdAt: string;
}

export interface DbUserSession {
  id: string;
  userId: string;
  token: string;
  ipAddress?: string;
  userAgent?: string;
  isActive: number;
  loggedInAt: string;
  lastActiveAt: string;
  loggedOutAt?: string | null;
}

export const logsApi = {
  getAuthLogs: (limit?: number): Promise<DbAuthLog[]> =>
    api.get(`/logs/auth${limit ? `?limit=${limit}` : ''}`),

  getSessions: (): Promise<DbUserSession[]> =>
    api.get('/logs/sessions'),

  getActivityLogs: (limit?: number, entityType?: string): Promise<DbActivityLog[]> => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', String(limit));
    if (entityType) params.append('entityType', entityType);
    const qs = params.toString();
    return api.get(`/logs/activity${qs ? `?${qs}` : ''}`);
  },

  logActivity: (data: {
    userId?: string;
    username?: string;
    role?: string;
    entityType: string;
    entityId?: string;
    action: string;
    description: string;
    changes?: any;
  }): Promise<{ success: boolean }> =>
    api.post('/logs/activity', data),
};
