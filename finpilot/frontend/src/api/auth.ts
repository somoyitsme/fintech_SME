import { api } from './client';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string | null;
  role: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: (username: string, password: string): Promise<AuthResponse> =>
    api.post('/auth/login', { username, password }),
  register: (data: { username: string; email: string; password: string; fullName?: string }): Promise<AuthResponse> =>
    api.post('/auth/register', data),
  getMe: (): Promise<{ user: User }> =>
    api.get('/auth/me'),
};
