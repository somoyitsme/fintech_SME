import { api } from './client';

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  country: string;
  category: string;
  totalPurchase: number;
  totalDue: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateSupplierInput = Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'totalPurchase' | 'totalDue'> & {
  totalPurchase?: number;
  totalDue?: number;
};
export type UpdateSupplierInput = Partial<CreateSupplierInput>;

export const suppliersApi = {
  getAll: (): Promise<Supplier[]> => api.get('/suppliers'),
  getById: (id: string): Promise<Supplier> => api.get(`/suppliers/${id}`),
  create: (data: CreateSupplierInput): Promise<Supplier> => api.post('/suppliers', data),
  update: (id: string, data: UpdateSupplierInput): Promise<Supplier> => api.put(`/suppliers/${id}`, data),
  delete: (id: string): Promise<void> => api.delete(`/suppliers/${id}`),
};
