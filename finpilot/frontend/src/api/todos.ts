import { api } from './client';

export interface DbTodo {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  isCompleted: number;
  completedBy?: string | null;
  completedAt?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const todosApi = {
  getAll: (): Promise<DbTodo[]> =>
    api.get('/todos'),

  create: (data: {
    title: string;
    description?: string;
    category?: string;
    priority?: string;
    dueDate?: string;
    createdBy?: string;
  }): Promise<DbTodo> =>
    api.post('/todos', data),

  update: (id: string, data: Partial<DbTodo>): Promise<{ success: boolean; id: string }> =>
    api.patch(`/todos/${id}`, data),

  delete: (id: string): Promise<{ success: boolean; id: string }> =>
    api.delete(`/todos/${id}`),
};
