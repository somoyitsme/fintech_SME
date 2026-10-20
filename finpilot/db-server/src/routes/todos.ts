import { Router } from 'express';
import { db } from '../db/client.js';
import { operationsChecklist, notifications } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { logActivity } from '../services/auditService.js';

const router = Router();

// GET /api/todos - Fetch all operations checklist tasks
router.get('/', async (_req, res) => {
  try {
    const tasks = await db
      .select()
      .from(operationsChecklist)
      .orderBy(desc(operationsChecklist.createdAt));
    res.json(tasks);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch tasks' });
  }
});

// POST /api/todos - Create new task
router.post('/', async (req, res) => {
  try {
    const { title, description = '', category = 'General', priority = 'medium', dueDate = '', createdBy = 'User' } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    const newTask = {
      id,
      title,
      description,
      category,
      priority,
      dueDate,
      isCompleted: 0,
      completedBy: null,
      completedAt: null,
      createdBy,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(operationsChecklist).values(newTask);

    // Broadcast notification to all users with an overview
    try {
      await db.insert(notifications).values({
        id: `notif-${uuidv4().slice(0, 8)}`,
        userId: 'all',
        title: `Operations Task: ${title}`,
        message: `${description ? description + ' · ' : ''}Priority: ${priority.toUpperCase()} · Due: ${dueDate || 'Immediate'} · Assigned by: ${createdBy}`,
        type: priority === 'urgent' ? 'warning' : 'info',
        isRead: 0,
        link: 'essentials-todo',
        actionUrl: 'essentials-todo',
        createdAt: now,
      });
    } catch (notifErr) {
      console.warn('Could not insert task notification:', notifErr);
    }

    logActivity({
      userId: (req as any).userId,
      entityType: 'todo',
      entityId: id,
      action: 'create',
      description: `Task created: "${title}"`,
      ipAddress: req.ip,
    });

    res.status(201).json(newTask);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create task' });
  }
});

// PATCH /api/todos/:id - Update or toggle task completion
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { isCompleted, completedBy, title, description, priority, dueDate } = req.body;
    const now = new Date().toISOString();

    const updateData: any = { updatedAt: now };
    if (isCompleted !== undefined) {
      updateData.isCompleted = isCompleted ? 1 : 0;
      updateData.completedBy = isCompleted ? (completedBy || 'User') : null;
      updateData.completedAt = isCompleted ? now : null;
    }
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate;

    await db
      .update(operationsChecklist)
      .set(updateData)
      .where(eq(operationsChecklist.id, id));

    logActivity({
      userId: (req as any).userId,
      entityType: 'todo',
      entityId: id,
      action: 'update',
      description: `Task ${id} updated: ${isCompleted ? 'marked completed' : 'updated'}`,
      changes: updateData,
      ipAddress: req.ip,
    });

    res.json({ success: true, id, ...updateData });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update task' });
  }
});

// DELETE /api/todos/:id - Remove task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(operationsChecklist).where(eq(operationsChecklist.id, id));

    logActivity({
      userId: (req as any).userId,
      entityType: 'todo',
      entityId: id,
      action: 'delete',
      description: `Task ${id} deleted`,
      ipAddress: req.ip,
    });

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete task' });
  }
});

export default router;
