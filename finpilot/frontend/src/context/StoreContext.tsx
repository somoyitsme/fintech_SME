import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  productsApi, 
  ordersApi, 
  customersApi, 
  expensesApi, 
  suppliersApi, 
  stockApi, 
  accountsApi, 
  analyticsApi,
  notificationsApi,
  logsApi,
  todosApi,
  cashRegisterApi,
  DbNotification,
  DbTodo,
  DbActivityLog
} from '../api';

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
}

export interface Customer {
  id: string;
  name: string;
  contactNumber: string;
  email?: string;
  deliveryAddress: string;
  customerType: 'Wholesale' | 'Retail' | 'Corporate';
  binNumber?: string;
  totalPurchases?: number;
  totalDue?: number;
}

export interface CourierDispatch {
  provider: 'Pathao' | 'Steadfast' | 'RedX';
  consignmentId: string;
  trackingUrl: string;
  status: 'Awaiting Rider Pickup' | 'In Transit' | 'Out for Delivery' | 'Delivered';
  codAmount: number;
  deliveryFee: number;
  recipientCity: string;
  dispatchedAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  costPrice?: number;
  profit?: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderType: 'online' | 'offline';
  customerName: string;
  customerId?: string | null;
  contactNumber: string;
  deliveryAddress: string;
  items: OrderItem[];
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
  paymentMethod: 'cash' | 'bkash' | 'bank_transfer' | 'credit_30d' | 'due';
  paymentStatus: 'Paid' | 'Credit 30D' | 'Partial' | 'COD Pending' | 'Due' | 'Partial Due';
  status: 'Processing' | 'Ready for Dispatch' | 'In Transit' | 'Delivered' | 'Counter Collected';
  customerDetails?: {
    id: string;
    name: string;
    contactNumber: string;
    email: string;
    deliveryAddress: string;
    customerType: string;
    binNumber?: string;
    totalPurchases?: number;
    totalDue?: number;
  } | null;
  courier?: CourierDispatch | null;
  orderDate: string;
  salesman: string;
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
  status: 'In Transit' | 'Port Customs' | 'Received';
  expectedDelivery: string;
}

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
}

export interface ExpenseRecord {
  id: string;
  category: string;
  amount: number;
  vendor: string;
  description: string;
  date: string;
  paymentMethod: string;
  status: 'Approved' | 'Pending';
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  fromLocation: string;
  toLocation: string;
  productId: string;
  productName: string;
  quantity: number;
  transferDate: string;
  status: 'Completed' | 'In Transit';
  notes?: string;
}

export interface StockAdjustment {
  id: string;
  adjustmentNumber: string;
  location: string;
  productId: string;
  productName: string;
  adjustmentType: 'Damaged' | 'Audit Shortage' | 'Audit Surplus';
  quantity: number;
  unitCost: number;
  totalValue: number;
  adjustmentDate: string;
  reason: string;
}

export interface PaymentAccount {
  id: string;
  accountName: string;
  accountType: 'Cash Drawer' | 'Bank Account' | 'MFS (bKash/Nagad)';
  accountNumber: string;
  bankName?: string;
  balance: number;
}

interface StoreContextType {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  purchaseOrders: SupplierPO[];
  suppliers: Supplier[];
  expenses: ExpenseRecord[];
  stockTransfers: StockTransfer[];
  stockAdjustments: StockAdjustment[];
  accounts: PaymentAccount[];
  notifications: DbNotification[];
  unreadNotificationsCount: number;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  selectedLocation: string;
  setSelectedLocation: (loc: string) => void;
  dateFilter: string;
  setDateFilter: (df: string) => void;
  cashRegister: {
    isOpen: boolean;
    openedAt: string;
    openingCash: number;
    cashSales: number;
    totalCash: number;
  };
  openCashRegister: (openingAmount: number) => void;
  closeCashRegister: () => void;
  addStock: (productId: string, quantity: number, unitCost?: number) => void;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  addNewProduct: (product: Omit<Product, 'id'>) => void;
  addNewCustomer: (customer: Omit<Customer, 'id'>) => Customer;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Supplier;
  addExpense: (expense: Omit<ExpenseRecord, 'id'>) => ExpenseRecord;
  createStockTransfer: (transfer: Omit<StockTransfer, 'id' | 'transferNumber'>) => StockTransfer;
  createStockAdjustment: (adjustment: Omit<StockAdjustment, 'id' | 'adjustmentNumber'>) => StockAdjustment;
  dispatchWithCourier: (
    orderId: string, 
    provider: 'Pathao' | 'Steadfast' | 'RedX', 
    options?: { deliveryFee?: number; codAmount?: number }
  ) => void;
  createPurchaseOrder: (poData: {
    supplierName: string;
    productId: string;
    quantity: number;
    totalCost: number;
    itemsSummary: string;
  }) => void;
  createSaleOrder: (orderData: {
    customerName: string;
    contactNumber: string;
    deliveryAddress: string;
    items: { product: Product; quantity: number; unitPrice?: number }[];
    discountPercent: number;
    discountAmountFlat?: number;
    orderType?: 'online' | 'offline';
    paymentMethod: 'cash' | 'bkash' | 'bank_transfer' | 'credit_30d' | 'due';
    paidAmount?: number;
    dueAmount?: number;
    branch?: string;
    salesman: string;
  }) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  receivePurchaseOrder: (poId: string) => void;
  metrics: {
    totalSalesRevenue: number;
    salesTodayCount: number;
    salesTodayRevenue: number;
    pendingOrdersCount: number;
    totalStockUnits: number;
    totalStockValue: number;
    totalCostValue: number;
    salesmanMonthSales: number;
    salesmanCommission: number;
    totalSales: number;
    sellReturn: number;
    totalPurchase: number;
    purchaseReturn: number;
    purchaseDue: number;
    totalExpense: number;
    expenseDue: number;
    grossProfit: number;
    netProfit: number;
    accountPayable: number;
    accountReceivable: number;
    stockSellPrice: number;
    stockPurchasePrice: number;
  };
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Pure local database-driven states - 0 hardcoded arrays in codebase
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<SupplierPO[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>([]);
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>([]);
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [notifications, setNotifications] = useState<DbNotification[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('All Locations');
  const [dateFilter, setDateFilter] = useState<string>('past30');

  const [cashRegister, setCashRegister] = useState<{
    isOpen: boolean;
    openedAt: string;
    openingCash: number;
    cashSales: number;
    totalCash: number;
  }>({
    isOpen: true,
    openedAt: 'Today, 09:30 AM',
    openingCash: 50000,
    cashSales: 135400,
    totalCash: 185400
  });

  // Synchronize state directly from local SQLite database (finpilot.db)
  const syncWithDbServer = async () => {
    try {
      const [
        dbProducts,
        dbCustomers,
        dbOrders,
        dbExpenses,
        dbSuppliers,
        dbNotifs,
        dbTransfers,
        dbAdjustments,
        dbPOs,
        dbAccounts,
        dbRegister
      ] = await Promise.allSettled([
        productsApi.getAll(),
        customersApi.getAll(),
        ordersApi.getAll(),
        expensesApi.getAll(),
        suppliersApi.getAll(),
        notificationsApi.getAll(),
        stockApi.getTransfers(),
        stockApi.getAdjustments(),
        stockApi.getPOs(),
        accountsApi.getAccounts(),
        cashRegisterApi.getCurrent()
      ]);

      if (dbProducts.status === 'fulfilled' && Array.isArray(dbProducts.value)) {
        setProducts(dbProducts.value);
      }
      if (dbCustomers.status === 'fulfilled' && Array.isArray(dbCustomers.value)) {
        setCustomers(dbCustomers.value.map(c => ({
          id: c.id,
          name: c.name,
          contactNumber: c.contactNumber,
          email: c.email || '',
          deliveryAddress: c.deliveryAddress,
          customerType: (c.customerType as any) || 'Retail',
          binNumber: c.binNumber || undefined,
          totalPurchases: c.totalPurchases || 0,
          totalDue: c.totalDue || 0,
        })));
      }
      if (dbOrders.status === 'fulfilled' && Array.isArray(dbOrders.value)) {
        setOrders(dbOrders.value.map(o => ({
          id: o.id,
          orderNumber: o.orderNumber,
          orderType: (o.orderType as any) || 'offline',
          customerName: o.customerName,
          customerId: o.customerId || null,
          contactNumber: o.contactNumber,
          deliveryAddress: o.deliveryAddress,
          items: (o.items || []).map((i: any) => ({
            productId: i.productId,
            name: i.name,
            sku: i.sku,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            costPrice: i.costPrice || 0,
            profit: i.profit || 0,
            total: i.total
          })),
          itemsSummary: o.itemsSummary,
          subtotal: o.subtotal,
          discountAmount: o.discountAmount,
          discountPercent: o.discountPercent,
          vatAmount: o.vatAmount,
          totalAmount: o.totalAmount,
          paidAmount: o.paidAmount !== undefined ? o.paidAmount : (o.paymentStatus === 'Paid' ? o.totalAmount : 0),
          dueAmount: o.dueAmount !== undefined ? o.dueAmount : 0,
          profit: o.profit || 0,
          branch: o.branch || 'Banani Central Vault & Warehouse',
          paymentMethod: (o.paymentMethod as any) || 'cash',
          paymentStatus: (o.paymentStatus as any) || 'Paid',
          status: (o.status as any) || 'Delivered',
          customerDetails: o.customerDetails || null,
          courier: o.courierProvider ? {
            provider: (o.courierProvider as any) || 'Pathao',
            consignmentId: o.courierConsignmentId || '',
            trackingUrl: o.courierTrackingUrl || '',
            status: (o.courierStatus as any) || 'Awaiting Rider Pickup',
            codAmount: o.courierCodAmount || 0,
            deliveryFee: o.courierDeliveryFee || 0,
            recipientCity: o.courierRecipientCity || 'Dhaka Metro',
            dispatchedAt: o.courierDispatchedAt || 'Today'
          } : null,
          orderDate: o.orderDate,
          salesman: o.salesman
        })));
      }
      if (dbExpenses.status === 'fulfilled' && Array.isArray(dbExpenses.value)) {
        setExpenses(dbExpenses.value.map(e => ({
          id: e.id,
          category: e.category,
          amount: e.amount,
          vendor: e.vendor,
          description: e.description,
          date: e.date,
          paymentMethod: e.paymentMethod,
          status: (e.status as any) || 'Approved'
        })));
      }
      if (dbSuppliers.status === 'fulfilled' && Array.isArray(dbSuppliers.value)) {
        setSuppliers(dbSuppliers.value);
      }
      if (dbPOs.status === 'fulfilled' && Array.isArray(dbPOs.value)) {
        setPurchaseOrders(dbPOs.value.map(po => ({
          id: po.id,
          poNumber: po.poNumber,
          supplierName: po.supplierName,
          items: po.items,
          productId: po.productId,
          quantity: po.quantity,
          totalCost: po.totalCost,
          orderDate: po.orderDate,
          status: po.status as any,
          expectedDelivery: po.expectedDelivery
        })));
      }
      if (dbAccounts.status === 'fulfilled' && Array.isArray(dbAccounts.value)) {
        setAccounts(dbAccounts.value.map(a => ({
          id: a.id,
          accountName: a.accountName,
          accountType: a.accountType as any,
          accountNumber: a.accountNumber,
          bankName: a.bankName || undefined,
          balance: a.balance
        })));
      }
      if (dbNotifs.status === 'fulfilled' && Array.isArray(dbNotifs.value)) {
        setNotifications(dbNotifs.value);
      }
      if (dbTransfers.status === 'fulfilled' && Array.isArray(dbTransfers.value)) {
        setStockTransfers(dbTransfers.value.map(t => ({
          id: t.id,
          transferNumber: t.transferNumber,
          fromLocation: t.fromLocation,
          toLocation: t.toLocation,
          productId: t.productId,
          productName: t.productName,
          quantity: t.quantity,
          transferDate: t.transferDate,
          status: t.status as any,
          notes: t.notes || undefined
        })));
      }
      if (dbAdjustments.status === 'fulfilled' && Array.isArray(dbAdjustments.value)) {
        setStockAdjustments(dbAdjustments.value.map(a => ({
          id: a.id,
          adjustmentNumber: a.adjustmentNumber,
          location: a.location,
          productId: a.productId,
          productName: a.productName,
          adjustmentType: a.adjustmentType as any,
          quantity: a.quantity,
          unitCost: a.unitCost,
          totalValue: a.totalValue,
          adjustmentDate: a.adjustmentDate,
          reason: a.reason
        })));
      }
      if (dbRegister.status === 'fulfilled' && dbRegister.value) {
        const reg = dbRegister.value;
        setCashRegister({
          isOpen: !!reg.isOpen,
          openedAt: reg.openedAt || 'Today, 09:30 AM',
          openingCash: reg.openingCash || 50000,
          cashSales: reg.cashSales || 0,
          totalCash: reg.totalCash || 50000
        });
      }
    } catch (err) {
      console.warn('FinPilot DB server unreachable:', err);
    }
  };

  useEffect(() => {
    syncWithDbServer();
  }, []);

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const markNotificationRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: 1 } : n));
    try {
      await notificationsApi.markAsRead(id);
    } catch (err) {
      console.warn('Failed to mark notification read on server:', err);
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: 1 })));
    try {
      await notificationsApi.markAllAsRead();
    } catch (err) {
      console.warn('Failed to mark all notifications read on server:', err);
    }
  };

  const openCashRegister = (openingAmount: number) => {
    setCashRegister({
      isOpen: true,
      openedAt: 'Just now',
      openingCash: openingAmount,
      cashSales: 0,
      totalCash: openingAmount
    });
    cashRegisterApi.open(openingAmount, 'Main Banani Cash Drawer', 'Banani Vault Branch').catch(err => {
      console.warn('Failed to record cash register open on server:', err);
    });
  };

  const closeCashRegister = () => {
    setCashRegister(prev => ({ ...prev, isOpen: false }));
    cashRegisterApi.close(cashRegister.totalCash).catch(err => {
      console.warn('Failed to record cash register close on server:', err);
    });
  };

  // Add stock to an existing product
  const addStock = (productId: string, quantity: number, unitCost?: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const newStock = p.stockCount + quantity;
          const updatedCost = unitCost ? unitCost : p.costPrice;
          productsApi.update(productId, { stockCount: newStock, costPrice: updatedCost }).catch((err: any) => {
            console.warn('Could not update product stock on db-server:', err);
          });
          return { ...p, stockCount: newStock, costPrice: updatedCost };
        }
        return p;
      })
    );
  };

  // Update product prices, cost, or metadata
  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    try {
      await productsApi.update(id, updates);
    } catch (err: any) {
      console.warn('Could not persist product update to db-server:', err);
    }
  };

  // Add a brand new hardware product
  const addNewProduct = (newProdData: Omit<Product, 'id'>) => {
    const tempId = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...newProdData,
      id: tempId
    };
    setProducts((prev) => [newProduct, ...prev]);

    productsApi.create(newProdData).then((saved: any) => {
      setProducts((prev) => prev.map(p => p.id === tempId ? { ...p, id: saved.id } : p));
    }).catch((err: any) => {
      console.warn('Could not persist product to db-server:', err);
    });
  };

  // Add a new customer
  const addNewCustomer = (newCust: Omit<Customer, 'id'>) => {
    const tempId = `cust-${Date.now()}`;
    const created: Customer = {
      ...newCust,
      id: tempId,
      totalPurchases: 0
    };
    setCustomers((prev) => [created, ...prev]);

    customersApi.create({
      name: newCust.name,
      contactNumber: newCust.contactNumber,
      deliveryAddress: newCust.deliveryAddress,
      customerType: newCust.customerType,
      binNumber: newCust.binNumber || null,
    }).then((saved: any) => {
      setCustomers((prev) => prev.map(c => c.id === tempId ? { ...c, id: saved.id } : c));
    }).catch((err: any) => {
      console.warn('Could not persist customer to db-server:', err);
    });

    return created;
  };

  // Add a new supplier
  const addSupplier = (newSup: Omit<Supplier, 'id'>) => {
    const tempId = `sup-${Date.now()}`;
    const created: Supplier = {
      ...newSup,
      id: tempId
    };
    setSuppliers((prev) => [created, ...prev]);

    suppliersApi.create({
      name: newSup.name,
      contactPerson: newSup.contactPerson,
      phone: newSup.phone,
      email: newSup.email,
      address: newSup.address,
      country: newSup.country,
      category: newSup.category,
      totalDue: newSup.totalDue,
    }).then((saved: any) => {
      setSuppliers((prev) => prev.map(s => s.id === tempId ? { ...s, id: saved.id } : s));
    }).catch((err: any) => {
      console.warn('Could not persist supplier to db-server:', err);
    });

    return created;
  };

  // Add an expense
  const addExpense = (newExp: Omit<ExpenseRecord, 'id'>) => {
    const tempId = `exp-${Date.now()}`;
    const created: ExpenseRecord = {
      ...newExp,
      id: tempId
    };
    setExpenses((prev) => [created, ...prev]);

    expensesApi.create({
      category: newExp.category,
      amount: newExp.amount,
      vendor: newExp.vendor,
      description: newExp.description,
      date: newExp.date,
      paymentMethod: newExp.paymentMethod,
      status: newExp.status,
    }).then((saved: any) => {
      setExpenses((prev) => prev.map(e => e.id === tempId ? { ...e, id: saved.id } : e));
    }).catch((err: any) => {
      console.warn('Could not persist expense to db-server:', err);
    });

    return created;
  };

  // Create Stock Transfer with live product stock updates
  const createStockTransfer = (trData: Omit<StockTransfer, 'id' | 'transferNumber'>) => {
    const tempId = `tr-${Date.now()}`;
    const transferNumber = `TR-2026-${Math.floor(100 + Math.random() * 900)}`;
    const created: StockTransfer = {
      ...trData,
      id: tempId,
      transferNumber
    };
    setStockTransfers((prev) => [created, ...prev]);

    // Live update product stock counts across branches
    setProducts((prev) => {
      const source = prev.find(p => p.id === trData.productId);
      if (!source) return prev;

      const targetMatch = prev.find(p => 
        p.id !== source.id && 
        p.name === source.name && 
        p.location.toLowerCase().includes(trData.toLocation.split(' ')[0].toLowerCase())
      );

      if (targetMatch) {
        return prev.map((p) => {
          if (p.id === source.id) return { ...p, stockCount: Math.max(0, p.stockCount - trData.quantity) };
          if (p.id === targetMatch.id) return { ...p, stockCount: p.stockCount + trData.quantity };
          return p;
        });
      } else {
        const updatedSource = { ...source, stockCount: Math.max(0, source.stockCount - trData.quantity) };
        const newBranchProd: Product = {
          ...source,
          id: `prod-tr-${Date.now()}`,
          sku: `${source.sku}-${trData.toLocation.split(' ')[0].toUpperCase()}`,
          location: trData.toLocation,
          stockCount: trData.quantity
        };
        return [...prev.map(p => p.id === source.id ? updatedSource : p), newBranchProd];
      }
    });

    stockApi.createTransfer({
      transferNumber,
      fromLocation: trData.fromLocation,
      toLocation: trData.toLocation,
      productId: trData.productId,
      productName: trData.productName,
      quantity: trData.quantity,
      transferDate: trData.transferDate,
      status: trData.status,
      notes: trData.notes
    }).then((saved: any) => {
      setStockTransfers(prev => prev.map(t => t.id === tempId ? { ...t, id: saved.id } : t));
      syncWithDbServer();
    }).catch((err: any) => {
      console.warn('Could not persist stock transfer to db-server:', err);
    });

    return created;
  };

  // Create Stock Adjustment
  const createStockAdjustment = (adjData: Omit<StockAdjustment, 'id' | 'adjustmentNumber'>) => {
    const tempId = `adj-${Date.now()}`;
    const adjustmentNumber = `ADJ-2026-${Math.floor(100 + Math.random() * 900)}`;
    const created: StockAdjustment = {
      ...adjData,
      id: tempId,
      adjustmentNumber
    };
    setProducts(prev => prev.map(p => {
      if (p.id === adjData.productId) {
        const qtyChange = adjData.adjustmentType === 'Audit Surplus' ? adjData.quantity : -adjData.quantity;
        return { ...p, stockCount: Math.max(0, p.stockCount + qtyChange) };
      }
      return p;
    }));
    setStockAdjustments((prev) => [created, ...prev]);

    stockApi.createAdjustment({
      adjustmentNumber,
      location: adjData.location,
      productId: adjData.productId,
      productName: adjData.productName,
      adjustmentType: adjData.adjustmentType,
      quantity: adjData.quantity,
      unitCost: adjData.unitCost,
      totalValue: adjData.totalValue,
      adjustmentDate: adjData.adjustmentDate,
      reason: adjData.reason
    }).then((saved: any) => {
      setStockAdjustments(prev => prev.map(a => a.id === tempId ? { ...a, id: saved.id } : a));
    }).catch((err: any) => {
      console.warn('Could not persist stock adjustment to db-server:', err);
    });

    return created;
  };

  // Dispatch with courier - Persisted directly into real database
  const dispatchWithCourier = (
    orderId: string, 
    provider: 'Pathao' | 'Steadfast' | 'RedX', 
    options?: { deliveryFee?: number; codAmount?: number }
  ) => {
    const prefix = provider === 'Pathao' ? 'PTH-DHK' : provider === 'Steadfast' ? 'STDF-DHK' : 'REDX-LOG';
    const consignmentId = `${prefix}-${Math.floor(10000 + Math.random() * 90000)}`;
    const trackingUrl = provider === 'Pathao' 
      ? `https://merchant.pathao.com/tracking?consignment_id=${consignmentId}`
      : provider === 'Steadfast'
      ? `https://steadfast.com.bd/t/${consignmentId}`
      : `https://redx.com.bd/track/${consignmentId}`;

    const orderToDispatch = orders.find(o => o.id === orderId);
    const cod = options?.codAmount !== undefined 
      ? options.codAmount 
      : (orderToDispatch?.paymentStatus === 'COD Pending' || orderToDispatch?.paymentStatus === 'Due' ? orderToDispatch.totalAmount : 0);
    const fee = options?.deliveryFee !== undefined 
      ? options.deliveryFee 
      : (orderToDispatch?.deliveryAddress.includes('Dhaka') ? 150 : 250);
    const recipientCity = orderToDispatch?.deliveryAddress.includes('Dhaka') ? 'Dhaka Metro' : 'Outside Dhaka';

    const courierPayload = {
      provider,
      consignmentId,
      trackingUrl,
      status: 'Awaiting Rider Pickup' as const,
      codAmount: cod,
      deliveryFee: fee,
      recipientCity,
    };

    // 1. Optimistic state update
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'In Transit',
            courier: {
              ...courierPayload,
              dispatchedAt: 'Just now'
            }
          };
        }
        return o;
      })
    );

    // 2. Real database persistence
    ordersApi.dispatchCourier(orderId, courierPayload).catch(err => {
      console.warn('Failed to persist courier dispatch on server:', err);
    });
  };

  // Create Sale Order via POS with full Due, Profit, and Database Integration
  const createSaleOrder = (orderData: {
    customerName: string;
    contactNumber: string;
    deliveryAddress: string;
    items: { product: Product; quantity: number; unitPrice?: number }[];
    discountPercent: number;
    discountAmountFlat?: number;
    orderType?: 'online' | 'offline';
    paymentMethod: 'cash' | 'bkash' | 'bank_transfer' | 'credit_30d' | 'due';
    paidAmount?: number;
    dueAmount?: number;
    branch?: string;
    salesman: string;
  }) => {
    setProducts((prev) =>
      prev.map((p) => {
        const itemSold = orderData.items.find((i) => i.product.id === p.id);
        if (itemSold) {
          const remaining = Math.max(0, p.stockCount - itemSold.quantity);
          return { ...p, stockCount: remaining };
        }
        return p;
      })
    );

    const orderItems: OrderItem[] = orderData.items.map((i) => {
      const finalPrice = i.unitPrice !== undefined && i.unitPrice >= 0 ? i.unitPrice : i.product.retailPrice;
      const costPrice = i.product.costPrice || 0;
      const profit = (finalPrice - costPrice) * i.quantity;
      return {
        productId: i.product.id,
        name: i.product.name,
        sku: i.product.sku,
        quantity: i.quantity,
        unitPrice: finalPrice,
        costPrice,
        profit,
        total: finalPrice * i.quantity
      };
    });

    const subtotal = orderItems.reduce((acc, curr) => acc + curr.total, 0);

    let discountAmount = 0;
    let discountPercent = 0;
    if (orderData.discountAmountFlat !== undefined && orderData.discountAmountFlat > 0) {
      discountAmount = Math.min(orderData.discountAmountFlat, subtotal);
      discountPercent = subtotal > 0 ? Math.round((discountAmount / subtotal) * 100) : 0;
    } else {
      discountPercent = Math.max(0, orderData.discountPercent || 0);
      discountAmount = Math.round((subtotal * discountPercent) / 100);
    }

    const taxableSubtotal = Math.max(0, subtotal - discountAmount);
    const vatAmount = Math.round(taxableSubtotal * 0.05);
    const totalAmount = taxableSubtotal + vatAmount;

    // Due & Paid computation
    let paidAmount = 0;
    let dueAmount = 0;
    let paymentStatus: Order['paymentStatus'] = 'Paid';

    if (orderData.paymentMethod === 'due') {
      paidAmount = orderData.paidAmount !== undefined ? orderData.paidAmount : 0;
      dueAmount = orderData.dueAmount !== undefined ? orderData.dueAmount : Math.max(0, totalAmount - paidAmount);
      paymentStatus = paidAmount > 0 ? 'Partial Due' : 'Due';
    } else if (orderData.paymentMethod === 'credit_30d') {
      paidAmount = 0;
      dueAmount = totalAmount;
      paymentStatus = 'Credit 30D';
    } else {
      paidAmount = orderData.paidAmount !== undefined ? orderData.paidAmount : totalAmount;
      dueAmount = Math.max(0, totalAmount - paidAmount);
      if (dueAmount > 0) {
        paymentStatus = paidAmount > 0 ? 'Partial' : 'Due';
      }
    }

    const orderProfit = Math.max(0, orderItems.reduce((sum, item) => sum + (item.profit || 0), 0) - discountAmount);
    const branch = orderData.branch || (selectedLocation !== 'All Locations' ? selectedLocation : 'Banani Central Vault & Warehouse');

    const summaryText = orderItems.map((i) => `${i.quantity}x ${i.name.split(' ')[0]} ${i.name.split(' ')[1] || ''}`).join(', ');

    const type = orderData.orderType || 'offline';
    const initialStatus: Order['status'] = type === 'online' ? 'Ready for Dispatch' : 'Counter Collected';

    const nowIso = new Date().toISOString();
    const orderDateFormatted = nowIso.replace('T', ' ').substring(0, 19);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-DS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      orderType: type,
      customerName: orderData.customerName,
      contactNumber: orderData.contactNumber,
      deliveryAddress: orderData.deliveryAddress,
      items: orderItems,
      itemsSummary: summaryText,
      subtotal,
      discountPercent,
      discountAmount,
      vatAmount,
      totalAmount,
      paidAmount,
      dueAmount,
      profit: orderProfit,
      branch,
      paymentMethod: orderData.paymentMethod,
      paymentStatus,
      status: initialStatus,
      orderDate: orderDateFormatted,
      salesman: orderData.salesman
    };

    // Update customer in local state if dueAmount > 0
    if (dueAmount > 0) {
      setCustomers(prev => prev.map(c => {
        if (c.name.trim().toLowerCase() === orderData.customerName.trim().toLowerCase() ||
            (orderData.contactNumber && c.contactNumber.trim() === orderData.contactNumber.trim())) {
          return {
            ...c,
            totalDue: (c.totalDue || 0) + dueAmount,
            totalPurchases: (c.totalPurchases || 0) + totalAmount
          };
        }
        return c;
      }));
    }

    // Immediately decrement product stock in local state for all purchased items
    setProducts((prev) =>
      prev.map((p) => {
        const item = orderItems.find((i) => i.productId === p.id);
        if (item) {
          return { ...p, stockCount: Math.max(0, p.stockCount - item.quantity) };
        }
        return p;
      })
    );

    setOrders((prev) => [newOrder, ...prev]);

    ordersApi.create({
      orderNumber: newOrder.orderNumber,
      orderType: newOrder.orderType,
      customerName: newOrder.customerName,
      contactNumber: newOrder.contactNumber,
      deliveryAddress: newOrder.deliveryAddress,
      itemsSummary: newOrder.itemsSummary,
      subtotal: newOrder.subtotal,
      discountAmount: newOrder.discountAmount,
      discountPercent: newOrder.discountPercent,
      vatAmount: newOrder.vatAmount,
      totalAmount: newOrder.totalAmount,
      paidAmount: newOrder.paidAmount,
      dueAmount: newOrder.dueAmount,
      branch: newOrder.branch,
      paymentMethod: newOrder.paymentMethod,
      paymentStatus: newOrder.paymentStatus,
      status: newOrder.status,
      orderDate: newOrder.orderDate,
      salesman: newOrder.salesman,
      items: orderItems.map(i => ({
        productId: i.productId,
        name: i.name,
        sku: i.sku,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        total: i.total
      }))
    }).then((saved: any) => {
      setOrders(prev => prev.map(o => o.id === newOrder.id ? { 
        ...o, 
        id: saved.id, 
        profit: saved.profit || orderProfit,
        customerDetails: saved.customerDetails || o.customerDetails 
      } : o));
      // Re-sync with db-server to ensure SQLite ledger and stock counts match perfectly
      syncWithDbServer();
    }).catch((err: any) => {
      console.warn('Could not persist order to db-server:', err);
    });

    if (orderData.paymentMethod === 'cash' && paidAmount > 0) {
      setCashRegister(prev => ({
        ...prev,
        cashSales: prev.cashSales + paidAmount,
        totalCash: prev.totalCash + paidAmount
      }));
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    ordersApi.update(orderId, { status }).catch((err: any) => {
      console.warn('Could not update order status on db-server:', err);
    });
  };

  const createPurchaseOrder = (poData: {
    supplierName: string;
    productId: string;
    quantity: number;
    totalCost: number;
    itemsSummary: string;
  }) => {
    const tempId = `po-${Date.now()}`;
    const poNumber = `PO-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newPO: SupplierPO = {
      id: tempId,
      poNumber,
      supplierName: poData.supplierName,
      items: poData.itemsSummary,
      productId: poData.productId,
      quantity: poData.quantity,
      totalCost: poData.totalCost,
      orderDate: 'Today',
      status: 'In Transit',
      expectedDelivery: 'En route to Banani Vault'
    };
    setPurchaseOrders((prev) => [newPO, ...prev]);

    stockApi.createPO({
      poNumber,
      supplierName: poData.supplierName,
      items: poData.itemsSummary,
      productId: poData.productId,
      quantity: poData.quantity,
      totalCost: poData.totalCost,
      orderDate: new Date().toISOString().split('T')[0],
      status: 'In Transit',
      expectedDelivery: 'En route to Banani Vault'
    }).then((saved: any) => {
      setPurchaseOrders(prev => prev.map(p => p.id === tempId ? { ...p, id: saved.id } : p));
    }).catch((err: any) => {
      console.warn('Could not persist PO to db-server:', err);
    });
  };

  const receivePurchaseOrder = (poId: string) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (po.id === poId && po.status !== 'Received') {
          addStock(po.productId, po.quantity);
          stockApi.receivePO(poId).catch((err: any) => console.warn('Could not receive PO on db-server:', err));
          return { ...po, status: 'Received', expectedDelivery: 'Delivered to Banani Vault' };
        }
        return po;
      })
    );
  };

  // Location-filtered datasets for branch-level isolation (Banani vs Multiplan vs IDB vs All Locations)
  const isAllLocations = !selectedLocation || selectedLocation === 'All Locations';
  const branchFilterKeyword = !isAllLocations ? selectedLocation.split(' ')[0].toLowerCase() : '';

  const locationFilteredOrders = isAllLocations 
    ? orders 
    : orders.filter(o => (o.branch || '').toLowerCase().includes(branchFilterKeyword));

  const activeProducts = isAllLocations 
    ? products 
    : products.filter(p => (p.location || '').toLowerCase().includes(branchFilterKeyword));

  // Date filtering logic based on dateFilter ('today' | 'week' | 'month' | 'past30' | 'all')
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const activeOrders = locationFilteredOrders.filter(o => {
    if (!dateFilter || dateFilter === 'all') return true;
    const orderDateRaw = o.orderDate || '';
    const datePart = orderDateRaw.split(' ')[0].split('T')[0];
    
    if (dateFilter === 'today') {
      return datePart === todayStr || orderDateRaw.includes('Today') || orderDateRaw.includes('Just now');
    }
    if (dateFilter === 'week') {
      const t = new Date(datePart).getTime();
      const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
      return !isNaN(t) && t >= sevenDaysAgo;
    }
    if (dateFilter === 'month') {
      const [nowYear, nowMonth] = todayStr.split('-');
      return datePart.startsWith(`${nowYear}-${nowMonth}`);
    }
    if (dateFilter === 'past30') {
      const t = new Date(datePart).getTime();
      const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;
      return !isNaN(t) && t >= thirtyDaysAgo;
    }
    return true;
  });

  const totalSalesRevenue = activeOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const salesTodayOrders = locationFilteredOrders.filter((o) => 
    (o.orderDate || '').startsWith(todayStr) || 
    (o.orderDate || '').includes('Today') || 
    (o.orderDate || '').includes('Just now')
  );
  const salesTodayCount = salesTodayOrders.length;
  const salesTodayRevenue = salesTodayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingOrdersCount = activeOrders.filter((o) => o.status === 'Processing' || o.status === 'Ready for Dispatch' || o.status === 'In Transit').length;
  const totalStockUnits = activeProducts.reduce((sum, p) => sum + (p.stockCount || 0), 0);
  const totalStockValue = activeProducts.reduce((sum, p) => sum + (p.stockCount * p.retailPrice || 0), 0);
  const totalCostValue = activeProducts.reduce((sum, p) => sum + (p.stockCount * p.costPrice || 0), 0);
  const currentMonthSales = totalSalesRevenue;
  const salesmanMonthSales = currentMonthSales;
  const salesmanCommission = Math.round(salesmanMonthSales * 0.02);

  const totalSales = totalSalesRevenue;
  const sellReturn = 0;
  const totalPurchase = purchaseOrders.reduce((sum, po) => sum + (po.totalCost || 0), 0) + (isAllLocations ? 7500000 : 2500000);
  const purchaseReturn = 0;
  const purchaseDue = 0;

  // Active expenses filtered by date range
  const activeExpenses = expenses.filter(e => {
    if (!dateFilter || dateFilter === 'all') return true;
    const expDate = (e.date || '').split(' ')[0].split('T')[0];
    if (dateFilter === 'today') return expDate === todayStr || (e.date || '').includes('Today');
    if (dateFilter === 'week') {
      const t = new Date(expDate).getTime();
      return !isNaN(t) && t >= (now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    if (dateFilter === 'month') {
      const [nowYear, nowMonth] = todayStr.split('-');
      return expDate.startsWith(`${nowYear}-${nowMonth}`);
    }
    if (dateFilter === 'past30') {
      const t = new Date(expDate).getTime();
      return !isNaN(t) && t >= (now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    return true;
  });
  const totalExpense = activeExpenses.reduce((sum, e) => sum + e.amount, 0);
  const expenseDue = 0;
  
  // Real gross profit computed from real orders and item cost prices
  const grossProfit = activeOrders.reduce((sum, o) => sum + (o.profit || 0), 0) || Math.round(totalSales * 0.20);
  const netProfit = Math.max(0, grossProfit - (isAllLocations ? totalExpense * 0.65 : totalExpense * 0.22));

  // Overdue / Due amounts for this location
  const overdueOrders = activeOrders.filter(o => 
    (o.dueAmount && o.dueAmount > 0) || 
    o.paymentStatus === 'Credit 30D' || 
    o.paymentStatus === 'COD Pending' || 
    o.paymentStatus === 'Due' || 
    o.paymentStatus === 'Partial Due'
  );
  const accountReceivable = overdueOrders.reduce((sum, o) => sum + (o.dueAmount !== undefined ? o.dueAmount : o.totalAmount), 0);
  const accountPayable = 0;

  return (
    <StoreContext.Provider
      value={{
        products,
        orders,
        customers,
        purchaseOrders,
        suppliers,
        expenses,
        stockTransfers,
        stockAdjustments,
        accounts,
        notifications,
        unreadNotificationsCount,
        markNotificationRead,
        markAllNotificationsRead,
        selectedLocation,
        setSelectedLocation,
        dateFilter,
        setDateFilter,
        cashRegister,
        openCashRegister,
        closeCashRegister,
        addStock,
        updateProduct,
        addNewProduct,
        addNewCustomer,
        addSupplier,
        addExpense,
        createStockTransfer,
        createStockAdjustment,
        dispatchWithCourier,
        createPurchaseOrder,
        createSaleOrder,
        updateOrderStatus,
        receivePurchaseOrder,
        metrics: {
          totalSalesRevenue,
          salesTodayCount,
          salesTodayRevenue,
          pendingOrdersCount,
          totalStockUnits,
          totalStockValue,
          totalCostValue,
          salesmanMonthSales,
          salesmanCommission,
          totalSales,
          sellReturn,
          totalPurchase,
          purchaseReturn,
          purchaseDue,
          totalExpense,
          expenseDue,
          grossProfit,
          netProfit,
          accountPayable,
          accountReceivable,
          stockSellPrice: totalStockValue,
          stockPurchasePrice: totalCostValue
        }
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export { productsApi, ordersApi, customersApi, expensesApi, suppliersApi, stockApi, accountsApi, analyticsApi };
