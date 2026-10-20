import { v4 as uuidv4 } from 'uuid';
import { sqlite } from '../db/client.js';

export interface AuthLogParams {
  userId?: string | null;
  username: string;
  action: 'login_success' | 'login_failed' | 'logout' | 'token_refresh' | 'session_expired';
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failed';
  failureReason?: string | null;
}

export function logAuth(params: AuthLogParams): void {
  try {
    const id = uuidv4();
    const now = new Date().toISOString();
    const stmt = sqlite.prepare(`
      INSERT INTO auth_logs (id, user_id, username, action, ip_address, user_agent, status, failure_reason, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      params.userId || null,
      params.username,
      params.action,
      params.ipAddress || '',
      params.userAgent || '',
      params.status,
      params.failureReason || null,
      now
    );
  } catch (err) {
    console.warn('[AuditService] Failed to log auth event:', err);
  }
}

export interface ActivityLogParams {
  userId?: string | null;
  username?: string;
  role?: string;
  entityType: 'order' | 'product' | 'customer' | 'supplier' | 'expense' | 'stock_transfer' | 'stock_adjustment' | 'cash_register' | 'settings' | 'auth' | 'notification' | 'todo' | 'system';
  entityId?: string | null;
  action: 'create' | 'update' | 'delete' | 'view' | 'export' | 'status_change' | 'approve' | 'dispatch' | 'login' | 'logout';
  description: string;
  changes?: Record<string, any> | null;
  ipAddress?: string;
}

export function logActivity(params: ActivityLogParams): void {
  try {
    const id = uuidv4();
    const now = new Date().toISOString();
    const stmt = sqlite.prepare(`
      INSERT INTO activity_logs (id, user_id, username, role, entity_type, entity_id, action, description, changes, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      params.userId || null,
      params.username || 'System',
      params.role || 'system',
      params.entityType,
      params.entityId || null,
      params.action,
      params.description,
      params.changes ? JSON.stringify(params.changes) : null,
      params.ipAddress || '',
      now
    );
  } catch (err) {
    console.warn('[AuditService] Failed to log activity event:', err);
  }
}

export interface NotificationParams {
  userId?: string; // 'all' or specific user ID
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'success' | 'danger' | 'order' | 'stock' | 'system';
  link?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export function createNotification(params: NotificationParams): string {
  const id = uuidv4();
  try {
    const now = new Date().toISOString();
    const stmt = sqlite.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type, is_read, link, action_url, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      params.userId || 'all',
      params.title,
      params.message,
      params.type || 'info',
      params.link || '',
      params.actionUrl || '',
      params.metadata ? JSON.stringify(params.metadata) : '{}',
      now
    );
  } catch (err) {
    console.warn('[AuditService] Failed to create notification:', err);
  }
  return id;
}

export interface StockLedgerParams {
  productId: string;
  productName: string;
  referenceType: 'sale' | 'purchase' | 'transfer_in' | 'transfer_out' | 'adjustment_loss' | 'adjustment_gain' | 'return' | 'initial_seed';
  referenceId?: string | null;
  location?: string;
  quantityChange: number;
  previousStock: number;
  newStock: number;
  unitCost?: number;
  notes?: string;
  createdBy?: string;
}

export function recordStockMovement(params: StockLedgerParams): void {
  try {
    const id = uuidv4();
    const now = new Date().toISOString();
    const stmt = sqlite.prepare(`
      INSERT INTO stock_ledger (id, product_id, product_name, reference_type, reference_id, location, quantity_change, previous_stock, new_stock, unit_cost, notes, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      params.productId,
      params.productName,
      params.referenceType,
      params.referenceId || null,
      params.location || 'Banani Central Vault',
      params.quantityChange,
      params.previousStock,
      params.newStock,
      params.unitCost || 0,
      params.notes || '',
      params.createdBy || 'System',
      now
    );
  } catch (err) {
    console.warn('[AuditService] Failed to record stock ledger:', err);
  }
}
