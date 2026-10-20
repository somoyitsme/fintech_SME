import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/client.js';
import { stockTransfers, stockAdjustments, products, supplierPos, stockLedger } from '../db/schema.js';
import { eq, sql, desc } from 'drizzle-orm';
import { logActivity, recordStockMovement, createNotification } from '../services/auditService.js';

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

// GET /api/stock/ledger - Inventory Movement Audit Trail
router.get('/ledger', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const { productId } = req.query;

    let query = db.select().from(stockLedger);
    const ledger = productId
      ? await query.where(eq(stockLedger.productId, String(productId))).orderBy(desc(stockLedger.createdAt)).limit(limit)
      : await query.orderBy(desc(stockLedger.createdAt)).limit(limit);

    res.json(ledger);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch stock ledger' });
  }
});

// Stock Transfers
router.get('/transfers', async (_req, res) => {
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

    // Update product stock counts across branches
    const [sourceProd] = await db.select().from(products).where(eq(products.id, data.productId)).limit(1);
    if (sourceProd) {
      const prevStock = sourceProd.stockCount;
      const newStock = Math.max(0, prevStock - data.quantity);
      await db.update(products).set({ stockCount: newStock, updatedAt: now }).where(eq(products.id, sourceProd.id));

      recordStockMovement({
        productId: sourceProd.id,
        productName: sourceProd.name,
        referenceType: 'transfer_out',
        referenceId: data.transferNumber,
        location: data.fromLocation,
        quantityChange: -data.quantity,
        previousStock,
        newStock,
        unitCost: sourceProd.costPrice,
        notes: `Transferred to ${data.toLocation} (Ref: ${data.transferNumber})`,
      });

      // Target product: find if same SKU or name exists at toLocation
      const targetMatches = await db.select().from(products)
        .where(eq(products.name, sourceProd.name));
      
      const targetProd = targetMatches.find(p => 
        p.id !== sourceProd.id && 
        p.location.toLowerCase().includes(data.toLocation.split(' ')[0].toLowerCase())
      );

      if (targetProd) {
        const targetPrev = targetProd.stockCount;
        const targetNew = targetPrev + data.quantity;
        await db.update(products).set({ stockCount: targetNew, updatedAt: now }).where(eq(products.id, targetProd.id));

        recordStockMovement({
          productId: targetProd.id,
          productName: targetProd.name,
          referenceType: 'transfer_in',
          referenceId: data.transferNumber,
          location: data.toLocation,
          quantityChange: data.quantity,
          previousStock: targetPrev,
          newStock: targetNew,
          unitCost: targetProd.costPrice,
          notes: `Received from ${data.fromLocation} (Ref: ${data.transferNumber})`,
        });
      } else {
        // Create product record at target location
        const targetId = uuidv4();
        await db.insert(products).values({
          id: targetId,
          name: sourceProd.name,
          sku: `${sourceProd.sku}-${data.toLocation.split(' ')[0].toUpperCase()}`,
          category: sourceProd.category,
          brand: sourceProd.brand,
          retailPrice: sourceProd.retailPrice,
          costPrice: sourceProd.costPrice,
          stockCount: data.quantity,
          unit: sourceProd.unit,
          minThreshold: sourceProd.minThreshold,
          location: data.toLocation,
          warranty: sourceProd.warranty,
          createdAt: now,
          updatedAt: now,
        });

        recordStockMovement({
          productId: targetId,
          productName: sourceProd.name,
          referenceType: 'transfer_in',
          referenceId: data.transferNumber,
          location: data.toLocation,
          quantityChange: data.quantity,
          previousStock: 0,
          newStock: data.quantity,
          unitCost: sourceProd.costPrice,
          notes: `Initial stock received via transfer from ${data.fromLocation}`,
        });
      }
    }

    // Audit log & notification
    logActivity({
      userId: (req as any).userId,
      entityType: 'stock_transfer',
      entityId: id,
      action: 'create',
      description: `Stock transfer ${data.transferNumber}: ${data.quantity}x ${data.productName} from ${data.fromLocation} to ${data.toLocation}`,
      ipAddress: req.ip,
    });

    createNotification({
      title: `Stock Transfer Dispatched: ${data.transferNumber}`,
      message: `${data.quantity} units of ${data.productName} dispatched from ${data.fromLocation} to ${data.toLocation}`,
      type: 'info',
      link: 'stock-transfers-list',
    });

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
router.get('/adjustments', async (_req, res) => {
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

    const [currentProd] = await db.select().from(products).where(eq(products.id, data.productId)).limit(1);
    const prevStock = currentProd ? currentProd.stockCount : 0;

    // Apply stock adjustment
    const quantityChange = data.adjustmentType === 'Audit Surplus' ? data.quantity : -Math.abs(data.quantity);
    const newStock = Math.max(0, prevStock + quantityChange);

    await db.update(products)
      .set({ stockCount: newStock, updatedAt: now })
      .where(eq(products.id, data.productId));

    await db.insert(stockAdjustments).values({ id, ...data, createdAt: now, updatedAt: now });

    // Record stock ledger
    recordStockMovement({
      productId: data.productId,
      productName: data.productName,
      referenceType: data.adjustmentType === 'Damaged' ? 'adjustment_loss' : 'adjustment_gain',
      referenceId: data.adjustmentNumber,
      location: data.location,
      quantityChange,
      previousStock: prevStock,
      newStock,
      unitCost: data.unitCost,
      notes: data.reason,
    });

    logActivity({
      userId: (req as any).userId,
      entityType: 'stock_adjustment',
      entityId: id,
      action: 'create',
      description: `Stock adjustment ${data.adjustmentNumber}: ${data.adjustmentType} (${quantityChange > 0 ? '+' : ''}${quantityChange}) on ${data.productName}`,
      ipAddress: req.ip,
    });

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
router.get('/supplier-pos', async (_req, res) => {
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

    logActivity({
      userId: (req as any).userId,
      entityType: 'supplier',
      entityId: id,
      action: 'create',
      description: `Created Supplier PO ${data.poNumber} for ${data.supplierName} (৳ ${data.totalCost.toLocaleString()})`,
      ipAddress: req.ip,
    });

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

    const [existing] = await db.select().from(supplierPos).where(eq(supplierPos.id, req.params.id)).limit(1);
    if (existing && data.status === 'Received' && existing.status !== 'Received' && existing.productId) {
      const [currentProd] = await db.select().from(products).where(eq(products.id, existing.productId)).limit(1);
      const prevStock = currentProd ? currentProd.stockCount : 0;
      const newStock = prevStock + existing.quantity;

      await db.update(products)
        .set({ stockCount: newStock, updatedAt: now })
        .where(eq(products.id, existing.productId));

      recordStockMovement({
        productId: existing.productId,
        productName: currentProd ? currentProd.name : existing.items,
        referenceType: 'purchase',
        referenceId: existing.poNumber,
        quantityChange: existing.quantity,
        previousStock: prevStock,
        newStock,
        unitCost: existing.totalCost / Math.max(1, existing.quantity),
        notes: `Received PO ${existing.poNumber} from ${existing.supplierName}`,
      });
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
