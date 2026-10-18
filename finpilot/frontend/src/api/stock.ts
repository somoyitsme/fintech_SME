import { api } from './client';

export interface StockTransfer {
  id: string;
  transferNumber: string;
  fromLocation: string;
  toLocation: string;
  productId: string;
  productName: string;
  quantity: number;
  transferDate: string;
  status: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StockAdjustment {
  id: string;
  adjustmentNumber: string;
  location: string;
  productId: string;
  productName: string;
  adjustmentType: string;
  quantity: number;
  unitCost: number;
  totalValue: number;
  adjustmentDate: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierPO {
  id: string;
  poNumber: string;
  supplierName: string;
  items: string;
  productId: string;
  quantity: number;
  totalCost: number;
  orderDate: string;
  status: string;
  expectedDelivery: string;
  createdAt: string;
  updatedAt: string;
}

export const stockApi = {
  // Transfers
  getTransfers: (): Promise<StockTransfer[]> => api.get('/stock/transfers'),
  createTransfer: (data: Omit<StockTransfer, 'id' | 'createdAt' | 'updatedAt'>): Promise<StockTransfer> =>
    api.post('/stock/transfers', data),

  // Adjustments
  getAdjustments: (): Promise<StockAdjustment[]> => api.get('/stock/adjustments'),
  createAdjustment: (data: Omit<StockAdjustment, 'id' | 'createdAt' | 'updatedAt'>): Promise<StockAdjustment> =>
    api.post('/stock/adjustments', data),

  // Purchase Orders
  getPOs: (): Promise<SupplierPO[]> => api.get('/stock/pos'),
  createPO: (data: Omit<SupplierPO, 'id' | 'createdAt' | 'updatedAt'>): Promise<SupplierPO> =>
    api.post('/stock/pos', data),
  updatePOStatus: (id: string, status: string): Promise<SupplierPO> =>
    api.patch(`/stock/pos/${id}/status`, { status }),
};
