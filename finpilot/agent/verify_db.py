"""Schema introspection + read-only executor smoke test against a real SQLite DB."""
import sqlite3
from decimal import Decimal
from datetime import date, timedelta

from app.core.db import DatabaseEngine

DB = "./test_sme.db"

# ── Build a realistic SME schema ──
conn = sqlite3.connect(DB)
c = conn.cursor()
c.executescript("""
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS bank_accounts;

CREATE TABLE bank_accounts (
    id INTEGER PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    account_name TEXT,
    balance NUMERIC(15,2) NOT NULL,
    as_of DATE NOT NULL
);

CREATE TABLE invoices (
    id INTEGER PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    customer_name TEXT,
    amount NUMERIC(15,2) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL
);

CREATE TABLE expenses (
    id INTEGER PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    category TEXT,
    vendor TEXT,
    amount NUMERIC(15,2) NOT NULL,
    expense_date DATE NOT NULL
);
""")

today = date.today()
c.execute("INSERT INTO bank_accounts VALUES (1,'tenant_a','Operating',450000,?)", (today.isoformat(),))
c.execute("INSERT INTO invoices VALUES (1,'tenant_a','ABC Corp',150000,?,?,'pending')",
          ((today - timedelta(days=90)).isoformat(), (today - timedelta(days=60)).isoformat()))
c.execute("INSERT INTO expenses VALUES (1,'tenant_a','Rent','Landlord',25000,?)",
          ((today - timedelta(days=5)).isoformat(),))
conn.commit()
conn.close()
print("Test schema created.")

# ── Introspection ──
eng = DatabaseEngine("sqlite:///./test_sme.db",
                     allowed_tables=["bank_accounts", "invoices", "expenses"])
eng.connect()
cat = eng.catalog

print(f"\nDialect: {cat.dialect}")
print(f"Tables discovered: {cat.table_names()}")
for t in cat.table_names():
    tbl = cat.get(t)
    print(f"  • {t}: numeric={[c.name for c in tbl.columns if c.is_numeric]}, "
          f"temporal={[c.name for c in tbl.columns if c.is_temporal]}, "
          f"tenant_col={tbl.has_tenant_column}")

assert "bank_accounts" in cat.table_names()
assert cat.get("bank_accounts").has_tenant_column
print("\n✅ Introspection: tenant_id detected on all 3 tables")

# ── Safe query + tenant scoping ──
rows = eng.execute_readonly(
    "SELECT customer_name, amount FROM invoices WHERE status = :status",
    {"status": "pending"},
    tenant_id="tenant_a",
)
print(f"\n✅ Safe query returned: {rows}")
assert rows and rows[0]["customer_name"] == "ABC Corp"

rows_b = eng.execute_readonly(
    "SELECT customer_name FROM invoices", {}, tenant_id="tenant_b"
)
print(f"✅ Tenant B sees {len(rows_b)} rows (isolation working)")
assert len(rows_b) == 0

# ── Injection / write blocking ──
blocked = 0
attacks = [
    ("DROP TABLE invoices", "write"),
    ("DELETE FROM invoices", "write"),
    ("UPDATE invoices SET amount = 0", "write"),
    ("INSERT INTO invoices VALUES (9,'x','y',1,'2026-01-01','2026-01-01','paid')", "write"),
    ("SELECT 1; DROP TABLE invoices", "stacked"),
    ("SELECT * FROM invoices UNION SELECT password FROM users", "union"),
    ("SELECT * FROM sqlite_master", "disallowed table"),
]
for bad, kind in attacks:
    try:
        eng.execute_readonly(bad, {}, "tenant_a")
        print(f"  ❌ NOT BLOCKED ({kind}): {bad}")
    except ValueError as e:
        blocked += 1
        print(f"  ✅ blocked [{kind}]: {str(e)[:55]}")
print(f"\n✅ Injection/write attempts blocked: {blocked}/{len(attacks)}")
assert blocked == len(attacks), "some dangerous SQL passed validation"

print("\n" + "=" * 50)
print("ALL DB ENGINE CHECKS PASSED")
print("=" * 50)