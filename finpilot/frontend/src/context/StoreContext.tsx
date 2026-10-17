import React, { createContext, useContext, useState, useEffect } from 'react';

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
  deliveryAddress: string;
  customerType: 'Wholesale' | 'Retail' | 'Corporate';
  binNumber?: string;
  totalPurchases?: number;
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
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderType: 'online' | 'offline';
  customerName: string;
  contactNumber: string;
  deliveryAddress: string;
  items: OrderItem[];
  itemsSummary: string;
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  vatAmount: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'bkash' | 'bank_transfer' | 'credit_30d';
  paymentStatus: 'Paid' | 'Credit 30D' | 'Partial' | 'COD Pending';
  status: 'Processing' | 'Ready for Dispatch' | 'In Transit' | 'Delivered' | 'Counter Collected';
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

export const defaultSuppliers: Supplier[] = [
  {
    id: "sup-1",
    name: "ASUS Regional Distribution (Singapore)",
    contactPerson: "David Lin (APAC Channel Lead)",
    phone: "+65 6741-2389",
    email: "apac.orders@asus.sg",
    address: "15 Changi Business Park Central 1, Singapore",
    country: "Singapore",
    category: "Motherboards & GPUs",
    totalPurchase: 4800000,
    totalDue: 0
  },
  {
    id: "sup-2",
    name: "Intel South Asia Authorized Distributor",
    contactPerson: "Rajiv Sharma (Enterprise Sales)",
    phone: "+880 1713-998877",
    email: "distributor.bd@intel.com",
    address: "Gulshan-2, Dhaka-1212, Bangladesh",
    country: "Bangladesh / Regional",
    category: "Processors (CPUs)",
    totalPurchase: 4653000,
    totalDue: 0
  },
  {
    id: "sup-3",
    name: "Zotac Technology Limited (Hong Kong)",
    contactPerson: "Kenji Wong (Export Director)",
    phone: "+852 2795-8888",
    email: "b2b.asia@zotac.com",
    address: "Tower 2, Grand Central Plaza, Shatin, Hong Kong",
    country: "Hong Kong",
    category: "Graphics Cards",
    totalPurchase: 3760000,
    totalDue: 0
  },
  {
    id: "sup-4",
    name: "Samsung Electronics APAC Logistics",
    contactPerson: "Min-ho Park",
    phone: "+65 6833-3111",
    email: "semiconductor.sales@samsung.com",
    address: "30 Pasir Panjang Road, Mapletree Business City, Singapore",
    country: "Singapore",
    category: "Storage & NVMe SSDs",
    totalPurchase: 1720000,
    totalDue: 0
  },
  {
    id: "sup-5",
    name: "Corsair Components Pte Ltd",
    contactPerson: "Marcus Vance",
    phone: "+852 3582-8000",
    email: "supply.asia@corsair.com",
    address: "Kwun Tong, Kowloon, Hong Kong",
    country: "Hong Kong",
    category: "RAM & Power Supplies",
    totalPurchase: 1464000,
    totalDue: 0
  },
  {
    id: "sup-6",
    name: "Micro-Star International (MSI) Taiwan",
    contactPerson: "Eileen Chen",
    phone: "+886 2 3234-5599",
    email: "sales.bd@msi.com",
    address: "Zhonghe District, New Taipei City, Taiwan",
    country: "Taiwan",
    category: "Monitors & Coolers",
    totalPurchase: 2155000,
    totalDue: 0
  }
];

export const defaultExpenses: ExpenseRecord[] = [
  { id: "exp-1", category: "Customs & Port Duty", amount: 295000, vendor: "Customs Authority BD", description: "Chittagong Port customs duty & AIT for GPU container", date: "05 Oct 2026", paymentMethod: "Corporate Bank Wire", status: "Approved" },
  { id: "exp-2", category: "Salaries & Payroll", amount: 195000, vendor: "Staff Bank Accounts", description: "Monthly sales staff base salary + incentive bonus", date: "01 Oct 2026", paymentMethod: "BEFTN Bank Transfer", status: "Approved" },
  { id: "exp-3", category: "Rent & Lease", amount: 95000, vendor: "Multiplan Management Ltd.", description: "Banani Central Vault & Multiplan Showroom lease", date: "02 Oct 2026", paymentMethod: "Corporate Bank Wire", status: "Approved" },
  { id: "exp-4", category: "Logistics & Couriers", amount: 48000, vendor: "Pathao / Steadfast Logistics", description: "E-commerce customer delivery fees & air express freight", date: "10 Oct 2026", paymentMethod: "bKash Merchant", status: "Approved" },
  { id: "exp-5", category: "Marketing & Community", amount: 35000, vendor: "Meta Business BD", description: "PC Builder gaming community promotions & Facebook ads", date: "04 Oct 2026", paymentMethod: "Corporate Card", status: "Approved" },
  { id: "exp-6", category: "Utilities & Fiber", amount: 21500, vendor: "DESCO / AmberIT", description: "Commercial 3-phase electricity & dedicated fiber lease line", date: "03 Oct 2026", paymentMethod: "Bank Transfer", status: "Approved" },
  { id: "exp-7", category: "Packaging & Transport", amount: 14000, vendor: "Dhaka Packaging Mart", description: "Anti-static bubble film, GPU protection boxes & straps", date: "08 Oct 2026", paymentMethod: "Cash", status: "Approved" },
  
  // September 2026
  { id: "exp-8", category: "Customs & Port Duty", amount: 310000, vendor: "Customs Authority BD", description: "Chittagong Port duty on Intel processors shipment", date: "06 Sep 2026", paymentMethod: "Corporate Bank Wire", status: "Approved" },
  { id: "exp-9", category: "Salaries & Payroll", amount: 195000, vendor: "Staff Bank Accounts", description: "Monthly staff salaries & sales commission", date: "01 Sep 2026", paymentMethod: "BEFTN Bank Transfer", status: "Approved" },
  { id: "exp-10", category: "Rent & Lease", amount: 95000, vendor: "Multiplan Management Ltd.", description: "Banani Vault & Multiplan commercial rent", date: "02 Sep 2026", paymentMethod: "Corporate Bank Wire", status: "Approved" },
  { id: "exp-11", category: "Logistics & Couriers", amount: 44000, vendor: "Pathao / Steadfast Logistics", description: "Courier dispatch charges & regional delivery", date: "12 Sep 2026", paymentMethod: "bKash Merchant", status: "Approved" },
  
  // August 2026
  { id: "exp-12", category: "Customs & Port Duty", amount: 285000, vendor: "Customs Authority BD", description: "Chittagong Port duty on Corsair memory & PSUs", date: "08 Aug 2026", paymentMethod: "Corporate Bank Wire", status: "Approved" },
  { id: "exp-13", category: "Salaries & Payroll", amount: 195000, vendor: "Staff Bank Accounts", description: "August staff salaries", date: "01 Aug 2026", paymentMethod: "BEFTN Bank Transfer", status: "Approved" },
  { id: "exp-14", category: "Rent & Lease", amount: 95000, vendor: "Multiplan Management Ltd.", description: "August showroom rent", date: "02 Aug 2026", paymentMethod: "Corporate Bank Wire", status: "Approved" }
];

export const defaultStockTransfers: StockTransfer[] = [
  {
    id: "tr-1",
    transferNumber: "TR-2026-001",
    fromLocation: "Banani Central Vault #B4",
    toLocation: "Elephant Road Multiplan Branch",
    productId: "prod-1",
    productName: "NVIDIA GeForce RTX 4070 Ti Super 16GB",
    quantity: 6,
    transferDate: "15 Oct 2026",
    status: "Completed",
    notes: "Restock retail display cabinet for weekend footfall"
  },
  {
    id: "tr-2",
    transferNumber: "TR-2026-002",
    fromLocation: "Banani Central Vault #A1",
    toLocation: "BCS Computer City IDB Branch",
    productId: "prod-5",
    productName: "Intel Core i7-14700K 20-Core Processor",
    quantity: 10,
    transferDate: "16 Oct 2026",
    status: "Completed",
    notes: "Inter-branch transfer for corporate PC builds"
  },
  {
    id: "tr-3",
    transferNumber: "TR-2026-003",
    fromLocation: "Warehouse Shelf #S1",
    toLocation: "Elephant Road Multiplan Branch",
    productId: "prod-15",
    productName: "Samsung 990 Pro 2TB PCIe 4.0 NVMe SSD",
    quantity: 12,
    transferDate: "17 Oct 2026",
    status: "In Transit",
    notes: "Courier rider transfer in progress"
  }
];

export const defaultStockAdjustments: StockAdjustment[] = [
  {
    id: "adj-1",
    adjustmentNumber: "ADJ-2026-001",
    location: "Banani Central Vault",
    productId: "prod-19",
    productName: "DeepCool PK650D 650W Power Supply",
    adjustmentType: "Damaged",
    quantity: 2,
    unitCost: 4200,
    totalValue: 8400,
    adjustmentDate: "14 Oct 2026",
    reason: "Outer chassis dented during airport cargo transit"
  },
  {
    id: "adj-2",
    adjustmentNumber: "ADJ-2026-002",
    location: "Multiplan Branch Shelf #M1",
    productId: "prod-14",
    productName: "Team T-Force Delta RGB 16GB DDR4",
    adjustmentType: "Audit Surplus",
    quantity: 3,
    unitCost: 4200,
    totalValue: 12600,
    adjustmentDate: "10 Oct 2026",
    reason: "Physical inventory reconciliation surplus from bulk shipment"
  }
];

export const defaultAccounts: PaymentAccount[] = [
  {
    id: "acc-1",
    accountName: "Banani Showroom POS Cash Drawer",
    accountType: "Cash Drawer",
    accountNumber: "DRAWER-01",
    balance: 185400
  },
  {
    id: "acc-2",
    accountName: "The City Bank Limited (Corporate Current A/C)",
    accountType: "Bank Account",
    accountNumber: "1102948192001",
    bankName: "The City Bank Ltd (Banani Branch)",
    balance: 1845000
  },
  {
    id: "acc-3",
    accountName: "bKash Merchant Gateway",
    accountType: "MFS (bKash/Nagad)",
    accountNumber: "01711-234567",
    balance: 245000
  },
  {
    id: "acc-4",
    accountName: "Brac Bank SME Operating A/C",
    accountType: "Bank Account",
    accountNumber: "1501204928172001",
    bankName: "Brac Bank PLC",
    balance: 780000
  }
];


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
    paymentMethod: 'cash' | 'bkash' | 'bank_transfer' | 'credit_30d';
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
    // ERP Cards metrics
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

export const defaultProducts: Product[] = [
  {
    "id": "prod-1",
    "name": "NVIDIA GeForce RTX 4070 Ti Super 16GB GDDR6X",
    "sku": "GPU-RTX4070TI-16G",
    "category": "Graphics Cards",
    "brand": "Zotac Gaming",
    "retailPrice": 118500,
    "costPrice": 94000,
    "stockCount": 38,
    "unit": "Units",
    "minThreshold": 15,
    "location": "Banani Central Vault #B4",
    "warranty": "3 Years Official"
  },
  {
    "id": "prod-2",
    "name": "MSI GeForce RTX 4060 Ventus 2X Black 8GB OC GDDR6",
    "sku": "GPU-RTX4060-8G",
    "category": "Graphics Cards",
    "brand": "MSI",
    "retailPrice": 38500,
    "costPrice": 31500,
    "stockCount": 74,
    "unit": "Units",
    "minThreshold": 20,
    "location": "Showroom Shelf #G2",
    "warranty": "3 Years Replacement"
  },
  {
    "id": "prod-3",
    "name": "ASUS TUF Gaming GeForce RTX 4080 Super 16GB GDDR6X",
    "sku": "GPU-RTX4080S-16G",
    "category": "Graphics Cards",
    "brand": "ASUS",
    "retailPrice": 148000,
    "costPrice": 122000,
    "stockCount": 14,
    "unit": "Units",
    "minThreshold": 10,
    "location": "Banani Vault #B1",
    "warranty": "3 Years Official"
  },
  {
    "id": "prod-4",
    "name": "Sapphire PULSE AMD Radeon RX 7800 XT 16GB Gaming GPU",
    "sku": "GPU-RX7800XT-16G",
    "category": "Graphics Cards",
    "brand": "Sapphire",
    "retailPrice": 68500,
    "costPrice": 55000,
    "stockCount": 22,
    "unit": "Units",
    "minThreshold": 12,
    "location": "Multiplan Branch #M1",
    "warranty": "2 Years"
  },
  {
    "id": "prod-5",
    "name": "Intel Core i7-14700K 20-Core 28-Thread LGA1700 Processor",
    "sku": "CPU-INTEL-14700K",
    "category": "Processors",
    "brand": "Intel",
    "retailPrice": 48000,
    "costPrice": 38500,
    "stockCount": 28,
    "unit": "Units",
    "minThreshold": 20,
    "location": "Banani Central Vault #A1",
    "warranty": "3 Years Replacement"
  },
  {
    "id": "prod-6",
    "name": "Intel Core i5-14400 10-Core 16-Thread Desktop Processor",
    "sku": "CPU-INTEL-14400",
    "category": "Processors",
    "brand": "Intel",
    "retailPrice": 24500,
    "costPrice": 19800,
    "stockCount": 65,
    "unit": "Units",
    "minThreshold": 25,
    "location": "Showroom Shelf #C1",
    "warranty": "3 Years Replacement"
  },
  {
    "id": "prod-7",
    "name": "AMD Ryzen 7 7800X3D 8-Core 16-Thread Gaming Processor",
    "sku": "CPU-AMD-7800X3D",
    "category": "Processors",
    "brand": "AMD",
    "retailPrice": 52000,
    "costPrice": 41000,
    "stockCount": 19,
    "unit": "Units",
    "minThreshold": 15,
    "location": "Banani Central Vault #A2",
    "warranty": "3 Years Official"
  },
  {
    "id": "prod-8",
    "name": "AMD Ryzen 5 7600X 6-Core 12-Thread AM5 Gaming Processor",
    "sku": "CPU-AMD-7600X",
    "category": "Processors",
    "brand": "AMD",
    "retailPrice": 26000,
    "costPrice": 20500,
    "stockCount": 42,
    "unit": "Units",
    "minThreshold": 20,
    "location": "Multiplan Branch #A3",
    "warranty": "3 Years Official"
  },
  {
    "id": "prod-9",
    "name": "ASUS ROG Strix Z790-E Gaming WiFi II DDR5 Motherboard",
    "sku": "MB-ASUS-Z790E-WIFI",
    "category": "Motherboards",
    "brand": "ASUS",
    "retailPrice": 62000,
    "costPrice": 49500,
    "stockCount": 16,
    "unit": "Units",
    "minThreshold": 15,
    "location": "Banani Vault #M2",
    "warranty": "3 Years Official"
  },
  {
    "id": "prod-10",
    "name": "MSI PRO B760M-A WiFi DDR5 mATX Motherboard",
    "sku": "MB-MSI-B760M-PRO",
    "category": "Motherboards",
    "brand": "MSI",
    "retailPrice": 19500,
    "costPrice": 15200,
    "stockCount": 48,
    "unit": "Units",
    "minThreshold": 20,
    "location": "Warehouse Shelf #M4",
    "warranty": "3 Years"
  },
  {
    "id": "prod-11",
    "name": "Gigabyte B650M Gaming WiFi AM5 Motherboard",
    "sku": "MB-GIGABYTE-B650M",
    "category": "Motherboards",
    "brand": "Gigabyte",
    "retailPrice": 17800,
    "costPrice": 14000,
    "stockCount": 54,
    "unit": "Units",
    "minThreshold": 20,
    "location": "Showroom Shelf #M5",
    "warranty": "3 Years"
  },
  {
    "id": "prod-12",
    "name": "Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz CL30",
    "sku": "RAM-CORSAIR-32GB-DDR5",
    "category": "Memory (RAM)",
    "brand": "Corsair",
    "retailPrice": 15200,
    "costPrice": 11800,
    "stockCount": 95,
    "unit": "Kits",
    "minThreshold": 30,
    "location": "Warehouse Shelf #R2",
    "warranty": "Lifetime Official"
  },
  {
    "id": "prod-13",
    "name": "G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6400MHz",
    "sku": "RAM-GSKILL-32GB-DDR5",
    "category": "Memory (RAM)",
    "brand": "G.Skill",
    "retailPrice": 18500,
    "costPrice": 14200,
    "stockCount": 58,
    "unit": "Kits",
    "minThreshold": 25,
    "location": "Banani Vault #R1",
    "warranty": "Lifetime Official"
  },
  {
    "id": "prod-14",
    "name": "Team T-Force Delta RGB 16GB (2x8GB) DDR4 3200MHz",
    "sku": "RAM-TEAM-16GB-DDR4",
    "category": "Memory (RAM)",
    "brand": "TeamGroup",
    "retailPrice": 5800,
    "costPrice": 4200,
    "stockCount": 120,
    "unit": "Kits",
    "minThreshold": 40,
    "location": "Warehouse Shelf #R3",
    "warranty": "Lifetime Official"
  },
  {
    "id": "prod-15",
    "name": "Samsung 990 Pro 2TB PCIe 4.0 M.2 NVMe Internal SSD",
    "sku": "SSD-SAMSUNG-990P-2TB",
    "category": "Storage",
    "brand": "Samsung",
    "retailPrice": 22500,
    "costPrice": 17200,
    "stockCount": 62,
    "unit": "Units",
    "minThreshold": 25,
    "location": "Warehouse Shelf #S1",
    "warranty": "5 Years"
  },
  {
    "id": "prod-16",
    "name": "Western Digital Black SN850X 1TB PCIe 4.0 NVMe SSD",
    "sku": "SSD-WD-BLACK-1TB",
    "category": "Storage",
    "brand": "Western Digital",
    "retailPrice": 12800,
    "costPrice": 9800,
    "stockCount": 82,
    "unit": "Units",
    "minThreshold": 30,
    "location": "Warehouse Shelf #S2",
    "warranty": "5 Years"
  },
  {
    "id": "prod-17",
    "name": "Kingston NV2 1TB PCIe 4.0 M.2 NVMe SSD",
    "sku": "SSD-KINGSTON-NV2-1TB",
    "category": "Storage",
    "brand": "Kingston",
    "retailPrice": 7400,
    "costPrice": 5600,
    "stockCount": 145,
    "unit": "Units",
    "minThreshold": 50,
    "location": "Showroom Shelf #S3",
    "warranty": "3 Years"
  },
  {
    "id": "prod-18",
    "name": "Corsair RM850x 850W 80 PLUS Gold Fully Modular PSU",
    "sku": "PSU-CORSAIR-850W",
    "category": "Power Supplies",
    "brand": "Corsair",
    "retailPrice": 16800,
    "costPrice": 13000,
    "stockCount": 38,
    "unit": "Units",
    "minThreshold": 20,
    "location": "Warehouse Shelf #P3",
    "warranty": "10 Years"
  },
  {
    "id": "prod-19",
    "name": "DeepCool PK650D 650W 80 PLUS Bronze Power Supply",
    "sku": "PSU-DEEPCOOL-650W",
    "category": "Power Supplies",
    "brand": "DeepCool",
    "retailPrice": 5600,
    "costPrice": 4200,
    "stockCount": 72,
    "unit": "Units",
    "minThreshold": 25,
    "location": "Showroom Shelf #P1",
    "warranty": "5 Years"
  },
  {
    "id": "prod-20",
    "name": "MSI MAG CoreLiquid 360R V2 ARGB AIO Liquid CPU Cooler",
    "sku": "COOL-MSI-360R-V2",
    "category": "Cooling",
    "brand": "MSI",
    "retailPrice": 14500,
    "costPrice": 11000,
    "stockCount": 28,
    "unit": "Units",
    "minThreshold": 15,
    "location": "Warehouse Shelf #C1",
    "warranty": "2 Years"
  },
  {
    "id": "prod-21",
    "name": "DeepCool AK400 Zero Dark Performance CPU Air Cooler",
    "sku": "COOL-DEEPCOOL-AK400",
    "category": "Cooling",
    "brand": "DeepCool",
    "retailPrice": 3800,
    "costPrice": 2800,
    "stockCount": 68,
    "unit": "Units",
    "minThreshold": 20,
    "location": "Showroom Shelf #C2",
    "warranty": "3 Years"
  },
  {
    "id": "prod-22",
    "name": "Lian Li O11 Dynamic EVO RGB Gaming Desktop Casing",
    "sku": "CASE-LIANLI-O11D",
    "category": "Casings",
    "brand": "Lian Li",
    "retailPrice": 21500,
    "costPrice": 16800,
    "stockCount": 20,
    "unit": "Units",
    "minThreshold": 12,
    "location": "Banani Vault #K1",
    "warranty": "1 Year"
  },
  {
    "id": "prod-23",
    "name": "Montech Air 903 Max E-ATX Mid-Tower Case with 4x ARGB",
    "sku": "CASE-MONTECH-AIR903",
    "category": "Casings",
    "brand": "Montech",
    "retailPrice": 8200,
    "costPrice": 6200,
    "stockCount": 46,
    "unit": "Units",
    "minThreshold": 20,
    "location": "Warehouse Shelf #K2",
    "warranty": "1 Year"
  },
  {
    "id": "prod-24",
    "name": "LG UltraGear 27GN800-B 27\" QHD 144Hz 1ms IPS Gaming Monitor",
    "sku": "MON-LG-27GN800",
    "category": "Monitors",
    "brand": "LG",
    "retailPrice": 34500,
    "costPrice": 27000,
    "stockCount": 25,
    "unit": "Units",
    "minThreshold": 15,
    "location": "Multiplan Branch #D1",
    "warranty": "3 Years"
  },
  {
    "id": "prod-25",
    "name": "MSI G2412 23.8\" FHD 170Hz 1ms IPS Esports Gaming Monitor",
    "sku": "MON-MSI-G2412",
    "category": "Monitors",
    "brand": "MSI",
    "retailPrice": 18500,
    "costPrice": 14500,
    "stockCount": 35,
    "unit": "Units",
    "minThreshold": 15,
    "location": "Showroom Shelf #D2",
    "warranty": "3 Years"
  },
  {
    "id": "prod-26",
    "name": "ASUS TUF Gaming A15 (Ryzen 7 7735HS, RTX 4060, 16GB, 512GB)",
    "sku": "LAPTOP-ASUS-TUF-A15",
    "category": "Laptops",
    "brand": "ASUS",
    "retailPrice": 142000,
    "costPrice": 118000,
    "stockCount": 11,
    "unit": "Units",
    "minThreshold": 8,
    "location": "Banani Vault #L1",
    "warranty": "2 Years International"
  },
  {
    "id": "prod-27",
    "name": "Lenovo IdeaPad Slim 3 15IRH8 (Core i5 13th Gen, 16GB, 512GB)",
    "sku": "LAPTOP-LENOVO-IP3",
    "category": "Laptops",
    "brand": "Lenovo",
    "retailPrice": 72000,
    "costPrice": 59000,
    "stockCount": 16,
    "unit": "Units",
    "minThreshold": 10,
    "location": "Showroom Shelf #L2",
    "warranty": "2 Years Official"
  }
];

export const defaultCustomers: Customer[] = [
  {
    "id": "cust-1",
    "name": "Apex Computer Systems",
    "contactNumber": "+880 1711-234567",
    "deliveryAddress": "Shop 402, Level 4, Multiplan Center, Elephant Road, Dhaka-1205",
    "customerType": "Wholesale",
    "binNumber": "003492817-0101",
    "totalPurchases": 3450000
  },
  {
    "id": "cust-2",
    "name": "Star IT Solutions Ltd.",
    "contactNumber": "+880 1819-876543",
    "deliveryAddress": "BCS Computer City, IDB Bhaban, Rokeya Sarani, Agargaon, Dhaka",
    "customerType": "Wholesale",
    "binNumber": "002918471-0203",
    "totalPurchases": 2850000
  },
  {
    "id": "cust-3",
    "name": "Dhaka Cyber Gaming Cafe",
    "contactNumber": "+880 1610-998877",
    "deliveryAddress": "House 14, Road 27, Dhanmondi, Dhaka-1209",
    "customerType": "Corporate",
    "binNumber": "001837492-0104",
    "totalPurchases": 1650000
  },
  {
    "id": "cust-4",
    "name": "TechLand BD Partner Store",
    "contactNumber": "+880 1912-345678",
    "deliveryAddress": "Level 3, Multiplan Center, Elephant Road, Dhaka",
    "customerType": "Wholesale",
    "binNumber": "004829103-0102",
    "totalPurchases": 4200000
  },
  {
    "id": "cust-5",
    "name": "UCC Tech World B2B Consignment",
    "contactNumber": "+880 1722-334455",
    "deliveryAddress": "Eastern Plus Market, Shantinagar, Dhaka-1217",
    "customerType": "Wholesale",
    "binNumber": "005829183-0201",
    "totalPurchases": 3100000
  },
  {
    "id": "cust-6",
    "name": "Chittagong Tech Point",
    "contactNumber": "+880 1611-987654",
    "deliveryAddress": "Shop 12, Ground Floor, Central Plaza, GEC Circle, Chattogram",
    "customerType": "Wholesale",
    "binNumber": "005829103-0402",
    "totalPurchases": 2600000
  },
  {
    "id": "cust-7",
    "name": "Daffodil International University Robotics Lab",
    "contactNumber": "+880 1515-456789",
    "deliveryAddress": "Engineering Dept, Daffodil Smart City, Ashulia, Dhaka",
    "customerType": "Corporate",
    "binNumber": "006918274-0201",
    "totalPurchases": 1480000
  },
  {
    "id": "cust-8",
    "name": "Brain Station 23 Workstation Unit",
    "contactNumber": "+880 1733-112233",
    "deliveryAddress": "Building 2, Mohakhali DOHS, Dhaka-1206",
    "customerType": "Corporate",
    "binNumber": "007829102-0105",
    "totalPurchases": 2950000
  },
  {
    "id": "cust-9",
    "name": "Sylhet Digital World",
    "contactNumber": "+880 1822-445566",
    "deliveryAddress": "Millennium Market, Zindabazar, Sylhet-3100",
    "customerType": "Wholesale",
    "binNumber": "008918273-0301",
    "totalPurchases": 1950000
  },
  {
    "id": "cust-10",
    "name": "Rajshahi IT Zone",
    "contactNumber": "+880 1933-556677",
    "deliveryAddress": "Shop 8, New Market, Alokar More, Rajshahi-6000",
    "customerType": "Wholesale",
    "binNumber": "009817263-0401",
    "totalPurchases": 1250000
  },
  {
    "id": "cust-11",
    "name": "Khulna Computer Hub",
    "contactNumber": "+880 1644-667788",
    "deliveryAddress": "Jolil Tower, Upper Jashore Road, Khulna-9100",
    "customerType": "Wholesale",
    "binNumber": "001928374-0501",
    "totalPurchases": 980000
  },
  {
    "id": "cust-12",
    "name": "Bogura Tech Express",
    "contactNumber": "+880 1755-778899",
    "deliveryAddress": "Rangpur Road, Jaleshwaritola, Bogura-5800",
    "customerType": "Wholesale",
    "binNumber": "002837465-0601",
    "totalPurchases": 820000
  },
  {
    "id": "cust-13",
    "name": "RedLine eSports Club",
    "contactNumber": "+880 1866-889900",
    "deliveryAddress": "Sector 7, Uttara Model Town, Dhaka-1230",
    "customerType": "Corporate",
    "binNumber": "003746582-0108",
    "totalPurchases": 740000
  },
  {
    "id": "cust-14",
    "name": "Banani Showroom Walk-in Client",
    "contactNumber": "+880 1700-000001",
    "deliveryAddress": "Plot 18, Road 11, Block D, Banani, Dhaka",
    "customerType": "Retail",
    "totalPurchases": 185000
  },
  {
    "id": "cust-15",
    "name": "Elephant Road Walk-in Client",
    "contactNumber": "+880 1700-000002",
    "deliveryAddress": "Level 4, Multiplan Center, Elephant Road, Dhaka",
    "customerType": "Retail",
    "totalPurchases": 142000
  }
];

export const defaultOrders: Order[] = [
  {
    "id": "ord-1",
    "orderNumber": "ORD-2026-0501",
    "orderType": "online",
    "customerName": "Apex Computer Systems",
    "contactNumber": "+880 1711-234567",
    "deliveryAddress": "Shop 402, Level 4, Multiplan Center, Elephant Road, Dhaka-1205",
    "items": [
      {
        "productId": "prod-1",
        "name": "NVIDIA GeForce RTX 4070 Ti Super 16GB GDDR6X",
        "sku": "GPU-RTX4070TI-16G",
        "quantity": 2,
        "unitPrice": 118500,
        "total": 237000
      },
      {
        "productId": "prod-12",
        "name": "Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz CL30",
        "sku": "RAM-CORSAIR-32GB-DDR5",
        "quantity": 4,
        "unitPrice": 15200,
        "total": 60800
      }
    ],
    "itemsSummary": "2x NVIDIA GeForce RTX 4070 Ti Super 16GB GDDR6X, 4x Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz CL30",
    "subtotal": 297800,
    "discountAmount": 14890,
    "discountPercent": 5,
    "vatAmount": 14146,
    "totalAmount": 297056,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "Delivered",
    "courier": {
      "provider": "Steadfast",
      "consignmentId": "STDF-DHA-20000",
      "trackingUrl": "https://steadfast.com.bd/t/STDF-DHA-20000",
      "status": "Delivered",
      "codAmount": 0,
      "deliveryFee": 150,
      "recipientCity": "Dhaka City",
      "dispatchedAt": "04 May 2026, 11:30 AM"
    },
    "orderDate": "04 May 2026, 11:30 AM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-2",
    "orderNumber": "ORD-2026-0502",
    "orderType": "online",
    "customerName": "Star IT Solutions Ltd.",
    "contactNumber": "+880 1819-876543",
    "deliveryAddress": "BCS Computer City, IDB Bhaban, Rokeya Sarani, Agargaon, Dhaka",
    "items": [
      {
        "productId": "prod-5",
        "name": "Intel Core i7-14700K 20-Core 28-Thread LGA1700 Processor",
        "sku": "CPU-INTEL-14700K",
        "quantity": 3,
        "unitPrice": 48000,
        "total": 144000
      },
      {
        "productId": "prod-9",
        "name": "ASUS ROG Strix Z790-E Gaming WiFi II DDR5 Motherboard",
        "sku": "MB-ASUS-Z790E-WIFI",
        "quantity": 3,
        "unitPrice": 62000,
        "total": 186000
      },
      {
        "productId": "prod-15",
        "name": "Samsung 990 Pro 2TB PCIe 4.0 M.2 NVMe Internal SSD",
        "sku": "SSD-SAMSUNG-990P-2TB",
        "quantity": 3,
        "unitPrice": 22500,
        "total": 67500
      }
    ],
    "itemsSummary": "3x Intel Core i7-14700K 20-Core 28-Thread LGA1700 Processor, 3x ASUS ROG Strix Z790-E Gaming WiFi II DDR5 Motherboard, 3x Samsung 990 Pro 2TB PCIe 4.0 M.2 NVMe Internal SSD",
    "subtotal": 397500,
    "discountAmount": 19875,
    "discountPercent": 5,
    "vatAmount": 18881,
    "totalAmount": 396506,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "Delivered",
    "courier": {
      "provider": "Pathao",
      "consignmentId": "PTH-DHA-10147",
      "trackingUrl": "https://merchant.pathao.com/tracking?consignment_id=PTH-DHA-10147",
      "status": "Delivered",
      "codAmount": 0,
      "deliveryFee": 150,
      "recipientCity": "Dhaka City",
      "dispatchedAt": "08 May 2026, 02:15 PM"
    },
    "orderDate": "08 May 2026, 02:15 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-3",
    "orderNumber": "ORD-2026-0503",
    "orderType": "online",
    "customerName": "Chittagong Tech Point",
    "contactNumber": "+880 1611-987654",
    "deliveryAddress": "Shop 12, Ground Floor, Central Plaza, GEC Circle, Chattogram",
    "items": [
      {
        "productId": "prod-2",
        "name": "MSI GeForce RTX 4060 Ventus 2X Black 8GB OC GDDR6",
        "sku": "GPU-RTX4060-8G",
        "quantity": 5,
        "unitPrice": 38500,
        "total": 192500
      },
      {
        "productId": "prod-6",
        "name": "Intel Core i5-14400 10-Core 16-Thread Desktop Processor",
        "sku": "CPU-INTEL-14400",
        "quantity": 5,
        "unitPrice": 24500,
        "total": 122500
      },
      {
        "productId": "prod-10",
        "name": "MSI PRO B760M-A WiFi DDR5 mATX Motherboard",
        "sku": "MB-MSI-B760M-PRO",
        "quantity": 5,
        "unitPrice": 19500,
        "total": 97500
      }
    ],
    "itemsSummary": "5x MSI GeForce RTX 4060 Ventus 2X Black 8GB OC GDDR6, 5x Intel Core i5-14400 10-Core 16-Thread Desktop Processor, 5x MSI PRO B760M-A WiFi DDR5 mATX Motherboard",
    "subtotal": 412500,
    "discountAmount": 20625,
    "discountPercent": 5,
    "vatAmount": 19594,
    "totalAmount": 411469,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "Delivered",
    "courier": {
      "provider": "Steadfast",
      "consignmentId": "STDF-CHA-20462",
      "trackingUrl": "https://steadfast.com.bd/t/STDF-CHA-20462",
      "status": "Delivered",
      "codAmount": 0,
      "deliveryFee": 250,
      "recipientCity": "Chattogram",
      "dispatchedAt": "12 May 2026, 04:45 PM"
    },
    "orderDate": "12 May 2026, 04:45 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-4",
    "orderNumber": "ORD-2026-0504",
    "orderType": "offline",
    "customerName": "Dhaka Cyber Gaming Cafe",
    "contactNumber": "+880 1610-998877",
    "deliveryAddress": "House 14, Road 27, Dhanmondi, Dhaka-1209",
    "items": [
      {
        "productId": "prod-7",
        "name": "AMD Ryzen 7 7800X3D 8-Core 16-Thread Gaming Processor",
        "sku": "CPU-AMD-7800X3D",
        "quantity": 2,
        "unitPrice": 52000,
        "total": 104000
      },
      {
        "productId": "prod-12",
        "name": "Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz CL30",
        "sku": "RAM-CORSAIR-32GB-DDR5",
        "quantity": 2,
        "unitPrice": 15200,
        "total": 30400
      },
      {
        "productId": "prod-18",
        "name": "Corsair RM850x 850W 80 PLUS Gold Fully Modular PSU",
        "sku": "PSU-CORSAIR-850W",
        "quantity": 2,
        "unitPrice": 16800,
        "total": 33600
      }
    ],
    "itemsSummary": "2x AMD Ryzen 7 7800X3D 8-Core 16-Thread Gaming Processor, 2x Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz CL30, 2x Corsair RM850x 850W 80 PLUS Gold Fully Modular PSU",
    "subtotal": 168000,
    "discountAmount": 8400,
    "discountPercent": 5,
    "vatAmount": 7980,
    "totalAmount": 167580,
    "paymentMethod": "bkash",
    "paymentStatus": "Paid",
    "status": "Counter Collected",
    "courier": null,
    "orderDate": "16 May 2026, 12:10 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-5",
    "orderNumber": "ORD-2026-0505",
    "orderType": "online",
    "customerName": "TechLand BD Partner Store",
    "contactNumber": "+880 1912-345678",
    "deliveryAddress": "Level 3, Multiplan Center, Elephant Road, Dhaka",
    "items": [
      {
        "productId": "prod-3",
        "name": "ASUS TUF Gaming GeForce RTX 4080 Super 16GB GDDR6X",
        "sku": "GPU-RTX4080S-16G",
        "quantity": 2,
        "unitPrice": 148000,
        "total": 296000
      },
      {
        "productId": "prod-5",
        "name": "Intel Core i7-14700K 20-Core 28-Thread LGA1700 Processor",
        "sku": "CPU-INTEL-14700K",
        "quantity": 2,
        "unitPrice": 48000,
        "total": 96000
      },
      {
        "productId": "prod-15",
        "name": "Samsung 990 Pro 2TB PCIe 4.0 M.2 NVMe Internal SSD",
        "sku": "SSD-SAMSUNG-990P-2TB",
        "quantity": 4,
        "unitPrice": 22500,
        "total": 90000
      }
    ],
    "itemsSummary": "2x ASUS TUF Gaming GeForce RTX 4080 Super 16GB GDDR6X, 2x Intel Core i7-14700K 20-Core 28-Thread LGA1700 Processor, 4x Samsung 990 Pro 2TB PCIe 4.0 M.2 NVMe Internal SSD",
    "subtotal": 482000,
    "discountAmount": 24100,
    "discountPercent": 5,
    "vatAmount": 22895,
    "totalAmount": 480795,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "Delivered",
    "courier": {
      "provider": "Pathao",
      "consignmentId": "PTH-DHA-10588",
      "trackingUrl": "https://merchant.pathao.com/tracking?consignment_id=PTH-DHA-10588",
      "status": "Delivered",
      "codAmount": 0,
      "deliveryFee": 150,
      "recipientCity": "Dhaka City",
      "dispatchedAt": "19 May 2026, 03:30 PM"
    },
    "orderDate": "19 May 2026, 03:30 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-6",
    "orderNumber": "ORD-2026-0506",
    "orderType": "offline",
    "customerName": "Banani Showroom Walk-in Client",
    "contactNumber": "+880 1700-000001",
    "deliveryAddress": "Plot 18, Road 11, Block D, Banani, Dhaka",
    "items": [
      {
        "productId": "prod-2",
        "name": "MSI GeForce RTX 4060 Ventus 2X Black 8GB OC GDDR6",
        "sku": "GPU-RTX4060-8G",
        "quantity": 1,
        "unitPrice": 38500,
        "total": 38500
      },
      {
        "productId": "prod-6",
        "name": "Intel Core i5-14400 10-Core 16-Thread Desktop Processor",
        "sku": "CPU-INTEL-14400",
        "quantity": 1,
        "unitPrice": 24500,
        "total": 24500
      },
      {
        "productId": "prod-19",
        "name": "DeepCool PK650D 650W 80 PLUS Bronze Power Supply",
        "sku": "PSU-DEEPCOOL-650W",
        "quantity": 1,
        "unitPrice": 5600,
        "total": 5600
      },
      {
        "productId": "prod-23",
        "name": "Montech Air 903 Max E-ATX Mid-Tower Case with 4x ARGB",
        "sku": "CASE-MONTECH-AIR903",
        "quantity": 1,
        "unitPrice": 8200,
        "total": 8200
      }
    ],
    "itemsSummary": "1x MSI GeForce RTX 4060 Ventus 2X Black 8GB OC GDDR6, 1x Intel Core i5-14400 10-Core 16-Thread Desktop Processor, 1x DeepCool PK650D 650W 80 PLUS Bronze Power Supply, 1x Montech Air 903 Max E-ATX Mid-Tower Case with 4x ARGB",
    "subtotal": 76800,
    "discountAmount": 3840,
    "discountPercent": 5,
    "vatAmount": 3648,
    "totalAmount": 76608,
    "paymentMethod": "cash",
    "paymentStatus": "Paid",
    "status": "Counter Collected",
    "courier": null,
    "orderDate": "22 May 2026, 05:00 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-7",
    "orderNumber": "ORD-2026-0507",
    "orderType": "online",
    "customerName": "Sylhet Digital World",
    "contactNumber": "+880 1822-445566",
    "deliveryAddress": "Millennium Market, Zindabazar, Sylhet-3100",
    "items": [
      {
        "productId": "prod-4",
        "name": "Sapphire PULSE AMD Radeon RX 7800 XT 16GB Gaming GPU",
        "sku": "GPU-RX7800XT-16G",
        "quantity": 2,
        "unitPrice": 68500,
        "total": 137000
      },
      {
        "productId": "prod-8",
        "name": "AMD Ryzen 5 7600X 6-Core 12-Thread AM5 Gaming Processor",
        "sku": "CPU-AMD-7600X",
        "quantity": 2,
        "unitPrice": 26000,
        "total": 52000
      },
      {
        "productId": "prod-11",
        "name": "Gigabyte B650M Gaming WiFi AM5 Motherboard",
        "sku": "MB-GIGABYTE-B650M",
        "quantity": 2,
        "unitPrice": 17800,
        "total": 35600
      }
    ],
    "itemsSummary": "2x Sapphire PULSE AMD Radeon RX 7800 XT 16GB Gaming GPU, 2x AMD Ryzen 5 7600X 6-Core 12-Thread AM5 Gaming Processor, 2x Gigabyte B650M Gaming WiFi AM5 Motherboard",
    "subtotal": 224600,
    "discountAmount": 11230,
    "discountPercent": 5,
    "vatAmount": 10668,
    "totalAmount": 224038,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "Delivered",
    "courier": {
      "provider": "Pathao",
      "consignmentId": "PTH-SYL-10882",
      "trackingUrl": "https://merchant.pathao.com/tracking?consignment_id=PTH-SYL-10882",
      "status": "Delivered",
      "codAmount": 0,
      "deliveryFee": 250,
      "recipientCity": "Sylhet",
      "dispatchedAt": "27 May 2026, 01:20 PM"
    },
    "orderDate": "27 May 2026, 01:20 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-8",
    "orderNumber": "ORD-2026-0508",
    "orderType": "online",
    "customerName": "Daffodil International University Robotics Lab",
    "contactNumber": "+880 1515-456789",
    "deliveryAddress": "Engineering Dept, Daffodil Smart City, Ashulia, Dhaka",
    "items": [
      {
        "productId": "prod-5",
        "name": "Intel Core i7-14700K 20-Core 28-Thread LGA1700 Processor",
        "sku": "CPU-INTEL-14700K",
        "quantity": 4,
        "unitPrice": 48000,
        "total": 192000
      },
      {
        "productId": "prod-13",
        "name": "G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6400MHz",
        "sku": "RAM-GSKILL-32GB-DDR5",
        "quantity": 4,
        "unitPrice": 18500,
        "total": 74000
      },
      {
        "productId": "prod-15",
        "name": "Samsung 990 Pro 2TB PCIe 4.0 M.2 NVMe Internal SSD",
        "sku": "SSD-SAMSUNG-990P-2TB",
        "quantity": 4,
        "unitPrice": 22500,
        "total": 90000
      },
      {
        "productId": "prod-24",
        "name": "LG UltraGear 27GN800-B 27\" QHD 144Hz 1ms IPS Gaming Monitor",
        "sku": "MON-LG-27GN800",
        "quantity": 2,
        "unitPrice": 34500,
        "total": 69000
      }
    ],
    "itemsSummary": "4x Intel Core i7-14700K 20-Core 28-Thread LGA1700 Processor, 4x G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6400MHz, 4x Samsung 990 Pro 2TB PCIe 4.0 M.2 NVMe Internal SSD, 2x LG UltraGear 27GN800-B 27\" QHD 144Hz 1ms IPS Gaming Monitor",
    "subtotal": 425000,
    "discountAmount": 21250,
    "discountPercent": 5,
    "vatAmount": 20188,
    "totalAmount": 423938,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "Delivered",
    "courier": {
      "provider": "Steadfast",
      "consignmentId": "STDF-DHA-21617",
      "trackingUrl": "https://steadfast.com.bd/t/STDF-DHA-21617",
      "status": "Delivered",
      "codAmount": 0,
      "deliveryFee": 150,
      "recipientCity": "Dhaka City",
      "dispatchedAt": "30 May 2026, 06:15 PM"
    },
    "orderDate": "30 May 2026, 06:15 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-9",
    "orderNumber": "ORD-2026-0601",
    "orderType": "online",
    "customerName": "Apex Computer Systems",
    "contactNumber": "+880 1711-234567",
    "deliveryAddress": "Shop 402, Level 4, Multiplan Center, Elephant Road, Dhaka-1205",
    "items": [
      {
        "productId": "prod-1",
        "name": "NVIDIA GeForce RTX 4070 Ti Super 16GB GDDR6X",
        "sku": "GPU-RTX4070TI-16G",
        "quantity": 3,
        "unitPrice": 118500,
        "total": 355500
      },
      {
        "productId": "prod-18",
        "name": "Corsair RM850x 850W 80 PLUS Gold Fully Modular PSU",
        "sku": "PSU-CORSAIR-850W",
        "quantity": 3,
        "unitPrice": 16800,
        "total": 50400
      },
      {
        "productId": "prod-22",
        "name": "Lian Li O11 Dynamic EVO RGB Gaming Desktop Casing",
        "sku": "CASE-LIANLI-O11D",
        "quantity": 3,
        "unitPrice": 21500,
        "total": 64500
      }
    ],
    "itemsSummary": "3x NVIDIA GeForce RTX 4070 Ti Super 16GB GDDR6X, 3x Corsair RM850x 850W 80 PLUS Gold Fully Modular PSU, 3x Lian Li O11 Dynamic EVO RGB Gaming Desktop Casing",
    "subtotal": 470400,
    "discountAmount": 23520,
    "discountPercent": 5,
    "vatAmount": 22344,
    "totalAmount": 469224,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "Delivered",
    "courier": {
      "provider": "Steadfast",
      "consignmentId": "STDF-DHA-21848",
      "trackingUrl": "https://steadfast.com.bd/t/STDF-DHA-21848",
      "status": "Delivered",
      "codAmount": 0,
      "deliveryFee": 150,
      "recipientCity": "Dhaka City",
      "dispatchedAt": "03 Jun 2026, 11:00 AM"
    },
    "orderDate": "03 Jun 2026, 11:00 AM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-10",
    "orderNumber": "ORD-2026-0602",
    "orderType": "online",
    "customerName": "UCC Tech World B2B Consignment",
    "contactNumber": "+880 1722-334455",
    "deliveryAddress": "Eastern Plus Market, Shantinagar, Dhaka-1217",
    "items": [
      {
        "productId": "prod-2",
        "name": "MSI GeForce RTX 4060 Ventus 2X Black 8GB OC GDDR6",
        "sku": "GPU-RTX4060-8G",
        "quantity": 4,
        "unitPrice": 38500,
        "total": 154000
      },
      {
        "productId": "prod-12",
        "name": "Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz CL30",
        "sku": "RAM-CORSAIR-32GB-DDR5",
        "quantity": 4,
        "unitPrice": 15200,
        "total": 60800
      },
      {
        "productId": "prod-17",
        "name": "Kingston NV2 1TB PCIe 4.0 M.2 NVMe SSD",
        "sku": "SSD-KINGSTON-NV2-1TB",
        "quantity": 8,
        "unitPrice": 7400,
        "total": 59200
      }
    ],
    "itemsSummary": "4x MSI GeForce RTX 4060 Ventus 2X Black 8GB OC GDDR6, 4x Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz CL30, 8x Kingston NV2 1TB PCIe 4.0 M.2 NVMe SSD",
    "subtotal": 274000,
    "discountAmount": 13700,
    "discountPercent": 5,
    "vatAmount": 13015,
    "totalAmount": 273315,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "Delivered",
    "courier": {
      "provider": "Pathao",
      "consignmentId": "PTH-DHA-11323",
      "trackingUrl": "https://merchant.pathao.com/tracking?consignment_id=PTH-DHA-11323",
      "status": "Delivered",
      "codAmount": 0,
      "deliveryFee": 150,
      "recipientCity": "Dhaka City",
      "dispatchedAt": "07 Jun 2026, 02:40 PM"
    },
    "orderDate": "07 Jun 2026, 02:40 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-11",
    "orderNumber": "ORD-2026-0603",
    "orderType": "online",
    "customerName": "Rajshahi IT Zone",
    "contactNumber": "+880 1933-556677",
    "deliveryAddress": "Shop 8, New Market, Alokar More, Rajshahi-6000",
    "items": [
      {
        "productId": "prod-6",
        "name": "Intel Core i5-14400 10-Core 16-Thread Desktop Processor",
        "sku": "CPU-INTEL-14400",
        "quantity": 3,
        "unitPrice": 24500,
        "total": 73500
      },
      {
        "productId": "prod-10",
        "name": "MSI PRO B760M-A WiFi DDR5 mATX Motherboard",
        "sku": "MB-MSI-B760M-PRO",
        "quantity": 3,
        "unitPrice": 19500,
        "total": 58500
      },
      {
        "productId": "prod-19",
        "name": "DeepCool PK650D 650W 80 PLUS Bronze Power Supply",
        "sku": "PSU-DEEPCOOL-650W",
        "quantity": 3,
        "unitPrice": 5600,
        "total": 16800
      },
      {
        "productId": "prod-21",
        "name": "DeepCool AK400 Zero Dark Performance CPU Air Cooler",
        "sku": "COOL-DEEPCOOL-AK400",
        "quantity": 3,
        "unitPrice": 3800,
        "total": 11400
      }
    ],
    "itemsSummary": "3x Intel Core i5-14400 10-Core 16-Thread Desktop Processor, 3x MSI PRO B760M-A WiFi DDR5 mATX Motherboard, 3x DeepCool PK650D 650W 80 PLUS Bronze Power Supply, 3x DeepCool AK400 Zero Dark Performance CPU Air Cooler",
    "subtotal": 160200,
    "discountAmount": 8010,
    "discountPercent": 5,
    "vatAmount": 7610,
    "totalAmount": 159800,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "Delivered",
    "courier": {
      "provider": "Steadfast",
      "consignmentId": "STDF-RAJ-22310",
      "trackingUrl": "https://steadfast.com.bd/t/STDF-RAJ-22310",
      "status": "Delivered",
      "codAmount": 0,
      "deliveryFee": 250,
      "recipientCity": "Rajshahi",
      "dispatchedAt": "11 Jun 2026, 04:10 PM"
    },
    "orderDate": "11 Jun 2026, 04:10 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-12",
    "orderNumber": "ORD-2026-0604",
    "orderType": "online",
    "customerName": "Brain Station 23 Workstation Unit",
    "contactNumber": "+880 1733-112233",
    "deliveryAddress": "Building 2, Mohakhali DOHS, Dhaka-1206",
    "items": [
      {
        "productId": "prod-3",
        "name": "ASUS TUF Gaming GeForce RTX 4080 Super 16GB GDDR6X",
        "sku": "GPU-RTX4080S-16G",
        "quantity": 1,
        "unitPrice": 148000,
        "total": 148000
      },
      {
        "productId": "prod-5",
        "name": "Intel Core i7-14700K 20-Core 28-Thread LGA1700 Processor",
        "sku": "CPU-INTEL-14700K",
        "quantity": 2,
        "unitPrice": 48000,
        "total": 96000
      },
      {
        "productId": "prod-13",
        "name": "G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6400MHz",
        "sku": "RAM-GSKILL-32GB-DDR5",
        "quantity": 2,
        "unitPrice": 18500,
        "total": 37000
      },
      {
        "productId": "prod-26",
        "name": "ASUS TUF Gaming A15 (Ryzen 7 7735HS, RTX 4060, 16GB, 512GB)",
        "sku": "LAPTOP-ASUS-TUF-A15",
        "quantity": 2,
        "unitPrice": 142000,
        "total": 284000
      }
    ],
    "itemsSummary": "1x ASUS TUF Gaming GeForce RTX 4080 Super 16GB GDDR6X, 2x Intel Core i7-14700K 20-Core 28-Thread LGA1700 Processor, 2x G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6400MHz, 2x ASUS TUF Gaming A15 (Ryzen 7 7735HS, RTX 4060, 16GB, 512GB)",
    "subtotal": 565000,
    "discountAmount": 28250,
    "discountPercent": 5,
    "vatAmount": 26838,
    "totalAmount": 563588,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "Delivered",
    "courier": {
      "provider": "Pathao",
      "consignmentId": "PTH-DHA-11617",
      "trackingUrl": "https://merchant.pathao.com/tracking?consignment_id=PTH-DHA-11617",
      "status": "Delivered",
      "codAmount": 0,
      "deliveryFee": 150,
      "recipientCity": "Dhaka City",
      "dispatchedAt": "16 Jun 2026, 12:30 PM"
    },
    "orderDate": "16 Jun 2026, 12:30 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-13",
    "orderNumber": "ORD-2026-0605",
    "orderType": "offline",
    "customerName": "Elephant Road Walk-in Client",
    "contactNumber": "+880 1700-000002",
    "deliveryAddress": "Level 4, Multiplan Center, Elephant Road, Dhaka",
    "items": [
      {
        "productId": "prod-7",
        "name": "AMD Ryzen 7 7800X3D 8-Core 16-Thread Gaming Processor",
        "sku": "CPU-AMD-7800X3D",
        "quantity": 1,
        "unitPrice": 52000,
        "total": 52000
      },
      {
        "productId": "prod-11",
        "name": "Gigabyte B650M Gaming WiFi AM5 Motherboard",
        "sku": "MB-GIGABYTE-B650M",
        "quantity": 1,
        "unitPrice": 17800,
        "total": 17800
      },
      {
        "productId": "prod-16",
        "name": "Western Digital Black SN850X 1TB PCIe 4.0 NVMe SSD",
        "sku": "SSD-WD-BLACK-1TB",
        "quantity": 1,
        "unitPrice": 12800,
        "total": 12800
      }
    ],
    "itemsSummary": "1x AMD Ryzen 7 7800X3D 8-Core 16-Thread Gaming Processor, 1x Gigabyte B650M Gaming WiFi AM5 Motherboard, 1x Western Digital Black SN850X 1TB PCIe 4.0 NVMe SSD",
    "subtotal": 82600,
    "discountAmount": 4130,
    "discountPercent": 5,
    "vatAmount": 3924,
    "totalAmount": 82394,
    "paymentMethod": "cash",
    "paymentStatus": "Paid",
    "status": "Counter Collected",
    "courier": null,
    "orderDate": "20 Jun 2026, 03:50 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-14",
    "orderNumber": "ORD-2026-0606",
    "orderType": "online",
    "customerName": "Star IT Solutions Ltd.",
    "contactNumber": "+880 1819-876543",
    "deliveryAddress": "BCS Computer City, IDB Bhaban, Rokeya Sarani, Agargaon, Dhaka",
    "items": [
      {
        "productId": "prod-1",
        "name": "NVIDIA GeForce RTX 4070 Ti Super 16GB GDDR6X",
        "sku": "GPU-RTX4070TI-16G",
        "quantity": 2,
        "unitPrice": 118500,
        "total": 237000
      },
      {
        "productId": "prod-9",
        "name": "ASUS ROG Strix Z790-E Gaming WiFi II DDR5 Motherboard",
        "sku": "MB-ASUS-Z790E-WIFI",
        "quantity": 2,
        "unitPrice": 62000,
        "total": 124000
      },
      {
        "productId": "prod-20",
        "name": "MSI MAG CoreLiquid 360R V2 ARGB AIO Liquid CPU Cooler",
        "sku": "COOL-MSI-360R-V2",
        "quantity": 2,
        "unitPrice": 14500,
        "total": 29000
      }
    ],
    "itemsSummary": "2x NVIDIA GeForce RTX 4070 Ti Super 16GB GDDR6X, 2x ASUS ROG Strix Z790-E Gaming WiFi II DDR5 Motherboard, 2x MSI MAG CoreLiquid 360R V2 ARGB AIO Liquid CPU Cooler",
    "subtotal": 390000,
    "discountAmount": 19500,
    "discountPercent": 5,
    "vatAmount": 18525,
    "totalAmount": 389025,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "Delivered",
    "courier": {
      "provider": "Steadfast",
      "consignmentId": "STDF-DHA-23003",
      "trackingUrl": "https://steadfast.com.bd/t/STDF-DHA-23003",
      "status": "Delivered",
      "codAmount": 0,
      "deliveryFee": 150,
      "recipientCity": "Dhaka City",
      "dispatchedAt": "24 Jun 2026, 05:15 PM"
    },
    "orderDate": "24 Jun 2026, 05:15 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-15",
    "orderNumber": "ORD-2026-0607",
    "orderType": "online",
    "customerName": "Khulna Computer Hub",
    "contactNumber": "+880 1644-667788",
    "deliveryAddress": "Jolil Tower, Upper Jashore Road, Khulna-9100",
    "items": [
      {
        "productId": "prod-4",
        "name": "Sapphire PULSE AMD Radeon RX 7800 XT 16GB Gaming GPU",
        "sku": "GPU-RX7800XT-16G",
        "quantity": 2,
        "unitPrice": 68500,
        "total": 137000
      },
      {
        "productId": "prod-8",
        "name": "AMD Ryzen 5 7600X 6-Core 12-Thread AM5 Gaming Processor",
        "sku": "CPU-AMD-7600X",
        "quantity": 2,
        "unitPrice": 26000,
        "total": 52000
      },
      {
        "productId": "prod-18",
        "name": "Corsair RM850x 850W 80 PLUS Gold Fully Modular PSU",
        "sku": "PSU-CORSAIR-850W",
        "quantity": 2,
        "unitPrice": 16800,
        "total": 33600
      }
    ],
    "itemsSummary": "2x Sapphire PULSE AMD Radeon RX 7800 XT 16GB Gaming GPU, 2x AMD Ryzen 5 7600X 6-Core 12-Thread AM5 Gaming Processor, 2x Corsair RM850x 850W 80 PLUS Gold Fully Modular PSU",
    "subtotal": 222600,
    "discountAmount": 11130,
    "discountPercent": 5,
    "vatAmount": 10574,
    "totalAmount": 222044,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "Delivered",
    "courier": {
      "provider": "Steadfast",
      "consignmentId": "STDF-KHU-23234",
      "trackingUrl": "https://steadfast.com.bd/t/STDF-KHU-23234",
      "status": "Delivered",
      "codAmount": 0,
      "deliveryFee": 250,
      "recipientCity": "Khulna",
      "dispatchedAt": "27 Jun 2026, 01:45 PM"
    },
    "orderDate": "27 Jun 2026, 01:45 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-16",
    "orderNumber": "ORD-2026-0608",
    "orderType": "offline",
    "customerName": "RedLine eSports Club",
    "contactNumber": "+880 1866-889900",
    "deliveryAddress": "Sector 7, Uttara Model Town, Dhaka-1230",
    "items": [
      {
        "productId": "prod-2",
        "name": "MSI GeForce RTX 4060 Ventus 2X Black 8GB OC GDDR6",
        "sku": "GPU-RTX4060-8G",
        "quantity": 3,
        "unitPrice": 38500,
        "total": 115500
      },
      {
        "productId": "prod-6",
        "name": "Intel Core i5-14400 10-Core 16-Thread Desktop Processor",
        "sku": "CPU-INTEL-14400",
        "quantity": 3,
        "unitPrice": 24500,
        "total": 73500
      },
      {
        "productId": "prod-25",
        "name": "MSI G2412 23.8\" FHD 170Hz 1ms IPS Esports Gaming Monitor",
        "sku": "MON-MSI-G2412",
        "quantity": 3,
        "unitPrice": 18500,
        "total": 55500
      }
    ],
    "itemsSummary": "3x MSI GeForce RTX 4060 Ventus 2X Black 8GB OC GDDR6, 3x Intel Core i5-14400 10-Core 16-Thread Desktop Processor, 3x MSI G2412 23.8\" FHD 170Hz 1ms IPS Esports Gaming Monitor",
    "subtotal": 244500,
    "discountAmount": 12225,
    "discountPercent": 5,
    "vatAmount": 11614,
    "totalAmount": 243889,
    "paymentMethod": "bkash",
    "paymentStatus": "Paid",
    "status": "Counter Collected",
    "courier": null,
    "orderDate": "29 Jun 2026, 06:00 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-17",
    "orderNumber": "ORD-2026-0701",
    "orderType": "online",
    "customerName": "Apex Computer Systems",
    "contactNumber": "+880 1711-234567",
    "deliveryAddress": "Shop 402, Level 4, Multiplan Center, Elephant Road, Dhaka-1205",
    "items": [
      {
        "productId": "prod-3",
        "name": "ASUS TUF Gaming GeForce RTX 4080 Super 16GB GDDR6X",
        "sku": "GPU-RTX4080S-16G",
        "quantity": 2,
        "unitPrice": 148000,
        "total": 296000
      },
      {
        "productId": "prod-5",
        "name": "Intel Core i7-14700K 20-Core 28-Thread LGA1700 Processor",
        "sku": "CPU-INTEL-14700K",
        "quantity": 4,
        "unitPrice": 48000,
        "total": 192000
      },
      {
        "productId": "prod-15",
        "name": "Samsung 990 Pro 2TB PCIe 4.0 M.2 NVMe Internal SSD",
        "sku": "SSD-SAMSUNG-990P-2TB",
        "quantity": 4,
        "unitPrice": 22500,
        "total": 90000
      }
    ],
    "itemsSummary": "2x ASUS TUF Gaming GeForce RTX 4080 Super 16GB GDDR6X, 4x Intel Core i7-14700K 20-Core 28-Thread LGA1700 Processor, 4x Samsung 990 Pro 2TB PCIe 4.0 M.2 NVMe Internal SSD",
    "subtotal": 578000,
    "discountAmount": 28900,
    "discountPercent": 5,
    "vatAmount": 27455,
    "totalAmount": 576555,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "Delivered",
    "courier": {
      "provider": "Pathao",
      "consignmentId": "PTH-DHA-12352",
      "trackingUrl": "https://merchant.pathao.com/tracking?consignment_id=PTH-DHA-12352",
      "status": "Delivered",
      "codAmount": 0,
      "deliveryFee": 150,
      "recipientCity": "Dhaka City",
      "dispatchedAt": "02 Jul 2026, 11:20 AM"
    },
    "orderDate": "02 Jul 2026, 11:20 AM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-18",
    "orderNumber": "ORD-2026-0702",
    "orderType": "online",
    "customerName": "Chittagong Tech Point",
    "contactNumber": "+880 1611-987654",
    "deliveryAddress": "Shop 12, Ground Floor, Central Plaza, GEC Circle, Chattogram",
    "items": [
      {
        "productId": "prod-1",
        "name": "NVIDIA GeForce RTX 4070 Ti Super 16GB GDDR6X",
        "sku": "GPU-RTX4070TI-16G",
        "quantity": 2,
        "unitPrice": 118500,
        "total": 237000
      },
      {
        "productId": "prod-2",
        "name": "MSI GeForce RTX 4060 Ventus 2X Black 8GB OC GDDR6",
        "sku": "GPU-RTX4060-8G",
        "quantity": 3,
        "unitPrice": 38500,
        "total": 115500
      },
      {
        "productId": "prod-12",
        "name": "Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz CL30",
        "sku": "RAM-CORSAIR-32GB-DDR5",
        "quantity": 5,
        "unitPrice": 15200,
        "total": 76000
      }
    ],
    "itemsSummary": "2x NVIDIA GeForce RTX 4070 Ti Super 16GB GDDR6X, 3x MSI GeForce RTX 4060 Ventus 2X Black 8GB OC GDDR6, 5x Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz CL30",
    "subtotal": 428500,
    "discountAmount": 21425,
    "discountPercent": 5,
    "vatAmount": 20354,
    "totalAmount": 427429,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "Delivered",
    "courier": {
      "provider": "Steadfast",
      "consignmentId": "STDF-CHA-23927",
      "trackingUrl": "https://steadfast.com.bd/t/STDF-CHA-23927",
      "status": "Delivered",
      "codAmount": 0,
      "deliveryFee": 250,
      "recipientCity": "Chattogram",
      "dispatchedAt": "06 Jul 2026, 02:10 PM"
    },
    "orderDate": "06 Jul 2026, 02:10 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-19",
    "orderNumber": "ORD-2026-0703",
    "orderType": "offline",
    "customerName": "Dhaka Cyber Gaming Cafe",
    "contactNumber": "+880 1610-998877",
    "deliveryAddress": "House 14, Road 27, Dhanmondi, Dhaka-1209",
    "items": [
      {
        "productId": "prod-7",
        "name": "AMD Ryzen 7 7800X3D 8-Core 16-Thread Gaming Processor",
        "sku": "CPU-AMD-7800X3D",
        "quantity": 3,
        "unitPrice": 52000,
        "total": 156000
      },
      {
        "productId": "prod-13",
        "name": "G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6400MHz",
        "sku": "RAM-GSKILL-32GB-DDR5",
        "quantity": 3,
        "unitPrice": 18500,
        "total": 55500
      },
      {
        "productId": "prod-22",
        "name": "Lian Li O11 Dynamic EVO RGB Gaming Desktop Casing",
        "sku": "CASE-LIANLI-O11D",
        "quantity": 3,
        "unitPrice": 21500,
        "total": 64500
      }
    ],
    "itemsSummary": "3x AMD Ryzen 7 7800X3D 8-Core 16-Thread Gaming Processor, 3x G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6400MHz, 3x Lian Li O11 Dynamic EVO RGB Gaming Desktop Casing",
    "subtotal": 276000,
    "discountAmount": 13800,
    "discountPercent": 5,
    "vatAmount": 13110,
    "totalAmount": 275310,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "Counter Collected",
    "courier": null,
    "orderDate": "10 Jul 2026, 04:30 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-20",
    "orderNumber": "ORD-2026-0704",
    "orderType": "online",
    "customerName": "Bogura Tech Express",
    "contactNumber": "+880 1755-778899",
    "deliveryAddress": "Rangpur Road, Jaleshwaritola, Bogura-5800",
    "items": [
      {
        "productId": "prod-2",
        "name": "MSI GeForce RTX 4060 Ventus 2X Black 8GB OC GDDR6",
        "sku": "GPU-RTX4060-8G",
        "quantity": 2,
        "unitPrice": 38500,
        "total": 77000
      },
      {
        "productId": "prod-6",
        "name": "Intel Core i5-14400 10-Core 16-Thread Desktop Processor",
        "sku": "CPU-INTEL-14400",
        "quantity": 2,
        "unitPrice": 24500,
        "total": 49000
      },
      {
        "productId": "prod-17",
        "name": "Kingston NV2 1TB PCIe 4.0 M.2 NVMe SSD",
        "sku": "SSD-KINGSTON-NV2-1TB",
        "quantity": 4,
        "unitPrice": 7400,
        "total": 29600
      }
    ],
    "itemsSummary": "2x MSI GeForce RTX 4060 Ventus 2X Black 8GB OC GDDR6, 2x Intel Core i5-14400 10-Core 16-Thread Desktop Processor, 4x Kingston NV2 1TB PCIe 4.0 M.2 NVMe SSD",
    "subtotal": 155600,
    "discountAmount": 7780,
    "discountPercent": 5,
    "vatAmount": 7391,
    "totalAmount": 155211,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "Delivered",
    "courier": {
      "provider": "Steadfast",
      "consignmentId": "STDF-BOG-24389",
      "trackingUrl": "https://steadfast.com.bd/t/STDF-BOG-24389",
      "status": "Delivered",
      "codAmount": 0,
      "deliveryFee": 250,
      "recipientCity": "Bogura",
      "dispatchedAt": "15 Jul 2026, 12:45 PM"
    },
    "orderDate": "15 Jul 2026, 12:45 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-21",
    "orderNumber": "ORD-2026-0705",
    "orderType": "online",
    "customerName": "TechLand BD Partner Store",
    "contactNumber": "+880 1912-345678",
    "deliveryAddress": "Level 3, Multiplan Center, Elephant Road, Dhaka",
    "items": [
      {
        "productId": "prod-4",
        "name": "Sapphire PULSE AMD Radeon RX 7800 XT 16GB Gaming GPU",
        "sku": "GPU-RX7800XT-16G",
        "quantity": 2,
        "unitPrice": 68500,
        "total": 137000
      },
      {
        "productId": "prod-8",
        "name": "AMD Ryzen 5 7600X 6-Core 12-Thread AM5 Gaming Processor",
        "sku": "CPU-AMD-7600X",
        "quantity": 2,
        "unitPrice": 26000,
        "total": 52000
      },
      {
        "productId": "prod-18",
        "name": "Corsair RM850x 850W 80 PLUS Gold Fully Modular PSU",
        "sku": "PSU-CORSAIR-850W",
        "quantity": 2,
        "unitPrice": 16800,
        "total": 33600
      },
      {
        "productId": "prod-24",
        "name": "LG UltraGear 27GN800-B 27\" QHD 144Hz 1ms IPS Gaming Monitor",
        "sku": "MON-LG-27GN800",
        "quantity": 2,
        "unitPrice": 34500,
        "total": 69000
      }
    ],
    "itemsSummary": "2x Sapphire PULSE AMD Radeon RX 7800 XT 16GB Gaming GPU, 2x AMD Ryzen 5 7600X 6-Core 12-Thread AM5 Gaming Processor, 2x Corsair RM850x 850W 80 PLUS Gold Fully Modular PSU, 2x LG UltraGear 27GN800-B 27\" QHD 144Hz 1ms IPS Gaming Monitor",
    "subtotal": 291600,
    "discountAmount": 14580,
    "discountPercent": 5,
    "vatAmount": 13851,
    "totalAmount": 290871,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "Delivered",
    "courier": {
      "provider": "Pathao",
      "consignmentId": "PTH-DHA-12940",
      "trackingUrl": "https://merchant.pathao.com/tracking?consignment_id=PTH-DHA-12940",
      "status": "Delivered",
      "codAmount": 0,
      "deliveryFee": 150,
      "recipientCity": "Dhaka City",
      "dispatchedAt": "19 Jul 2026, 03:15 PM"
    },
    "orderDate": "19 Jul 2026, 03:15 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-22",
    "orderNumber": "ORD-2026-0706",
    "orderType": "offline",
    "customerName": "Banani Showroom Walk-in Client",
    "contactNumber": "+880 1700-000001",
    "deliveryAddress": "Plot 18, Road 11, Block D, Banani, Dhaka",
    "items": [
      {
        "productId": "prod-26",
        "name": "ASUS TUF Gaming A15 (Ryzen 7 7735HS, RTX 4060, 16GB, 512GB)",
        "sku": "LAPTOP-ASUS-TUF-A15",
        "quantity": 1,
        "unitPrice": 142000,
        "total": 142000
      }
    ],
    "itemsSummary": "1x ASUS TUF Gaming A15 (Ryzen 7 7735HS, RTX 4060, 16GB, 512GB)",
    "subtotal": 142000,
    "discountAmount": 0,
    "discountPercent": 0,
    "vatAmount": 7100,
    "totalAmount": 149100,
    "paymentMethod": "bkash",
    "paymentStatus": "Paid",
    "status": "Counter Collected",
    "courier": null,
    "orderDate": "23 Jul 2026, 05:40 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-23",
    "orderNumber": "ORD-2026-0707",
    "orderType": "online",
    "customerName": "Sylhet Digital World",
    "contactNumber": "+880 1822-445566",
    "deliveryAddress": "Millennium Market, Zindabazar, Sylhet-3100",
    "items": [
      {
        "productId": "prod-5",
        "name": "Intel Core i7-14700K 20-Core 28-Thread LGA1700 Processor",
        "sku": "CPU-INTEL-14700K",
        "quantity": 2,
        "unitPrice": 48000,
        "total": 96000
      },
      {
        "productId": "prod-9",
        "name": "ASUS ROG Strix Z790-E Gaming WiFi II DDR5 Motherboard",
        "sku": "MB-ASUS-Z790E-WIFI",
        "quantity": 2,
        "unitPrice": 62000,
        "total": 124000
      },
      {
        "productId": "prod-15",
        "name": "Samsung 990 Pro 2TB PCIe 4.0 M.2 NVMe Internal SSD",
        "sku": "SSD-SAMSUNG-990P-2TB",
        "quantity": 2,
        "unitPrice": 22500,
        "total": 45000
      }
    ],
    "itemsSummary": "2x Intel Core i7-14700K 20-Core 28-Thread LGA1700 Processor, 2x ASUS ROG Strix Z790-E Gaming WiFi II DDR5 Motherboard, 2x Samsung 990 Pro 2TB PCIe 4.0 M.2 NVMe Internal SSD",
    "subtotal": 265000,
    "discountAmount": 13250,
    "discountPercent": 5,
    "vatAmount": 12588,
    "totalAmount": 264338,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "Delivered",
    "courier": {
      "provider": "Pathao",
      "consignmentId": "PTH-SYL-13234",
      "trackingUrl": "https://merchant.pathao.com/tracking?consignment_id=PTH-SYL-13234",
      "status": "Delivered",
      "codAmount": 0,
      "deliveryFee": 250,
      "recipientCity": "Sylhet",
      "dispatchedAt": "27 Jul 2026, 01:10 PM"
    },
    "orderDate": "27 Jul 2026, 01:10 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-24",
    "orderNumber": "ORD-2026-0708",
    "orderType": "online",
    "customerName": "Star IT Solutions Ltd.",
    "contactNumber": "+880 1819-876543",
    "deliveryAddress": "BCS Computer City, IDB Bhaban, Rokeya Sarani, Agargaon, Dhaka",
    "items": [
      {
        "productId": "prod-1",
        "name": "NVIDIA GeForce RTX 4070 Ti Super 16GB GDDR6X",
        "sku": "GPU-RTX4070TI-16G",
        "quantity": 2,
        "unitPrice": 118500,
        "total": 237000
      },
      {
        "productId": "prod-10",
        "name": "MSI PRO B760M-A WiFi DDR5 mATX Motherboard",
        "sku": "MB-MSI-B760M-PRO",
        "quantity": 2,
        "unitPrice": 19500,
        "total": 39000
      },
      {
        "productId": "prod-13",
        "name": "G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6400MHz",
        "sku": "RAM-GSKILL-32GB-DDR5",
        "quantity": 4,
        "unitPrice": 18500,
        "total": 74000
      }
    ],
    "itemsSummary": "2x NVIDIA GeForce RTX 4070 Ti Super 16GB GDDR6X, 2x MSI PRO B760M-A WiFi DDR5 mATX Motherboard, 4x G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6400MHz",
    "subtotal": 350000,
    "discountAmount": 17500,
    "discountPercent": 5,
    "vatAmount": 16625,
    "totalAmount": 349125,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "Delivered",
    "courier": {
      "provider": "Steadfast",
      "consignmentId": "STDF-DHA-25313",
      "trackingUrl": "https://steadfast.com.bd/t/STDF-DHA-25313",
      "status": "Delivered",
      "codAmount": 0,
      "deliveryFee": 150,
      "recipientCity": "Dhaka City",
      "dispatchedAt": "31 Jul 2026, 06:20 PM"
    },
    "orderDate": "31 Jul 2026, 06:20 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-25",
    "orderNumber": "ORD-2026-0801",
    "orderType": "online",
    "customerName": "UCC Tech World B2B Consignment",
    "contactNumber": "+880 1722-334455",
    "deliveryAddress": "Eastern Plus Market, Shantinagar, Dhaka-1217",
    "items": [
      {
        "productId": "prod-2",
        "name": "MSI GeForce RTX 4060 Ventus 2X Black 8GB OC GDDR6",
        "sku": "GPU-RTX4060-8G",
        "quantity": 5,
        "unitPrice": 38500,
        "total": 192500
      },
      {
        "productId": "prod-6",
        "name": "Intel Core i5-14400 10-Core 16-Thread Desktop Processor",
        "sku": "CPU-INTEL-14400",
        "quantity": 5,
        "unitPrice": 24500,
        "total": 122500
      },
      {
        "productId": "prod-17",
        "name": "Kingston NV2 1TB PCIe 4.0 M.2 NVMe SSD",
        "sku": "SSD-KINGSTON-NV2-1TB",
        "quantity": 10,
        "unitPrice": 7400,
        "total": 74000
      }
    ],
    "itemsSummary": "5x MSI GeForce RTX 4060 Ventus 2X Black 8GB OC GDDR6, 5x Intel Core i5-14400 10-Core 16-Thread Desktop Processor, 10x Kingston NV2 1TB PCIe 4.0 M.2 NVMe SSD",
    "subtotal": 389000,
    "discountAmount": 19450,
    "discountPercent": 5,
    "vatAmount": 18478,
    "totalAmount": 388028,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "Delivered",
    "courier": {
      "provider": "Pathao",
      "consignmentId": "PTH-DHA-13528",
      "trackingUrl": "https://merchant.pathao.com/tracking?consignment_id=PTH-DHA-13528",
      "status": "Delivered",
      "codAmount": 0,
      "deliveryFee": 150,
      "recipientCity": "Dhaka City",
      "dispatchedAt": "04 Aug 2026, 11:40 AM"
    },
    "orderDate": "04 Aug 2026, 11:40 AM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-26",
    "orderNumber": "ORD-2026-0802",
    "orderType": "online",
    "customerName": "Apex Computer Systems",
    "contactNumber": "+880 1711-234567",
    "deliveryAddress": "Shop 402, Level 4, Multiplan Center, Elephant Road, Dhaka-1205",
    "items": [
      {
        "productId": "prod-3",
        "name": "ASUS TUF Gaming GeForce RTX 4080 Super 16GB GDDR6X",
        "sku": "GPU-RTX4080S-16G",
        "quantity": 2,
        "unitPrice": 148000,
        "total": 296000
      },
      {
        "productId": "prod-5",
        "name": "Intel Core i7-14700K 20-Core 28-Thread LGA1700 Processor",
        "sku": "CPU-INTEL-14700K",
        "quantity": 3,
        "unitPrice": 48000,
        "total": 144000
      },
      {
        "productId": "prod-15",
        "name": "Samsung 990 Pro 2TB PCIe 4.0 M.2 NVMe Internal SSD",
        "sku": "SSD-SAMSUNG-990P-2TB",
        "quantity": 3,
        "unitPrice": 22500,
        "total": 67500
      }
    ],
    "itemsSummary": "2x ASUS TUF Gaming GeForce RTX 4080 Super 16GB GDDR6X, 3x Intel Core i7-14700K 20-Core 28-Thread LGA1700 Processor, 3x Samsung 990 Pro 2TB PCIe 4.0 M.2 NVMe Internal SSD",
    "subtotal": 507500,
    "discountAmount": 25375,
    "discountPercent": 5,
    "vatAmount": 24106,
    "totalAmount": 506231,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "Delivered",
    "courier": {
      "provider": "Steadfast",
      "consignmentId": "STDF-DHA-25775",
      "trackingUrl": "https://steadfast.com.bd/t/STDF-DHA-25775",
      "status": "Delivered",
      "codAmount": 0,
      "deliveryFee": 150,
      "recipientCity": "Dhaka City",
      "dispatchedAt": "08 Aug 2026, 02:30 PM"
    },
    "orderDate": "08 Aug 2026, 02:30 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-27",
    "orderNumber": "ORD-2026-0803",
    "orderType": "online",
    "customerName": "Daffodil International University Robotics Lab",
    "contactNumber": "+880 1515-456789",
    "deliveryAddress": "Engineering Dept, Daffodil Smart City, Ashulia, Dhaka",
    "items": [
      {
        "productId": "prod-7",
        "name": "AMD Ryzen 7 7800X3D 8-Core 16-Thread Gaming Processor",
        "sku": "CPU-AMD-7800X3D",
        "quantity": 4,
        "unitPrice": 52000,
        "total": 208000
      },
      {
        "productId": "prod-13",
        "name": "G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6400MHz",
        "sku": "RAM-GSKILL-32GB-DDR5",
        "quantity": 4,
        "unitPrice": 18500,
        "total": 74000
      },
      {
        "productId": "prod-19",
        "name": "DeepCool PK650D 650W 80 PLUS Bronze Power Supply",
        "sku": "PSU-DEEPCOOL-650W",
        "quantity": 4,
        "unitPrice": 5600,
        "total": 22400
      },
      {
        "productId": "prod-22",
        "name": "Lian Li O11 Dynamic EVO RGB Gaming Desktop Casing",
        "sku": "CASE-LIANLI-O11D",
        "quantity": 2,
        "unitPrice": 21500,
        "total": 43000
      }
    ],
    "itemsSummary": "4x AMD Ryzen 7 7800X3D 8-Core 16-Thread Gaming Processor, 4x G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6400MHz, 4x DeepCool PK650D 650W 80 PLUS Bronze Power Supply, 2x Lian Li O11 Dynamic EVO RGB Gaming Desktop Casing",
    "subtotal": 347400,
    "discountAmount": 17370,
    "discountPercent": 5,
    "vatAmount": 16502,
    "totalAmount": 346532,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "Delivered",
    "courier": {
      "provider": "Steadfast",
      "consignmentId": "STDF-DHA-26006",
      "trackingUrl": "https://steadfast.com.bd/t/STDF-DHA-26006",
      "status": "Delivered",
      "codAmount": 0,
      "deliveryFee": 150,
      "recipientCity": "Dhaka City",
      "dispatchedAt": "12 Aug 2026, 04:15 PM"
    },
    "orderDate": "12 Aug 2026, 04:15 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-28",
    "orderNumber": "ORD-2026-0804",
    "orderType": "online",
    "customerName": "Chittagong Tech Point",
    "contactNumber": "+880 1611-987654",
    "deliveryAddress": "Shop 12, Ground Floor, Central Plaza, GEC Circle, Chattogram",
    "items": [
      {
        "productId": "prod-1",
        "name": "NVIDIA GeForce RTX 4070 Ti Super 16GB GDDR6X",
        "sku": "GPU-RTX4070TI-16G",
        "quantity": 2,
        "unitPrice": 118500,
        "total": 237000
      },
      {
        "productId": "prod-4",
        "name": "Sapphire PULSE AMD Radeon RX 7800 XT 16GB Gaming GPU",
        "sku": "GPU-RX7800XT-16G",
        "quantity": 2,
        "unitPrice": 68500,
        "total": 137000
      },
      {
        "productId": "prod-12",
        "name": "Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz CL30",
        "sku": "RAM-CORSAIR-32GB-DDR5",
        "quantity": 4,
        "unitPrice": 15200,
        "total": 60800
      }
    ],
    "itemsSummary": "2x NVIDIA GeForce RTX 4070 Ti Super 16GB GDDR6X, 2x Sapphire PULSE AMD Radeon RX 7800 XT 16GB Gaming GPU, 4x Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz CL30",
    "subtotal": 434800,
    "discountAmount": 21740,
    "discountPercent": 5,
    "vatAmount": 20653,
    "totalAmount": 433713,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "Delivered",
    "courier": {
      "provider": "Pathao",
      "consignmentId": "PTH-CHA-13969",
      "trackingUrl": "https://merchant.pathao.com/tracking?consignment_id=PTH-CHA-13969",
      "status": "Delivered",
      "codAmount": 0,
      "deliveryFee": 250,
      "recipientCity": "Chattogram",
      "dispatchedAt": "16 Aug 2026, 12:20 PM"
    },
    "orderDate": "16 Aug 2026, 12:20 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-29",
    "orderNumber": "ORD-2026-0805",
    "orderType": "offline",
    "customerName": "Elephant Road Walk-in Client",
    "contactNumber": "+880 1700-000002",
    "deliveryAddress": "Level 4, Multiplan Center, Elephant Road, Dhaka",
    "items": [
      {
        "productId": "prod-27",
        "name": "Lenovo IdeaPad Slim 3 15IRH8 (Core i5 13th Gen, 16GB, 512GB)",
        "sku": "LAPTOP-LENOVO-IP3",
        "quantity": 1,
        "unitPrice": 72000,
        "total": 72000
      }
    ],
    "itemsSummary": "1x Lenovo IdeaPad Slim 3 15IRH8 (Core i5 13th Gen, 16GB, 512GB)",
    "subtotal": 72000,
    "discountAmount": 0,
    "discountPercent": 0,
    "vatAmount": 3600,
    "totalAmount": 75600,
    "paymentMethod": "cash",
    "paymentStatus": "Paid",
    "status": "Counter Collected",
    "courier": null,
    "orderDate": "20 Aug 2026, 03:40 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-30",
    "orderNumber": "ORD-2026-0806",
    "orderType": "online",
    "customerName": "Brain Station 23 Workstation Unit",
    "contactNumber": "+880 1733-112233",
    "deliveryAddress": "Building 2, Mohakhali DOHS, Dhaka-1206",
    "items": [
      {
        "productId": "prod-5",
        "name": "Intel Core i7-14700K 20-Core 28-Thread LGA1700 Processor",
        "sku": "CPU-INTEL-14700K",
        "quantity": 3,
        "unitPrice": 48000,
        "total": 144000
      },
      {
        "productId": "prod-9",
        "name": "ASUS ROG Strix Z790-E Gaming WiFi II DDR5 Motherboard",
        "sku": "MB-ASUS-Z790E-WIFI",
        "quantity": 3,
        "unitPrice": 62000,
        "total": 186000
      },
      {
        "productId": "prod-15",
        "name": "Samsung 990 Pro 2TB PCIe 4.0 M.2 NVMe Internal SSD",
        "sku": "SSD-SAMSUNG-990P-2TB",
        "quantity": 4,
        "unitPrice": 22500,
        "total": 90000
      },
      {
        "productId": "prod-24",
        "name": "LG UltraGear 27GN800-B 27\" QHD 144Hz 1ms IPS Gaming Monitor",
        "sku": "MON-LG-27GN800",
        "quantity": 2,
        "unitPrice": 34500,
        "total": 69000
      }
    ],
    "itemsSummary": "3x Intel Core i7-14700K 20-Core 28-Thread LGA1700 Processor, 3x ASUS ROG Strix Z790-E Gaming WiFi II DDR5 Motherboard, 4x Samsung 990 Pro 2TB PCIe 4.0 M.2 NVMe Internal SSD, 2x LG UltraGear 27GN800-B 27\" QHD 144Hz 1ms IPS Gaming Monitor",
    "subtotal": 489000,
    "discountAmount": 24450,
    "discountPercent": 5,
    "vatAmount": 23228,
    "totalAmount": 487778,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "Delivered",
    "courier": {
      "provider": "Steadfast",
      "consignmentId": "STDF-DHA-26699",
      "trackingUrl": "https://steadfast.com.bd/t/STDF-DHA-26699",
      "status": "Delivered",
      "codAmount": 0,
      "deliveryFee": 150,
      "recipientCity": "Dhaka City",
      "dispatchedAt": "24 Aug 2026, 05:00 PM"
    },
    "orderDate": "24 Aug 2026, 05:00 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-31",
    "orderNumber": "ORD-2026-0807",
    "orderType": "online",
    "customerName": "Rajshahi IT Zone",
    "contactNumber": "+880 1933-556677",
    "deliveryAddress": "Shop 8, New Market, Alokar More, Rajshahi-6000",
    "items": [
      {
        "productId": "prod-2",
        "name": "MSI GeForce RTX 4060 Ventus 2X Black 8GB OC GDDR6",
        "sku": "GPU-RTX4060-8G",
        "quantity": 3,
        "unitPrice": 38500,
        "total": 115500
      },
      {
        "productId": "prod-6",
        "name": "Intel Core i5-14400 10-Core 16-Thread Desktop Processor",
        "sku": "CPU-INTEL-14400",
        "quantity": 3,
        "unitPrice": 24500,
        "total": 73500
      },
      {
        "productId": "prod-18",
        "name": "Corsair RM850x 850W 80 PLUS Gold Fully Modular PSU",
        "sku": "PSU-CORSAIR-850W",
        "quantity": 3,
        "unitPrice": 16800,
        "total": 50400
      }
    ],
    "itemsSummary": "3x MSI GeForce RTX 4060 Ventus 2X Black 8GB OC GDDR6, 3x Intel Core i5-14400 10-Core 16-Thread Desktop Processor, 3x Corsair RM850x 850W 80 PLUS Gold Fully Modular PSU",
    "subtotal": 239400,
    "discountAmount": 11970,
    "discountPercent": 5,
    "vatAmount": 11372,
    "totalAmount": 238802,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "Delivered",
    "courier": {
      "provider": "Steadfast",
      "consignmentId": "STDF-RAJ-26930",
      "trackingUrl": "https://steadfast.com.bd/t/STDF-RAJ-26930",
      "status": "Delivered",
      "codAmount": 0,
      "deliveryFee": 250,
      "recipientCity": "Rajshahi",
      "dispatchedAt": "27 Aug 2026, 01:30 PM"
    },
    "orderDate": "27 Aug 2026, 01:30 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-32",
    "orderNumber": "ORD-2026-0808",
    "orderType": "offline",
    "customerName": "Dhaka Cyber Gaming Cafe",
    "contactNumber": "+880 1610-998877",
    "deliveryAddress": "House 14, Road 27, Dhanmondi, Dhaka-1209",
    "items": [
      {
        "productId": "prod-8",
        "name": "AMD Ryzen 5 7600X 6-Core 12-Thread AM5 Gaming Processor",
        "sku": "CPU-AMD-7600X",
        "quantity": 2,
        "unitPrice": 26000,
        "total": 52000
      },
      {
        "productId": "prod-11",
        "name": "Gigabyte B650M Gaming WiFi AM5 Motherboard",
        "sku": "MB-GIGABYTE-B650M",
        "quantity": 2,
        "unitPrice": 17800,
        "total": 35600
      },
      {
        "productId": "prod-19",
        "name": "DeepCool PK650D 650W 80 PLUS Bronze Power Supply",
        "sku": "PSU-DEEPCOOL-650W",
        "quantity": 2,
        "unitPrice": 5600,
        "total": 11200
      }
    ],
    "itemsSummary": "2x AMD Ryzen 5 7600X 6-Core 12-Thread AM5 Gaming Processor, 2x Gigabyte B650M Gaming WiFi AM5 Motherboard, 2x DeepCool PK650D 650W 80 PLUS Bronze Power Supply",
    "subtotal": 98800,
    "discountAmount": 4940,
    "discountPercent": 5,
    "vatAmount": 4693,
    "totalAmount": 98553,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "Counter Collected",
    "courier": null,
    "orderDate": "30 Aug 2026, 06:10 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-33",
    "orderNumber": "ORD-2026-0901",
    "orderType": "online",
    "customerName": "Star IT Solutions Ltd.",
    "contactNumber": "+880 1819-876543",
    "deliveryAddress": "BCS Computer City, IDB Bhaban, Rokeya Sarani, Agargaon, Dhaka",
    "items": [
      {
        "productId": "prod-1",
        "name": "NVIDIA GeForce RTX 4070 Ti Super 16GB GDDR6X",
        "sku": "GPU-RTX4070TI-16G",
        "quantity": 3,
        "unitPrice": 118500,
        "total": 355500
      },
      {
        "productId": "prod-9",
        "name": "ASUS ROG Strix Z790-E Gaming WiFi II DDR5 Motherboard",
        "sku": "MB-ASUS-Z790E-WIFI",
        "quantity": 3,
        "unitPrice": 62000,
        "total": 186000
      },
      {
        "productId": "prod-15",
        "name": "Samsung 990 Pro 2TB PCIe 4.0 M.2 NVMe Internal SSD",
        "sku": "SSD-SAMSUNG-990P-2TB",
        "quantity": 3,
        "unitPrice": 22500,
        "total": 67500
      }
    ],
    "itemsSummary": "3x NVIDIA GeForce RTX 4070 Ti Super 16GB GDDR6X, 3x ASUS ROG Strix Z790-E Gaming WiFi II DDR5 Motherboard, 3x Samsung 990 Pro 2TB PCIe 4.0 M.2 NVMe Internal SSD",
    "subtotal": 609000,
    "discountAmount": 30450,
    "discountPercent": 5,
    "vatAmount": 28928,
    "totalAmount": 607478,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "Delivered",
    "courier": {
      "provider": "Pathao",
      "consignmentId": "PTH-DHA-14704",
      "trackingUrl": "https://merchant.pathao.com/tracking?consignment_id=PTH-DHA-14704",
      "status": "Delivered",
      "codAmount": 0,
      "deliveryFee": 150,
      "recipientCity": "Dhaka City",
      "dispatchedAt": "03 Sep 2026, 11:15 AM"
    },
    "orderDate": "03 Sep 2026, 11:15 AM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-34",
    "orderNumber": "ORD-2026-0902",
    "orderType": "online",
    "customerName": "Apex Computer Systems",
    "contactNumber": "+880 1711-234567",
    "deliveryAddress": "Shop 402, Level 4, Multiplan Center, Elephant Road, Dhaka-1205",
    "items": [
      {
        "productId": "prod-3",
        "name": "ASUS TUF Gaming GeForce RTX 4080 Super 16GB GDDR6X",
        "sku": "GPU-RTX4080S-16G",
        "quantity": 2,
        "unitPrice": 148000,
        "total": 296000
      },
      {
        "productId": "prod-5",
        "name": "Intel Core i7-14700K 20-Core 28-Thread LGA1700 Processor",
        "sku": "CPU-INTEL-14700K",
        "quantity": 3,
        "unitPrice": 48000,
        "total": 144000
      },
      {
        "productId": "prod-13",
        "name": "G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6400MHz",
        "sku": "RAM-GSKILL-32GB-DDR5",
        "quantity": 4,
        "unitPrice": 18500,
        "total": 74000
      }
    ],
    "itemsSummary": "2x ASUS TUF Gaming GeForce RTX 4080 Super 16GB GDDR6X, 3x Intel Core i7-14700K 20-Core 28-Thread LGA1700 Processor, 4x G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6400MHz",
    "subtotal": 514000,
    "discountAmount": 25700,
    "discountPercent": 5,
    "vatAmount": 24415,
    "totalAmount": 512715,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "Delivered",
    "courier": {
      "provider": "Steadfast",
      "consignmentId": "STDF-DHA-27623",
      "trackingUrl": "https://steadfast.com.bd/t/STDF-DHA-27623",
      "status": "Delivered",
      "codAmount": 0,
      "deliveryFee": 150,
      "recipientCity": "Dhaka City",
      "dispatchedAt": "07 Sep 2026, 02:20 PM"
    },
    "orderDate": "07 Sep 2026, 02:20 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-35",
    "orderNumber": "ORD-2026-0903",
    "orderType": "online",
    "customerName": "Chittagong Tech Point",
    "contactNumber": "+880 1611-987654",
    "deliveryAddress": "Shop 12, Ground Floor, Central Plaza, GEC Circle, Chattogram",
    "items": [
      {
        "productId": "prod-1",
        "name": "NVIDIA GeForce RTX 4070 Ti Super 16GB GDDR6X",
        "sku": "GPU-RTX4070TI-16G",
        "quantity": 3,
        "unitPrice": 118500,
        "total": 355500
      },
      {
        "productId": "prod-2",
        "name": "MSI GeForce RTX 4060 Ventus 2X Black 8GB OC GDDR6",
        "sku": "GPU-RTX4060-8G",
        "quantity": 4,
        "unitPrice": 38500,
        "total": 154000
      },
      {
        "productId": "prod-12",
        "name": "Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz CL30",
        "sku": "RAM-CORSAIR-32GB-DDR5",
        "quantity": 5,
        "unitPrice": 15200,
        "total": 76000
      }
    ],
    "itemsSummary": "3x NVIDIA GeForce RTX 4070 Ti Super 16GB GDDR6X, 4x MSI GeForce RTX 4060 Ventus 2X Black 8GB OC GDDR6, 5x Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz CL30",
    "subtotal": 585500,
    "discountAmount": 29275,
    "discountPercent": 5,
    "vatAmount": 27811,
    "totalAmount": 584036,
    "paymentMethod": "credit_30d",
    "paymentStatus": "Credit 30D",
    "status": "Delivered",
    "courier": {
      "provider": "Steadfast",
      "consignmentId": "STDF-CHA-27854",
      "trackingUrl": "https://steadfast.com.bd/t/STDF-CHA-27854",
      "status": "Delivered",
      "codAmount": 0,
      "deliveryFee": 250,
      "recipientCity": "Chattogram",
      "dispatchedAt": "12 Sep 2026, 04:30 PM"
    },
    "orderDate": "12 Sep 2026, 04:30 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-36",
    "orderNumber": "ORD-2026-0904",
    "orderType": "online",
    "customerName": "UCC Tech World B2B Consignment",
    "contactNumber": "+880 1722-334455",
    "deliveryAddress": "Eastern Plus Market, Shantinagar, Dhaka-1217",
    "items": [
      {
        "productId": "prod-4",
        "name": "Sapphire PULSE AMD Radeon RX 7800 XT 16GB Gaming GPU",
        "sku": "GPU-RX7800XT-16G",
        "quantity": 3,
        "unitPrice": 68500,
        "total": 205500
      },
      {
        "productId": "prod-8",
        "name": "AMD Ryzen 5 7600X 6-Core 12-Thread AM5 Gaming Processor",
        "sku": "CPU-AMD-7600X",
        "quantity": 3,
        "unitPrice": 26000,
        "total": 78000
      },
      {
        "productId": "prod-17",
        "name": "Kingston NV2 1TB PCIe 4.0 M.2 NVMe SSD",
        "sku": "SSD-KINGSTON-NV2-1TB",
        "quantity": 6,
        "unitPrice": 7400,
        "total": 44400
      }
    ],
    "itemsSummary": "3x Sapphire PULSE AMD Radeon RX 7800 XT 16GB Gaming GPU, 3x AMD Ryzen 5 7600X 6-Core 12-Thread AM5 Gaming Processor, 6x Kingston NV2 1TB PCIe 4.0 M.2 NVMe SSD",
    "subtotal": 327900,
    "discountAmount": 16395,
    "discountPercent": 5,
    "vatAmount": 15575,
    "totalAmount": 327080,
    "paymentMethod": "credit_30d",
    "paymentStatus": "Credit 30D",
    "status": "Delivered",
    "courier": {
      "provider": "Pathao",
      "consignmentId": "PTH-DHA-15145",
      "trackingUrl": "https://merchant.pathao.com/tracking?consignment_id=PTH-DHA-15145",
      "status": "Delivered",
      "codAmount": 0,
      "deliveryFee": 150,
      "recipientCity": "Dhaka City",
      "dispatchedAt": "16 Sep 2026, 12:40 PM"
    },
    "orderDate": "16 Sep 2026, 12:40 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-37",
    "orderNumber": "ORD-2026-0905",
    "orderType": "online",
    "customerName": "Khulna Computer Hub",
    "contactNumber": "+880 1644-667788",
    "deliveryAddress": "Jolil Tower, Upper Jashore Road, Khulna-9100",
    "items": [
      {
        "productId": "prod-5",
        "name": "Intel Core i7-14700K 20-Core 28-Thread LGA1700 Processor",
        "sku": "CPU-INTEL-14700K",
        "quantity": 2,
        "unitPrice": 48000,
        "total": 96000
      },
      {
        "productId": "prod-10",
        "name": "MSI PRO B760M-A WiFi DDR5 mATX Motherboard",
        "sku": "MB-MSI-B760M-PRO",
        "quantity": 2,
        "unitPrice": 19500,
        "total": 39000
      },
      {
        "productId": "prod-19",
        "name": "DeepCool PK650D 650W 80 PLUS Bronze Power Supply",
        "sku": "PSU-DEEPCOOL-650W",
        "quantity": 2,
        "unitPrice": 5600,
        "total": 11200
      }
    ],
    "itemsSummary": "2x Intel Core i7-14700K 20-Core 28-Thread LGA1700 Processor, 2x MSI PRO B760M-A WiFi DDR5 mATX Motherboard, 2x DeepCool PK650D 650W 80 PLUS Bronze Power Supply",
    "subtotal": 146200,
    "discountAmount": 7310,
    "discountPercent": 5,
    "vatAmount": 6944,
    "totalAmount": 145834,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "Delivered",
    "courier": {
      "provider": "Steadfast",
      "consignmentId": "STDF-KHU-28316",
      "trackingUrl": "https://steadfast.com.bd/t/STDF-KHU-28316",
      "status": "Delivered",
      "codAmount": 0,
      "deliveryFee": 250,
      "recipientCity": "Khulna",
      "dispatchedAt": "20 Sep 2026, 03:10 PM"
    },
    "orderDate": "20 Sep 2026, 03:10 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-38",
    "orderNumber": "ORD-2026-0906",
    "orderType": "online",
    "customerName": "Sylhet Digital World",
    "contactNumber": "+880 1822-445566",
    "deliveryAddress": "Millennium Market, Zindabazar, Sylhet-3100",
    "items": [
      {
        "productId": "prod-2",
        "name": "MSI GeForce RTX 4060 Ventus 2X Black 8GB OC GDDR6",
        "sku": "GPU-RTX4060-8G",
        "quantity": 3,
        "unitPrice": 38500,
        "total": 115500
      },
      {
        "productId": "prod-6",
        "name": "Intel Core i5-14400 10-Core 16-Thread Desktop Processor",
        "sku": "CPU-INTEL-14400",
        "quantity": 3,
        "unitPrice": 24500,
        "total": 73500
      },
      {
        "productId": "prod-18",
        "name": "Corsair RM850x 850W 80 PLUS Gold Fully Modular PSU",
        "sku": "PSU-CORSAIR-850W",
        "quantity": 3,
        "unitPrice": 16800,
        "total": 50400
      }
    ],
    "itemsSummary": "3x MSI GeForce RTX 4060 Ventus 2X Black 8GB OC GDDR6, 3x Intel Core i5-14400 10-Core 16-Thread Desktop Processor, 3x Corsair RM850x 850W 80 PLUS Gold Fully Modular PSU",
    "subtotal": 239400,
    "discountAmount": 11970,
    "discountPercent": 5,
    "vatAmount": 11372,
    "totalAmount": 238802,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "Delivered",
    "courier": {
      "provider": "Pathao",
      "consignmentId": "PTH-SYL-15439",
      "trackingUrl": "https://merchant.pathao.com/tracking?consignment_id=PTH-SYL-15439",
      "status": "Delivered",
      "codAmount": 0,
      "deliveryFee": 250,
      "recipientCity": "Sylhet",
      "dispatchedAt": "23 Sep 2026, 05:30 PM"
    },
    "orderDate": "23 Sep 2026, 05:30 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-39",
    "orderNumber": "ORD-2026-0907",
    "orderType": "online",
    "customerName": "TechLand BD Partner Store",
    "contactNumber": "+880 1912-345678",
    "deliveryAddress": "Level 3, Multiplan Center, Elephant Road, Dhaka",
    "items": [
      {
        "productId": "prod-1",
        "name": "NVIDIA GeForce RTX 4070 Ti Super 16GB GDDR6X",
        "sku": "GPU-RTX4070TI-16G",
        "quantity": 1,
        "unitPrice": 118500,
        "total": 118500
      },
      {
        "productId": "prod-7",
        "name": "AMD Ryzen 7 7800X3D 8-Core 16-Thread Gaming Processor",
        "sku": "CPU-AMD-7800X3D",
        "quantity": 2,
        "unitPrice": 52000,
        "total": 104000
      },
      {
        "productId": "prod-13",
        "name": "G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6400MHz",
        "sku": "RAM-GSKILL-32GB-DDR5",
        "quantity": 2,
        "unitPrice": 18500,
        "total": 37000
      }
    ],
    "itemsSummary": "1x NVIDIA GeForce RTX 4070 Ti Super 16GB GDDR6X, 2x AMD Ryzen 7 7800X3D 8-Core 16-Thread Gaming Processor, 2x G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6400MHz",
    "subtotal": 259500,
    "discountAmount": 12975,
    "discountPercent": 5,
    "vatAmount": 12326,
    "totalAmount": 258851,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "Delivered",
    "courier": {
      "provider": "Steadfast",
      "consignmentId": "STDF-DHA-28778",
      "trackingUrl": "https://steadfast.com.bd/t/STDF-DHA-28778",
      "status": "Delivered",
      "codAmount": 0,
      "deliveryFee": 150,
      "recipientCity": "Dhaka City",
      "dispatchedAt": "27 Sep 2026, 01:15 PM"
    },
    "orderDate": "27 Sep 2026, 01:15 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-40",
    "orderNumber": "ORD-2026-0908",
    "orderType": "offline",
    "customerName": "Banani Showroom Walk-in Client",
    "contactNumber": "+880 1700-000001",
    "deliveryAddress": "Plot 18, Road 11, Block D, Banani, Dhaka",
    "items": [
      {
        "productId": "prod-20",
        "name": "MSI MAG CoreLiquid 360R V2 ARGB AIO Liquid CPU Cooler",
        "sku": "COOL-MSI-360R-V2",
        "quantity": 1,
        "unitPrice": 14500,
        "total": 14500
      },
      {
        "productId": "prod-21",
        "name": "DeepCool AK400 Zero Dark Performance CPU Air Cooler",
        "sku": "COOL-DEEPCOOL-AK400",
        "quantity": 1,
        "unitPrice": 3800,
        "total": 3800
      },
      {
        "productId": "prod-23",
        "name": "Montech Air 903 Max E-ATX Mid-Tower Case with 4x ARGB",
        "sku": "CASE-MONTECH-AIR903",
        "quantity": 1,
        "unitPrice": 8200,
        "total": 8200
      }
    ],
    "itemsSummary": "1x MSI MAG CoreLiquid 360R V2 ARGB AIO Liquid CPU Cooler, 1x DeepCool AK400 Zero Dark Performance CPU Air Cooler, 1x Montech Air 903 Max E-ATX Mid-Tower Case with 4x ARGB",
    "subtotal": 26500,
    "discountAmount": 1325,
    "discountPercent": 5,
    "vatAmount": 1259,
    "totalAmount": 26434,
    "paymentMethod": "bkash",
    "paymentStatus": "Paid",
    "status": "Counter Collected",
    "courier": null,
    "orderDate": "29 Sep 2026, 06:00 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-41",
    "orderNumber": "ORD-2026-1001",
    "orderType": "online",
    "customerName": "Apex Computer Systems",
    "contactNumber": "+880 1711-234567",
    "deliveryAddress": "Shop 402, Level 4, Multiplan Center, Elephant Road, Dhaka-1205",
    "items": [
      {
        "productId": "prod-1",
        "name": "NVIDIA GeForce RTX 4070 Ti Super 16GB GDDR6X",
        "sku": "GPU-RTX4070TI-16G",
        "quantity": 2,
        "unitPrice": 118500,
        "total": 237000
      },
      {
        "productId": "prod-9",
        "name": "ASUS ROG Strix Z790-E Gaming WiFi II DDR5 Motherboard",
        "sku": "MB-ASUS-Z790E-WIFI",
        "quantity": 2,
        "unitPrice": 62000,
        "total": 124000
      },
      {
        "productId": "prod-15",
        "name": "Samsung 990 Pro 2TB PCIe 4.0 M.2 NVMe Internal SSD",
        "sku": "SSD-SAMSUNG-990P-2TB",
        "quantity": 2,
        "unitPrice": 22500,
        "total": 45000
      }
    ],
    "itemsSummary": "2x NVIDIA GeForce RTX 4070 Ti Super 16GB GDDR6X, 2x ASUS ROG Strix Z790-E Gaming WiFi II DDR5 Motherboard, 2x Samsung 990 Pro 2TB PCIe 4.0 M.2 NVMe Internal SSD",
    "subtotal": 406000,
    "discountAmount": 20300,
    "discountPercent": 5,
    "vatAmount": 19285,
    "totalAmount": 404985,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "Delivered",
    "courier": {
      "provider": "Steadfast",
      "consignmentId": "STDF-DHA-29240",
      "trackingUrl": "https://steadfast.com.bd/t/STDF-DHA-29240",
      "status": "Delivered",
      "codAmount": 0,
      "deliveryFee": 150,
      "recipientCity": "Dhaka City",
      "dispatchedAt": "02 Oct 2026, 11:30 AM"
    },
    "orderDate": "02 Oct 2026, 11:30 AM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-42",
    "orderNumber": "ORD-2026-1002",
    "orderType": "online",
    "customerName": "Star IT Solutions Ltd.",
    "contactNumber": "+880 1819-876543",
    "deliveryAddress": "BCS Computer City, IDB Bhaban, Rokeya Sarani, Agargaon, Dhaka",
    "items": [
      {
        "productId": "prod-3",
        "name": "ASUS TUF Gaming GeForce RTX 4080 Super 16GB GDDR6X",
        "sku": "GPU-RTX4080S-16G",
        "quantity": 1,
        "unitPrice": 148000,
        "total": 148000
      },
      {
        "productId": "prod-5",
        "name": "Intel Core i7-14700K 20-Core 28-Thread LGA1700 Processor",
        "sku": "CPU-INTEL-14700K",
        "quantity": 2,
        "unitPrice": 48000,
        "total": 96000
      },
      {
        "productId": "prod-13",
        "name": "G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6400MHz",
        "sku": "RAM-GSKILL-32GB-DDR5",
        "quantity": 4,
        "unitPrice": 18500,
        "total": 74000
      }
    ],
    "itemsSummary": "1x ASUS TUF Gaming GeForce RTX 4080 Super 16GB GDDR6X, 2x Intel Core i7-14700K 20-Core 28-Thread LGA1700 Processor, 4x G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6400MHz",
    "subtotal": 318000,
    "discountAmount": 15900,
    "discountPercent": 5,
    "vatAmount": 15105,
    "totalAmount": 317205,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "Delivered",
    "courier": {
      "provider": "Pathao",
      "consignmentId": "PTH-DHA-16027",
      "trackingUrl": "https://merchant.pathao.com/tracking?consignment_id=PTH-DHA-16027",
      "status": "Delivered",
      "codAmount": 0,
      "deliveryFee": 150,
      "recipientCity": "Dhaka City",
      "dispatchedAt": "05 Oct 2026, 02:45 PM"
    },
    "orderDate": "05 Oct 2026, 02:45 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-43",
    "orderNumber": "ORD-2026-1003",
    "orderType": "online",
    "customerName": "Chittagong Tech Point",
    "contactNumber": "+880 1611-987654",
    "deliveryAddress": "Shop 12, Ground Floor, Central Plaza, GEC Circle, Chattogram",
    "items": [
      {
        "productId": "prod-1",
        "name": "NVIDIA GeForce RTX 4070 Ti Super 16GB GDDR6X",
        "sku": "GPU-RTX4070TI-16G",
        "quantity": 2,
        "unitPrice": 118500,
        "total": 237000
      },
      {
        "productId": "prod-10",
        "name": "MSI PRO B760M-A WiFi DDR5 mATX Motherboard",
        "sku": "MB-MSI-B760M-PRO",
        "quantity": 2,
        "unitPrice": 19500,
        "total": 39000
      },
      {
        "productId": "prod-19",
        "name": "DeepCool PK650D 650W 80 PLUS Bronze Power Supply",
        "sku": "PSU-DEEPCOOL-650W",
        "quantity": 2,
        "unitPrice": 5600,
        "total": 11200
      }
    ],
    "itemsSummary": "2x NVIDIA GeForce RTX 4070 Ti Super 16GB GDDR6X, 2x MSI PRO B760M-A WiFi DDR5 mATX Motherboard, 2x DeepCool PK650D 650W 80 PLUS Bronze Power Supply",
    "subtotal": 287200,
    "discountAmount": 14360,
    "discountPercent": 5,
    "vatAmount": 13642,
    "totalAmount": 286482,
    "paymentMethod": "bank_transfer",
    "paymentStatus": "Paid",
    "status": "In Transit",
    "courier": {
      "provider": "Steadfast",
      "consignmentId": "STDF-CHA-29702",
      "trackingUrl": "https://steadfast.com.bd/t/STDF-CHA-29702",
      "status": "In Transit",
      "codAmount": 0,
      "deliveryFee": 250,
      "recipientCity": "Chattogram",
      "dispatchedAt": "08 Oct 2026, 04:20 PM"
    },
    "orderDate": "08 Oct 2026, 04:20 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-44",
    "orderNumber": "ORD-2026-1004",
    "orderType": "online",
    "customerName": "Sylhet Digital World",
    "contactNumber": "+880 1822-445566",
    "deliveryAddress": "Millennium Market, Zindabazar, Sylhet-3100",
    "items": [
      {
        "productId": "prod-2",
        "name": "MSI GeForce RTX 4060 Ventus 2X Black 8GB OC GDDR6",
        "sku": "GPU-RTX4060-8G",
        "quantity": 2,
        "unitPrice": 38500,
        "total": 77000
      },
      {
        "productId": "prod-6",
        "name": "Intel Core i5-14400 10-Core 16-Thread Desktop Processor",
        "sku": "CPU-INTEL-14400",
        "quantity": 2,
        "unitPrice": 24500,
        "total": 49000
      },
      {
        "productId": "prod-17",
        "name": "Kingston NV2 1TB PCIe 4.0 M.2 NVMe SSD",
        "sku": "SSD-KINGSTON-NV2-1TB",
        "quantity": 2,
        "unitPrice": 7400,
        "total": 14800
      }
    ],
    "itemsSummary": "2x MSI GeForce RTX 4060 Ventus 2X Black 8GB OC GDDR6, 2x Intel Core i5-14400 10-Core 16-Thread Desktop Processor, 2x Kingston NV2 1TB PCIe 4.0 M.2 NVMe SSD",
    "subtotal": 140800,
    "discountAmount": 7040,
    "discountPercent": 5,
    "vatAmount": 6688,
    "totalAmount": 140448,
    "paymentMethod": "cash",
    "paymentStatus": "COD Pending",
    "status": "In Transit",
    "courier": {
      "provider": "Pathao",
      "consignmentId": "PTH-SYL-16321",
      "trackingUrl": "https://merchant.pathao.com/tracking?consignment_id=PTH-SYL-16321",
      "status": "In Transit",
      "codAmount": 140448,
      "deliveryFee": 250,
      "recipientCity": "Sylhet",
      "dispatchedAt": "11 Oct 2026, 12:15 PM"
    },
    "orderDate": "11 Oct 2026, 12:15 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-45",
    "orderNumber": "ORD-2026-1005",
    "orderType": "online",
    "customerName": "Rajshahi IT Zone",
    "contactNumber": "+880 1933-556677",
    "deliveryAddress": "Shop 8, New Market, Alokar More, Rajshahi-6000",
    "items": [
      {
        "productId": "prod-4",
        "name": "Sapphire PULSE AMD Radeon RX 7800 XT 16GB Gaming GPU",
        "sku": "GPU-RX7800XT-16G",
        "quantity": 1,
        "unitPrice": 68500,
        "total": 68500
      },
      {
        "productId": "prod-8",
        "name": "AMD Ryzen 5 7600X 6-Core 12-Thread AM5 Gaming Processor",
        "sku": "CPU-AMD-7600X",
        "quantity": 1,
        "unitPrice": 26000,
        "total": 26000
      },
      {
        "productId": "prod-18",
        "name": "Corsair RM850x 850W 80 PLUS Gold Fully Modular PSU",
        "sku": "PSU-CORSAIR-850W",
        "quantity": 2,
        "unitPrice": 16800,
        "total": 33600
      }
    ],
    "itemsSummary": "1x Sapphire PULSE AMD Radeon RX 7800 XT 16GB Gaming GPU, 1x AMD Ryzen 5 7600X 6-Core 12-Thread AM5 Gaming Processor, 2x Corsair RM850x 850W 80 PLUS Gold Fully Modular PSU",
    "subtotal": 128100,
    "discountAmount": 6405,
    "discountPercent": 5,
    "vatAmount": 6085,
    "totalAmount": 127780,
    "paymentMethod": "cash",
    "paymentStatus": "COD Pending",
    "status": "In Transit",
    "courier": {
      "provider": "Pathao",
      "consignmentId": "PTH-RAJ-16468",
      "trackingUrl": "https://merchant.pathao.com/tracking?consignment_id=PTH-RAJ-16468",
      "status": "In Transit",
      "codAmount": 127780,
      "deliveryFee": 250,
      "recipientCity": "Rajshahi",
      "dispatchedAt": "14 Oct 2026, 03:30 PM"
    },
    "orderDate": "14 Oct 2026, 03:30 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-46",
    "orderNumber": "ORD-2026-1006",
    "orderType": "online",
    "customerName": "Dhaka Cyber Gaming Cafe",
    "contactNumber": "+880 1610-998877",
    "deliveryAddress": "House 14, Road 27, Dhanmondi, Dhaka-1209",
    "items": [
      {
        "productId": "prod-7",
        "name": "AMD Ryzen 7 7800X3D 8-Core 16-Thread Gaming Processor",
        "sku": "CPU-AMD-7800X3D",
        "quantity": 2,
        "unitPrice": 52000,
        "total": 104000
      },
      {
        "productId": "prod-12",
        "name": "Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz CL30",
        "sku": "RAM-CORSAIR-32GB-DDR5",
        "quantity": 2,
        "unitPrice": 15200,
        "total": 30400
      },
      {
        "productId": "prod-24",
        "name": "LG UltraGear 27GN800-B 27\" QHD 144Hz 1ms IPS Gaming Monitor",
        "sku": "MON-LG-27GN800",
        "quantity": 2,
        "unitPrice": 34500,
        "total": 69000
      }
    ],
    "itemsSummary": "2x AMD Ryzen 7 7800X3D 8-Core 16-Thread Gaming Processor, 2x Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz CL30, 2x LG UltraGear 27GN800-B 27\" QHD 144Hz 1ms IPS Gaming Monitor",
    "subtotal": 203400,
    "discountAmount": 10170,
    "discountPercent": 5,
    "vatAmount": 9662,
    "totalAmount": 202892,
    "paymentMethod": "bkash",
    "paymentStatus": "Paid",
    "status": "Ready for Dispatch",
    "courier": {
      "provider": "Steadfast",
      "consignmentId": "STDF-DHA-30395",
      "trackingUrl": "https://steadfast.com.bd/t/STDF-DHA-30395",
      "status": "Awaiting Rider Pickup",
      "codAmount": 0,
      "deliveryFee": 150,
      "recipientCity": "Dhaka City",
      "dispatchedAt": "16 Oct 2026, 05:10 PM"
    },
    "orderDate": "16 Oct 2026, 05:10 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-47",
    "orderNumber": "ORD-2026-1007",
    "orderType": "offline",
    "customerName": "Banani Showroom Walk-in Client",
    "contactNumber": "+880 1700-000001",
    "deliveryAddress": "Plot 18, Road 11, Block D, Banani, Dhaka",
    "items": [
      {
        "productId": "prod-2",
        "name": "MSI GeForce RTX 4060 Ventus 2X Black 8GB OC GDDR6",
        "sku": "GPU-RTX4060-8G",
        "quantity": 1,
        "unitPrice": 38500,
        "total": 38500
      },
      {
        "productId": "prod-19",
        "name": "DeepCool PK650D 650W 80 PLUS Bronze Power Supply",
        "sku": "PSU-DEEPCOOL-650W",
        "quantity": 1,
        "unitPrice": 5600,
        "total": 5600
      },
      {
        "productId": "prod-21",
        "name": "DeepCool AK400 Zero Dark Performance CPU Air Cooler",
        "sku": "COOL-DEEPCOOL-AK400",
        "quantity": 1,
        "unitPrice": 3800,
        "total": 3800
      }
    ],
    "itemsSummary": "1x MSI GeForce RTX 4060 Ventus 2X Black 8GB OC GDDR6, 1x DeepCool PK650D 650W 80 PLUS Bronze Power Supply, 1x DeepCool AK400 Zero Dark Performance CPU Air Cooler",
    "subtotal": 47900,
    "discountAmount": 2395,
    "discountPercent": 5,
    "vatAmount": 2275,
    "totalAmount": 47780,
    "paymentMethod": "cash",
    "paymentStatus": "Paid",
    "status": "Counter Collected",
    "courier": null,
    "orderDate": "17 Oct 2026, 02:25 PM",
    "salesman": "Tanvir Ahmed"
  },
  {
    "id": "ord-48",
    "orderNumber": "ORD-2026-1008",
    "orderType": "offline",
    "customerName": "Elephant Road Walk-in Client",
    "contactNumber": "+880 1700-000002",
    "deliveryAddress": "Level 4, Multiplan Center, Elephant Road, Dhaka",
    "items": [
      {
        "productId": "prod-26",
        "name": "ASUS TUF Gaming A15 (Ryzen 7 7735HS, RTX 4060, 16GB, 512GB)",
        "sku": "LAPTOP-ASUS-TUF-A15",
        "quantity": 1,
        "unitPrice": 142000,
        "total": 142000
      }
    ],
    "itemsSummary": "1x ASUS TUF Gaming A15 (Ryzen 7 7735HS, RTX 4060, 16GB, 512GB)",
    "subtotal": 142000,
    "discountAmount": 0,
    "discountPercent": 0,
    "vatAmount": 7100,
    "totalAmount": 149100,
    "paymentMethod": "cash",
    "paymentStatus": "Paid",
    "status": "Processing",
    "courier": null,
    "orderDate": "17 Oct 2026, 04:50 PM",
    "salesman": "Tanvir Ahmed"
  }
];

export const defaultPOs: SupplierPO[] = [
  {
    "id": "po-1",
    "poNumber": "PO-2026-ASUS-091",
    "supplierName": "ASUS Regional Distribution (Singapore)",
    "items": "30x ROG Strix Z790-E Motherboards, 15x TUF RTX 4080 Super",
    "productId": "prod-9",
    "quantity": 45,
    "totalCost": 3315000,
    "orderDate": "08 Oct 2026",
    "status": "Port Customs",
    "expectedDelivery": "Chittagong Port Terminal (Customs Clearance)"
  },
  {
    "id": "po-2",
    "poNumber": "PO-2026-INTEL-084",
    "supplierName": "Intel South Asia Authorized Distributor",
    "items": "50x Core i7-14700K, 60x Core i5-14400 Processors",
    "productId": "prod-5",
    "quantity": 110,
    "totalCost": 3113000,
    "orderDate": "11 Oct 2026",
    "status": "In Transit",
    "expectedDelivery": "En route to Banani Vault via DHL Freight"
  },
  {
    "id": "po-3",
    "poNumber": "PO-2026-ZOTAC-112",
    "supplierName": "Zotac Technology Limited (Hong Kong)",
    "items": "40x GeForce RTX 4070 Ti Super 16GB",
    "productId": "prod-1",
    "quantity": 40,
    "totalCost": 3760000,
    "orderDate": "25 Sep 2026",
    "status": "Received",
    "expectedDelivery": "Warehouse Received & Serialized"
  },
  {
    "id": "po-4",
    "poNumber": "PO-2026-SAMSUNG-045",
    "supplierName": "Samsung Electronics APAC Logistics",
    "items": "100x Samsung 990 Pro 2TB NVMe PCIe 4.0 SSD",
    "productId": "prod-15",
    "quantity": 100,
    "totalCost": 1720000,
    "orderDate": "14 Sep 2026",
    "status": "Received",
    "expectedDelivery": "Warehouse Stocked"
  },
  {
    "id": "po-5",
    "poNumber": "PO-2026-CORSAIR-063",
    "supplierName": "Corsair Components Pte Ltd",
    "items": "80x Vengeance RGB 32GB DDR5, 40x RM850x 850W Gold PSUs",
    "productId": "prod-12",
    "quantity": 120,
    "totalCost": 1464000,
    "orderDate": "28 Aug 2026",
    "status": "Received",
    "expectedDelivery": "Warehouse Stocked"
  },
  {
    "id": "po-6",
    "poNumber": "PO-2026-MSI-078",
    "supplierName": "Micro-Star International Taiwan Co.",
    "items": "50x MSI RTX 4060 Ventus, 40x MSI G2412 170Hz Monitors",
    "productId": "prod-2",
    "quantity": 90,
    "totalCost": 2155000,
    "orderDate": "12 Aug 2026",
    "status": "Received",
    "expectedDelivery": "Warehouse Stocked"
  }
];

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('dhaka_silicon_products_v3') || localStorage.getItem('dhaka_silicon_products_v2') || localStorage.getItem('dhaka_silicon_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 20) return parsed;
      } catch (e) {}
    }
    return defaultProducts;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('dhaka_silicon_orders_v3') || localStorage.getItem('dhaka_silicon_orders_v2') || localStorage.getItem('dhaka_silicon_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 25) return parsed;
      } catch (e) {}
    }
    return defaultOrders;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('dhaka_silicon_customers_v3') || localStorage.getItem('dhaka_silicon_customers_v2') || localStorage.getItem('dhaka_silicon_customers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 10) return parsed;
      } catch (e) {}
    }
    return defaultCustomers;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<SupplierPO[]>(() => {
    const saved = localStorage.getItem('dhaka_silicon_pos_v3') || localStorage.getItem('dhaka_silicon_pos_v2') || localStorage.getItem('dhaka_silicon_pos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 4) return parsed;
      } catch (e) {}
    }
    return defaultPOs;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('dhaka_silicon_suppliers');
    return saved ? JSON.parse(saved) : defaultSuppliers;
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    const saved = localStorage.getItem('dhaka_silicon_expenses');
    return saved ? JSON.parse(saved) : defaultExpenses;
  });

  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>(() => {
    const saved = localStorage.getItem('dhaka_silicon_transfers');
    return saved ? JSON.parse(saved) : defaultStockTransfers;
  });

  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>(() => {
    const saved = localStorage.getItem('dhaka_silicon_adjustments');
    return saved ? JSON.parse(saved) : defaultStockAdjustments;
  });

  const [accounts, setAccounts] = useState<PaymentAccount[]>(() => {
    const saved = localStorage.getItem('dhaka_silicon_accounts');
    return saved ? JSON.parse(saved) : defaultAccounts;
  });

  const [selectedLocation, setSelectedLocation] = useState<string>('All Locations');
  const [dateFilter, setDateFilter] = useState<string>('past30');

  const [cashRegister, setCashRegister] = useState<{
    isOpen: boolean;
    openedAt: string;
    openingCash: number;
    cashSales: number;
    totalCash: number;
  }>(() => {
    const saved = localStorage.getItem('dhaka_silicon_register');
    return saved ? JSON.parse(saved) : {
      isOpen: true,
      openedAt: 'Today, 09:30 AM',
      openingCash: 50000,
      cashSales: 135400,
      totalCash: 185400
    };
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('dhaka_silicon_products_v3', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('dhaka_silicon_orders_v3', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('dhaka_silicon_customers_v3', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('dhaka_silicon_pos_v3', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem('dhaka_silicon_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('dhaka_silicon_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('dhaka_silicon_transfers', JSON.stringify(stockTransfers));
  }, [stockTransfers]);

  useEffect(() => {
    localStorage.setItem('dhaka_silicon_adjustments', JSON.stringify(stockAdjustments));
  }, [stockAdjustments]);

  useEffect(() => {
    localStorage.setItem('dhaka_silicon_register', JSON.stringify(cashRegister));
  }, [cashRegister]);

  const openCashRegister = (openingAmount: number) => {
    setCashRegister({
      isOpen: true,
      openedAt: 'Just now',
      openingCash: openingAmount,
      cashSales: 0,
      totalCash: openingAmount
    });
  };

  const closeCashRegister = () => {
    setCashRegister(prev => ({ ...prev, isOpen: false }));
  };

  // Add stock to an existing product
  const addStock = (productId: string, quantity: number, unitCost?: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const newStock = p.stockCount + quantity;
          const updatedCost = unitCost ? unitCost : p.costPrice;
          return { ...p, stockCount: newStock, costPrice: updatedCost };
        }
        return p;
      })
    );
  };

  // Add a brand new hardware product
  const addNewProduct = (newProdData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...newProdData,
      id: `prod-${Date.now()}`
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  // Add a new customer to the database
  const addNewCustomer = (newCust: Omit<Customer, 'id'>) => {
    const created: Customer = {
      ...newCust,
      id: `cust-${Date.now()}`,
      totalPurchases: 0
    };
    setCustomers((prev) => [created, ...prev]);
    return created;
  };

  // Add a new supplier
  const addSupplier = (newSup: Omit<Supplier, 'id'>) => {
    const created: Supplier = {
      ...newSup,
      id: `sup-${Date.now()}`
    };
    setSuppliers((prev) => [created, ...prev]);
    return created;
  };

  // Add an expense
  const addExpense = (newExp: Omit<ExpenseRecord, 'id'>) => {
    const created: ExpenseRecord = {
      ...newExp,
      id: `exp-${Date.now()}`
    };
    setExpenses((prev) => [created, ...prev]);
    return created;
  };

  // Create Stock Transfer
  const createStockTransfer = (trData: Omit<StockTransfer, 'id' | 'transferNumber'>) => {
    const created: StockTransfer = {
      ...trData,
      id: `tr-${Date.now()}`,
      transferNumber: `TR-2026-${Math.floor(100 + Math.random() * 900)}`
    };
    setStockTransfers((prev) => [created, ...prev]);
    return created;
  };

  // Create Stock Adjustment
  const createStockAdjustment = (adjData: Omit<StockAdjustment, 'id' | 'adjustmentNumber'>) => {
    const created: StockAdjustment = {
      ...adjData,
      id: `adj-${Date.now()}`,
      adjustmentNumber: `ADJ-2026-${Math.floor(100 + Math.random() * 900)}`
    };
    // Adjust product stock
    setProducts(prev => prev.map(p => {
      if (p.id === adjData.productId) {
        const qtyChange = adjData.adjustmentType === 'Audit Surplus' ? adjData.quantity : -adjData.quantity;
        return { ...p, stockCount: Math.max(0, p.stockCount + qtyChange) };
      }
      return p;
    }));
    setStockAdjustments((prev) => [created, ...prev]);
    return created;
  };

  // Dispatch with courier
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

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const cod = options?.codAmount !== undefined 
            ? options.codAmount 
            : (o.paymentStatus === 'COD Pending' ? o.totalAmount : 0);
          const fee = options?.deliveryFee !== undefined ? options.deliveryFee : (o.deliveryAddress.includes('Dhaka') ? 150 : 250);
          return {
            ...o,
            status: 'In Transit',
            courier: {
              provider,
              consignmentId,
              trackingUrl,
              status: 'Awaiting Rider Pickup',
              codAmount: cod,
              deliveryFee: fee,
              recipientCity: o.deliveryAddress.includes('Dhaka') ? 'Dhaka Metro' : 'Outside Dhaka',
              dispatchedAt: 'Just now'
            }
          };
        }
        return o;
      })
    );
  };

  // Create Sale Order via POS
  const createSaleOrder = (orderData: {
    customerName: string;
    contactNumber: string;
    deliveryAddress: string;
    items: { product: Product; quantity: number; unitPrice?: number }[];
    discountPercent: number;
    discountAmountFlat?: number;
    orderType?: 'online' | 'offline';
    paymentMethod: 'cash' | 'bkash' | 'bank_transfer' | 'credit_30d';
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
      return {
        productId: i.product.id,
        name: i.product.name,
        sku: i.product.sku,
        quantity: i.quantity,
        unitPrice: finalPrice,
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

    const summaryText = orderItems.map((i) => `${i.quantity}x ${i.name.split(' ')[0]} ${i.name.split(' ')[1] || ''}`).join(', ');

    const type = orderData.orderType || 'offline';
    const initialStatus: Order['status'] = type === 'online' ? 'Ready for Dispatch' : 'Counter Collected';

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
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.paymentMethod === 'credit_30d' ? 'Credit 30D' : 'Paid',
      status: initialStatus,
      orderDate: 'Today, Just now',
      salesman: orderData.salesman
    };

    setOrders((prev) => [newOrder, ...prev]);

    // If cash payment, update cash register
    if (orderData.paymentMethod === 'cash') {
      setCashRegister(prev => ({
        ...prev,
        cashSales: prev.cashSales + totalAmount,
        totalCash: prev.totalCash + totalAmount
      }));
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const createPurchaseOrder = (poData: {
    supplierName: string;
    productId: string;
    quantity: number;
    totalCost: number;
    itemsSummary: string;
  }) => {
    const newPO: SupplierPO = {
      id: `po-${Date.now()}`,
      poNumber: `PO-2026-${Math.floor(100 + Math.random() * 900)}`,
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
  };

  const receivePurchaseOrder = (poId: string) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (po.id === poId && po.status !== 'Received') {
          addStock(po.productId, po.quantity);
          return { ...po, status: 'Received', expectedDelivery: 'Delivered to Banani Vault' };
        }
        return po;
      })
    );
  };

  // -------------------------------------------------------------
  // DYNAMIC COMPUTED METRICS
  // -------------------------------------------------------------
  const totalSalesRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const salesTodayOrders = orders.filter((o) => o.orderDate.includes('Today') || o.orderDate.includes('17 Oct 2026') || o.orderDate.includes('Just now'));
  const salesTodayCount = salesTodayOrders.length;
  const salesTodayRevenue = salesTodayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'Processing' || o.status === 'Ready for Dispatch' || o.status === 'In Transit').length;
  const totalStockUnits = products.reduce((sum, p) => sum + p.stockCount, 0);
  const totalStockValue = products.reduce((sum, p) => sum + p.stockCount * p.retailPrice, 0);
  const totalCostValue = products.reduce((sum, p) => sum + p.stockCount * p.costPrice, 0);
  const currentMonthSales = orders
    .filter((o) => o.orderDate.includes('Oct 2026') || o.orderDate.includes('Today') || o.orderDate.includes('Just now'))
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const salesmanMonthSales = currentMonthSales;
  const salesmanCommission = Math.round(salesmanMonthSales * 0.02);

  // ERP Card Metrics
  const totalSales = totalSalesRevenue;
  const sellReturn = 0;
  const totalPurchase = purchaseOrders.reduce((sum, po) => sum + po.totalCost, 0) + 7500000;
  const purchaseReturn = 0;
  const purchaseDue = 0;
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const expenseDue = 0;
  
  // Gross Profit = Total Revenue - Cost of Goods Sold (~22% margin in hardware distribution)
  const estimatedCogs = Math.round(totalSales * 0.81);
  const grossProfit = totalSales - estimatedCogs;
  const netProfit = Math.max(0, grossProfit - (totalExpense * 0.65)); // 5-month net profit

  const overdueOrders = orders.filter(o => o.paymentStatus === 'Credit 30D' || o.paymentStatus === 'COD Pending');
  const accountReceivable = overdueOrders.reduce((sum, o) => sum + o.totalAmount, 0);
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
        selectedLocation,
        setSelectedLocation,
        dateFilter,
        setDateFilter,
        cashRegister,
        openCashRegister,
        closeCashRegister,
        addStock,
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
