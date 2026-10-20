import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/client.js';
import { customers } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { logActivity } from '../services/auditService.js';

const router = Router();

const customerSchema = z.object({
  name: z.string().min(1),
  contactNumber: z.string().default(''),
  email: z.string().optional().default(''),
  deliveryAddress: z.string().default(''),
  customerType: z.enum(['Wholesale', 'Retail', 'Corporate']).default('Retail'),
  binNumber: z.string().optional(),
  totalPurchases: z.number().min(0).default(0),
  totalDue: z.number().min(0).default(0),
});

router.get('/', async (_req, res) => {
  try {
    const allCustomers = await db.select().from(customers);
    res.json(allCustomers);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch customers' });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = customerSchema.parse(req.body);
    const id = uuidv4();
    const now = new Date().toISOString();

    await db.insert(customers).values({
      id,
      ...data,
      binNumber: data.binNumber || null,
      createdAt: now,
      updatedAt: now,
    });

    logActivity({
      userId: (req as any).userId,
      entityType: 'customer',
      entityId: id,
      action: 'create',
      description: `Registered new ${data.customerType} customer "${data.name}" (${data.contactNumber})`,
      changes: data,
      ipAddress: req.ip,
    });

    const [created] = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    res.status(201).json(created);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
    } else {
      res.status(500).json({ error: err.message || 'Failed to create customer' });
    }
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = customerSchema.partial().parse(req.body);
    const now = new Date().toISOString();

    await db.update(customers)
      .set({ ...data, updatedAt: now })
      .where(eq(customers.id, req.params.id));

    const [updated] = await db.select().from(customers).where(eq(customers.id, req.params.id)).limit(1);
    if (!updated) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    logActivity({
      userId: (req as any).userId,
      entityType: 'customer',
      entityId: req.params.id,
      action: 'update',
      description: `Updated customer profile "${updated.name}"`,
      changes: data,
      ipAddress: req.ip,
    });

    res.json(updated);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
    } else {
      res.status(500).json({ error: err.message || 'Failed to update customer' });
    }
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [existing] = await db.select().from(customers).where(eq(customers.id, req.params.id)).limit(1);
    await db.delete(customers).where(eq(customers.id, req.params.id));

    if (existing) {
      logActivity({
        userId: (req as any).userId,
        entityType: 'customer',
        entityId: req.params.id,
        action: 'delete',
        description: `Removed customer "${existing.name}"`,
        ipAddress: req.ip,
      });
    }

    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete customer' });
  }
});

export default router;
