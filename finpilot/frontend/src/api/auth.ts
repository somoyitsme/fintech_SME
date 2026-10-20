import { api } from './client';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string | null;
  role: string;
}

export interface SystemUser {
  id: string;
  username: string;
  email: string;
  fullName: string | null;
  role: 'admin' | 'manager' | 'salesman';
  status: 'active' | 'suspended' | 'inactive';
  phone: string;
  branch: string;
  createdAt?: string;
  updatedAt?: string;
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
  logout: (userId?: string, username?: string, role?: string): Promise<{ success: boolean }> =>
    api.post('/auth/logout', { userId, username, role }),
  listUsers: (): Promise<{ users: SystemUser[] }> =>
    api.get('/auth/users'),
  createUser: (data: {
    username: string;
    email: string;
    password: string;
    fullName?: string;
    role: string;
    phone?: string;
    branch?: string;
    operatorName?: string;
    operatorRole?: string;
  }): Promise<{ user: SystemUser; message: string }> =>
    api.post('/auth/users', data),
  updateUser: (
    id: string,
    data: {
      fullName?: string;
      email?: string;
      role?: 'admin' | 'manager' | 'salesman';
      status?: 'active' | 'suspended' | 'inactive';
      phone?: string;
      branch?: string;
      operatorName?: string;
      operatorRole?: string;
    }
  ): Promise<{ user: SystemUser; message: string }> =>
    api.patch(`/auth/users/${id}`, data),
  resetPassword: (
    id: string,
    newPassword: string,
    operatorName?: string,
    operatorRole?: string
  ): Promise<{ success: boolean; message: string }> =>
    api.post(`/auth/users/${id}/reset-password`, { newPassword, operatorName, operatorRole }),
};
