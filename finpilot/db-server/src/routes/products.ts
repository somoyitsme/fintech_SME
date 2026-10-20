import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/client.js';
import { products } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { logActivity, recordStockMovement } from '../services/auditService.js';

const router = Router();

const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  category: z.string(),
  brand: z.string(),
  retailPrice: z.number().min(0),
  costPrice: z.number().min(0),
  stockCount: z.number().int().min(0),
  unit: z.string().default('pcs'),
  minThreshold: z.number().int().min(0).default(0),
  location: z.string().default(''),
  warranty: z.string().default(''),
});

router.get('/', async (_req, res) => {
  try {
    const allProducts = await db.select().from(products);
    res.json(allProducts);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch products' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [product] = await db.select().from(products).where(eq(products.id, req.params.id)).limit(1);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch product' });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = productSchema.parse(req.body);
    const id = uuidv4();
    const now = new Date().toISOString();

    await db.insert(products).values({
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    });

    if (data.stockCount > 0) {
      recordStockMovement({
        productId: id,
        productName: data.name,
        referenceType: 'initial_seed',
        referenceId: 'INITIAL_STOCK',
        location: data.location,
        quantityChange: data.stockCount,
        previousStock: 0,
        newStock: data.stockCount,
        unitCost: data.costPrice,
        notes: `Initial stock for new product SKU: ${data.sku}`,
      });
    }

    logActivity({
      userId: (req as any).userId,
      entityType: 'product',
      entityId: id,
      action: 'create',
      description: `Created new catalog product "${data.name}" (${data.sku}) - Retail: ৳ ${data.retailPrice.toLocaleString()}`,
      changes: data,
      ipAddress: req.ip,
    });

    const [created] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    res.status(201).json(created);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
    } else if (err.message?.includes('UNIQUE constraint failed')) {
      res.status(409).json({ error: 'SKU already exists' });
    } else {
      res.status(500).json({ error: err.message || 'Failed to create product' });
    }
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = productSchema.partial().parse(req.body);
    const now = new Date().toISOString();

    const [existing] = await db.select().from(products).where(eq(products.id, req.params.id)).limit(1);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await db.update(products)
      .set({ ...data, updatedAt: now })
      .where(eq(products.id, req.params.id));

    logActivity({
      userId: (req as any).userId,
      entityType: 'product',
      entityId: req.params.id,
      action: 'update',
      description: `Updated product "${existing.name}" (${existing.sku})`,
      changes: data,
      ipAddress: req.ip,
    });

    const [updated] = await db.select().from(products).where(eq(products.id, req.params.id)).limit(1);
    res.json(updated);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
    } else {
      res.status(500).json({ error: err.message || 'Failed to update product' });
    }
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [existing] = await db.select().from(products).where(eq(products.id, req.params.id)).limit(1);
    await db.delete(products).where(eq(products.id, req.params.id));

    if (existing) {
      logActivity({
        userId: (req as any).userId,
        entityType: 'product',
        entityId: req.params.id,
        action: 'delete',
        description: `Deleted product "${existing.name}" (${existing.sku})`,
        ipAddress: req.ip,
      });
    }

    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete product' });
  }
});

export default router;
