import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db, sqlite } from '../db/client.js';
import { orders, orderItems, products, customers } from '../db/schema.js';
import { eq, inArray, sql, or } from 'drizzle-orm';
import { logActivity, recordStockMovement, createNotification } from '../services/auditService.js';

const router = Router();

const orderItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  sku: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().min(0),
  costPrice: z.number().min(0).optional(),
  profit: z.number().optional(),
  total: z.number().min(0),
});

const orderSchema = z.object({
  orderNumber: z.string().default(() => `ORD-DS-${Date.now()}`),
  orderType: z.enum(['online', 'offline']).default('offline'),
  customerName: z.string().min(1),
  customerId: z.string().optional(),
  contactNumber: z.string().default(''),
  deliveryAddress: z.string().default(''),
  itemsSummary: z.string().default(''),
  subtotal: z.number().min(0),
  discountAmount: z.number().min(0).default(0),
  discountPercent: z.number().min(0).default(0),
  vatAmount: z.number().min(0).default(0),
  totalAmount: z.number().min(0),
  paidAmount: z.number().min(0).optional(),
  dueAmount: z.number().min(0).optional(),
  branch: z.string().default('Banani Central Vault & Warehouse'),
  paymentMethod: z.enum(['cash', 'bkash', 'bank_transfer', 'credit_30d', 'due']).default('cash'),
  paymentStatus: z.enum(['Paid', 'Credit 30D', 'Partial', 'COD Pending', 'Due', 'Partial Due']).default('Paid'),
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
  orderDate: z.string().optional(),
  salesman: z.string().default(''),
  items: z.array(orderItemSchema).min(1),
});

router.get('/', async (req, res) => {
  try {
    const allOrders = await db.select().from(orders).orderBy(sql`${orders.orderDate} DESC, ${orders.createdAt} DESC`);
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

    // Fetch customer details map for fast lookup
    const allCustomers = await db.select().from(customers);
    const customerMapByName = new Map<string, typeof allCustomers[0]>();
    const customerMapById = new Map<string, typeof allCustomers[0]>();
    allCustomers.forEach(c => {
      customerMapById.set(c.id, c);
      customerMapByName.set(c.name.trim().toLowerCase(), c);
      if (c.contactNumber) {
        customerMapByName.set(c.contactNumber.trim(), c);
      }
    });

    const result = allOrders.map(order => {
      const cust = (order.customerId && customerMapById.get(order.customerId)) ||
                   customerMapByName.get(order.customerName.trim().toLowerCase()) ||
                   (order.contactNumber && customerMapByName.get(order.contactNumber.trim())) ||
                   null;

      return {
        ...order,
        items: itemsByOrder.get(order.id) || [],
        customerDetails: cust ? {
          id: cust.id,
          name: cust.name,
          contactNumber: cust.contactNumber,
          email: cust.email || '',
          deliveryAddress: cust.deliveryAddress,
          customerType: cust.customerType,
          binNumber: cust.binNumber || '',
          totalPurchases: cust.totalPurchases || 0,
          totalDue: cust.totalDue || 0,
        } : {
          id: 'walk-in',
          name: order.customerName,
          contactNumber: order.contactNumber,
          email: '',
          deliveryAddress: order.deliveryAddress,
          customerType: 'Retail',
          binNumber: '',
          totalPurchases: order.totalAmount,
          totalDue: order.dueAmount || 0,
        },
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
      };
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch orders' });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = orderSchema.parse(req.body);
    const id = uuidv4();
    const now = new Date();
    const nowIso = now.toISOString();
    // Use ISO timestamp for seamless mathematical & alphabetical chronological ordering
    const orderDateFormatted = data.orderDate || nowIso.replace('T', ' ').substring(0, 19);

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

    // Determine paid and due amounts
    let paidAmount = 0;
    let dueAmount = 0;
    let paymentStatus = data.paymentStatus;

    if (data.paymentMethod === 'due') {
      paidAmount = data.paidAmount !== undefined ? data.paidAmount : 0;
      dueAmount = data.dueAmount !== undefined ? data.dueAmount : Math.max(0, data.totalAmount - paidAmount);
      paymentStatus = paidAmount > 0 ? 'Partial Due' : 'Due';
    } else if (data.paymentMethod === 'credit_30d') {
      paidAmount = 0;
      dueAmount = data.totalAmount;
      paymentStatus = 'Credit 30D';
    } else {
      paidAmount = data.paidAmount !== undefined ? data.paidAmount : data.totalAmount;
      dueAmount = Math.max(0, data.totalAmount - paidAmount);
      if (dueAmount > 0) {
        paymentStatus = paidAmount > 0 ? 'Partial' : 'Due';
      }
    }

    // Calculate item cost prices and profits
    let orderGrossProfit = 0;
    const itemRecords = data.items.map(item => {
      const prod = stockProducts.find(p => p.id === item.productId);
      const unitCost = prod ? prod.costPrice : 0;
      const itemProfit = (item.unitPrice - unitCost) * item.quantity;
      orderGrossProfit += itemProfit;

      return {
        id: uuidv4(),
        orderId: id,
        productId: item.productId,
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        costPrice: unitCost,
        profit: itemProfit,
        total: item.total,
      };
    });

    const netOrderProfit = Math.max(0, orderGrossProfit - data.discountAmount);

    // Update customer records and total_due
    let customerRecord = null;
    const existingCustomers = await db.select().from(customers)
      .where(or(
        eq(customers.name, data.customerName),
        data.contactNumber ? eq(customers.contactNumber, data.contactNumber) : undefined
      ));

    if (existingCustomers.length > 0) {
      customerRecord = existingCustomers[0];
      const newTotalDue = (customerRecord.totalDue || 0) + dueAmount;
      const newTotalPurchases = (customerRecord.totalPurchases || 0) + data.totalAmount;

      await db.update(customers)
        .set({
          totalDue: newTotalDue,
          totalPurchases: newTotalPurchases,
          updatedAt: nowIso
        })
        .where(eq(customers.id, customerRecord.id));
    } else if (data.customerName && data.customerName !== 'Regular Walk-in Customer') {
      const newCustId = uuidv4();
      await db.insert(customers).values({
        id: newCustId,
        name: data.customerName,
        contactNumber: data.contactNumber,
        deliveryAddress: data.deliveryAddress,
        customerType: 'Retail',
        totalPurchases: data.totalAmount,
        totalDue: dueAmount,
        createdAt: nowIso,
        updatedAt: nowIso
      });
      const [createdCust] = await db.select().from(customers).where(eq(customers.id, newCustId));
      customerRecord = createdCust;
    }

    // Insert order
    await db.insert(orders).values({
      id,
      orderNumber: data.orderNumber,
      orderType: data.orderType,
      customerName: data.customerName,
      customerId: customerRecord ? customerRecord.id : null,
      contactNumber: data.contactNumber,
      deliveryAddress: data.deliveryAddress,
      itemsSummary: data.itemsSummary,
      subtotal: data.subtotal,
      discountAmount: data.discountAmount,
      discountPercent: data.discountPercent,
      vatAmount: data.vatAmount,
      totalAmount: data.totalAmount,
      paidAmount,
      dueAmount,
      profit: netOrderProfit,
      branch: data.branch,
      paymentMethod: data.paymentMethod,
      paymentStatus,
      status: data.status,
      courierProvider: data.courier?.provider || null,
      courierConsignmentId: data.courier?.consignmentId || null,
      courierTrackingUrl: data.courier?.trackingUrl || null,
      courierStatus: data.courier?.status || null,
      courierCodAmount: data.courier?.codAmount || null,
      courierDeliveryFee: data.courier?.deliveryFee || null,
      courierRecipientCity: data.courier?.recipientCity || null,
      courierDispatchedAt: data.courier?.dispatchedAt || null,
      orderDate: orderDateFormatted,
      salesman: data.salesman,
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    // Insert order items
    await db.insert(orderItems).values(itemRecords);

    // Decrement stock & record in stock_ledger
    for (const item of data.items) {
      const prod = stockProducts.find(p => p.id === item.productId);
      const prevStock = prod ? prod.stockCount : 0;
      const newStock = Math.max(0, prevStock - item.quantity);

      await db.update(products)
        .set({
          stockCount: newStock,
          updatedAt: nowIso,
        })
        .where(eq(products.id, item.productId));

      recordStockMovement({
        productId: item.productId,
        productName: item.name,
        referenceType: 'sale',
        referenceId: data.orderNumber,
        quantityChange: -item.quantity,
        previousStock: prevStock,
        newStock,
        unitCost: prod ? prod.costPrice : 0,
        notes: `Sold via ${data.orderType} order ${data.orderNumber} to ${data.customerName} (Branch: ${data.branch})`,
        createdBy: data.salesman || 'Sales Staff',
      });
    }

    // Generate notification for new order
    createNotification({
      title: `New Sale: ${data.orderNumber}`,
      message: `Sale for ${data.customerName} totaling ৳ ${data.totalAmount.toLocaleString()} recorded via ${data.paymentMethod.toUpperCase()}${dueAmount > 0 ? ` (Due: ৳ ${dueAmount.toLocaleString()})` : ''} at ${data.branch}. Profit: +৳ ${netOrderProfit.toLocaleString()}`,
      type: 'order',
      link: 'sell-all',
      actionUrl: `sell-pos`,
      metadata: { orderId: id, totalAmount: data.totalAmount, dueAmount, profit: netOrderProfit },
    });

    // Log enterprise activity
    logActivity({
      userId: (req as any).userId,
      username: data.salesman || 'Sales Staff',
      role: 'salesman',
      entityType: 'order',
      entityId: id,
      action: 'create',
      description: `Created ${data.orderType} order ${data.orderNumber} for "${data.customerName}" (৳ ${data.totalAmount.toLocaleString()}, Due: ৳ ${dueAmount.toLocaleString()}, Profit: ৳ ${netOrderProfit.toLocaleString()})`,
      changes: { totalAmount: data.totalAmount, itemsCount: data.items.length, dueAmount, profit: netOrderProfit },
      ipAddress: req.ip,
    });

    const [created] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    const createdItems = await db.select().from(orderItems).where(eq(orderItems.orderId, id));

    res.status(201).json({
      ...created,
      items: createdItems,
      customerDetails: customerRecord,
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

// Real Courier Dispatch Endpoint
router.patch('/:id/courier', async (req, res) => {
  try {
    const courierSchema = z.object({
      provider: z.enum(['Pathao', 'Steadfast', 'RedX']),
      consignmentId: z.string().min(1),
      trackingUrl: z.string(),
      status: z.enum(['Awaiting Rider Pickup', 'In Transit', 'Out for Delivery', 'Delivered']).default('In Transit'),
      codAmount: z.number().min(0).default(0),
      deliveryFee: z.number().min(0).default(0),
      recipientCity: z.string().default('Dhaka Metro'),
    });

    const courierData = courierSchema.parse(req.body);
    const nowIso = new Date().toISOString();

    const [order] = await db.select().from(orders).where(eq(orders.id, req.params.id)).limit(1);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await db.update(orders)
      .set({
        status: 'In Transit',
        courierProvider: courierData.provider,
        courierConsignmentId: courierData.consignmentId,
        courierTrackingUrl: courierData.trackingUrl,
        courierStatus: courierData.status,
        courierCodAmount: courierData.codAmount,
        courierDeliveryFee: courierData.deliveryFee,
        courierRecipientCity: courierData.recipientCity,
        courierDispatchedAt: nowIso,
        updatedAt: nowIso,
      })
      .where(eq(orders.id, req.params.id));

    createNotification({
      title: `Courier Dispatched: ${order.orderNumber}`,
      message: `Order forwarded to ${courierData.provider} Courier! Consignment ID: ${courierData.consignmentId} (COD: ৳ ${courierData.codAmount.toLocaleString()})`,
      type: 'order',
      link: 'sell-all',
      actionUrl: `sell-all`,
      metadata: { orderId: order.id, consignmentId: courierData.consignmentId },
    });

    logActivity({
      userId: (req as any).userId,
      username: 'Courier Gateway',
      role: 'logistics',
      entityType: 'order',
      entityId: order.id,
      action: 'dispatch',
      description: `Dispatched order ${order.orderNumber} via ${courierData.provider} Courier. Consignment: ${courierData.consignmentId}`,
      changes: courierData,
      ipAddress: req.ip,
    });

    const [updated] = await db.select().from(orders).where(eq(orders.id, req.params.id)).limit(1);
    res.json(updated);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
    } else {
      res.status(500).json({ error: err.message || 'Failed to dispatch with courier' });
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
    const { paymentStatus, paidAmount, dueAmount } = z.object({
      paymentStatus: z.enum(['Paid', 'Credit 30D', 'Partial', 'COD Pending', 'Due', 'Partial Due']),
      paidAmount: z.number().optional(),
      dueAmount: z.number().optional()
    }).parse(req.body);

    const now = new Date().toISOString();
    const updateData: any = { paymentStatus, updatedAt: now };
    if (paidAmount !== undefined) updateData.paidAmount = paidAmount;
    if (dueAmount !== undefined) updateData.dueAmount = dueAmount;

    await db.update(orders)
      .set(updateData)
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
