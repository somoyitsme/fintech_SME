import { db } from './client.js';
import { users, products, customers, suppliers, expenses, paymentAccounts, stockTransfers, stockAdjustments } from './schema.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export async function seedIfEmpty() {
  const existingUsers = await db.select().from(users).limit(1);
  if (existingUsers.length > 0) {
    console.log('✅ Database already seeded');
    return;
  }

  console.log('📦 Seeding database...');
  const now = new Date().toISOString();

  // Create admin user
  const adminHash = await bcrypt.hash('admin123', 10);
  await db.insert(users).values({
    id: uuidv4(),
    username: 'admin',
    email: 'admin@finpilot.local',
    passwordHash: adminHash,
    fullName: 'System Administrator',
    role: 'admin',
    createdAt: now,
    updatedAt: now,
  });

  // Create manager/owner user
  await db.insert(users).values({
    id: uuidv4(),
    username: 'director',
    email: 'director@dhakasilicon.com',
    passwordHash: adminHash,
    fullName: 'MD Nazmul Hasan',
    role: 'manager',
    createdAt: now,
    updatedAt: now,
  });

  // Create salesman user
  const salesHash = await bcrypt.hash('sales123', 10);
  await db.insert(users).values({
    id: uuidv4(),
    username: 'salesman',
    email: 'sales@dhakasilicon.com',
    passwordHash: salesHash,
    fullName: 'Tanvir Ahmed',
    role: 'salesman',
    createdAt: now,
    updatedAt: now,
  });

  // Seed products (first 20 from frontend demo data)
  const productsSeed = [
    { id: uuidv4(), name: "NVIDIA GeForce RTX 4070 Ti Super 16GB", sku: "GPU-RTX4070TI-16G", category: "Graphics Cards", brand: "Zotac Gaming", retailPrice: 118500, costPrice: 94000, stockCount: 38, unit: "Units", minThreshold: 15, location: "Banani Central Vault #B4", warranty: "3 Years Official", createdAt: now, updatedAt: now },
    { id: uuidv4(), name: "MSI GeForce RTX 4060 Ventus 2X 8GB", sku: "GPU-RTX4060-8G", category: "Graphics Cards", brand: "MSI", retailPrice: 38500, costPrice: 31500, stockCount: 74, unit: "Units", minThreshold: 20, location: "Showroom Shelf #G2", warranty: "3 Years", createdAt: now, updatedAt: now },
    { id: uuidv4(), name: "ASUS TUF RTX 4080 Super 16GB", sku: "GPU-RTX4080S-16G", category: "Graphics Cards", brand: "ASUS", retailPrice: 148000, costPrice: 122000, stockCount: 14, unit: "Units", minThreshold: 10, location: "Banani Vault #B1", warranty: "3 Years", createdAt: now, updatedAt: now },
    { id: uuidv4(), name: "Sapphire RX 7800 XT 16GB", sku: "GPU-RX7800XT-16G", category: "Graphics Cards", brand: "Sapphire", retailPrice: 68500, costPrice: 55000, stockCount: 22, unit: "Units", minThreshold: 12, location: "Multiplan Branch #M1", warranty: "2 Years", createdAt: now, updatedAt: now },
    { id: uuidv4(), name: "Intel Core i7-14700K", sku: "CPU-INTEL-14700K", category: "Processors", brand: "Intel", retailPrice: 48000, costPrice: 38500, stockCount: 28, unit: "Units", minThreshold: 20, location: "Banani Central Vault #A1", warranty: "3 Years", createdAt: now, updatedAt: now },
    { id: uuidv4(), name: "Intel Core i5-14400", sku: "CPU-INTEL-14400", category: "Processors", brand: "Intel", retailPrice: 24500, costPrice: 19500, stockCount: 52, unit: "Units", minThreshold: 25, location: "Banani Vault #A2", warranty: "3 Years", createdAt: now, updatedAt: now },
    { id: uuidv4(), name: "AMD Ryzen 9 7950X 16-Core", sku: "CPU-AMD-7950X", category: "Processors", brand: "AMD", retailPrice: 58000, costPrice: 47000, stockCount: 18, unit: "Units", minThreshold: 12, location: "Showroom Shelf #P1", warranty: "3 Years", createdAt: now, updatedAt: now },
    { id: uuidv4(), name: "ASUS ROG Strix Z790-E Gaming", sku: "MB-ASUS-Z790E", category: "Motherboards", brand: "ASUS", retailPrice: 62000, costPrice: 51000, stockCount: 16, unit: "Units", minThreshold: 10, location: "Banani Central Vault #M1", warranty: "3 Years", createdAt: now, updatedAt: now },
    { id: uuidv4(), name: "MSI MAG B650 Tomahawk WiFi", sku: "MB-MSI-B650", category: "Motherboards", brand: "MSI", retailPrice: 28500, costPrice: 22500, stockCount: 34, unit: "Units", minThreshold: 15, location: "Multiplan Branch #M2", warranty: "3 Years", createdAt: now, updatedAt: now },
    { id: uuidv4(), name: "G.Skill Trident Z5 RGB 32GB DDR5", sku: "RAM-GSKILL-DDR5-32G", category: "Memory", brand: "G.Skill", retailPrice: 18500, costPrice: 15000, stockCount: 48, unit: "Kits", minThreshold: 20, location: "Showroom Shelf #R1", warranty: "Lifetime", createdAt: now, updatedAt: now },
  ];
  await db.insert(products).values(productsSeed);

  // Seed customers
  const customersSeed = [
    { id: uuidv4(), name: "TechVenture Solutions Ltd.", contactNumber: "+880 1711-987654", deliveryAddress: "Gulshan-2, Dhaka-1212", customerType: "Corporate" as const, binNumber: "003456789012", totalPurchases: 485000, createdAt: now, updatedAt: now },
    { id: uuidv4(), name: "Rahim PC Gaming", contactNumber: "+880 1812-445566", deliveryAddress: "Dhanmondi 15, Dhaka-1209", customerType: "Wholesale" as const, totalPurchases: 285000, createdAt: now, updatedAt: now },
    { id: uuidv4(), name: "Sarah Ahmed", contactNumber: "+880 1521-778899", deliveryAddress: "Banani DOHS, Dhaka", customerType: "Retail" as const, totalPurchases: 62000, createdAt: now, updatedAt: now },
  ];
  await db.insert(customers).values(customersSeed);

  // Seed suppliers
  const suppliersSeed = [
    { id: uuidv4(), name: "ASUS Regional Distribution (Singapore)", contactPerson: "David Lin", phone: "+65 6741-2389", email: "apac.orders@asus.sg", address: "15 Changi Business Park Central 1, Singapore", country: "Singapore", category: "Motherboards & GPUs", totalPurchase: 4800000, totalDue: 0, createdAt: now, updatedAt: now },
    { id: uuidv4(), name: "Intel South Asia Authorized Distributor", contactPerson: "Rajiv Sharma", phone: "+880 1713-998877", email: "distributor.bd@intel.com", address: "Gulshan-2, Dhaka-1212", country: "Bangladesh", category: "Processors", totalPurchase: 4653000, totalDue: 0, createdAt: now, updatedAt: now },
    { id: uuidv4(), name: "Zotac Technology Limited (Hong Kong)", contactPerson: "Kenji Wong", phone: "+852 2795-8888", email: "b2b.asia@zotac.com", address: "Tower 2, Grand Central Plaza, Shatin, Hong Kong", country: "Hong Kong", category: "Graphics Cards", totalPurchase: 3760000, totalDue: 0, createdAt: now, updatedAt: now },
  ];
  await db.insert(suppliers).values(suppliersSeed);

  // Seed expenses
  const expensesSeed = [
    { id: uuidv4(), category: "Customs & Port Duty", amount: 295000, vendor: "Customs Authority BD", description: "Chittagong Port customs duty & AIT for GPU container", date: "2026-10-05", paymentMethod: "Corporate Bank Wire", status: "Approved" as const, createdAt: now, updatedAt: now },
    { id: uuidv4(), category: "Salaries & Payroll", amount: 195000, vendor: "Staff Bank Accounts", description: "Monthly sales staff base salary + incentive bonus", date: "2026-10-01", paymentMethod: "BEFTN Bank Transfer", status: "Approved" as const, createdAt: now, updatedAt: now },
    { id: uuidv4(), category: "Rent & Lease", amount: 95000, vendor: "Multiplan Management Ltd.", description: "Banani Central Vault & Multiplan Showroom lease", date: "2026-10-02", paymentMethod: "Corporate Bank Wire", status: "Approved" as const, createdAt: now, updatedAt: now },
    { id: uuidv4(), category: "Logistics & Couriers", amount: 48000, vendor: "Pathao / Steadfast Logistics", description: "E-commerce customer delivery fees & air express freight", date: "2026-10-10", paymentMethod: "bKash Merchant", status: "Approved" as const, createdAt: now, updatedAt: now },
  ];
  await db.insert(expenses).values(expensesSeed);

  // Seed payment accounts
  const accountsSeed = [
    { id: uuidv4(), accountName: "Banani Showroom POS Cash Drawer", accountType: "Cash Drawer" as const, accountNumber: "DRAWER-01", bankName: null, balance: 185400, createdAt: now, updatedAt: now },
    { id: uuidv4(), accountName: "The City Bank Limited (Corporate Current A/C)", accountType: "Bank Account" as const, accountNumber: "1102948192001", bankName: "The City Bank Ltd (Banani Branch)", balance: 1845000, createdAt: now, updatedAt: now },
    { id: uuidv4(), accountName: "bKash Merchant Gateway", accountType: "MFS (bKash/Nagad)" as const, accountNumber: "01711-234567", bankName: null, balance: 245000, createdAt: now, updatedAt: now },
  ];
  await db.insert(paymentAccounts).values(accountsSeed);

  // Seed stock transfers
  const transfersSeed = [
    { id: uuidv4(), transferNumber: "TR-2026-001", fromLocation: "Banani Central Vault #B4", toLocation: "Elephant Road Multiplan Branch", productId: productsSeed[0].id, productName: productsSeed[0].name, quantity: 6, transferDate: "2026-10-15", status: "Completed" as const, notes: "Restock retail display cabinet", createdAt: now, updatedAt: now },
    { id: uuidv4(), transferNumber: "TR-2026-002", fromLocation: "Banani Central Vault #A1", toLocation: "BCS Computer City IDB Branch", productId: productsSeed[4].id, productName: productsSeed[4].name, quantity: 10, transferDate: "2026-10-16", status: "Completed" as const, notes: "Inter-branch transfer", createdAt: now, updatedAt: now },
  ];
  await db.insert(stockTransfers).values(transfersSeed);

  // Seed stock adjustments
  const adjustmentsSeed = [
    { id: uuidv4(), adjustmentNumber: "ADJ-2026-001", location: "Banani Central Vault", productId: productsSeed[1].id, productName: productsSeed[1].name, adjustmentType: "Damaged" as const, quantity: 2, unitCost: 31500, totalValue: 63000, adjustmentDate: "2026-10-14", reason: "Outer chassis dented during transit", createdAt: now, updatedAt: now },
  ];
  await db.insert(stockAdjustments).values(adjustmentsSeed);

  console.log('✅ Database seeded successfully');
  console.log('   Login: admin / admin123');
}
