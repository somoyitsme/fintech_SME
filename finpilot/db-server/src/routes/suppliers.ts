import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/client.js';
import { suppliers } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

const supplierSchema = z.object({
  name: z.string().min(1),
  contactPerson: z.string().default(''),
  phone: z.string().default(''),
  email: z.string().default(''),
  address: z.string().default(''),
  country: z.string().default(''),
  category: z.string().default(''),
  totalPurchase: z.number().min(0).default(0),
  totalDue: z.number().min(0).default(0),
});

router.get('/', async (req, res) => {
  try {
    const all = await db.select().from(suppliers);
    res.json(all);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch suppliers' });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = supplierSchema.parse(req.body);
    const id = uuidv4();
    const now = new Date().toISOString();

    await db.insert(suppliers).values({ id, ...data, createdAt: now, updatedAt: now });
    const [created] = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1);
    res.status(201).json(created);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
    } else {
      res.status(500).json({ error: err.message || 'Failed to create supplier' });
    }
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = supplierSchema.partial().parse(req.body);
    const now = new Date().toISOString();
    await db.update(suppliers).set({ ...data, updatedAt: now }).where(eq(suppliers.id, req.params.id));
    const [updated] = await db.select().from(suppliers).where(eq(suppliers.id, req.params.id)).limit(1);
    if (!updated) return res.status(404).json({ error: 'Supplier not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update supplier' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.delete(suppliers).where(eq(suppliers.id, req.params.id));
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete supplier' });
  }
});

export default router;
