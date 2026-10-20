import { Router } from 'express';
import { z } from 'zod';
import * as authService from '../services/authService.js';
import { logAuth, logActivity } from '../services/auditService.js';
import { db } from '../db/client.js';
import { userSessions } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().optional(),
});

const loginSchema = z.object({
  username: z.string().optional(),
  email: z.string().optional(),
  password: z.string(),
}).refine(data => !!(data.username || data.email), {
  message: 'Username or email is required',
});

router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await authService.registerUser(data.username, data.email, data.password, data.fullName);

    logActivity({
      userId: result.user.id,
      username: result.user.username,
      role: result.user.role,
      entityType: 'auth',
      entityId: result.user.id,
      action: 'create',
      description: `New user registered: ${result.user.username} (${result.user.email})`,
      ipAddress: req.ip,
    });

    res.json(result);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
    } else if (err.message?.includes('UNIQUE constraint failed')) {
      res.status(409).json({ error: 'Username or email already exists' });
    } else {
      res.status(500).json({ error: err.message || 'Registration failed' });
    }
  }
});

router.post('/login', async (req, res) => {
  const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown Client';
  let requestedIdentifier = '';

  try {
    const data = loginSchema.parse(req.body);
    requestedIdentifier = (data.username || data.email || '').trim();
    const result = await authService.loginUser(requestedIdentifier, data.password);

    const now = new Date().toISOString();

    // 1. Log authentication success to auth_logs
    logAuth({
      userId: result.user.id,
      username: result.user.username,
      action: 'login_success',
      ipAddress,
      userAgent,
      status: 'success',
    });

    // 2. Record active session to user_sessions
    await db.insert(userSessions).values({
      id: uuidv4(),
      userId: result.user.id,
      token: result.token,
      ipAddress,
      userAgent,
      isActive: 1,
      loggedInAt: now,
      lastActiveAt: now,
      loggedOutAt: null,
    });

    // 3. Log activity to enterprise activity_logs
    logActivity({
      userId: result.user.id,
      username: result.user.fullName || result.user.username,
      role: result.user.role,
      entityType: 'auth',
      entityId: result.user.id,
      action: 'login',
      description: `User "${result.user.fullName || result.user.username}" (${result.user.role}) logged in successfully`,
      ipAddress,
    });

    res.json(result);
  } catch (err: any) {
    // Log authentication failure to auth_logs
    logAuth({
      userId: null,
      username: requestedIdentifier || 'anonymous',
      action: 'login_failed',
      ipAddress,
      userAgent,
      status: 'failed',
      failureReason: err.message || 'Invalid credentials',
    });

    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
    } else {
      res.status(401).json({ error: err.message || 'Login failed' });
    }
  }
});

router.post('/logout', async (req, res) => {
  const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown Client';
  const authHeader = req.headers.authorization;
  const now = new Date().toISOString();

  let token = '';
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  }

  const userId = (req as any).userId || req.body?.userId;
  const username = req.body?.username || 'Authenticated User';

  try {
    if (token) {
      await db
        .update(userSessions)
        .set({ isActive: 0, loggedOutAt: now })
        .where(eq(userSessions.token, token));
    } else if (userId) {
      await db
        .update(userSessions)
        .set({ isActive: 0, loggedOutAt: now })
        .where(and(eq(userSessions.userId, userId), eq(userSessions.isActive, 1)));
    }

    logAuth({
      userId: userId || null,
      username,
      action: 'logout',
      ipAddress,
      userAgent,
      status: 'success',
    });

    logActivity({
      userId: userId || null,
      username,
      role: req.body?.role || 'user',
      entityType: 'auth',
      entityId: userId || null,
      action: 'logout',
      description: `User "${username}" signed out from session`,
      ipAddress,
    });

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Logout failed' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const allUsers = await authService.listAllUsers();
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get user' });
  }
});

// ── User Management (Manager / Admin RBAC) ──

// List all system users
router.get('/users', async (req, res) => {
  try {
    const users = await authService.listAllUsers();
    res.json({ users });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve users' });
  }
});

// Create new user for a specific role
const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().optional(),
  role: z.enum(['admin', 'manager', 'salesman']),
  phone: z.string().optional(),
  branch: z.string().optional(),
});

router.post('/users', async (req, res) => {
  try {
    const data = createUserSchema.parse(req.body);
    const user = await authService.createUserWithRole(data);

    logActivity({
      userId: user.id,
      username: req.body.operatorName || 'Manager',
      role: req.body.operatorRole || 'manager',
      entityType: 'auth',
      entityId: user.id,
      action: 'create',
      description: `Created new user account "${user.username}" with role "${user.role}"`,
      ipAddress: req.ip,
    });

    res.status(201).json({ user, message: 'User created successfully' });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
    } else if (err.message?.includes('UNIQUE constraint failed')) {
      res.status(409).json({ error: 'Username or email already exists in system' });
    } else {
      res.status(500).json({ error: err.message || 'Failed to create user' });
    }
  }
});

// Update user details
const updateUserSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'manager', 'salesman']).optional(),
  status: z.enum(['active', 'suspended', 'inactive']).optional(),
  phone: z.string().optional(),
  branch: z.string().optional(),
});

router.patch('/users/:id', async (req, res) => {
  try {
    const data = updateUserSchema.parse(req.body);
    const user = await authService.updateUser(req.params.id, data);

    logActivity({
      userId: user.id,
      username: req.body.operatorName || 'Manager',
      role: req.body.operatorRole || 'manager',
      entityType: 'auth',
      entityId: user.id,
      action: 'update',
      description: `Updated profile & role for user "${user.username}" (${user.role})`,
      ipAddress: req.ip,
    });

    res.json({ user, message: 'User updated successfully' });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
    } else {
      res.status(500).json({ error: err.message || 'Failed to update user' });
    }
  }
});

// Reset user password
const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters long'),
});

router.post('/users/:id/reset-password', async (req, res) => {
  try {
    const { newPassword } = resetPasswordSchema.parse(req.body);
    await authService.resetUserPassword(req.params.id, newPassword);

    logActivity({
      userId: req.params.id,
      username: req.body.operatorName || 'Manager',
      role: req.body.operatorRole || 'manager',
      entityType: 'auth',
      entityId: req.params.id,
      action: 'update',
      description: `Password reset successfully for user ID ${req.params.id}`,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Password has been securely reset' });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
    } else {
      res.status(500).json({ error: err.message || 'Failed to reset password' });
    }
  }
});

export default router;
