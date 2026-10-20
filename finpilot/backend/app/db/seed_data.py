import json
from datetime import datetime, timedelta, timezone
from app.db.database import SessionLocal, init_db
from app.db.models import (
    Tenant, User, ApiKey, Client, Invoice, InvoiceItem,
    Expense, Income, CashFlowSnapshot, AgentConversation, AgentMessage, AuditLog
)
from app.core.security import get_password_hash, hash_api_key

def seed_database():
    init_db()
    db = SessionLocal()
    try:
        # Check if already seeded with Dhaka Silicon
        existing_tenant = db.query(Tenant).filter_by(company_name="Dhaka Silicon & Hardware Ltd.").first()
        if existing_tenant:
            print("Database already contains computer parts seed tenant.")
            return existing_tenant.id

        now = datetime.now(timezone.utc)

        # 1. Tenant: Computer Parts & Hardware Wholesaler / Retailer
        tenant = Tenant(
            company_name="Dhaka Silicon & Hardware Ltd.",
            industry="Computer Hardware & Components",
            country="BD",
            currency="BDT",
            tax_id="BIN-0029481729-01",
            annual_revenue=14500000.0,  # ~1.45 Crore BDT
            employee_count=14,
            risk_score=84.0
        )
        db.add(tenant)
        db.flush()

        # 2. Users (Salesman account + Admin)
        salesman_user = User(
            tenant_id=tenant.id,
            email="salesman@dhakasilicon.com",
            password_hash=get_password_hash("Sales123!"),
            role="salesman",
            full_name="Tanvir Ahmed (Senior Sales & Inventory Lead)",
            is_active=True
        )
        demo_user = User(
            tenant_id=tenant.id,
            email="admin@nebulatech.cn",
            password_hash=get_password_hash("Admin123456!"),
            role="admin",
            full_name="Contest Reviewer / Auditor",
            is_active=True
        )
        db.add_all([salesman_user, admin_user, demo_user])
        db.flush()

        # 3. API Key for SDK widget integration
        api_key_raw = "fp_test_demo123456789abcdef"
        api_key = ApiKey(
            tenant_id=tenant.id,
            name="Universal Embed Widget SDK Key",
            key_hash=hash_api_key(api_key_raw),
            key_prefix="fp_test_demo",
            permissions=["read", "write", "agent"],
            is_active=True
        )
        db.add(api_key)

        # 4. Clients (Local IT Retailers, System Integrators, Cyber Cafes)
        clients_data = [
            {
                "name": "StarTech Hardware Hub",
                "email": "procurement@startech-hub.bd",
                "phone": "+880 1711-234567",
                "company": "StarTech IT Distributors Ltd.",
                "address": "Multiplan Center, New Elephant Road, Dhaka",
                "tax_number": "BIN-001293847-02",
                "payment_terms_days": 30,
                "credit_limit": 1200000.0
            },
            {
                "name": "Ryans Computer World",
                "email": "accounts@ryans-cw.bd",
                "phone": "+880 1819-876543",
                "company": "Ryans Computer World Wholesale",
                "address": "IDB Bhaban, Rokeya Sarani, Agargaon, Dhaka",
                "tax_number": "BIN-003847291-03",
                "payment_terms_days": 45,
                "credit_limit": 1500000.0
            },
            {
                "name": "Nexus IT Solutions & Gaming",
                "email": "orders@nexus-it.bd",
                "phone": "+880 1912-345678",
                "company": "Nexus Gaming & Workstation Solutions",
                "address": "Jamuna Future Park Level 4, Dhaka",
                "tax_number": "BIN-004729184-01",
                "payment_terms_days": 30,
                "credit_limit": 800000.0
            },
            {
                "name": "Chittagong Tech Point",
                "email": "finance@ctgtechpoint.bd",
                "phone": "+880 1611-987654",
                "company": "Chittagong Tech Point Retailer",
                "address": "GEC Circle, Central Plaza, Chittagong",
                "tax_number": "BIN-005829103-04",
                "payment_terms_days": 60,
                "credit_limit": 900000.0
            },
            {
                "name": "Daffodil Tech & Robotics Lab",
                "email": "lab-purchase@daffodil-tech.bd",
                "phone": "+880 1515-456789",
                "company": "Daffodil Innovation & Workstations",
                "address": "Daffodil Smart City, Ashulia, Dhaka",
                "tax_number": "BIN-006918274-02",
                "payment_terms_days": 30,
                "credit_limit": 600000.0
            }
        ]

        clients = []
        for c in clients_data:
            client = Client(tenant_id=tenant.id, **c)
            db.add(client)
            clients.append(client)
        db.flush()

        # 5. Invoices & Computer Parts Line Items (Real Hardware Products)
        invoice_specs = [
            # Paid Invoices
            ("INV-2026-101", clients[0].id, now - timedelta(days=70), now - timedelta(days=40), "paid", 385000.0, 0.05, now - timedelta(days=38), [
                ("NVIDIA GeForce RTX 4070 Super 12GB OC Edition", 3, 78500.0),
                ("Corsair Vengeance 32GB (2x16GB) DDR5 6000MHz", 10, 14800.0)
            ]),
            ("INV-2026-102", clients[1].id, now - timedelta(days=60), now - timedelta(days=15), "paid", 486000.0, 0.05, now - timedelta(days=14), [
                ("Intel Core i7-14700K 20-Core LGA1700 Processor", 6, 44200.0),
                ("ASUS ROG Strix B760-F Gaming Motherboard", 6, 26000.0),
                ("Samsung 990 Pro 2TB NVMe PCIe 4.0 SSD", 4, 22500.0)
            ]),
            ("INV-2026-103", clients[2].id, now - timedelta(days=45), now - timedelta(days=15), "paid", 245000.0, 0.05, now - timedelta(days=12), [
                ("Corsair RM850e 850W 80+ Gold Fully Modular PSU", 10, 15200.0),
                ("Lian Li O11 Dynamic EVO Gaming Case", 5, 18900.0)
            ]),
            # Sent / Active Invoices (Due Soon)
            ("INV-2026-104", clients[0].id, now - timedelta(days=15), now + timedelta(days=15), "sent", 420000.0, 0.05, None, [
                ("NVIDIA GeForce RTX 4080 Super 16GB Gaming GPU", 3, 118000.0),
                ("DeepCool LS720 360mm AIO Liquid Cooler", 5, 13200.0)
            ]),
            ("INV-2026-105", clients[1].id, now - timedelta(days=10), now + timedelta(days=35), "sent", 535000.0, 0.05, None, [
                ("AMD Ryzen 7 7800X3D Gaming Processor", 8, 42500.0),
                ("G.Skill Trident Z5 RGB 32GB DDR5 6400MHz", 10, 19500.0)
            ]),
            # Overdue Invoices (Actionable for Salesman & Copilot Collection!)
            ("INV-2026-106", clients[3].id, now - timedelta(days=55), now - timedelta(days=10), "overdue", 345000.0, 0.05, None, [
                ("MSI MAG B650 Tomahawk WiFi Motherboard", 10, 24500.0),
                ("Kingston KC3000 2TB PCIe 4.0 NVMe SSD", 5, 20000.0)
            ]),
            ("INV-2026-107", clients[4].id, now - timedelta(days=40), now - timedelta(days=5), "overdue", 185000.0, 0.05, None, [
                ("Corsair 4000D Airflow Tempered Glass Mid-Tower", 10, 9500.0),
                ("Cooler Master MWE 750W Bronze V2 Power Supply", 10, 9000.0)
            ]),
            # Recent Active Invoices
            ("INV-2026-108", clients[2].id, now - timedelta(days=4), now + timedelta(days=26), "sent", 215000.0, 0.05, None, [
                ("Intel Core i5-14600K 14-Core Desktop Processor", 5, 32500.0),
                ("TeamGroup T-Force Delta RGB 32GB DDR5", 5, 10500.0)
            ]),
            ("INV-2026-109", clients[4].id, now - timedelta(days=1), now + timedelta(days=29), "draft", 128000.0, 0.05, None, [
                ("Thermalright Peerless Assassin 120 SE CPU Cooler", 15, 4800.0),
                ("Western Digital Black SN850X 1TB NVMe SSD", 5, 11200.0)
            ])
        ]

        invoices = []
        for inv_num, client_id, issue_d, due_d, status, subtotal, tax_r, paid_d, items_list in invoice_specs:
            tax_amt = round(subtotal * tax_r, 2)
            tot = round(subtotal + tax_amt, 2)
            inv = Invoice(
                tenant_id=tenant.id,
                client_id=client_id,
                invoice_number=inv_num,
                issue_date=issue_d,
                due_date=due_d,
                status=status,
                subtotal=subtotal,
                tax_rate=tax_r,
                tax_amount=tax_amt,
                total=tot,
                payment_method="BEFTN / Bank Wire",
                paid_at=paid_d,
                notes=f"Computer hardware wholesale delivery order {inv_num}. Standard 1-year brand warranty."
            )
            db.add(inv)
            db.flush()
            invoices.append(inv)

            for item_desc, qty, unit_p in items_list:
                item_tot = round(qty * unit_p * (1 + tax_r), 2)
                db.add(InvoiceItem(
                    invoice_id=inv.id,
                    description=item_desc,
                    quantity=float(qty),
                    unit_price=float(unit_p),
                    tax_rate=tax_r,
                    total=item_tot
                ))

            if status == "paid" and paid_d:
                db.add(Income(
                    tenant_id=tenant.id,
                    source="Wholesale Client Settlement",
                    amount=tot,
                    currency="BDT",
                    description=f"Received payment for {inv_num}",
                    date=paid_d,
                    invoice_id=inv.id
                ))

        # 6. Expenses: Hardware Wholesale Showroom, Customs Import, Freight, Salaries
        expense_templates = [
            ("Import Customs & Port Clearance Duty", 280000.0, "Chittagong Port customs duty for GPU/CPU shipment", "Customs Authority BD", True),
            ("Sales Team Commission & Salaries", 195000.0, "Monthly sales staff base salary + incentive bonus", "Staff Bank Accounts", True),
            ("Elephant Road Multiplan Showroom Lease", 75000.0, "Monthly showroom & warehouse rent", "Multiplan Center Management", True),
            ("Air Freight & Logistics Express", 42000.0, "Expedited DHL freight for graphics card inventory", "DHL Express Bangladesh", True),
            ("Digital Marketing & Facebook Ads", 35000.0, "PC builder promotion & gaming community ads", "Meta Business", True),
            ("Showroom Utilities & High-Speed Fiber", 18500.0, "Commercial electricity and fiber lease line", "DESCO / AmberIT", True),
            ("Packaging & Anti-Static Bubble Film", 12000.0, "Hardware transport safety packing supplies", "Local Packaging Vendor", True)
        ]

        for month_offset in [2, 1, 0]:
            base_date = now - timedelta(days=month_offset * 30 + 10)
            for cat, amt, desc, vendor, tax_ded in expense_templates:
                db.add(Expense(
                    tenant_id=tenant.id,
                    category=cat,
                    amount=amt,
                    currency="BDT",
                    description=f"{desc} (Month -{month_offset})",
                    vendor=vendor,
                    date=base_date + timedelta(days=3),
                    payment_method="Corporate Bank Wire",
                    tax_deductible=tax_ded,
                    status="approved"
                ))

        # 7. Cash Flow Snapshots (Showing ~18.5 Lakh BDT current balance, healthy PC parts trading)
        current_balance = 1850000.0  # 18.5 Lakh BDT
        avg_monthly_burn = 657500.0  # ~6.5 Lakh BDT operational cost
        runway_mo = round(current_balance / avg_monthly_burn, 1)  # ~2.8 months

        for day_i in range(30, -1, -1):
            snap_date = now - timedelta(days=day_i)
            day_balance = current_balance - (day_i * 6800) + (385000 if day_i > 22 else 0)
            db.add(CashFlowSnapshot(
                tenant_id=tenant.id,
                snapshot_date=snap_date,
                cash_in=45000.0 if day_i % 6 == 0 else 0.0,
                cash_out=32000.0 if day_i % 5 == 0 else 4500.0,
                net_cash=13000.0 if day_i % 6 == 0 else -4500.0,
                ending_balance=day_balance,
                forecasted_balance_30d=day_balance - 180000.0,
                forecasted_balance_60d=day_balance - 420000.0,
                forecasted_balance_90d=day_balance - 680000.0,
                run_rate=avg_monthly_burn,
                runway_months=runway_mo,
                confidence_interval_low=day_balance - 220000.0,
                confidence_interval_high=day_balance - 140000.0
            ))

        # 8. Demo Conversation for Salesman Tanvir Ahmed
        conv = AgentConversation(
            tenant_id=tenant.id,
            user_id=salesman_user.id,
            title="Q4 Hardware Inventory & Receivables Strategy",
            context={"page": "dashboard", "role": "salesman"}
        )
        db.add(conv)
        db.flush()

        db.add(AgentMessage(
            conversation_id=conv.id,
            sender="user",
            content="Hey FinPilot, Tanvir here from sales. How does our cash runway look before our next GPU import from Taiwan, and which client invoices are overdue?",
            created_at=now - timedelta(minutes=15)
        ))
        db.add(AgentMessage(
            conversation_id=conv.id,
            sender="agent",
            specialist="orchestrator",
            content=(
                "Hello Tanvir! Here is the real-time financial diagnosis for **Dhaka Silicon & Hardware Ltd.**:\n\n"
                "### 🖥️ Hardware Sales & Liquidity Status\n"
                "- **Cash in Bank:** ৳ 1,850,000 BDT\n"
                "- **Monthly Burn (Customs + Showroom + Salaries):** ৳ 657,500 BDT\n"
                "- **Operating Runway:** ~2.8 months\n"
                "- **Open Receivables:** ৳ 1,703,000 BDT across active computer shop clients\n\n"
                "### ⚠️ Overdue Collection Alert (৳ 530,000 BDT at risk)\n"
                "1. **Chittagong Tech Point:** ৳ 345,000 BDT (10 days past due for B650 Motherboards & KC3000 SSDs)\n"
                "2. **Daffodil Tech Lab:** ৳ 185,000 BDT (5 days past due for 4000D Cabinets & 750W PSUs)\n\n"
                "### 💡 Recommended Actions for Sales Team\n"
                "- **Dispatch Firm Payment Reminders:** I have drafted polite and assertive reminder letters with warranty clearance clauses.\n"
                "- **Pre-Approved Trade Credit:** If you need liquidity before the upcoming RTX 50-series graphics card shipment, you are pre-approved for **WeBank SME Trade Credit / Digital Revolving Line** up to ৳ 5,000,000 BDT (based on your verified invoice records)."
            ),
            tool_calls=[
                {"tool": "get_cash_flow_metrics", "args": {}, "status": "success"},
                {"tool": "get_overdue_invoices", "args": {}, "status": "success"},
                {"tool": "match_financing_options", "args": {"amount_needed": 500000}, "status": "success"}
            ],
            citations=[
                {"source": "invoices", "ids": ["INV-2026-106", "INV-2026-107"]},
                {"source": "cash_flow_snapshots", "metric": "runway_months"}
            ],
            guardrail_flags=["pii_sanitized", "deterministic_tools_verified"],
            created_at=now - timedelta(minutes=14)
        ))

        db.add(AuditLog(
            tenant_id=tenant.id,
            user_id=salesman_user.id,
            action="seed_computer_parts_sme",
            resource_type="system",
            resource_id=tenant.id,
            details={"tenant": tenant.company_name, "currency": "BDT", "industry": tenant.industry}
        ))

        db.commit()
        print(f"Successfully seeded Dhaka Silicon Computer Hardware SME: {tenant.id}")
        return tenant.id
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
