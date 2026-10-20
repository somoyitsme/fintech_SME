import { api } from './client';

export interface Customer {
  id: string;
  name: string;
  contactNumber: string;
  email?: string | null;
  deliveryAddress: string;
  customerType: string;
  binNumber: string | null;
  totalPurchases: number;
  totalDue?: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateCustomerInput = Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'totalPurchases'>;
export type UpdateCustomerInput = Partial<CreateCustomerInput>;

export const customersApi = {
  getAll: (): Promise<Customer[]> => api.get('/customers'),
  getById: (id: string): Promise<Customer> => api.get(`/customers/${id}`),
  create: (data: CreateCustomerInput): Promise<Customer> => api.post('/customers', data),
  update: (id: string, data: UpdateCustomerInput): Promise<Customer> => api.put(`/customers/${id}`, data),
  delete: (id: string): Promise<void> => api.delete(`/customers/${id}`),
};
