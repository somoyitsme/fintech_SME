import express from 'express';
import cors from 'cors';
import { initializeSchema } from './db/client.js';
import { seedIfEmpty } from './db/seed.js';
import { verifyToken } from './services/authService.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import customerRoutes from './routes/customers.js';
import orderRoutes from './routes/orders.js';
import supplierRoutes from './routes/suppliers.js';
import expenseRoutes from './routes/expenses.js';
import stockRoutes from './routes/stock.js';
import accountRoutes from './routes/accounts.js';
import analyticsRoutes from './routes/analytics.js';
import notificationsRoutes from './routes/notifications.js';
import logsRoutes from './routes/logs.js';
import settingsRoutes from './routes/settings.js';
import todosRoutes from './routes/todos.js';
import cashRegisterRoutes from './routes/cashRegister.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

import { setupNowOrNever } from './db/setupNowOrNever.js';

// Initialize full SQLite schema (all 20 tables & indices)
initializeSchema();
await seedIfEmpty();
await setupNowOrNever();

// Auth middleware - extract userId from JWT
app.use((req: any, _res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const decoded = verifyToken(authHeader.slice(7));
      req.userId = decoded.userId;
    } catch {
      // invalid token - continue without userId (auth routes handle it)
    }
  }
  next();
});

// Core Enterprise Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api', accountRoutes);
app.use('/api/analytics', analyticsRoutes);

// New Audit, Notification, Logs & Settings Routes
app.use('/api/notifications', notificationsRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/todos', todosRoutes);
app.use('/api/cash-register', cashRegisterRoutes);

// Health check with DB status
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    engine: 'sqlite3-wal',
    database: 'local_storage',
    timestamp: new Date().toISOString() 
  });
});

app.listen(PORT, () => {
  console.log(`✅ FinPilot DB server running on http://localhost:${PORT}`);
  console.log(`   Database: SQLite (WAL mode) in local storage`);
  console.log(`   Login: admin / admin123 | director / admin123 | salesman / sales123`);
});
