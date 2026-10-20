import bcrypt from 'bcrypt';
import { sqlite } from './client.js';

export async function setupNowOrNever() {
  try {
    const passwordHash = await bcrypt.hash('Somoy@2026', 10);
    const now = new Date().toISOString();

    // 1. Remove all old demo users and set Shahed Rahman Somoy as Manager & Admin
    sqlite.exec(`
      DELETE FROM user_sessions;
      DELETE FROM users WHERE username NOT IN ('somoy', 'manager');
    `);

    // Upsert Shahed Rahman Somoy (primary user: somoy)
    const somoyStmt = sqlite.prepare(`
      INSERT INTO users (id, username, email, password_hash, full_name, role, status, phone, branch, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(username) DO UPDATE SET
        full_name = excluded.full_name,
        email = excluded.email,
        password_hash = excluded.password_hash,
        role = excluded.role,
        status = 'active',
        phone = excluded.phone,
        branch = excluded.branch,
        updated_at = excluded.updated_at
    `);

    somoyStmt.run(
      'usr-somoy-001',
      'somoy',
      'somoy@nowornever.console',
      passwordHash,
      'Shahed Rahman Somoy',
      'manager',
      'active',
      '+880 1711-000000',
      'Now_or_Never Central Vault',
      now,
      now
    );

    // Upsert manager alias so login with identifier "manager" also works seamlessly
    somoyStmt.run(
      'usr-manager-alias',
      'manager',
      'manager@nowornever.console',
      passwordHash,
      'Shahed Rahman Somoy',
      'manager',
      'active',
      '+880 1711-000000',
      'Now_or_Never Central Vault',
      now,
      now
    );

    // 2. Add realistic demo payment accounts for develop database
    const accStmt = sqlite.prepare(`
      INSERT OR IGNORE INTO payment_accounts (id, account_name, account_type, account_number, bank_name, balance, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const demoAccounts = [
      { id: 'acc-1', name: 'Banani Showroom POS Cash Drawer', type: 'Cash Drawer', number: 'DRAWER-01', bank: null, balance: 185400 },
      { id: 'acc-2', name: 'The City Bank Limited (Corporate Current A/C)', type: 'Bank Account', number: '1102948192001', bank: 'The City Bank Ltd (Banani Branch)', balance: 1845000 },
      { id: 'acc-3', name: 'bKash Merchant Gateway', type: 'MFS (bKash/Nagad)', number: '01711-234567', bank: null, balance: 245000 },
      { id: 'acc-4', name: 'Brac Bank SME Operating A/C', type: 'Bank Account', number: '1501204928172001', bank: 'Brac Bank PLC', balance: 780000 },
      { id: 'acc-5', name: 'Eastern Bank PLC (Import LC Escrow A/C)', type: 'Bank Account', number: '1041060982341', bank: 'Eastern Bank Ltd (Principal Branch)', balance: 3250000 },
      { id: 'acc-6', name: 'Dutch-Bangla Bank (Wholesale Clearing & NexusPay)', type: 'Bank Account', number: '1171200389124', bank: 'Dutch-Bangla Bank Ltd', balance: 1420000 },
      { id: 'acc-7', name: 'Nagad Business Merchant Wallet', type: 'MFS (bKash/Nagad)', number: '01819-998877', bank: null, balance: 165000 },
      { id: 'acc-8', name: 'Prime Bank Ltd (Treasury Margin & Guarantee A/C)', type: 'Bank Account', number: '2109384712019', bank: 'Prime Bank Ltd', balance: 2100000 },
      { id: 'acc-9', name: 'Central Vault Petty Cash & RMA Reserve', type: 'Cash Drawer', number: 'PETTY-BANANI-02', bank: null, balance: 75000 },
    ];

    for (const a of demoAccounts) {
      accStmt.run(a.id, a.name, a.type, a.number, a.bank, a.balance, now, now);
    }

    // 3. Update business settings to Now_or_Never Console
    sqlite.exec(`
      INSERT INTO business_settings (id, key, value, category, description, updated_at)
      VALUES ('set-001', 'company_name', 'Now_or_Never Console', 'general', 'Official corporate business name', '${now}')
      ON CONFLICT(id) DO UPDATE SET value = 'Now_or_Never Console', updated_at = '${now}';

      INSERT INTO business_settings (id, key, value, category, description, updated_at)
      VALUES ('set-006', 'primary_branch', 'Now_or_Never Central Vault & Warehouse', 'general', 'Main headquarters location', '${now}')
      ON CONFLICT(id) DO UPDATE SET value = 'Now_or_Never Central Vault & Warehouse', updated_at = '${now}';
    `);

    // 4. Update staff table
    sqlite.exec(`
      DELETE FROM staff WHERE id != 'stf-001';
      INSERT INTO staff (id, name, role, email, phone, branch, department, hire_date, salary, status, created_at, updated_at)
      VALUES ('stf-001', 'Shahed Rahman Somoy', 'Managing Director & System Manager', 'somoy@nowornever.console', '+880 1711-000000', 'Now_or_Never Central Vault', 'Executive Management', '2021-01-01', 150000, 'Active', '${now}', '${now}')
      ON CONFLICT(id) DO UPDATE SET
        name = 'Shahed Rahman Somoy',
        role = 'Managing Director & System Manager',
        email = 'somoy@nowornever.console',
        phone = '+880 1711-000000',
        branch = 'Now_or_Never Central Vault',
        updated_at = '${now}';
    `);

    console.log('✅ Now_or_Never Console initialized: Shahed Rahman Somoy configured as Manager with Somoy@2026. Demo accounts ready.');
  } catch (err) {
    console.warn('setupNowOrNever error:', err);
  }
}
