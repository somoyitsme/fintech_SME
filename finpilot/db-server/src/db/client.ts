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

export function initializeSchema() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

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
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      contact_number TEXT NOT NULL DEFAULT '',
      delivery_address TEXT NOT NULL DEFAULT '',
      customer_type TEXT NOT NULL DEFAULT 'Retail',
      bin_number TEXT,
      total_purchases REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT NOT NULL UNIQUE,
      order_type TEXT NOT NULL DEFAULT 'offline',
      customer_name TEXT NOT NULL,
      contact_number TEXT NOT NULL DEFAULT '',
      delivery_address TEXT NOT NULL DEFAULT '',
      items_summary TEXT NOT NULL DEFAULT '',
      subtotal REAL NOT NULL DEFAULT 0,
      discount_amount REAL NOT NULL DEFAULT 0,
      discount_percent REAL NOT NULL DEFAULT 0,
      vat_amount REAL NOT NULL DEFAULT 0,
      total_amount REAL NOT NULL DEFAULT 0,
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
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

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

    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      hire_date TEXT NOT NULL,
      salary REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Active',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date DESC);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
    CREATE INDEX IF NOT EXISTS idx_transfers_status ON stock_transfers(status);
    CREATE INDEX IF NOT EXISTS idx_pos_status ON supplier_pos(status);
  `);
}
