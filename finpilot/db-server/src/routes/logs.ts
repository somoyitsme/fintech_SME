import { Router } from 'express';
import { db } from '../db/client.js';
import { authLogs, activityLogs, userSessions } from '../db/schema.js';
import { desc, eq } from 'drizzle-orm';
import { logActivity } from '../services/auditService.js';

const router = Router();

// GET /api/logs/auth - Get all login/logout authentication records
router.get('/auth', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const records = await db
      .select()
      .from(authLogs)
      .orderBy(desc(authLogs.createdAt))
      .limit(limit);

    res.json(records);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch auth logs' });
  }
});

// GET /api/logs/sessions - Get active and historical user sessions
router.get('/sessions', async (req, res) => {
  try {
    const records = await db
      .select()
      .from(userSessions)
      .orderBy(desc(userSessions.loggedInAt))
      .limit(50);

    res.json(records);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch user sessions' });
  }
});

// GET /api/logs/activity - Get full enterprise activity audit trail
router.get('/activity', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 150;
    const { entityType } = req.query;

    let query = db.select().from(activityLogs);
    const records = entityType
      ? await query.where(eq(activityLogs.entityType, String(entityType))).orderBy(desc(activityLogs.createdAt)).limit(limit)
      : await query.orderBy(desc(activityLogs.createdAt)).limit(limit);

    res.json(records);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch activity logs' });
  }
});

// POST /api/logs/activity - Allow client to record user actions into DB audit trail
router.post('/activity', async (req, res) => {
  try {
    const { 
      userId, 
      username, 
      role, 
      entityType, 
      entityId, 
      action, 
      description, 
      changes 
    } = req.body;

    if (!entityType || !action || !description) {
      return res.status(400).json({ error: 'entityType, action, and description are required' });
    }

    logActivity({
      userId: userId || (req as any).userId,
      username: username || 'User',
      role: role || 'user',
      entityType,
      entityId: entityId || null,
      action,
      description,
      changes: changes || null,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to record activity log' });
  }
});

export default router;
