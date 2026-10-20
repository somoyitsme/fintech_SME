import { Router } from 'express';
import { db } from '../db/client.js';
import { notifications } from '../db/schema.js';
import { eq, desc, and, or } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { logActivity } from '../services/auditService.js';

const router = Router();

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const { userId, unreadOnly } = req.query;
    
    let query = db.select().from(notifications);
    
    const conditions = [];
    if (userId) {
      conditions.push(or(eq(notifications.userId, String(userId)), eq(notifications.userId, 'all')));
    }
    if (unreadOnly === 'true') {
      conditions.push(eq(notifications.isRead, 0));
    }

    const results = conditions.length > 0 
      ? await query.where(and(...conditions)).orderBy(desc(notifications.createdAt))
      : await query.orderBy(desc(notifications.createdAt));

    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch notifications' });
  }
});

// POST /api/notifications
router.post('/', async (req, res) => {
  try {
    const { title, message, type = 'info', userId = 'all', link = '', actionUrl = '', metadata = {} } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    const newNotif = {
      id,
      userId,
      title,
      message,
      type,
      isRead: 0,
      link,
      actionUrl,
      metadata: typeof metadata === 'string' ? metadata : JSON.stringify(metadata),
      createdAt: now,
      readAt: null,
    };

    await db.insert(notifications).values(newNotif);

    logActivity({
      userId: (req as any).userId,
      entityType: 'notification',
      entityId: id,
      action: 'create',
      description: `Notification created: "${title}"`,
      ipAddress: req.ip,
    });

    res.status(201).json(newNotif);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create notification' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date().toISOString();

    await db
      .update(notifications)
      .set({ isRead: 1, readAt: now })
      .where(eq(notifications.id, id));

    res.json({ success: true, id, readAt: now });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to mark notification as read' });
  }
});

// POST /api/notifications/mark-all-read
router.post('/mark-all-read', async (req, res) => {
  try {
    const now = new Date().toISOString();
    await db
      .update(notifications)
      .set({ isRead: 1, readAt: now })
      .where(eq(notifications.isRead, 0));

    res.json({ success: true, markedAt: now });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to mark all as read' });
  }
});

// DELETE /api/notifications/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(notifications).where(eq(notifications.id, id));
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete notification' });
  }
});

export default router;
