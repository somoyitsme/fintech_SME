import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/client.js';
import { paymentAccounts, staff } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

// Payment Accounts
const accountSchema = z.object({
  accountName: z.string().min(1),
  accountType: z.enum(['Cash Drawer', 'Bank Account', 'MFS (bKash/Nagad)']),
  accountNumber: z.string().default(''),
  bankName: z.string().optional(),
  balance: z.number().min(0).default(0),
});

router.get('/payment-accounts', async (req, res) => {
  try {
    const all = await db.select().from(paymentAccounts);
    res.json(all);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch accounts' });
  }
});

router.post('/payment-accounts', async (req, res) => {
  try {
    const data = accountSchema.parse(req.body);
    const id = uuidv4();
    const now = new Date().toISOString();
    await db.insert(paymentAccounts).values({ id, ...data, bankName: data.bankName || null, createdAt: now, updatedAt: now });
    const [created] = await db.select().from(paymentAccounts).where(eq(paymentAccounts.id, id)).limit(1);
    res.status(201).json(created);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
    } else {
      res.status(500).json({ error: err.message || 'Failed to create account' });
    }
  }
});

router.put('/payment-accounts/:id', async (req, res) => {
  try {
    const data = accountSchema.partial().parse(req.body);
    const now = new Date().toISOString();
    await db.update(paymentAccounts).set({ ...data, updatedAt: now }).where(eq(paymentAccounts.id, req.params.id));
    const [updated] = await db.select().from(paymentAccounts).where(eq(paymentAccounts.id, req.params.id)).limit(1);
    if (!updated) return res.status(404).json({ error: 'Account not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update account' });
  }
});

router.delete('/payment-accounts/:id', async (req, res) => {
  try {
    await db.delete(paymentAccounts).where(eq(paymentAccounts.id, req.params.id));
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete account' });
  }
});

// Staff
const staffSchema = z.object({
  name: z.string().min(1),
  role: z.string(),
  email: z.string().default(''),
  phone: z.string().default(''),
  hireDate: z.string(),
  salary: z.number().min(0).default(0),
  status: z.enum(['Active', 'Inactive']).default('Active'),
});

router.get('/staff', async (req, res) => {
  try {
    const all = await db.select().from(staff);
    res.json(all);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch staff' });
  }
});

router.post('/staff', async (req, res) => {
  try {
    const data = staffSchema.parse(req.body);
    const id = uuidv4();
    const now = new Date().toISOString();
    await db.insert(staff).values({ id, ...data, createdAt: now, updatedAt: now });
    const [created] = await db.select().from(staff).where(eq(staff.id, id)).limit(1);
    res.status(201).json(created);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
    } else {
      res.status(500).json({ error: err.message || 'Failed to create staff' });
    }
  }
});

router.put('/staff/:id', async (req, res) => {
  try {
    const data = staffSchema.partial().parse(req.body);
    const now = new Date().toISOString();
    await db.update(staff).set({ ...data, updatedAt: now }).where(eq(staff.id, req.params.id));
    const [updated] = await db.select().from(staff).where(eq(staff.id, req.params.id)).limit(1);
    if (!updated) return res.status(404).json({ error: 'Staff not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update staff' });
  }
});

router.delete('/staff/:id', async (req, res) => {
  try {
    await db.delete(staff).where(eq(staff.id, req.params.id));
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete staff' });
  }
});

export default router;
