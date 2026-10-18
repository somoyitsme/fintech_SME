import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/client.js';
import { stockTransfers, stockAdjustments, products, supplierPos } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';

const router = Router();

const transferSchema = z.object({
  transferNumber: z.string(),
  fromLocation: z.string(),
  toLocation: z.string(),
  productId: z.string(),
  productName: z.string(),
  quantity: z.number().int().positive(),
  transferDate: z.string(),
  status: z.enum(['In Transit', 'Completed']).default('In Transit'),
  notes: z.string().optional(),
});

const adjustmentSchema = z.object({
  adjustmentNumber: z.string(),
  location: z.string(),
  productId: z.string(),
  productName: z.string(),
  adjustmentType: z.enum(['Damaged', 'Audit Shortage', 'Audit Surplus']),
  quantity: z.number().int(),
  unitCost: z.number().min(0),
  totalValue: z.number(),
  adjustmentDate: z.string(),
  reason: z.string().default(''),
});

const supplierPoSchema = z.object({
  poNumber: z.string(),
  supplierName: z.string(),
  items: z.string().default(''),
  productId: z.string().default(''),
  quantity: z.number().int().min(0).default(0),
  totalCost: z.number().min(0).default(0),
  orderDate: z.string(),
  status: z.enum(['In Transit', 'Port Customs', 'Received']).default('In Transit'),
  expectedDelivery: z.string().default(''),
});

// Stock Transfers
router.get('/transfers', async (req, res) => {
  try {
    const all = await db.select().from(stockTransfers).orderBy(sql`${stockTransfers.transferDate} DESC`);
    res.json(all);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch transfers' });
  }
});

router.post('/transfers', async (req, res) => {
  try {
    const data = transferSchema.parse(req.body);
    const id = uuidv4();
    const now = new Date().toISOString();
    await db.insert(stockTransfers).values({ id, ...data, notes: data.notes || null, createdAt: now, updatedAt: now });
    const [created] = await db.select().from(stockTransfers).where(eq(stockTransfers.id, id)).limit(1);
    res.status(201).json(created);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
    } else if (err.message?.includes('UNIQUE constraint failed')) {
      res.status(409).json({ error: 'Transfer number already exists' });
    } else {
      res.status(500).json({ error: err.message || 'Failed to create transfer' });
    }
  }
});

router.put('/transfers/:id', async (req, res) => {
  try {
    const data = transferSchema.partial().parse(req.body);
    const now = new Date().toISOString();
    await db.update(stockTransfers).set({ ...data, updatedAt: now }).where(eq(stockTransfers.id, req.params.id));
    const [updated] = await db.select().from(stockTransfers).where(eq(stockTransfers.id, req.params.id)).limit(1);
    if (!updated) return res.status(404).json({ error: 'Transfer not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update transfer' });
  }
});

router.delete('/transfers/:id', async (req, res) => {
  try {
    await db.delete(stockTransfers).where(eq(stockTransfers.id, req.params.id));
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete transfer' });
  }
});

// Stock Adjustments
router.get('/adjustments', async (req, res) => {
  try {
    const all = await db.select().from(stockAdjustments).orderBy(sql`${stockAdjustments.adjustmentDate} DESC`);
    res.json(all);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch adjustments' });
  }
});

router.post('/adjustments', async (req, res) => {
  try {
    const data = adjustmentSchema.parse(req.body);
    const id = uuidv4();
    const now = new Date().toISOString();

    // Apply stock adjustment
    const quantityChange = data.adjustmentType === 'Audit Surplus' ? data.quantity : -Math.abs(data.quantity);
    await db.update(products)
      .set({ stockCount: sql`${products.stockCount} + ${quantityChange}`, updatedAt: now })
      .where(eq(products.id, data.productId));

    await db.insert(stockAdjustments).values({ id, ...data, createdAt: now, updatedAt: now });
    const [created] = await db.select().from(stockAdjustments).where(eq(stockAdjustments.id, id)).limit(1);
    res.status(201).json(created);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
    } else if (err.message?.includes('UNIQUE constraint failed')) {
      res.status(409).json({ error: 'Adjustment number already exists' });
    } else {
      res.status(500).json({ error: err.message || 'Failed to create adjustment' });
    }
  }
});

router.delete('/adjustments/:id', async (req, res) => {
  try {
    await db.delete(stockAdjustments).where(eq(stockAdjustments.id, req.params.id));
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete adjustment' });
  }
});

// Supplier Purchase Orders
router.get('/supplier-pos', async (req, res) => {
  try {
    const all = await db.select().from(supplierPos).orderBy(sql`${supplierPos.orderDate} DESC`);
    res.json(all);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch supplier POs' });
  }
});

router.post('/supplier-pos', async (req, res) => {
  try {
    const data = supplierPoSchema.parse(req.body);
    const id = uuidv4();
    const now = new Date().toISOString();
    await db.insert(supplierPos).values({ id, ...data, createdAt: now, updatedAt: now });
    const [created] = await db.select().from(supplierPos).where(eq(supplierPos.id, id)).limit(1);
    res.status(201).json(created);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
    } else if (err.message?.includes('UNIQUE constraint failed')) {
      res.status(409).json({ error: 'PO number already exists' });
    } else {
      res.status(500).json({ error: err.message || 'Failed to create PO' });
    }
  }
});

router.put('/supplier-pos/:id', async (req, res) => {
  try {
    const data = supplierPoSchema.partial().parse(req.body);
    const now = new Date().toISOString();

    // If status changed to 'Received', increment stock
    const [existing] = await db.select().from(supplierPos).where(eq(supplierPos.id, req.params.id)).limit(1);
    if (existing && data.status === 'Received' && existing.status !== 'Received' && existing.productId) {
      await db.update(products)
        .set({ stockCount: sql`${products.stockCount} + ${existing.quantity}`, updatedAt: now })
        .where(eq(products.id, existing.productId));
    }

    await db.update(supplierPos).set({ ...data, updatedAt: now }).where(eq(supplierPos.id, req.params.id));
    const [updated] = await db.select().from(supplierPos).where(eq(supplierPos.id, req.params.id)).limit(1);
    if (!updated) return res.status(404).json({ error: 'PO not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update PO' });
  }
});

router.delete('/supplier-pos/:id', async (req, res) => {
  try {
    await db.delete(supplierPos).where(eq(supplierPos.id, req.params.id));
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete PO' });
  }
});

export default router;
