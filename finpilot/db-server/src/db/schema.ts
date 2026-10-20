// Drizzle schema mirror of the SQLite database tables in client.ts
import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name'),
  role: text('role').notNull().default('admin'),
  status: text('status').notNull().default('active'),
  phone: text('phone').notNull().default(''),
  branch: text('branch').notNull().default('Banani Central Vault'),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export const userSessions = sqliteTable('user_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  token: text('token').notNull(),
  ipAddress: text('ip_address').default(''),
  userAgent: text('user_agent').default(''),
  isActive: integer('is_active').notNull().default(1),
  loggedInAt: text('logged_in_at').notNull().default(''),
  lastActiveAt: text('last_active_at').notNull().default(''),
  loggedOutAt: text('logged_out_at'),
});

export const authLogs = sqliteTable('auth_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  username: text('username').notNull(),
  action: text('action').notNull(), // 'login_success' | 'login_failed' | 'logout' | 'token_refresh'
  ipAddress: text('ip_address').default(''),
  userAgent: text('user_agent').default(''),
  status: text('status').notNull().default('success'), // 'success' | 'failed'
  failureReason: text('failure_reason'),
  createdAt: text('created_at').notNull().default(''),
});

export const activityLogs = sqliteTable('activity_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  username: text('username').notNull().default('System'),
  role: text('role').notNull().default('system'),
  entityType: text('entity_type').notNull(), // 'order' | 'product' | 'customer' | 'supplier' | 'expense' | 'stock_transfer' | 'stock_adjustment' | 'cash_register' | 'settings' | 'auth' | 'notification' | 'todo'
  entityId: text('entity_id'),
  action: text('action').notNull(), // 'create' | 'update' | 'delete' | 'view' | 'export' | 'status_change' | 'approve' | 'dispatch'
  description: text('description').notNull(),
  changes: text('changes'), // JSON
  ipAddress: text('ip_address').default(''),
  createdAt: text('created_at').notNull().default(''),
});

export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().default('all'),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull().default('info'), // 'info' | 'warning' | 'success' | 'danger' | 'order' | 'stock' | 'system'
  isRead: integer('is_read').notNull().default(0),
  link: text('link').default(''),
  actionUrl: text('action_url').default(''),
  metadata: text('metadata').default('{}'),
  createdAt: text('created_at').notNull().default(''),
  readAt: text('read_at'),
});

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  sku: text('sku').notNull().unique(),
  category: text('category').notNull(),
  brand: text('brand').notNull(),
  retailPrice: real('retail_price').notNull().default(0),
  costPrice: real('cost_price').notNull().default(0),
  stockCount: integer('stock_count').notNull().default(0),
  unit: text('unit').notNull().default('pcs'),
  minThreshold: integer('min_threshold').notNull().default(0),
  location: text('location').notNull().default(''),
  warranty: text('warranty').notNull().default(''),
  imageUrl: text('image_url').default(''),
  barcode: text('barcode').default(''),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export const stockLedger = sqliteTable('stock_ledger', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull(),
  productName: text('product_name').notNull(),
  referenceType: text('reference_type').notNull(), // 'sale' | 'purchase' | 'transfer_in' | 'transfer_out' | 'adjustment_loss' | 'adjustment_gain' | 'return' | 'initial_seed'
  referenceId: text('reference_id'),
  location: text('location').notNull().default('Banani Central Vault'),
  quantityChange: integer('quantity_change').notNull(),
  previousStock: integer('previous_stock').notNull(),
  newStock: integer('new_stock').notNull(),
  unitCost: real('unit_cost').notNull().default(0),
  notes: text('notes').default(''),
  createdBy: text('created_by').notNull().default('System'),
  createdAt: text('created_at').notNull().default(''),
});

export const customers = sqliteTable('customers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  contactNumber: text('contact_number').notNull().default(''),
  email: text('email').default(''),
  deliveryAddress: text('delivery_address').notNull().default(''),
  customerType: text('customer_type').notNull().default('Retail'),
  binNumber: text('bin_number'),
  creditLimit: real('credit_limit').notNull().default(0),
  totalPurchases: real('total_purchases').notNull().default(0),
  totalDue: real('total_due').notNull().default(0),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  orderType: text('order_type').notNull().default('offline'),
  customerName: text('customer_name').notNull(),
  customerId: text('customer_id'),
  contactNumber: text('contact_number').notNull().default(''),
  deliveryAddress: text('delivery_address').notNull().default(''),
  itemsSummary: text('items_summary').notNull().default(''),
  subtotal: real('subtotal').notNull().default(0),
  discountAmount: real('discount_amount').notNull().default(0),
  discountPercent: real('discount_percent').notNull().default(0),
  vatAmount: real('vat_amount').notNull().default(0),
  totalAmount: real('total_amount').notNull().default(0),
  paidAmount: real('paid_amount').notNull().default(0),
  dueAmount: real('due_amount').notNull().default(0),
  profit: real('profit').notNull().default(0),
  branch: text('branch').notNull().default('Banani Central Vault & Warehouse'),
  paymentMethod: text('payment_method').notNull().default('cash'),
  paymentStatus: text('payment_status').notNull().default('Paid'),
  status: text('status').notNull().default('Processing'),
  courierProvider: text('courier_provider'),
  courierConsignmentId: text('courier_consignment_id'),
  courierTrackingUrl: text('courier_tracking_url'),
  courierStatus: text('courier_status'),
  courierCodAmount: real('courier_cod_amount'),
  courierDeliveryFee: real('courier_delivery_fee'),
  courierRecipientCity: text('courier_recipient_city'),
  courierDispatchedAt: text('courier_dispatched_at'),
  orderDate: text('order_date').notNull(),
  salesman: text('salesman').notNull().default(''),
  notes: text('notes').default(''),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export const orderItems = sqliteTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull(),
  productId: text('product_id').notNull(),
  name: text('name').notNull(),
  sku: text('sku').notNull(),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: real('unit_price').notNull().default(0),
  costPrice: real('cost_price').notNull().default(0),
  profit: real('profit').notNull().default(0),
  total: real('total').notNull().default(0),
});

export const suppliers = sqliteTable('suppliers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  contactPerson: text('contact_person').notNull().default(''),
  phone: text('phone').notNull().default(''),
  email: text('email').notNull().default(''),
  address: text('address').notNull().default(''),
  country: text('country').notNull().default(''),
  category: text('category').notNull().default(''),
  totalPurchase: real('total_purchase').notNull().default(0),
  totalDue: real('total_due').notNull().default(0),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export const supplierPos = sqliteTable('supplier_pos', {
  id: text('id').primaryKey(),
  poNumber: text('po_number').notNull().unique(),
  supplierName: text('supplier_name').notNull(),
  items: text('items').notNull().default(''),
  productId: text('product_id').notNull().default(''),
  quantity: integer('quantity').notNull().default(0),
  totalCost: real('total_cost').notNull().default(0),
  orderDate: text('order_date').notNull(),
  status: text('status').notNull().default('In Transit'),
  expectedDelivery: text('expected_delivery').notNull().default(''),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export const expenses = sqliteTable('expenses', {
  id: text('id').primaryKey(),
  category: text('category').notNull(),
  amount: real('amount').notNull().default(0),
  vendor: text('vendor').notNull().default(''),
  description: text('description').notNull().default(''),
  date: text('date').notNull(),
  paymentMethod: text('payment_method').notNull().default(''),
  status: text('status').notNull().default('Approved'),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export const stockTransfers = sqliteTable('stock_transfers', {
  id: text('id').primaryKey(),
  transferNumber: text('transfer_number').notNull().unique(),
  fromLocation: text('from_location').notNull(),
  toLocation: text('to_location').notNull(),
  productId: text('product_id').notNull(),
  productName: text('product_name').notNull(),
  quantity: integer('quantity').notNull().default(0),
  transferDate: text('transfer_date').notNull(),
  status: text('status').notNull().default('In Transit'),
  notes: text('notes'),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export const stockAdjustments = sqliteTable('stock_adjustments', {
  id: text('id').primaryKey(),
  adjustmentNumber: text('adjustment_number').notNull().unique(),
  location: text('location').notNull(),
  productId: text('product_id').notNull(),
  productName: text('product_name').notNull(),
  adjustmentType: text('adjustment_type').notNull(),
  quantity: integer('quantity').notNull().default(0),
  unitCost: real('unit_cost').notNull().default(0),
  totalValue: real('total_value').notNull().default(0),
  adjustmentDate: text('adjustment_date').notNull(),
  reason: text('reason').notNull().default(''),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export const paymentAccounts = sqliteTable('payment_accounts', {
  id: text('id').primaryKey(),
  accountName: text('account_name').notNull(),
  accountType: text('account_type').notNull(),
  accountNumber: text('account_number').notNull().default(''),
  bankName: text('bank_name'),
  balance: real('balance').notNull().default(0),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export const cashRegisters = sqliteTable('cash_registers', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  userName: text('user_name').notNull().default('Banani Counter Sales'),
  location: text('location').notNull().default('Banani Central Vault'),
  openingAmount: real('opening_amount').notNull().default(0),
  closingAmount: real('closing_amount'),
  cashSales: real('cash_sales').notNull().default(0),
  cardSales: real('card_sales').notNull().default(0),
  mfsSales: real('mfs_sales').notNull().default(0),
  totalExpected: real('total_expected').notNull().default(0),
  totalActual: real('total_actual'),
  difference: real('difference'),
  status: text('status').notNull().default('open'),
  openedAt: text('opened_at').notNull().default(''),
  closedAt: text('closed_at'),
  notes: text('notes').default(''),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export const staff = sqliteTable('staff', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  email: text('email').notNull().default(''),
  phone: text('phone').notNull().default(''),
  branch: text('branch').notNull().default('Banani Central Vault'),
  department: text('department').notNull().default('Operations'),
  hireDate: text('hire_date').notNull(),
  salary: real('salary').notNull().default(0),
  status: text('status').notNull().default('Active'),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export const operationsChecklist = sqliteTable('operations_checklist', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').default(''),
  category: text('category').notNull().default('General'),
  priority: text('priority').notNull().default('medium'), // 'low' | 'medium' | 'high' | 'urgent'
  dueDate: text('due_date').default(''),
  isCompleted: integer('is_completed').notNull().default(0),
  completedBy: text('completed_by'),
  completedAt: text('completed_at'),
  createdBy: text('created_by').notNull().default('System'),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export const businessSettings = sqliteTable('business_settings', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  category: text('category').notNull().default('general'),
  description: text('description').default(''),
  updatedAt: text('updated_at').notNull().default(''),
});
