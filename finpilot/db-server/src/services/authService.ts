import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/client.js';
import { users } from '../db/schema.js';
import { eq, or } from 'drizzle-orm';

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

export async function loginUser(identifier: string, password: string): Promise<{ user: User; token: string }> {
  const clean = identifier.trim().toLowerCase();
  const [userRecord] = await db
    .select()
    .from(users)
    .where(or(eq(users.username, clean), eq(users.email, clean)))
    .limit(1);

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

export async function listAllUsers(): Promise<Array<{
  id: string;
  username: string;
  email: string;
  fullName: string | null;
  role: string;
  status: string;
  phone: string;
  branch: string;
  createdAt: string;
  updatedAt: string;
}>> {
  const records = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
      status: users.status,
      phone: users.phone,
      branch: users.branch,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users);
  return records;
}

export async function createUserWithRole(data: {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  role?: string;
  phone?: string;
  branch?: string;
}) {
  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const id = `usr-${uuidv4().slice(0, 8)}`;
  const now = new Date().toISOString();
  const cleanUsername = data.username.trim().toLowerCase();
  const cleanEmail = data.email.trim().toLowerCase();
  const role = data.role || 'salesman';

  await db.insert(users).values({
    id,
    username: cleanUsername,
    email: cleanEmail,
    passwordHash,
    fullName: data.fullName || null,
    role,
    status: 'active',
    phone: data.phone || '',
    branch: data.branch || 'Banani Central Vault',
    createdAt: now,
    updatedAt: now,
  });

  return {
    id,
    username: cleanUsername,
    email: cleanEmail,
    fullName: data.fullName || null,
    role,
    status: 'active',
    phone: data.phone || '',
    branch: data.branch || 'Banani Central Vault',
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateUser(
  id: string,
  updates: {
    fullName?: string;
    email?: string;
    role?: string;
    status?: string;
    phone?: string;
    branch?: string;
  }
) {
  const now = new Date().toISOString();
  await db
    .update(users)
    .set({
      ...updates,
      updatedAt: now,
    })
    .where(eq(users.id, id));

  const [userRecord] = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
      status: users.status,
      phone: users.phone,
      branch: users.branch,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, id));

  if (!userRecord) {
    throw new Error('User not found');
  }

  return userRecord;
}

export async function resetUserPassword(id: string, newPassword: string): Promise<boolean> {
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  const now = new Date().toISOString();

  await db
    .update(users)
    .set({
      passwordHash,
      updatedAt: now,
    })
    .where(eq(users.id, id));

  return true;
}

