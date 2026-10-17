import sys
import os
from datetime import datetime, timedelta, timezone

# Add backend and agent paths
sys.path.insert(0, "/media/somoy/Backup/Documents/China/finpilot/backend")
sys.path.insert(0, "/media/somoy/Backup/Documents/China/finpilot-agent")

# Load generated data from seed_full_startech_data
from seed_full_startech_data import PRODUCTS, CUSTOMERS, GENERATED_ORDERS, ORDER_SCHEDULE

from app.db.database import SessionLocal as BackendSession, init_db as init_backend_db
from app.db.models import (
    Tenant as BackendTenant, User as BackendUser, ApiKey as BackendApiKey,
    Client as BackendClient, Invoice as BackendInvoice, InvoiceItem as BackendInvoiceItem,
    Expense as BackendExpense, Income as BackendIncome, CashFlowSnapshot as BackendCashSnapshot
)
from app.core.security import get_password_hash, hash_api_key

from agent_core.db.database import SessionLocal as AgentSession, Base as AgentBase, engine as agent_engine
from agent_core.db.models import (
    Tenant as AgentTenant, ApiKey as AgentApiKey,
    SyncedInvoice, SyncedExpense, SyncedClient, CashSnapshot as AgentCashSnapshot
)
from agent_core.security.auth import hash_api_key as agent_hash_api_key
from agent_core.engine.context.builder import TenantContextBuilder

def run_reseed():
    print("Initializing databases...")
    init_backend_db()
    AgentBase.metadata.create_all(bind=agent_engine)

    backend_db = BackendSession()
    agent_db = AgentSession()

    now = datetime.now(timezone.utc)

    # -------------------------------------------------------------
    # 1. SEED BACKEND (finpilot.db)
    # -------------------------------------------------------------
    print("\n--- SEEDING BACKEND DATABASE (finpilot.db) ---")
    b_tenant = backend_db.query(BackendTenant).filter_by(company_name="Dhaka Silicon & Hardware Ltd.").first()
    if b_tenant:
        print("Clearing existing Dhaka Silicon records in backend...")
        backend_db.query(BackendInvoiceItem).filter(BackendInvoiceItem.invoice_id.in_(
            backend_db.query(BackendInvoice.id).filter_by(tenant_id=b_tenant.id)
        )).delete(synchronize_session=False)
        backend_db.query(BackendIncome).filter_by(tenant_id=b_tenant.id).delete()
        backend_db.query(BackendInvoice).filter_by(tenant_id=b_tenant.id).delete()
        backend_db.query(BackendExpense).filter_by(tenant_id=b_tenant.id).delete()
        backend_db.query(BackendCashSnapshot).filter_by(tenant_id=b_tenant.id).delete()
        backend_db.query(BackendClient).filter_by(tenant_id=b_tenant.id).delete()
        backend_db.query(BackendApiKey).filter_by(tenant_id=b_tenant.id).delete()
        backend_db.query(BackendUser).filter_by(tenant_id=b_tenant.id).delete()
        backend_db.delete(b_tenant)
        backend_db.commit()

    b_tenant = BackendTenant(
        company_name="Dhaka Silicon & Hardware Ltd.",
        industry="Computer Hardware & Components Wholesale/Retail",
        country="BD",
        currency="BDT",
        tax_id="BIN-0029481729-01",
        annual_revenue=18500000.0,
        employee_count=14,
        risk_score=84.0
    )
    backend_db.add(b_tenant)
    backend_db.flush()

    # Users
    salesman_user = BackendUser(
        tenant_id=b_tenant.id,
        email="salesman@dhakasilicon.com",
        password_hash=get_password_hash("Sales123!"),
        role="salesman",
        full_name="Tanvir Ahmed (Senior Sales & Inventory Lead)",
        is_active=True
    )
    admin_user = BackendUser(
        tenant_id=b_tenant.id,
        email="admin@dhakasilicon.com",
        password_hash=get_password_hash("Admin123!"),
        role="admin",
        full_name="Mustafa Kamal (Managing Director)",
        is_active=True
    )
    demo_user = BackendUser(
        tenant_id=b_tenant.id,
        email="admin@nebulatech.cn",
        password_hash=get_password_hash("Admin123456!"),
        role="admin",
        full_name="Contest Reviewer / Auditor",
        is_active=True
    )
    backend_db.add_all([salesman_user, admin_user, demo_user])

    # API key
    api_key_raw = "fp_live_testdemo123456789abcdef"
    api_key = BackendApiKey(
        tenant_id=b_tenant.id,
        name="Universal Embed Widget SDK Key",
        key_hash=hash_api_key(api_key_raw),
        key_prefix="fp_live_test",
        permissions=["read", "write", "agent"],
        is_active=True
    )
    backend_db.add(api_key)

    # Clients (15)
    b_clients_map = {}
    for c in CUSTOMERS:
        email_prefix = c["name"].lower().replace(" ", "").replace(".", "").replace("&", "")[:12]
        client_obj = BackendClient(
            tenant_id=b_tenant.id,
            name=c["name"],
            email=f"{email_prefix}@startech-partner.bd",
            phone=c["contactNumber"],
            company=c["name"],
            address=c["deliveryAddress"],
            tax_number=c.get("binNumber", "BIN-00819203-01"),
            payment_terms_days=30 if c["customerType"] == "Wholesale" else 15,
            credit_limit=1500000.0 if c["customerType"] == "Wholesale" else 500000.0
        )
        backend_db.add(client_obj)
        backend_db.flush()
        b_clients_map[c["name"]] = client_obj

    # 48 Invoices & Line items
    for idx, order in enumerate(GENERATED_ORDERS):
        sched = ORDER_SCHEDULE[idx]
        order_dt = datetime.fromisoformat(sched["iso"].replace("Z", "+00:00"))
        due_dt = order_dt + timedelta(days=30)
        
        status = "paid"
        paid_dt = order_dt + timedelta(days=5) if order_dt < (now - timedelta(days=5)) else order_dt
        if order["paymentStatus"] == "Credit 30D":
            if due_dt < now:
                status = "overdue"
                paid_dt = None
            else:
                status = "sent"
                paid_dt = None
        elif order["paymentStatus"] == "COD Pending":
            status = "sent"
            paid_dt = None

        client_rec = b_clients_map.get(order["customerName"])
        inv = BackendInvoice(
            tenant_id=b_tenant.id,
            client_id=client_rec.id if client_rec else None,
            invoice_number=order["orderNumber"],
            issue_date=order_dt,
            due_date=due_dt,
            status=status,
            subtotal=float(order["subtotal"] - order["discountAmount"]),
            tax_rate=0.05,
            tax_amount=float(order["vatAmount"]),
            total=float(order["totalAmount"]),
            payment_method=order["paymentMethod"],
            paid_at=paid_dt,
            notes=f"StarTech hardware batch: {order['itemsSummary']}. Courier: {order['courier']['provider'] if order['courier'] else 'Walk-in Counter'}"
        )
        backend_db.add(inv)
        backend_db.flush()

        for it in order["items"]:
            backend_db.add(BackendInvoiceItem(
                invoice_id=inv.id,
                description=f"{it['name']} ({it['sku']})",
                quantity=float(it["quantity"]),
                unit_price=float(it["unitPrice"]),
                tax_rate=0.05,
                total=float(it["total"] * 1.05)
            ))

        if status == "paid" and paid_dt:
            backend_db.add(BackendIncome(
                tenant_id=b_tenant.id,
                source=f"Sales Order {order['orderNumber']}",
                amount=float(order["totalAmount"]),
                currency="BDT",
                description=f"Payment for {order['itemsSummary'][:80]}",
                date=paid_dt,
                invoice_id=inv.id,
                payment_method=order["paymentMethod"]
            ))

    # 5 Months of Expenses (May to Oct 2026)
    expense_defs = [
        ("Import Customs & Port Clearance Duty", 295000.0, "Chittagong Port customs duty & Advance Income Tax (AIT) for GPU shipments", "Customs Authority BD"),
        ("Sales Team Salaries & Performance Bonus", 195000.0, "Monthly sales staff base salary + incentive bonus (Lead Tanvir Ahmed)", "Staff Bank Accounts"),
        ("Banani Central & Multiplan Showroom Lease", 95000.0, "Monthly showroom, vault & retail branch commercial rent", "Multiplan Management Ltd."),
        ("Courier Freight & Air Express Logistics", 48000.0, "Pathao, Steadfast logistics & DHL air freight", "Courier Partners BD"),
        ("Digital Marketing & Community Campaigns", 35000.0, "PC Builder social media & Facebook ads", "Meta Business BD"),
        ("Commercial Utilities & AmberIT Dedicated Fiber", 21500.0, "Commercial electricity and fiber lease line", "DESCO / AmberIT"),
        ("Packaging & Anti-Static Bubble Film", 14000.0, "Transport safety packaging materials", "Dhaka Packaging Mart")
    ]
    for month_offset in [5, 4, 3, 2, 1, 0]:
        base_exp_dt = now - timedelta(days=month_offset * 30 + 12)
        for cat, amt, desc, vendor in expense_defs:
            backend_db.add(BackendExpense(
                tenant_id=b_tenant.id,
                category=cat,
                amount=amt,
                currency="BDT",
                description=f"{desc} (Month -{month_offset})",
                vendor=vendor,
                date=base_exp_dt,
                payment_method="Corporate Bank Wire",
                tax_deductible=True,
                status="approved"
            ))

    # Cash snapshots over 150 days
    balance_track = 1450000.0
    for day_i in range(150, -1, -5):
        s_date = now - timedelta(days=day_i)
        cash_in = 280000.0 + (day_i % 7) * 45000.0
        cash_out = 160000.0 + (day_i % 5) * 32000.0
        balance_track += (cash_in - cash_out)
        backend_db.add(BackendCashSnapshot(
            tenant_id=b_tenant.id,
            snapshot_date=s_date,
            cash_in=cash_in,
            cash_out=cash_out,
            net_cash=cash_in - cash_out,
            ending_balance=balance_track,
            forecasted_balance_30d=balance_track + 450000.0,
            forecasted_balance_60d=balance_track + 850000.0,
            forecasted_balance_90d=balance_track + 1250000.0,
            run_rate=650000.0,
            runway_months=round(balance_track / 650000.0, 1)
        ))

    backend_db.commit()
    print("Backend database seeded successfully with 48 invoices, 15 clients, and 5 months of records.")

    # -------------------------------------------------------------
    # 2. SEED AGENT DATABASE (agent.db)
    # -------------------------------------------------------------
    print("\n--- SEEDING AGENT DATABASE (agent.db) ---")
    a_tenant = agent_db.query(AgentTenant).filter_by(company_name="Dhaka Silicon & Hardware Ltd.").first()
    if a_tenant:
        print("Clearing existing Dhaka Silicon records in agent db...")
        agent_db.query(SyncedInvoice).filter_by(tenant_id=a_tenant.id).delete()
        agent_db.query(SyncedExpense).filter_by(tenant_id=a_tenant.id).delete()
        agent_db.query(SyncedClient).filter_by(tenant_id=a_tenant.id).delete()
        agent_db.query(AgentCashSnapshot).filter_by(tenant_id=a_tenant.id).delete()
        agent_db.query(AgentApiKey).filter_by(tenant_id=a_tenant.id).delete()
        agent_db.delete(a_tenant)
        agent_db.commit()

    a_tenant = AgentTenant(
        company_name="Dhaka Silicon & Hardware Ltd.",
        industry="Computer Wholesale & Retail",
        country="BD",
        currency="BDT",
        tax_id="BIN-88291039481-C",
        annual_revenue=18500000.0,
        employee_count=14,
        risk_score=84.0,
        onboarding_status="active"
    )
    agent_db.add(a_tenant)
    agent_db.flush()

    # Agent API Key
    k1 = AgentApiKey(
        tenant_id=a_tenant.id,
        key_hash=agent_hash_api_key("fpk_live_dhaka_silicon"),
        key_prefix="fpk_live_dhaka",
        name="Dhaka Silicon Master Key",
        scopes=["read", "write", "agent", "sync", "admin"]
    )
    agent_db.add(k1)

    # Synced Clients
    for c in CUSTOMERS:
        email_prefix = c["name"].lower().replace(" ", "").replace(".", "").replace("&", "")[:12]
        agent_db.add(SyncedClient(
            tenant_id=a_tenant.id,
            external_id=c["id"],
            name=c["name"],
            email=f"{email_prefix}@startech-partner.bd",
            phone=c["contactNumber"],
            company=c["name"],
            payment_terms_days=30 if c["customerType"] == "Wholesale" else 15,
            credit_limit=1500000.0 if c["customerType"] == "Wholesale" else 500000.0,
            notes=f"Tier: {c['customerType']}, Address: {c['deliveryAddress']}"
        ))

    # Synced Invoices
    for idx, order in enumerate(GENERATED_ORDERS):
        sched = ORDER_SCHEDULE[idx]
        order_dt = datetime.fromisoformat(sched["iso"].replace("Z", "+00:00"))
        due_dt = order_dt + timedelta(days=30)
        
        status = "paid"
        paid_dt = order_dt + timedelta(days=5) if order_dt < (now - timedelta(days=5)) else order_dt
        if order["paymentStatus"] == "Credit 30D":
            if due_dt < now:
                status = "overdue"
                paid_dt = None
            else:
                status = "sent"
                paid_dt = None
        elif order["paymentStatus"] == "COD Pending":
            status = "sent"
            paid_dt = None

        agent_db.add(SyncedInvoice(
            tenant_id=a_tenant.id,
            external_id=order["orderNumber"],
            client_name=order["customerName"],
            client_email=f"{order['customerName'].lower()[:8]}@partner.bd",
            amount=float(order["totalAmount"]),
            subtotal=float(order["subtotal"] - order["discountAmount"]),
            tax_amount=float(order["vatAmount"]),
            status=status,
            issue_date=order_dt,
            due_date=due_dt,
            paid_at=paid_dt,
            items=[{"name": it["name"], "qty": it["quantity"], "price": it["unitPrice"]} for it in order["items"]],
            notes=f"{order['itemsSummary']}. Courier: {order['courier']['provider'] if order['courier'] else 'Counter'}"
        ))

    # Synced Expenses
    for month_offset in [5, 4, 3, 2, 1, 0]:
        base_exp_dt = now - timedelta(days=month_offset * 30 + 12)
        for cat, amt, desc, vendor in expense_defs:
            agent_db.add(SyncedExpense(
                tenant_id=a_tenant.id,
                category=cat,
                amount=amt,
                vendor=vendor,
                description=f"{desc} (Month -{month_offset})",
                date=base_exp_dt,
                tax_deductible=True
            ))

    # Agent Cash Snapshot
    agent_db.add(AgentCashSnapshot(
        tenant_id=a_tenant.id,
        snapshot_date=now,
        current_balance=2250000.0,
        monthly_burn_rate=678500.0,
        runway_months=3.3,
        health_score=86.5,
        notes="5-Month audited liquidity metrics from StarTech hardware wholesale catalog"
    ))

    agent_db.commit()
    print("Agent database seeded successfully with 48 synced invoices and 5 months of expenses.")

    # Recompute metrics for all tenants
    print("Recomputing tenant context metrics...")
    for t in agent_db.query(AgentTenant).all():
        TenantContextBuilder(agent_db, t).compute_all_metrics()
    print("Agent tenant context metrics computed successfully!")

if __name__ == "__main__":
    run_reseed()
