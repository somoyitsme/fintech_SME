import { api } from './client';

export interface Expense {
  id: string;
  category: string;
  amount: number;
  vendor: string;
  description: string;
  date: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateExpenseInput = Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateExpenseInput = Partial<CreateExpenseInput>;

export const expensesApi = {
  getAll: (): Promise<Expense[]> => api.get('/expenses'),
  getById: (id: string): Promise<Expense> => api.get(`/expenses/${id}`),
  create: (data: CreateExpenseInput): Promise<Expense> => api.post('/expenses', data),
  update: (id: string, data: UpdateExpenseInput): Promise<Expense> => api.put(`/expenses/${id}`, data),
  delete: (id: string): Promise<void> => api.delete(`/expenses/${id}`),
  approve: (id: string): Promise<Expense> => api.patch(`/expenses/${id}/approve`, {}),
};
