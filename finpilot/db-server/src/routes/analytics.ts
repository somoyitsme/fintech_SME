import { Router } from 'express';
import { db } from '../db/client.js';
import { orders, products, expenses, orderItems } from '../db/schema.js';
import { sql, desc, gte } from 'drizzle-orm';

const router = Router();

router.get('/dashboard', async (req, res) => {
  try {
    // Total revenue (sum of all paid orders)
    const revenueResult = await db.select({
      total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`
    }).from(orders).where(sql`${orders.paymentStatus} IN ('Paid', 'Partial')`);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Order counts
    const orderCountResult = await db.select({
      total: sql<number>`COUNT(*)`
    }).from(orders);
    const totalOrders = orderCountResult[0]?.total || 0;

    const pendingOrdersResult = await db.select({
      total: sql<number>`COUNT(*)`
    }).from(orders).where(sql`${orders.status} = 'Processing'`);
    const pendingOrders = pendingOrdersResult[0]?.total || 0;

    // Product count
    const productCountResult = await db.select({
      total: sql<number>`COUNT(*)`
    }).from(products);
    const totalProducts = productCountResult[0]?.total || 0;

    // Low stock products
    const lowStockProducts = await db.select().from(products)
      .where(sql`${products.stockCount} < ${products.minThreshold}`)
      .limit(10);

    // Recent orders
    const recentOrders = await db.select().from(orders)
      .orderBy(desc(orders.orderDate))
      .limit(10);

    // Total expenses
    const expensesResult = await db.select({
      total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`
    }).from(expenses).where(sql`${expenses.status} = 'Approved'`);
    const totalExpenses = expensesResult[0]?.total || 0;

    // Top selling products (by quantity)
    const topProducts = await db.select({
      productId: orderItems.productId,
      name: orderItems.name,
      totalQuantity: sql<number>`SUM(${orderItems.quantity})`,
      totalRevenue: sql<number>`SUM(${orderItems.total})`
    })
    .from(orderItems)
    .groupBy(orderItems.productId, orderItems.name)
    .orderBy(desc(sql`SUM(${orderItems.quantity})`))
    .limit(5);

    res.json({
      revenue: {
        total: totalRevenue,
        expenses: totalExpenses,
        profit: totalRevenue - totalExpenses,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
      },
      products: {
        total: totalProducts,
        lowStock: lowStockProducts.length,
      },
      lowStockProducts,
      recentOrders,
      topProducts,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch analytics' });
  }
});

router.get('/sales-trend', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(days));
    const dateStr = daysAgo.toISOString().split('T')[0];

    const trend = await db.select({
      date: orders.orderDate,
      revenue: sql<number>`SUM(${orders.totalAmount})`,
      orderCount: sql<number>`COUNT(*)`
    })
    .from(orders)
    .where(gte(orders.orderDate, dateStr))
    .groupBy(orders.orderDate)
    .orderBy(orders.orderDate);

    res.json(trend);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch sales trend' });
  }
});

router.get('/inventory-value', async (req, res) => {
  try {
    const result = await db.select({
      totalValue: sql<number>`SUM(${products.stockCount} * ${products.costPrice})`,
      totalRetailValue: sql<number>`SUM(${products.stockCount} * ${products.retailPrice})`
    }).from(products);

    res.json(result[0] || { totalValue: 0, totalRetailValue: 0 });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch inventory value' });
  }
});

router.get('/expenses-breakdown', async (req, res) => {
  try {
    const breakdown = await db.select({
      category: expenses.category,
      total: sql<number>`SUM(${expenses.amount})`
    })
    .from(expenses)
    .where(sql`${expenses.status} = 'Approved'`)
    .groupBy(expenses.category)
    .orderBy(desc(sql`SUM(${expenses.amount})`));

    res.json(breakdown);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch expenses breakdown' });
  }
});

router.get('/revenue-by-category', async (req, res) => {
  try {
    const categoryRevenue = await db.select({
      category: products.category,
      revenue: sql<number>`SUM(${orderItems.total})`
    })
    .from(orderItems)
    .innerJoin(products, sql`${orderItems.productId} = ${products.id}`)
    .groupBy(products.category)
    .orderBy(desc(sql`SUM(${orderItems.total})`));

    res.json(categoryRevenue);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch revenue by category' });
  }
});

export default router;
