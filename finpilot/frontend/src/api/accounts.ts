import { api } from './client';

export interface PaymentAccount {
  id: string;
  accountName: string;
  accountType: string;
  accountNumber: string;
  bankName: string | null;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  hireDate: string;
  salary: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const accountsApi = {
  // Accounts
  getAccounts: (): Promise<PaymentAccount[]> => api.get('/accounts'),
  createAccount: (data: Omit<PaymentAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentAccount> =>
    api.post('/accounts', data),
  updateAccount: (id: string, data: Partial<PaymentAccount>): Promise<PaymentAccount> =>
    api.put(`/accounts/${id}`, data),
  deleteAccount: (id: string): Promise<void> =>
    api.delete(`/accounts/${id}`),

  // Staff
  getStaff: (): Promise<Staff[]> => api.get('/staff'),
  createStaff: (data: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>): Promise<Staff> =>
    api.post('/staff', data),
  updateStaff: (id: string, data: Partial<Staff>): Promise<Staff> =>
    api.put(`/staff/${id}`, data),
  deleteStaff: (id: string): Promise<void> =>
    api.delete(`/staff/${id}`),
};
