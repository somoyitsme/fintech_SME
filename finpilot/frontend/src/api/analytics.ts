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

export interface BranchSummary {
  branch: string;
  totalSales: number;
  dailySales: number;
  totalProfit: number;
  dailyProfit: number;
  totalDue: number;
  dailyDue: number;
  stockCount: number;
  stockValue: number;
  orderCount: number;
}

export interface ReportsSummary {
  totalSales: number;
  dailySales: number;
  totalProfit: number;
  dailyProfit: number;
  totalDue: number;
  dailyDue: number;
  totalStockCount: number;
  totalStockValue: number;
  branches: BranchSummary[];
  updatedAt: string;
}

export const analyticsApi = {
  getDashboardMetrics: (): Promise<DashboardMetrics> => api.get('/analytics/dashboard'),
  getReportsSummary: (): Promise<ReportsSummary> => api.get('/analytics/reports/summary'),
  getSalesTrends: (days?: number): Promise<any> => api.get(`/analytics/sales-trends${days ? `?days=${days}` : ''}`),
  getExpensesBreakdown: (): Promise<any> => api.get('/analytics/expenses-breakdown'),
  getInventoryValuation: (): Promise<any> => api.get('/analytics/inventory-valuation'),
};
