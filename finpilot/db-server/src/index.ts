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

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize database
initializeSchema();
await seedIfEmpty();

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api', accountRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ FinPilot DB server running on http://localhost:${PORT}`);
  console.log(`   Login: admin / admin123`);
});
