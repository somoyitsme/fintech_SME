import { api } from './client';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  retailPrice: number;
  costPrice: number;
  stockCount: number;
  unit: string;
  minThreshold: number;
  location: string;
  warranty: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateProductInput = Partial<CreateProductInput>;

export const productsApi = {
  getAll: (): Promise<Product[]> => api.get('/products'),
  getById: (id: string): Promise<Product> => api.get(`/products/${id}`),
  create: (data: CreateProductInput): Promise<Product> => api.post('/products', data),
  update: (id: string, data: UpdateProductInput): Promise<Product> => api.put(`/products/${id}`, data),
  delete: (id: string): Promise<void> => api.delete(`/products/${id}`),
};
