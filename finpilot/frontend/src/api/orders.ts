import { api } from './client';

export interface OrderItem {
  id?: string;
  orderId?: string;
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  costPrice?: number;
  profit?: number;
  total: number;
}

export interface CustomerDetails {
  id: string;
  name: string;
  contactNumber: string;
  email: string;
  deliveryAddress: string;
  customerType: string;
  binNumber?: string;
  totalPurchases?: number;
  totalDue?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderType: string;
  customerName: string;
  customerId?: string | null;
  contactNumber: string;
  deliveryAddress: string;
  itemsSummary: string;
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  vatAmount: number;
  totalAmount: number;
  paidAmount?: number;
  dueAmount?: number;
  profit?: number;
  branch?: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  customerDetails?: CustomerDetails;
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
  orderNumber?: string;
  orderType?: string;
  customerName: string;
  customerId?: string;
  contactNumber?: string;
  deliveryAddress?: string;
  itemsSummary?: string;
  subtotal: number;
  discountAmount?: number;
  discountPercent?: number;
  vatAmount?: number;
  totalAmount: number;
  paidAmount?: number;
  dueAmount?: number;
  branch?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  status?: string;
  courier?: {
    provider: 'Pathao' | 'Steadfast' | 'RedX' | string;
    consignmentId: string;
    trackingUrl: string;
    status: string;
    codAmount: number;
    deliveryFee: number;
    recipientCity: string;
    dispatchedAt: string;
  } | null;
  orderDate?: string;
  salesman?: string;
  items: Array<{
    productId: string;
    name: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

export const ordersApi = {
  getAll: (): Promise<Order[]> => api.get('/orders'),
  getById: (id: string): Promise<Order> => api.get(`/orders/${id}`),
  create: (data: CreateOrderInput): Promise<Order> => api.post('/orders', data),
  dispatchCourier: (id: string, courier: any): Promise<Order> => api.patch(`/orders/${id}/courier`, courier),
  update: (id: string, data: Partial<Order>): Promise<Order> => api.put(`/orders/${id}`, data),
  delete: (id: string): Promise<void> => api.delete(`/orders/${id}`),
};
