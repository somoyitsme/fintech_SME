import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, sqlite, initializeSchema } from './client.js';
import { 
  users, 
  products, 
  customers, 
  suppliers, 
  supplierPos,
  expenses, 
  paymentAccounts, 
  stockTransfers, 
  stockAdjustments,
  orders,
  orderItems,
  notifications,
  authLogs,
  activityLogs,
  cashRegisters,
  staff,
  operationsChecklist,
  businessSettings,
  stockLedger
} from './schema.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seedIfEmpty() {
  initializeSchema();
  const existingProducts = await db.select().from(products).limit(1);
  const existingOrders = await db.select().from(orders).limit(1);
  
  if (existingProducts.length > 0 && existingOrders.length > 0) {
    console.log('✅ Local SQLite database already populated with enterprise tables.');
    return;
  }

  console.log('📦 Seeding local SQLite database (/media/somoy/Backup/Documents/China/finpilot/db-server/data/finpilot.db) with 100% complete dataset...');
  await executeFullSeed();
}

export async function executeFullSeed() {
  initializeSchema();
  const jsonPath = path.join(__dirname, 'initialData.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('initialData.json not found');
    return;
  }
  const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const now = new Date().toISOString();

  // Clear existing records to ensure pure, pristine local database state
  sqlite.exec(`
    DELETE FROM order_items;
    DELETE FROM orders;
    DELETE FROM stock_ledger;
    DELETE FROM products;
    DELETE FROM customers;
    DELETE FROM suppliers;
    DELETE FROM supplier_pos;
    DELETE FROM expenses;
    DELETE FROM stock_transfers;
    DELETE FROM stock_adjustments;
    DELETE FROM payment_accounts;
    DELETE FROM cash_registers;
    DELETE FROM staff;
    DELETE FROM operations_checklist;
    DELETE FROM business_settings;
    DELETE FROM notifications;
    DELETE FROM auth_logs;
    DELETE FROM activity_logs;
    DELETE FROM user_sessions;
    DELETE FROM users;
  `);

  // 1. Users
  const adminHash = await bcrypt.hash('admin123', 10);
  const salesHash = await bcrypt.hash('sales123', 10);

  const directorId = 'usr-director-001';
  const salesmanId = 'usr-salesman-002';
  const adminId = 'usr-admin-003';

  await db.insert(users).values([
    {
      id: directorId,
      username: 'director',
      email: 'director@dhakasilicon.com',
      passwordHash: adminHash,
      fullName: 'MD Nazmul Hasan',
      role: 'manager',
      status: 'active',
      phone: '+880 1711-223344',
      branch: 'Banani Central Vault',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: salesmanId,
      username: 'salesman',
      email: 'sales@dhakasilicon.com',
      passwordHash: salesHash,
      fullName: 'Tanvir Ahmed',
      role: 'salesman',
      status: 'active',
      phone: '+880 1819-556677',
      branch: 'Banani Central Vault',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: adminId,
      username: 'admin',
      email: 'admin@finpilot.local',
      passwordHash: adminHash,
      fullName: 'System Administrator',
      role: 'admin',
      status: 'active',
      phone: '+880 1700-000000',
      branch: 'Banani Central Vault',
      createdAt: now,
      updatedAt: now,
    }
  ]);

  // 2. Products (All 27 products)
  if (Array.isArray(rawData.products) && rawData.products.length > 0) {
    const productValues = rawData.products.map((p: any) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      brand: p.brand,
      retailPrice: p.retailPrice || 0,
      costPrice: p.costPrice || 0,
      stockCount: p.stockCount || 0,
      unit: p.unit || 'Units',
      minThreshold: p.minThreshold || 10,
      location: p.location || 'Banani Central Vault',
      warranty: p.warranty || '3 Years Official',
      createdAt: now,
      updatedAt: now,
    }));
    await db.insert(products).values(productValues);
    console.log(`Inserted ${productValues.length} products to SQLite`);
  }

  // 3. Customers (All 15 customers)
  if (Array.isArray(rawData.customers) && rawData.customers.length > 0) {
    const customerValues = rawData.customers.map((c: any) => ({
      id: c.id,
      name: c.name,
      contactNumber: c.contactNumber || '',
      email: `${c.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@client.bd`,
      deliveryAddress: c.deliveryAddress || 'Dhaka, Bangladesh',
      customerType: c.customerType || 'Retail',
      binNumber: c.binNumber || null,
      creditLimit: 500000,
      totalPurchases: c.totalPurchases || 0,
      createdAt: now,
      updatedAt: now,
    }));
    await db.insert(customers).values(customerValues);
    console.log(`Inserted ${customerValues.length} customers to SQLite`);
  }

  // 4. Suppliers (All 6 suppliers)
  if (Array.isArray(rawData.suppliers) && rawData.suppliers.length > 0) {
    const supplierValues = rawData.suppliers.map((s: any) => ({
      id: s.id,
      name: s.name,
      contactPerson: s.contactPerson || '',
      phone: s.phone || '',
      email: s.email || '',
      address: s.address || '',
      country: s.country || 'Singapore',
      category: s.category || 'Hardware',
      totalPurchase: s.totalPurchase || 0,
      totalDue: s.totalDue || 0,
      createdAt: now,
      updatedAt: now,
    }));
    await db.insert(suppliers).values(supplierValues);
    console.log(`Inserted ${supplierValues.length} suppliers to SQLite`);
  }

  // 5. Supplier POs (All 6 POs)
  if (Array.isArray(rawData.pos) && rawData.pos.length > 0) {
    const poValues = rawData.pos.map((po: any) => ({
      id: po.id,
      poNumber: po.poNumber,
      supplierName: po.supplierName,
      items: po.items,
      productId: po.productId,
      quantity: po.quantity,
      totalCost: po.totalCost,
      orderDate: po.orderDate,
      status: po.status,
      expectedDelivery: po.expectedDelivery,
      createdAt: now,
      updatedAt: now,
    }));
    await db.insert(supplierPos).values(poValues);
    console.log(`Inserted ${poValues.length} purchase orders to SQLite`);
  }

  // 6. Expenses (All 14 expenses)
  if (Array.isArray(rawData.expenses) && rawData.expenses.length > 0) {
    const expValues = rawData.expenses.map((e: any) => ({
      id: e.id,
      category: e.category,
      amount: e.amount,
      vendor: e.vendor,
      description: e.description,
      date: e.date,
      paymentMethod: e.paymentMethod,
      status: e.status || 'Approved',
      createdAt: now,
      updatedAt: now,
    }));
    await db.insert(expenses).values(expValues);
    console.log(`Inserted ${expValues.length} expense records to SQLite`);
  }

  // 7. Stock Transfers (All 3 transfers)
  if (Array.isArray(rawData.stockTransfers) && rawData.stockTransfers.length > 0) {
    const trValues = rawData.stockTransfers.map((t: any) => ({
      id: t.id,
      transferNumber: t.transferNumber,
      fromLocation: t.fromLocation,
      toLocation: t.toLocation,
      productId: t.productId,
      productName: t.productName,
      quantity: t.quantity,
      transferDate: t.transferDate,
      status: t.status,
      notes: t.notes || '',
      createdAt: now,
      updatedAt: now,
    }));
    await db.insert(stockTransfers).values(trValues);
    console.log(`Inserted ${trValues.length} stock transfers to SQLite`);
  }

  // 8. Stock Adjustments (All 2 adjustments)
  if (Array.isArray(rawData.stockAdjustments) && rawData.stockAdjustments.length > 0) {
    const adjValues = rawData.stockAdjustments.map((a: any) => ({
      id: a.id,
      adjustmentNumber: a.adjustmentNumber,
      location: a.location,
      productId: a.productId,
      productName: a.productName,
      adjustmentType: a.adjustmentType,
      quantity: a.quantity,
      unitCost: a.unitCost,
      totalValue: a.totalValue,
      adjustmentDate: a.adjustmentDate,
      reason: a.reason,
      createdAt: now,
      updatedAt: now,
    }));
    await db.insert(stockAdjustments).values(adjValues);
    console.log(`Inserted ${adjValues.length} stock adjustments to SQLite`);
  }

  // 9. Payment Accounts (All 4 accounts)
  if (Array.isArray(rawData.accounts) && rawData.accounts.length > 0) {
    const accValues = rawData.accounts.map((a: any) => ({
      id: a.id,
      accountName: a.accountName,
      accountType: a.accountType,
      accountNumber: a.accountNumber,
      bankName: a.bankName || null,
      balance: a.balance || 0,
      createdAt: now,
      updatedAt: now,
    }));
    await db.insert(paymentAccounts).values(accValues);
    console.log(`Inserted ${accValues.length} payment accounts to SQLite`);
  }

  // 10. Orders & Order Items (All 48 historical & live orders)
  if (Array.isArray(rawData.orders) && rawData.orders.length > 0) {
    const orderValues: any[] = [];
    const itemValues: any[] = [];

    for (const o of rawData.orders) {
      orderValues.push({
        id: o.id,
        orderNumber: o.orderNumber,
        orderType: o.orderType || 'offline',
        customerName: o.customerName,
        contactNumber: o.contactNumber || '',
        deliveryAddress: o.deliveryAddress || '',
        itemsSummary: o.itemsSummary || '',
        subtotal: o.subtotal || 0,
        discountAmount: o.discountAmount || 0,
        discountPercent: o.discountPercent || 0,
        vatAmount: o.vatAmount || 0,
        totalAmount: o.totalAmount || 0,
        paidAmount: o.paymentStatus === 'Paid' ? o.totalAmount : 0,
        dueAmount: o.paymentStatus === 'Credit 30D' || o.paymentStatus === 'COD Pending' ? o.totalAmount : 0,
        paymentMethod: o.paymentMethod || 'cash',
        paymentStatus: o.paymentStatus || 'Paid',
        status: o.status || 'Delivered',
        courierProvider: o.courier?.provider || null,
        courierConsignmentId: o.courier?.consignmentId || null,
        courierTrackingUrl: o.courier?.trackingUrl || null,
        courierStatus: o.courier?.status || null,
        courierCodAmount: o.courier?.codAmount || 0,
        courierDeliveryFee: o.courier?.deliveryFee || 0,
        courierRecipientCity: o.courier?.recipientCity || null,
        courierDispatchedAt: o.courier?.dispatchedAt || null,
        orderDate: o.orderDate || 'Today',
        salesman: o.salesman || 'Tanvir Ahmed',
        createdAt: now,
        updatedAt: now,
      });

      if (Array.isArray(o.items)) {
        for (const item of o.items) {
          itemValues.push({
            id: `item-${uuidv4()}`,
            orderId: o.id,
            productId: item.productId,
            name: item.name,
            sku: item.sku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          });
        }
      }
    }

    // Insert in batches of 20 to respect SQLite parameter limits
    for (let i = 0; i < orderValues.length; i += 20) {
      await db.insert(orders).values(orderValues.slice(i, i + 20));
    }
    for (let i = 0; i < itemValues.length; i += 50) {
      await db.insert(orderItems).values(itemValues.slice(i, i + 50));
    }
    console.log(`Inserted ${orderValues.length} orders and ${itemValues.length} order items to SQLite`);
  }

  // 11. Cash Register
  await db.insert(cashRegisters).values({
    id: 'reg-001',
    userId: salesmanId,
    userName: 'Tanvir Ahmed',
    location: 'Banani Central Vault #01',
    openingAmount: 50000,
    cashSales: 135400,
    cardSales: 215000,
    mfsSales: 45000,
    totalExpected: 185400,
    status: 'open',
    openedAt: 'Today, 09:30 AM',
    notes: 'Morning shift drawer initialized with standard float',
    createdAt: now,
    updatedAt: now,
  });

  // 12. Staff
  await db.insert(staff).values([
    { id: 'stf-001', name: 'MD Nazmul Hasan', role: 'Managing Director', email: 'director@dhakasilicon.com', phone: '+880 1711-223344', branch: 'Banani Central Vault', department: 'Executive', hireDate: '2021-01-01', salary: 250000, status: 'Active', createdAt: now, updatedAt: now },
    { id: 'stf-002', name: 'Tanvir Ahmed', role: 'Senior Sales Lead', email: 'sales@dhakasilicon.com', phone: '+880 1819-556677', branch: 'Banani Central Vault', department: 'Sales', hireDate: '2023-03-15', salary: 65000, status: 'Active', createdAt: now, updatedAt: now },
    { id: 'stf-003', name: 'Rahim Uddin', role: 'Vault Logistics Manager', email: 'vault@dhakasilicon.com', phone: '+880 1712-445566', branch: 'Banani Central Vault', department: 'Logistics', hireDate: '2022-06-01', salary: 45000, status: 'Active', createdAt: now, updatedAt: now },
  ]);

  // 13. Operations Checklist (Todos)
  await db.insert(operationsChecklist).values([
    { id: 'todo-001', title: 'Verify Chittagong Port customs clearance documentation', description: 'Ensure bill of lading and AIT receipts match incoming GPU container #BD-904', category: 'Compliance', priority: 'urgent', dueDate: '2026-10-20', isCompleted: 0, createdBy: 'MD Nazmul Hasan', createdAt: now, updatedAt: now },
    { id: 'todo-002', title: 'Audit Banani Central Vault GPU serial numbers', description: 'Cross-check physical RTX 4070 Ti barcode serials against supplier manifest', category: 'Inventory', priority: 'high', dueDate: '2026-10-21', isCompleted: 1, completedBy: 'Tanvir Ahmed', completedAt: '2026-10-18', createdBy: 'MD Nazmul Hasan', createdAt: now, updatedAt: now },
    { id: 'todo-003', title: 'Follow up with Apex Computer Systems quotation', description: 'Client requested 2% wholesale rebate on 20 units of RTX 4080 Super', category: 'Sales', priority: 'medium', dueDate: '2026-10-20', isCompleted: 0, createdBy: 'Tanvir Ahmed', createdAt: now, updatedAt: now },
    { id: 'todo-004', title: 'Daily Cash Drawer Count Reconciliation', description: 'Count physical notes in Banani Vault register drawer against POS receipts', category: 'Finance', priority: 'high', dueDate: '2026-10-19', isCompleted: 1, completedBy: 'Tanvir Ahmed', completedAt: '2026-10-19', createdBy: 'MD Nazmul Hasan', createdAt: now, updatedAt: now },
  ]);

  // 14. Business Settings
  await db.insert(businessSettings).values([
    { id: 'set-001', key: 'company_name', value: 'Now_or_Never Console', category: 'general', description: 'Official corporate business name', updatedAt: now },
    { id: 'set-002', key: 'company_bin', value: '003456789012-0101', category: 'tax', description: 'Bangladesh 12-digit VAT/BIN Registration Number', updatedAt: now },
    { id: 'set-003', key: 'currency_code', value: 'BDT', category: 'finance', description: 'Primary currency code', updatedAt: now },
    { id: 'set-004', key: 'currency_symbol', value: '৳', category: 'finance', description: 'Primary currency symbol', updatedAt: now },
    { id: 'set-005', key: 'default_vat_rate', value: '5.0', category: 'tax', description: 'Standard computer hardware VAT percentage', updatedAt: now },
    { id: 'set-006', key: 'primary_branch', value: 'Banani Central Vault & Warehouse', category: 'general', description: 'Main headquarters location', updatedAt: now },
  ]);

  // 15. Notifications
  await db.insert(notifications).values([
    { id: 'notif-001', userId: 'all', title: 'Low Stock Alert: Intel Core i7-14700K', message: 'Vault stock is down to 28 units (minimum safe threshold is 20). Reorder recommended.', type: 'warning', isRead: 0, link: 'products-list', actionUrl: 'purchases-add', createdAt: now },
    { id: 'notif-002', userId: 'all', title: 'Wholesale Order Delivered', message: 'Order ORD-2026-0501 for Apex Computer Systems (৳ 297,056) has been delivered.', type: 'success', isRead: 0, link: 'sell-all', createdAt: now },
    { id: 'notif-003', userId: 'all', title: 'Inter-Branch Stock Relocation', message: 'Stock transfer TR-2026-002 (10x Intel i7 CPUs) to BCS Computer City IDB Branch confirmed.', type: 'info', isRead: 1, link: 'stock-transfers-list', readAt: now, createdAt: now },
  ]);

  // 16. Auth Logs
  await db.insert(authLogs).values([
    { id: 'auth-001', userId: directorId, username: 'director', action: 'login_success', ipAddress: '127.0.0.1', userAgent: 'Local Chrome Ubuntu Terminal', status: 'success', createdAt: now },
    { id: 'auth-002', userId: salesmanId, username: 'salesman', action: 'login_success', ipAddress: '127.0.0.1', userAgent: 'Local POS Terminal 01', status: 'success', createdAt: now },
  ]);

  // 17. Activity Logs
  await db.insert(activityLogs).values([
    { id: 'act-001', userId: directorId, username: 'MD Nazmul Hasan', role: 'manager', entityType: 'system', entityId: 'BOOTSTRAP', action: 'create', description: 'Initial SQLite enterprise database bootstrap and ledger initialization complete', changes: JSON.stringify({ tables: 20 }), ipAddress: '127.0.0.1', createdAt: now },
    { id: 'act-002', userId: salesmanId, username: 'Tanvir Ahmed', role: 'salesman', entityType: 'order', entityId: 'ord-1', action: 'create', description: 'Created wholesale sales order ORD-2026-0501 for Apex Computer Systems', changes: JSON.stringify({ totalAmount: 297056 }), ipAddress: '127.0.0.1', createdAt: now },
  ]);

  // 18. Stock Ledger Initial Records
  const ledgerEntries: any[] = [];
  if (Array.isArray(rawData.products)) {
    for (const p of rawData.products.slice(0, 10)) {
      ledgerEntries.push({
        id: `led-${uuidv4()}`,
        productId: p.id,
        productName: p.name,
        referenceType: 'initial_seed',
        referenceId: 'INIT-2026',
        location: p.location || 'Banani Central Vault',
        quantityChange: p.stockCount,
        previousStock: 0,
        newStock: p.stockCount,
        unitCost: p.costPrice,
        notes: 'Initial inventory physical audit verification count',
        createdBy: 'MD Nazmul Hasan',
        createdAt: now,
      });
    }
    await db.insert(stockLedger).values(ledgerEntries);
    console.log(`Inserted ${ledgerEntries.length} stock ledger records to SQLite`);
  }

  console.log('🎉 100% of enterprise records are now stored in the local SQLite database file (/media/somoy/Backup/Documents/China/finpilot/db-server/data/finpilot.db)!');
}

// Allow direct CLI execution: node dist/db/seed.js or tsx src/db/seed.ts
if (process.argv[1] && process.argv[1].includes('seed')) {
  executeFullSeed().then(() => {
    console.log('Seeding process completed cleanly.');
    process.exit(0);
  }).catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
}
