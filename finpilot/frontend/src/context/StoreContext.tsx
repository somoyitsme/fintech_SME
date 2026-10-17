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
  orderType: 'online' | 'offline'; // Online Delivery vs Offline Counter Sale
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
  courier?: CourierDispatch;
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

interface StoreContextType {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  purchaseOrders: SupplierPO[];
  addStock: (productId: string, quantity: number, unitCost?: number) => void;
  addNewProduct: (product: Omit<Product, 'id'>) => void;
  addNewCustomer: (customer: Omit<Customer, 'id'>) => Customer;
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
  };
}

const defaultProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'NVIDIA GeForce RTX 4070 Ti Super 16GB GDDR6X',
    sku: 'GPU-RTX4070TI-16G',
    category: 'Graphics Cards',
    brand: 'Zotac Gaming',
    retailPrice: 118500,
    costPrice: 94000,
    stockCount: 42,
    unit: 'Units',
    minThreshold: 15,
    location: 'Banani Central Vault #B4',
    warranty: '3 Years Official'
  },
  {
    id: 'prod-2',
    name: 'Intel Core i7-14700K 20-Core LGA1700 Processor',
    sku: 'CPU-INTEL-14700K',
    category: 'Processors',
    brand: 'Intel',
    retailPrice: 48000,
    costPrice: 38500,
    stockCount: 14,
    unit: 'Units',
    minThreshold: 20,
    location: 'Banani Central Vault #A1',
    warranty: '3 Years Replacement'
  },
  {
    id: 'prod-3',
    name: 'Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz CL30',
    sku: 'RAM-CORSAIR-32GB-DDR5',
    category: 'Memory (RAM)',
    brand: 'Corsair',
    retailPrice: 15200,
    costPrice: 11800,
    stockCount: 110,
    unit: 'Kits',
    minThreshold: 30,
    location: 'Warehouse Shelf #R2',
    warranty: 'Lifetime Official'
  },
  {
    id: 'prod-4',
    name: 'Samsung 990 Pro 2TB PCIe 4.0 M.2 NVMe Internal SSD',
    sku: 'SSD-SAMSUNG-990P-2TB',
    category: 'Storage',
    brand: 'Samsung',
    retailPrice: 22500,
    costPrice: 17200,
    stockCount: 65,
    unit: 'Units',
    minThreshold: 25,
    location: 'Warehouse Shelf #S1',
    warranty: '5 Years'
  },
  {
    id: 'prod-5',
    name: 'ASUS ROG Strix Z790-E Gaming WiFi II DDR5 Motherboard',
    sku: 'MB-ASUS-Z790E-WIFI',
    category: 'Motherboards',
    brand: 'ASUS',
    retailPrice: 62000,
    costPrice: 49500,
    stockCount: 18,
    unit: 'Units',
    minThreshold: 15,
    location: 'Banani Vault #M2',
    warranty: '3 Years Official'
  },
  {
    id: 'prod-6',
    name: 'Corsair RM850x 850W 80 PLUS Gold Fully Modular PSU',
    sku: 'PSU-CORSAIR-850W',
    category: 'Power Supplies',
    brand: 'Corsair',
    retailPrice: 16800,
    costPrice: 13000,
    stockCount: 35,
    unit: 'Units',
    minThreshold: 20,
    location: 'Warehouse Shelf #P3',
    warranty: '10 Years'
  },
  {
    id: 'prod-7',
    name: 'AMD Ryzen 7 7800X3D 8-Core 16-Thread Gaming Processor',
    sku: 'CPU-AMD-7800X3D',
    category: 'Processors',
    brand: 'AMD',
    retailPrice: 52000,
    costPrice: 41000,
    stockCount: 9,
    unit: 'Units',
    minThreshold: 15,
    location: 'Banani Central Vault #A2',
    warranty: '3 Years Official'
  },
  {
    id: 'prod-8',
    name: 'MSI MAG CoreLiquid 360R V2 ARGB AIO Liquid CPU Cooler',
    sku: 'COOL-MSI-360R-V2',
    category: 'Cooling',
    brand: 'MSI',
    retailPrice: 14500,
    costPrice: 11000,
    stockCount: 26,
    unit: 'Units',
    minThreshold: 15,
    location: 'Warehouse Shelf #C1',
    warranty: '2 Years'
  }
];

const defaultCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Apex Computer Systems',
    contactNumber: '+880 1711-234567',
    deliveryAddress: 'Shop 402, Level 4, Multiplan Center, Elephant Road, Dhaka-1205',
    customerType: 'Wholesale',
    binNumber: '003492817-0101',
    totalPurchases: 2370000
  },
  {
    id: 'cust-2',
    name: 'Star IT Solutions Ltd.',
    contactNumber: '+880 1819-876543',
    deliveryAddress: 'BCS Computer City, IDB Bhaban, Rokeya Sarani, Agargaon, Dhaka',
    customerType: 'Wholesale',
    binNumber: '002918471-0203',
    totalPurchases: 1850000
  },
  {
    id: 'cust-3',
    name: 'Dhaka Cyber Gaming Cafe',
    contactNumber: '+880 1610-998877',
    deliveryAddress: 'House 14, Road 27, Dhanmondi, Dhaka-1209',
    customerType: 'Corporate',
    binNumber: '001837492-0104',
    totalPurchases: 945000
  },
  {
    id: 'cust-4',
    name: 'TechLand BD Partner Store',
    contactNumber: '+880 1912-345678',
    deliveryAddress: 'Level 3, Multiplan Center, Elephant Road, Dhaka',
    customerType: 'Wholesale',
    binNumber: '004829103-0102',
    totalPurchases: 3200000
  },
  {
    id: 'cust-5',
    name: 'Walk-in Retail Customer',
    contactNumber: '+880 1700-000000',
    deliveryAddress: 'Banani Showroom Counter, Dhaka',
    customerType: 'Retail',
    totalPurchases: 54000
  }
];

const defaultOrders: Order[] = [
  {
    id: 'ord-1',
    orderNumber: 'ORD-DS-2026-1049',
    orderType: 'online',
    customerName: 'Apex Computer Systems',
    contactNumber: '+880 1711-234567',
    deliveryAddress: 'Shop 402, Level 4, Multiplan Center, Elephant Road, Dhaka-1205',
    items: [
      { productId: 'prod-1', name: 'NVIDIA GeForce RTX 4070 Ti Super 16GB', sku: 'GPU-RTX4070TI-16G', quantity: 2, unitPrice: 118500, total: 237000 },
      { productId: 'prod-3', name: 'Corsair Vengeance 32GB DDR5', sku: 'RAM-CORSAIR-32GB-DDR5', quantity: 2, unitPrice: 15200, total: 30400 }
    ],
    itemsSummary: '2x RTX 4070 Ti Super 16GB, 2x Corsair DDR5 32GB',
    subtotal: 267400,
    discountAmount: 0,
    discountPercent: 0,
    vatAmount: 13370,
    totalAmount: 280770,
    paymentMethod: 'bkash',
    paymentStatus: 'Paid',
    status: 'Ready for Dispatch',
    orderDate: 'Today, 10:15 AM',
    salesman: 'Tanvir Ahmed'
  },
  {
    id: 'ord-2',
    orderNumber: 'ORD-DS-2026-1048',
    orderType: 'offline',
    customerName: 'Dhaka Cyber Gaming Cafe',
    contactNumber: '+880 1610-998877',
    deliveryAddress: 'House 14, Road 27, Dhanmondi, Dhaka-1209',
    items: [
      { productId: 'prod-2', name: 'Intel Core i7-14700K 20-Core', sku: 'CPU-INTEL-14700K', quantity: 5, unitPrice: 48000, total: 240000 },
      { productId: 'prod-5', name: 'ASUS ROG Strix Z790-E Motherboard', sku: 'MB-ASUS-Z790E-WIFI', quantity: 5, unitPrice: 62000, total: 310000 }
    ],
    itemsSummary: '5x Core i7-14700K 20-Core, 5x ASUS Z790-E Motherboards',
    subtotal: 550000,
    discountAmount: 16500,
    discountPercent: 3,
    vatAmount: 26675,
    totalAmount: 560175,
    paymentMethod: 'credit_30d',
    paymentStatus: 'Credit 30D',
    status: 'Counter Collected',
    orderDate: 'Today, 09:30 AM',
    salesman: 'Tanvir Ahmed'
  },
  {
    id: 'ord-3',
    orderNumber: 'ORD-DS-2026-1045',
    orderType: 'online',
    customerName: 'Star IT Solutions Ltd.',
    contactNumber: '+880 1819-876543',
    deliveryAddress: 'BCS Computer City, IDB Bhaban, Rokeya Sarani, Agargaon, Dhaka',
    items: [
      { productId: 'prod-4', name: 'Samsung 990 Pro 2TB SSD', sku: 'SSD-SAMSUNG-990P-2TB', quantity: 10, unitPrice: 22500, total: 225000 }
    ],
    itemsSummary: '10x Samsung 990 Pro 2TB PCIe 4.0 SSD',
    subtotal: 225000,
    discountAmount: 0,
    discountPercent: 0,
    vatAmount: 11250,
    totalAmount: 236250,
    paymentMethod: 'bank_transfer',
    paymentStatus: 'Paid',
    status: 'In Transit',
    courier: {
      provider: 'Steadfast',
      consignmentId: 'STEADFAST-DHK-48210',
      trackingUrl: 'https://steadfast.com.bd/tracking/48210',
      status: 'In Transit',
      codAmount: 0,
      deliveryFee: 150,
      recipientCity: 'Dhaka City',
      dispatchedAt: 'Yesterday, 05:00 PM'
    },
    orderDate: 'Yesterday, 04:20 PM',
    salesman: 'Tanvir Ahmed'
  }
];

const defaultPOs: SupplierPO[] = [
  {
    id: 'po-1',
    poNumber: 'PO-2026-ASUS-091',
    supplierName: 'ASUS Regional Distribution (Singapore)',
    items: '30x ROG Strix Z790-E Motherboards',
    productId: 'prod-5',
    quantity: 30,
    totalCost: 1485000,
    orderDate: '08 Oct 2026',
    status: 'Port Customs',
    expectedDelivery: 'Chittagong Port Terminal'
  },
  {
    id: 'po-2',
    poNumber: 'PO-2026-INTEL-084',
    supplierName: 'Intel South Asia Authorized Distributor',
    items: '40x Core i7-14700K Processors',
    productId: 'prod-2',
    quantity: 40,
    totalCost: 1540000,
    orderDate: '11 Oct 2026',
    status: 'In Transit',
    expectedDelivery: 'En route to Banani Vault'
  }
];

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('dhaka_silicon_products');
    return saved ? JSON.parse(saved) : defaultProducts;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('dhaka_silicon_orders');
    return saved ? JSON.parse(saved) : defaultOrders;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('dhaka_silicon_customers');
    return saved ? JSON.parse(saved) : defaultCustomers;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<SupplierPO[]>(() => {
    const saved = localStorage.getItem('dhaka_silicon_pos');
    return saved ? JSON.parse(saved) : defaultPOs;
  });

  // Save changes to localStorage for state persistence
  useEffect(() => {
    localStorage.setItem('dhaka_silicon_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('dhaka_silicon_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('dhaka_silicon_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('dhaka_silicon_pos', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem('dhaka_silicon_pos', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

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

  // Dispatch an online delivery order via Bangladeshi courier partner (Pathao / Steadfast / RedX)
  const dispatchWithCourier = (
    orderId: string, 
    provider: 'Pathao' | 'Steadfast' | 'RedX', 
    options?: { deliveryFee?: number; codAmount?: number }
  ) => {
    const prefix = provider === 'Pathao' ? 'PATHAO-BD' : provider === 'Steadfast' ? 'STEADFAST-DHK' : 'REDX-LOG';
    const consignmentId = `${prefix}-${Math.floor(10000 + Math.random() * 90000)}`;
    const trackingUrl = provider === 'Pathao' 
      ? `https://pathao.com/courier/tracking?consignment=${consignmentId}`
      : provider === 'Steadfast'
      ? `https://steadfast.com.bd/tracking/${consignmentId}`
      : `https://redx.com.bd/track/${consignmentId}`;

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const cod = options?.codAmount !== undefined 
            ? options.codAmount 
            : (o.paymentStatus === 'COD Pending' ? o.totalAmount : 0);
          const fee = options?.deliveryFee !== undefined ? options.deliveryFee : 130;
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

  // Create a sales order via POS: custom fixed price per item, custom discount as wanted, stock deduction
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
    // 1. Deduct stock for each sold product
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

    // 2. Compute accurate financial line items with custom salesman unit price if provided
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

    // Salesman can give discount as he wants (no artificial 5% restriction!)
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
    const vatAmount = Math.round(taxableSubtotal * 0.05); // 5% NBR VAT
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
    return newOrder;
  };

  // Update order status (Processing -> Ready -> Shipped -> Delivered)
  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  // Create a new purchase order
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

  // Receive a purchase order shipment from a supplier: automatically increases inventory stock!
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

  // Dynamically computed metrics across the application
  const totalSalesRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0) + 28000000;
  const salesTodayOrders = orders.filter((o) => o.orderDate.includes('Today') || o.orderDate.includes('Just now'));
  const salesTodayCount = salesTodayOrders.length + 42; // Base day counter + active orders
  const salesTodayRevenue = salesTodayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'Processing' || o.status === 'Ready for Dispatch').length;
  const totalStockUnits = products.reduce((sum, p) => sum + p.stockCount, 0);
  const totalStockValue = products.reduce((sum, p) => sum + p.stockCount * p.retailPrice, 0);
  const totalCostValue = products.reduce((sum, p) => sum + p.stockCount * p.costPrice, 0);
  const salesmanMonthSales = orders
    .filter((o) => o.salesman.includes('Tanvir'))
    .reduce((sum, o) => sum + o.totalAmount, 0) + 1850000;
  const salesmanCommission = Math.round(salesmanMonthSales * 0.02);

  return (
    <StoreContext.Provider
      value={{
        products,
        orders,
        customers,
        purchaseOrders,
        addStock,
        addNewProduct,
        addNewCustomer,
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
          salesmanCommission
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
