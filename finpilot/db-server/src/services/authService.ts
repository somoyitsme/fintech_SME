import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/client.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'finpilot-secret-key-change-in-production';
const SALT_ROUNDS = 10;

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string | null;
  role: string;
}

export async function registerUser(username: string, email: string, password: string, fullName?: string): Promise<{ user: User; token: string }> {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const id = uuidv4();

  const now = new Date().toISOString();
  await db.insert(users).values({
    id,
    username,
    email,
    passwordHash,
    fullName: fullName || null,
    role: 'admin',
    createdAt: now,
    updatedAt: now,
  });

  const user: User = { id, username, email, fullName: fullName || null, role: 'admin' };
  const token = jwt.sign({ userId: id, username, email }, JWT_SECRET, { expiresIn: '7d' });

  return { user, token };
}

export async function loginUser(username: string, password: string): Promise<{ user: User; token: string }> {
  const [userRecord] = await db.select().from(users).where(eq(users.username, username)).limit(1);

  if (!userRecord) {
    throw new Error('Invalid username or password');
  }

  const valid = await bcrypt.compare(password, userRecord.passwordHash);
  if (!valid) {
    throw new Error('Invalid username or password');
  }

  const user: User = {
    id: userRecord.id,
    username: userRecord.username,
    email: userRecord.email,
    fullName: userRecord.fullName,
    role: userRecord.role,
  };

  const token = jwt.sign({ userId: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

  return { user, token };
}

export function verifyToken(token: string): { userId: string; username: string; email: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string; email: string };
    return decoded;
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
}

export async function getUserById(id: string): Promise<User | null> {
  const [userRecord] = await db.select().from(users).where(eq(users.id, id)).limit(1);

  if (!userRecord) return null;

  return {
    id: userRecord.id,
    username: userRecord.username,
    email: userRecord.email,
    fullName: userRecord.fullName,
    role: userRecord.role,
  };
}
