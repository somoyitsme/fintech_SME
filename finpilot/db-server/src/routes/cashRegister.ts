import { Router } from 'express';
import { db } from '../db/client.js';
import { cashRegisters } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { logActivity } from '../services/auditService.js';

const router = Router();

// GET /api/cash-register/current - Get latest or open cash register shift
router.get('/current', async (_req, res) => {
  try {
    const [latest] = await db
      .select()
      .from(cashRegisters)
      .orderBy(desc(cashRegisters.openedAt))
      .limit(1);

    if (!latest) {
      return res.json({
        isOpen: false,
        openedAt: '',
        openingCash: 0,
        cashSales: 0,
        totalCash: 0,
      });
    }

    res.json({
      id: latest.id,
      isOpen: latest.status === 'open',
      openedAt: latest.openedAt,
      closedAt: latest.closedAt,
      openingCash: latest.openingAmount,
      cashSales: latest.cashSales,
      cardSales: latest.cardSales,
      mfsSales: latest.mfsSales,
      totalCash: latest.totalExpected || (latest.openingAmount + latest.cashSales),
      location: latest.location,
      userName: latest.userName,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch cash register' });
  }
});

// POST /api/cash-register/open - Open a new register shift
router.post('/open', async (req, res) => {
  try {
    const { openingAmount = 50000, location = 'Banani Central Vault', userName = 'Banani Counter Sales' } = req.body;
    const id = uuidv4();
    const now = new Date().toISOString();

    const newShift = {
      id,
      userId: (req as any).userId || null,
      userName,
      location,
      openingAmount: Number(openingAmount),
      closingAmount: null,
      cashSales: 0,
      cardSales: 0,
      mfsSales: 0,
      totalExpected: Number(openingAmount),
      totalActual: null,
      difference: null,
      status: 'open',
      openedAt: now,
      closedAt: null,
      notes: 'Opened register shift',
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(cashRegisters).values(newShift);

    logActivity({
      userId: (req as any).userId,
      username: userName,
      entityType: 'cash_register',
      entityId: id,
      action: 'create',
      description: `Opened cash register drawer with float ৳ ${Number(openingAmount).toLocaleString()}`,
      ipAddress: req.ip,
    });

    res.status(201).json(newShift);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to open cash register' });
  }
});

// POST /api/cash-register/close - Close and reconcile register shift
router.post('/close', async (req, res) => {
  try {
    const { id, closingAmount, notes = '' } = req.body;
    const now = new Date().toISOString();

    const [current] = id 
      ? await db.select().from(cashRegisters).where(eq(cashRegisters.id, id)).limit(1)
      : await db.select().from(cashRegisters).where(eq(cashRegisters.status, 'open')).orderBy(desc(cashRegisters.openedAt)).limit(1);

    if (!current) {
      return res.status(404).json({ error: 'No open register shift found' });
    }

    const actual = closingAmount !== undefined ? Number(closingAmount) : current.totalExpected;
    const diff = actual - current.totalExpected;

    await db
      .update(cashRegisters)
      .set({
        closingAmount: actual,
        totalActual: actual,
        difference: diff,
        status: 'closed',
        closedAt: now,
        notes: notes || current.notes,
        updatedAt: now,
      })
      .where(eq(cashRegisters.id, current.id));

    logActivity({
      userId: (req as any).userId,
      username: current.userName,
      entityType: 'cash_register',
      entityId: current.id,
      action: 'update',
      description: `Closed cash register drawer with actual cash ৳ ${actual.toLocaleString()} (diff: ৳ ${diff.toLocaleString()})`,
      ipAddress: req.ip,
    });

    res.json({ success: true, id: current.id, closedAt: now, difference: diff });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to close cash register' });
  }
});

export default router;
