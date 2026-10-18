// Drizzle schema mirror of the SQL created in client.ts.
// Kept for typed queries; table definitions mirror the raw CREATE TABLE statements.
import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name'),
  role: text('role').notNull().default('admin'),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
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
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export const customers = sqliteTable('customers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  contactNumber: text('contact_number').notNull().default(''),
  deliveryAddress: text('delivery_address').notNull().default(''),
  customerType: text('customer_type').notNull().default('Retail'),
  binNumber: text('bin_number'),
  totalPurchases: real('total_purchases').notNull().default(0),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  orderType: text('order_type').notNull().default('offline'),
  customerName: text('customer_name').notNull(),
  contactNumber: text('contact_number').notNull().default(''),
  deliveryAddress: text('delivery_address').notNull().default(''),
  itemsSummary: text('items_summary').notNull().default(''),
  subtotal: real('subtotal').notNull().default(0),
  discountAmount: real('discount_amount').notNull().default(0),
  discountPercent: real('discount_percent').notNull().default(0),
  vatAmount: real('vat_amount').notNull().default(0),
  totalAmount: real('total_amount').notNull().default(0),
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

export const staff = sqliteTable('staff', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  email: text('email').notNull().default(''),
  phone: text('phone').notNull().default(''),
  hireDate: text('hire_date').notNull(),
  salary: real('salary').notNull().default(0),
  status: text('status').notNull().default('Active'),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});
