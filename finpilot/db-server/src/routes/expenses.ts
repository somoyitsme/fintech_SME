import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/client.js';
import { expenses } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';

const router = Router();

const expenseSchema = z.object({
  category: z.string(),
  amount: z.number().min(0),
  vendor: z.string().default(''),
  description: z.string().default(''),
  date: z.string(),
  paymentMethod: z.string().default(''),
  status: z.enum(['Approved', 'Pending']).default('Pending'),
});

router.get('/', async (req, res) => {
  try {
    const all = await db.select().from(expenses).orderBy(sql`${expenses.date} DESC`);
    res.json(all);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch expenses' });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = expenseSchema.parse(req.body);
    const id = uuidv4();
    const now = new Date().toISOString();
    await db.insert(expenses).values({ id, ...data, createdAt: now, updatedAt: now });
    const [created] = await db.select().from(expenses).where(eq(expenses.id, id)).limit(1);
    res.status(201).json(created);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
    } else {
      res.status(500).json({ error: err.message || 'Failed to create expense' });
    }
  }
});

router.patch('/:id/approve', async (req, res) => {
  try {
    const now = new Date().toISOString();
    await db.update(expenses).set({ status: 'Approved', updatedAt: now }).where(eq(expenses.id, req.params.id));
    const [updated] = await db.select().from(expenses).where(eq(expenses.id, req.params.id)).limit(1);
    if (!updated) return res.status(404).json({ error: 'Expense not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to approve expense' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = expenseSchema.partial().parse(req.body);
    const now = new Date().toISOString();
    await db.update(expenses).set({ ...data, updatedAt: now }).where(eq(expenses.id, req.params.id));
    const [updated] = await db.select().from(expenses).where(eq(expenses.id, req.params.id)).limit(1);
    if (!updated) return res.status(404).json({ error: 'Expense not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update expense' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.delete(expenses).where(eq(expenses.id, req.params.id));
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete expense' });
  }
});

export default router;
