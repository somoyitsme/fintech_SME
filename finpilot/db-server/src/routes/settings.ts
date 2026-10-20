import { Router } from 'express';
import { db } from '../db/client.js';
import { businessSettings } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { logActivity } from '../services/auditService.js';

const router = Router();

// GET /api/settings - Fetch all settings
router.get('/', async (_req, res) => {
  try {
    const records = await db.select().from(businessSettings);
    // Return both array and key-value mapping for convenience
    const settingsMap: Record<string, string> = {};
    records.forEach(r => { settingsMap[r.key] = r.value; });
    res.json({ list: records, map: settingsMap });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch settings' });
  }
});

// POST /api/settings - Upsert setting
router.post('/', async (req, res) => {
  try {
    const { key, value, category = 'general', description = '' } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json({ error: 'Key and value are required' });
    }

    const now = new Date().toISOString();
    const existing = await db.select().from(businessSettings).where(eq(businessSettings.key, key)).limit(1);

    if (existing.length > 0) {
      await db
        .update(businessSettings)
        .set({ value: String(value), category, description, updatedAt: now })
        .where(eq(businessSettings.key, key));
    } else {
      await db.insert(businessSettings).values({
        id: uuidv4(),
        key,
        value: String(value),
        category,
        description,
        updatedAt: now,
      });
    }

    logActivity({
      userId: (req as any).userId,
      entityType: 'settings',
      entityId: key,
      action: 'update',
      description: `Updated business setting: "${key}" = "${value}"`,
      ipAddress: req.ip,
    });

    res.json({ success: true, key, value });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save setting' });
  }
});

export default router;
