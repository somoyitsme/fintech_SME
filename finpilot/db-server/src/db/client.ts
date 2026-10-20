import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = process.env.DB_PATH || path.join(dataDir, 'finpilot.db');
export const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

export function initializeSchema(forceRecreate = false) {
  if (forceRecreate) {
    sqlite.exec(`
      DROP TABLE IF EXISTS order_items;
      DROP TABLE IF EXISTS orders;
      DROP TABLE IF EXISTS stock_ledger;
      DROP TABLE IF EXISTS products;
      DROP TABLE IF EXISTS customers;
      DROP TABLE IF EXISTS suppliers;
      DROP TABLE IF EXISTS supplier_pos;
      DROP TABLE IF EXISTS expenses;
      DROP TABLE IF EXISTS stock_transfers;
      DROP TABLE IF EXISTS stock_adjustments;
      DROP TABLE IF EXISTS payment_accounts;
      DROP TABLE IF EXISTS cash_registers;
      DROP TABLE IF EXISTS staff;
      DROP TABLE IF EXISTS operations_checklist;
      DROP TABLE IF EXISTS business_settings;
      DROP TABLE IF EXISTS notifications;
      DROP TABLE IF EXISTS auth_logs;
      DROP TABLE IF EXISTS activity_logs;
      DROP TABLE IF EXISTS user_sessions;
      DROP TABLE IF EXISTS users;
    `);
  } else {
    try {
      const userColumns = sqlite.pragma('table_info(users)') as any[];
      const hasStatus = Array.isArray(userColumns) && userColumns.some(c => c.name === 'status');
      if (userColumns.length > 0 && !hasStatus) {
        initializeSchema(true);
        return;
      }
    } catch (e) {}
  }

  sqlite.exec(`
    -- 1. Users
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT,
      role TEXT NOT NULL DEFAULT 'admin',
      status TEXT NOT NULL DEFAULT 'active',
      phone TEXT NOT NULL DEFAULT '',
      branch TEXT NOT NULL DEFAULT 'Banani Central Vault',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 2. User Sessions
    CREATE TABLE IF NOT EXISTS user_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL,
      ip_address TEXT DEFAULT '',
      user_agent TEXT DEFAULT '',
      is_active INTEGER NOT NULL DEFAULT 1,
      logged_in_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_active_at TEXT NOT NULL DEFAULT (datetime('now')),
      logged_out_at TEXT
    );

    -- 3. Authentication & Login/Logout Logs
    CREATE TABLE IF NOT EXISTS auth_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      username TEXT NOT NULL,
      action TEXT NOT NULL,
      ip_address TEXT DEFAULT '',
      user_agent TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'success',
      failure_reason TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 4. Full Activity & Audit Trail Logs
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      username TEXT NOT NULL DEFAULT 'System',
      role TEXT NOT NULL DEFAULT 'system',
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      action TEXT NOT NULL,
      description TEXT NOT NULL,
      changes TEXT,
      ip_address TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 5. Notifications
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'all',
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info',
      is_read INTEGER NOT NULL DEFAULT 0,
      link TEXT DEFAULT '',
      action_url TEXT DEFAULT '',
      metadata TEXT DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      read_at TEXT
    );

    -- 6. Products & Catalog
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sku TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      brand TEXT NOT NULL,
      retail_price REAL NOT NULL DEFAULT 0,
      cost_price REAL NOT NULL DEFAULT 0,
      stock_count INTEGER NOT NULL DEFAULT 0,
      unit TEXT NOT NULL DEFAULT 'pcs',
      min_threshold INTEGER NOT NULL DEFAULT 0,
      location TEXT NOT NULL DEFAULT '',
      warranty TEXT NOT NULL DEFAULT '',
      image_url TEXT DEFAULT '',
      barcode TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 7. Stock Movement Audit Ledger
    CREATE TABLE IF NOT EXISTS stock_ledger (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      product_name TEXT NOT NULL,
      reference_type TEXT NOT NULL,
      reference_id TEXT,
      location TEXT NOT NULL DEFAULT 'Banani Central Vault',
      quantity_change INTEGER NOT NULL,
      previous_stock INTEGER NOT NULL,
      new_stock INTEGER NOT NULL,
      unit_cost REAL NOT NULL DEFAULT 0,
      notes TEXT DEFAULT '',
      created_by TEXT NOT NULL DEFAULT 'System',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 8. Customers
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      contact_number TEXT NOT NULL DEFAULT '',
      email TEXT DEFAULT '',
      delivery_address TEXT NOT NULL DEFAULT '',
      customer_type TEXT NOT NULL DEFAULT 'Retail',
      bin_number TEXT,
      credit_limit REAL NOT NULL DEFAULT 0,
      total_purchases REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 9. Orders & Sales
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT NOT NULL UNIQUE,
      order_type TEXT NOT NULL DEFAULT 'offline',
      customer_name TEXT NOT NULL,
      customer_id TEXT,
      contact_number TEXT NOT NULL DEFAULT '',
      delivery_address TEXT NOT NULL DEFAULT '',
      items_summary TEXT NOT NULL DEFAULT '',
      subtotal REAL NOT NULL DEFAULT 0,
      discount_amount REAL NOT NULL DEFAULT 0,
      discount_percent REAL NOT NULL DEFAULT 0,
      vat_amount REAL NOT NULL DEFAULT 0,
      total_amount REAL NOT NULL DEFAULT 0,
      paid_amount REAL NOT NULL DEFAULT 0,
      due_amount REAL NOT NULL DEFAULT 0,
      payment_method TEXT NOT NULL DEFAULT 'cash',
      payment_status TEXT NOT NULL DEFAULT 'Paid',
      status TEXT NOT NULL DEFAULT 'Processing',
      courier_provider TEXT,
      courier_consignment_id TEXT,
      courier_tracking_url TEXT,
      courier_status TEXT,
      courier_cod_amount REAL,
      courier_delivery_fee REAL,
      courier_recipient_city TEXT,
      courier_dispatched_at TEXT,
      order_date TEXT NOT NULL,
      salesman TEXT NOT NULL DEFAULT '',
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 10. Order Items
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL,
      name TEXT NOT NULL,
      sku TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0
    );

    -- 11. Suppliers
    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      contact_person TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      country TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT '',
      total_purchase REAL NOT NULL DEFAULT 0,
      total_due REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 12. Supplier POs
    CREATE TABLE IF NOT EXISTS supplier_pos (
      id TEXT PRIMARY KEY,
      po_number TEXT NOT NULL UNIQUE,
      supplier_name TEXT NOT NULL,
      items TEXT NOT NULL DEFAULT '',
      product_id TEXT NOT NULL DEFAULT '',
      quantity INTEGER NOT NULL DEFAULT 0,
      total_cost REAL NOT NULL DEFAULT 0,
      order_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'In Transit',
      expected_delivery TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 13. Expenses
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      amount REAL NOT NULL DEFAULT 0,
      vendor TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL,
      payment_method TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'Approved',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 14. Stock Transfers
    CREATE TABLE IF NOT EXISTS stock_transfers (
      id TEXT PRIMARY KEY,
      transfer_number TEXT NOT NULL UNIQUE,
      from_location TEXT NOT NULL,
      to_location TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      transfer_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'In Transit',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 15. Stock Adjustments
    CREATE TABLE IF NOT EXISTS stock_adjustments (
      id TEXT PRIMARY KEY,
      adjustment_number TEXT NOT NULL UNIQUE,
      location TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      adjustment_type TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      unit_cost REAL NOT NULL DEFAULT 0,
      total_value REAL NOT NULL DEFAULT 0,
      adjustment_date TEXT NOT NULL,
      reason TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 16. Payment Accounts
    CREATE TABLE IF NOT EXISTS payment_accounts (
      id TEXT PRIMARY KEY,
      account_name TEXT NOT NULL,
      account_type TEXT NOT NULL,
      account_number TEXT NOT NULL DEFAULT '',
      bank_name TEXT,
      balance REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 17. Cash Registers & POS Shifts
    CREATE TABLE IF NOT EXISTS cash_registers (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_name TEXT NOT NULL DEFAULT 'Banani Counter Sales',
      location TEXT NOT NULL DEFAULT 'Banani Central Vault',
      opening_amount REAL NOT NULL DEFAULT 0,
      closing_amount REAL,
      cash_sales REAL NOT NULL DEFAULT 0,
      card_sales REAL NOT NULL DEFAULT 0,
      mfs_sales REAL NOT NULL DEFAULT 0,
      total_expected REAL NOT NULL DEFAULT 0,
      total_actual REAL,
      difference REAL,
      status TEXT NOT NULL DEFAULT 'open',
      opened_at TEXT NOT NULL DEFAULT (datetime('now')),
      closed_at TEXT,
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 18. Staff & HRM
    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      branch TEXT NOT NULL DEFAULT 'Banani Central Vault',
      department TEXT NOT NULL DEFAULT 'Operations',
      hire_date TEXT NOT NULL,
      salary REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Active',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 19. Operations Checklist & Tasks
    CREATE TABLE IF NOT EXISTS operations_checklist (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      category TEXT NOT NULL DEFAULT 'General',
      priority TEXT NOT NULL DEFAULT 'medium',
      due_date TEXT DEFAULT '',
      is_completed INTEGER NOT NULL DEFAULT 0,
      completed_by TEXT,
      completed_at TEXT,
      created_by TEXT NOT NULL DEFAULT 'System',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 20. Business & Enterprise Settings
    CREATE TABLE IF NOT EXISTS business_settings (
      id TEXT PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      description TEXT DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Indices for high performance queries
    CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date DESC);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
    CREATE INDEX IF NOT EXISTS idx_transfers_status ON stock_transfers(status);
    CREATE INDEX IF NOT EXISTS idx_pos_status ON supplier_pos(status);
    CREATE INDEX IF NOT EXISTS idx_auth_logs_created ON auth_logs(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_auth_logs_user ON auth_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
    CREATE INDEX IF NOT EXISTS idx_stock_ledger_product ON stock_ledger(product_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_checklist_completed ON operations_checklist(is_completed);
  `);

  // Migration: Ensure new enterprise columns exist gracefully
  try { sqlite.exec(`ALTER TABLE orders ADD COLUMN branch TEXT NOT NULL DEFAULT 'Banani Central Vault & Warehouse';`); } catch (e) {}
  try { sqlite.exec(`ALTER TABLE orders ADD COLUMN profit REAL NOT NULL DEFAULT 0;`); } catch (e) {}
  try { sqlite.exec(`ALTER TABLE order_items ADD COLUMN cost_price REAL NOT NULL DEFAULT 0;`); } catch (e) {}
  try { sqlite.exec(`ALTER TABLE order_items ADD COLUMN profit REAL NOT NULL DEFAULT 0;`); } catch (e) {}
  try { sqlite.exec(`ALTER TABLE customers ADD COLUMN total_due REAL NOT NULL DEFAULT 0;`); } catch (e) {}
}
