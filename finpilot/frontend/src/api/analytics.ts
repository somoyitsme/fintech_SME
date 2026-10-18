import { api } from './client';

export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  inventoryValue: number;
  totalExpenses: number;
  netCashFlow: number;
  recentOrders: any[];
  topProducts: any[];
}

export const analyticsApi = {
  getDashboardMetrics: (): Promise<DashboardMetrics> => api.get('/analytics/dashboard'),
  getSalesTrends: (days?: number): Promise<any> => api.get(`/analytics/sales-trends${days ? `?days=${days}` : ''}`),
  getExpensesBreakdown: (): Promise<any> => api.get('/analytics/expenses-breakdown'),
  getInventoryValuation: (): Promise<any> => api.get('/analytics/inventory-valuation'),
};
