import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/client.js';
import { orders, orderItems, products } from '../db/schema.js';
import { eq, inArray, sql } from 'drizzle-orm';

const router = Router();

const orderItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  sku: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().min(0),
  total: z.number().min(0),
});

const orderSchema = z.object({
  orderNumber: z.string().default(() => `ORD-DS-${Date.now()}`),
  orderType: z.enum(['online', 'offline']).default('offline'),
  customerName: z.string().min(1),
  contactNumber: z.string().default(''),
  deliveryAddress: z.string().default(''),
  itemsSummary: z.string().default(''),
  subtotal: z.number().min(0),
  discountAmount: z.number().min(0).default(0),
  discountPercent: z.number().min(0).default(0),
  vatAmount: z.number().min(0).default(0),
  totalAmount: z.number().min(0),
  paymentMethod: z.enum(['cash', 'bkash', 'bank_transfer', 'credit_30d']).default('cash'),
  paymentStatus: z.enum(['Paid', 'Credit 30D', 'Partial', 'COD Pending']).default('Paid'),
  status: z.enum(['Processing', 'Ready for Dispatch', 'In Transit', 'Delivered', 'Counter Collected']).default('Processing'),
  courier: z.object({
    provider: z.enum(['Pathao', 'Steadfast', 'RedX']),
    consignmentId: z.string(),
    trackingUrl: z.string(),
    status: z.enum(['Awaiting Rider Pickup', 'In Transit', 'Out for Delivery', 'Delivered']),
    codAmount: z.number(),
    deliveryFee: z.number(),
    recipientCity: z.string(),
    dispatchedAt: z.string(),
  }).nullable().optional(),
  orderDate: z.string().default(() => new Date().toISOString().split('T')[0]),
  salesman: z.string().default(''),
  items: z.array(orderItemSchema).min(1),
});

router.get('/', async (req, res) => {
  try {
    const allOrders = await db.select().from(orders).orderBy(sql`${orders.orderDate} DESC`);
    const orderIds = allOrders.map(o => o.id);
    const allItems = orderIds.length > 0
      ? await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds))
      : [];

    const itemsByOrder = new Map<string, typeof allItems>();
    allItems.forEach(item => {
      const list = itemsByOrder.get(item.orderId) || [];
      list.push(item);
      itemsByOrder.set(item.orderId, list);
    });

    const result = allOrders.map(order => ({
      ...order,
      items: itemsByOrder.get(order.id) || [],
      courier: order.courierProvider ? {
        provider: order.courierProvider,
        consignmentId: order.courierConsignmentId,
        trackingUrl: order.courierTrackingUrl,
        status: order.courierStatus,
        codAmount: order.courierCodAmount,
        deliveryFee: order.courierDeliveryFee,
        recipientCity: order.courierRecipientCity,
        dispatchedAt: order.courierDispatchedAt,
      } : null,
    }));

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch orders' });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = orderSchema.parse(req.body);
    const id = uuidv4();
    const now = new Date().toISOString();

    // Validate stock availability
    const productIds = data.items.map(i => i.productId);
    const stockProducts = await db.select().from(products).where(inArray(products.id, productIds));

    for (const item of data.items) {
      const product = stockProducts.find(p => p.id === item.productId);
      if (!product) {
        return res.status(400).json({ error: `Product ${item.name} not found` });
      }
      if (product.stockCount < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}. Available: ${product.stockCount}, Requested: ${item.quantity}` });
      }
    }

    // Insert order
    await db.insert(orders).values({
      id,
      orderNumber: data.orderNumber,
      orderType: data.orderType,
      customerName: data.customerName,
      contactNumber: data.contactNumber,
      deliveryAddress: data.deliveryAddress,
      itemsSummary: data.itemsSummary,
      subtotal: data.subtotal,
      discountAmount: data.discountAmount,
      discountPercent: data.discountPercent,
      vatAmount: data.vatAmount,
      totalAmount: data.totalAmount,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus,
      status: data.status,
      courierProvider: data.courier?.provider || null,
      courierConsignmentId: data.courier?.consignmentId || null,
      courierTrackingUrl: data.courier?.trackingUrl || null,
      courierStatus: data.courier?.status || null,
      courierCodAmount: data.courier?.codAmount || null,
      courierDeliveryFee: data.courier?.deliveryFee || null,
      courierRecipientCity: data.courier?.recipientCity || null,
      courierDispatchedAt: data.courier?.dispatchedAt || null,
      orderDate: data.orderDate,
      salesman: data.salesman,
      createdAt: now,
      updatedAt: now,
    });

    // Insert order items
    const itemRecords = data.items.map(item => ({
      id: uuidv4(),
      orderId: id,
      productId: item.productId,
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
    }));
    await db.insert(orderItems).values(itemRecords);

    // Decrement stock
    for (const item of data.items) {
      await db.update(products)
        .set({
          stockCount: sql`${products.stockCount} - ${item.quantity}`,
          updatedAt: now,
        })
        .where(eq(products.id, item.productId));
    }

    const [created] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    const createdItems = await db.select().from(orderItems).where(eq(orderItems.orderId, id));

    res.status(201).json({
      ...created,
      items: createdItems,
      courier: data.courier,
    });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
    } else if (err.message?.includes('UNIQUE constraint failed')) {
      res.status(409).json({ error: 'Order number already exists' });
    } else {
      res.status(500).json({ error: err.message || 'Failed to create order' });
    }
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = z.object({
      status: z.enum(['Processing', 'Ready for Dispatch', 'In Transit', 'Delivered', 'Counter Collected'])
    }).parse(req.body);

    const now = new Date().toISOString();
    await db.update(orders)
      .set({ status, updatedAt: now })
      .where(eq(orders.id, req.params.id));

    const [updated] = await db.select().from(orders).where(eq(orders.id, req.params.id)).limit(1);
    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(updated);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
    } else {
      res.status(500).json({ error: err.message || 'Failed to update order status' });
    }
  }
});

router.patch('/:id/payment', async (req, res) => {
  try {
    const { paymentStatus } = z.object({
      paymentStatus: z.enum(['Paid', 'Credit 30D', 'Partial', 'COD Pending'])
    }).parse(req.body);

    const now = new Date().toISOString();
    await db.update(orders)
      .set({ paymentStatus, updatedAt: now })
      .where(eq(orders.id, req.params.id));

    const [updated] = await db.select().from(orders).where(eq(orders.id, req.params.id)).limit(1);
    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(updated);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
    } else {
      res.status(500).json({ error: err.message || 'Failed to update payment status' });
    }
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.delete(orders).where(eq(orders.id, req.params.id));
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete order' });
  }
});

export default router;
