import { api } from './client';

export interface DbCashRegister {
  id?: string;
  isOpen: boolean;
  openedAt: string;
  closedAt?: string | null;
  openingCash: number;
  cashSales: number;
  cardSales?: number;
  mfsSales?: number;
  totalCash: number;
  location?: string;
  userName?: string;
}

export const cashRegisterApi = {
  getCurrent: (): Promise<DbCashRegister> =>
    api.get('/cash-register/current'),

  open: (openingAmount: number, location?: string, userName?: string): Promise<any> =>
    api.post('/cash-register/open', { openingAmount, location, userName }),

  close: (closingAmount?: number, notes?: string): Promise<any> =>
    api.post('/cash-register/close', { closingAmount, notes }),
};
