import { Router } from 'express';
import { z } from 'zod';
import * as authService from '../services/authService.js';

const router = Router();

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().optional(),
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await authService.registerUser(data.username, data.email, data.password, data.fullName);
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
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.loginUser(data.username, data.password);
    res.json(result);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
    } else {
      res.status(401).json({ error: err.message || 'Login failed' });
    }
  }
});

router.get('/me', async (req, res) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await authService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get user' });
  }
});

export default router;
