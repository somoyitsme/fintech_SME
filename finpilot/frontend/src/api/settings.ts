import { api } from './client';

export interface DbSetting {
  id: string;
  key: string;
  value: string;
  category: string;
  description?: string;
  updatedAt: string;
}

export const settingsApi = {
  getAll: (): Promise<{ list: DbSetting[]; map: Record<string, string> }> =>
    api.get('/settings'),

  save: (data: { key: string; value: string; category?: string; description?: string }): Promise<{ success: boolean; key: string; value: string }> =>
    api.post('/settings', data),
};
