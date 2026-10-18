import { api } from './client';

export interface OrderItem {
  id?: string;
  orderId?: string;
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderType: string;
  customerName: string;
  contactNumber: string;
  deliveryAddress: string;
  itemsSummary: string;
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  vatAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  courierProvider?: string | null;
  courierConsignmentId?: string | null;
  courierTrackingUrl?: string | null;
  courierStatus?: string | null;
  courierCodAmount?: number | null;
  courierDeliveryFee?: number | null;
  courierRecipientCity?: string | null;
  courierDispatchedAt?: string | null;
  orderDate: string;
  salesman: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

export interface CreateOrderInput {
  orderType?: string;
  customerName: string;
  contactNumber?: string;
  deliveryAddress?: string;
  subtotal: number;
  discountAmount?: number;
  discountPercent?: number;
  vatAmount?: number;
  totalAmount: number;
  paymentMethod?: string;
  paymentStatus?: string;
  status?: string;
  orderDate: string;
  salesman?: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export const ordersApi = {
  getAll: (): Promise<Order[]> => api.get('/orders'),
  getById: (id: string): Promise<Order> => api.get(`/orders/${id}`),
  create: (data: CreateOrderInput): Promise<Order> => api.post('/orders', data),
  update: (id: string, data: Partial<Order>): Promise<Order> => api.put(`/orders/${id}`, data),
  delete: (id: string): Promise<void> => api.delete(`/orders/${id}`),
};
