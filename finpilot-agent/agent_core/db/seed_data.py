from datetime import datetime, timezone, timedelta
from agent_core.db.database import SessionLocal, Base, engine
from agent_core.db.models import (
    Tenant, ApiKey, SyncedInvoice, SyncedExpense,
    SyncedClient, CashSnapshot, KnowledgeEntry
)
from agent_core.security.auth import hash_api_key
from agent_core.engine.context.builder import TenantContextBuilder

def seed_agent_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        existing = db.query(Tenant).filter_by(company_name="Dhaka Silicon & Hardware Ltd.").first()
        if existing:
            print("Database already contains seed tenants. Recomputing contexts...")
            for t in db.query(Tenant).all():
                TenantContextBuilder(db, t).compute_all_metrics()
            return

        now = datetime.now(timezone.utc)

        # -------------------------------------------------------------
        # TENANT 1: Dhaka Silicon & Hardware Ltd. (Computer Hardware)
        # -------------------------------------------------------------
        t1 = Tenant(
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
        db.add(t1)
        db.flush()

        k1_raw = "fpk_live_dhaka_silicon"
        k1 = ApiKey(
            tenant_id=t1.id,
            key_hash=hash_api_key(k1_raw),
            key_prefix="fpk_live_dhaka",
            name="Dhaka Silicon Master Key",
            scopes=["read", "write", "agent", "sync", "admin"]
        )
        db.add(k1)

        # Invoices
        invs_t1 = [
            SyncedInvoice(
                tenant_id=t1.id,
                external_id="INV-2026-001",
                client_name="StarTech & Engineering Ltd",
                client_email="accounts@startech.com.bd",
                amount=450000.0,
                subtotal=428571.0,
                tax_amount=21429.0,
                status="overdue",
                due_date=now - timedelta(days=28),
                notes="50x NVIDIA RTX 4060 GPU Wholesale consignment"
            ),
            SyncedInvoice(
                tenant_id=t1.id,
                external_id="INV-2026-002",
                client_name="Ryans Computers Ltd",
                client_email="billing@ryansplus.com",
                amount=320000.0,
                subtotal=304761.0,
                tax_amount=15239.0,
                status="sent",
                due_date=now + timedelta(days=12),
                notes="40x Intel Core i7 14700K CPUs"
            ),
            SyncedInvoice(
                tenant_id=t1.id,
                external_id="INV-2026-003",
                client_name="UCC Tech World Ltd",
                client_email="finance@ucc.com.bd",
                amount=190000.0,
                subtotal=180952.0,
                tax_amount=9048.0,
                status="overdue",
                due_date=now - timedelta(days=15),
                notes="80x 1TB NVMe Gen4 SSD Wholesale batch"
            ),
            SyncedInvoice(
                tenant_id=t1.id,
                external_id="INV-2026-004",
                client_name="Computer City BD",
                client_email="accounts@computercity.com.bd",
                amount=680000.0,
                subtotal=647619.0,
                tax_amount=32381.0,
                status="paid",
                due_date=now - timedelta(days=35),
                paid_at=now - timedelta(days=33),
                notes="ASUS ROG Motherboard bulk shipment"
            ),
        ]
        db.add_all(invs_t1)

        # Expenses
        exps_t1 = [
            SyncedExpense(
                tenant_id=t1.id,
                category="Customs & Freight",
                amount=210000.0,
                vendor="Chittagong Port Authority & C&F Agent",
                description="Port clearance Advance Income Tax (AIT) & terminal duty on GPU container",
                tax_deductible=True
            ),
            SyncedExpense(
                tenant_id=t1.id,
                category="Rent & Utilities",
                amount=145000.0,
                vendor="Multiplan Center Commercial Complex",
                description="Monthly showroom & wholesale center lease",
                tax_deductible=True
            ),
            SyncedExpense(
                tenant_id=t1.id,
                category="Logistics",
                amount=65000.0,
                vendor="DHL Global Forwarding",
                description="Air cargo express transit for processor chips",
                tax_deductible=True
            ),
            SyncedExpense(
                tenant_id=t1.id,
                category="Payroll",
                amount=195000.0,
                vendor="Internal Payroll",
                description="Staff salaries (Sales lead Tanvir Ahmed & technical engineers)",
                tax_deductible=True
            ),
        ]
        db.add_all(exps_t1)

        # Cash Snapshot
        db.add(CashSnapshot(
            tenant_id=t1.id,
            snapshot_date=now,
            current_balance=1850000.0,
            monthly_burn_rate=615000.0,
            runway_months=3.0,
            health_score=84.0,
            notes="Opening liquidity snapshot for computer wholesale"
        ))

        # -------------------------------------------------------------
        # TENANT 2: MedCare Pharma & Surgical Ltd. (Pharmaceuticals)
        # -------------------------------------------------------------
        t2 = Tenant(
            company_name="MedCare Pharma & Surgical Ltd.",
            industry="Pharmacy & Healthcare",
            country="BD",
            currency="BDT",
            tax_id="BIN-77182903112-P",
            annual_revenue=28000000.0,
            employee_count=22,
            risk_score=88.0,
            onboarding_status="active"
        )
        db.add(t2)
        db.flush()

        k2_raw = "fpk_live_medcare_pharma"
        k2 = ApiKey(
            tenant_id=t2.id,
            key_hash=hash_api_key(k2_raw),
            key_prefix="fpk_live_medca",
            name="MedCare Master Key",
            scopes=["read", "write", "agent", "sync", "admin"]
        )
        db.add(k2)

        # Invoices
        invs_t2 = [
            SyncedInvoice(
                tenant_id=t2.id,
                external_id="PH-2026-101",
                client_name="Popular Diagnostic Centre",
                client_email="accounts@populardiagnostic.com",
                amount=580000.0,
                status="overdue",
                due_date=now - timedelta(days=22),
                notes="Diagnostic reagents and sterile syringe consignment"
            ),
            SyncedInvoice(
                tenant_id=t2.id,
                external_id="PH-2026-102",
                client_name="Square Hospital Pharmacy",
                client_email="procurement@squarehospital.com",
                amount=720000.0,
                status="sent",
                due_date=now + timedelta(days=15),
                notes="Cold-chain biologics and specialized cardiac medication"
            ),
            SyncedInvoice(
                tenant_id=t2.id,
                external_id="PH-2026-103",
                client_name="Labaid Hospital Supplies",
                client_email="finance@labaid.com.bd",
                amount=380000.0,
                status="paid",
                due_date=now - timedelta(days=40),
                paid_at=now - timedelta(days=38),
                notes="General ICU disposable packs"
            ),
        ]
        db.add_all(invs_t2)

        # Expenses
        exps_t2 = [
            SyncedExpense(
                tenant_id=t2.id,
                category="Procurement",
                amount=420000.0,
                vendor="Beximco Pharmaceuticals Ltd",
                description="Bulk antibiotics and essential medicines stock",
                tax_deductible=True
            ),
            SyncedExpense(
                tenant_id=t2.id,
                category="Cold Chain Logistics",
                amount=140000.0,
                vendor="ThermoCold Logistics BD",
                description="Sub-zero temperature logistics and dry ice packaging",
                tax_deductible=True
            ),
            SyncedExpense(
                tenant_id=t2.id,
                category="Regulatory & Licensing",
                amount=45000.0,
                vendor="Directorate General of Drug Administration (DGDA)",
                description="Annual drug license renewal and batch inspection fees",
                tax_deductible=True
            ),
            SyncedExpense(
                tenant_id=t2.id,
                category="Warehouse & Storage",
                amount=115000.0,
                vendor="Tejgaon Central Cold Warehouse",
                description="Pharmaceutical GMP-certified warehouse rent",
                tax_deductible=True
            ),
        ]
        db.add_all(exps_t2)

        # Cash Snapshot
        db.add(CashSnapshot(
            tenant_id=t2.id,
            snapshot_date=now,
            current_balance=3250000.0,
            monthly_burn_rate=720000.0,
            runway_months=4.5,
            health_score=88.0,
            notes="Opening liquidity snapshot for pharma distributor"
        ))

        db.commit()

        # Run context builders to self-train initial knowledge entries
        TenantContextBuilder(db, t1).compute_all_metrics()
        TenantContextBuilder(db, t2).compute_all_metrics()

        print("Successfully seeded FinPilot Standalone Agent database:")
        print(f"1. {t1.company_name} (API Key: {k1_raw})")
        print(f"2. {t2.company_name} (API Key: {k2_raw})")

    finally:
        db.close()

if __name__ == "__main__":
    seed_agent_database()
