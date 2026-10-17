from datetime import datetime, timezone
from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from agent_core.db.database import get_db
from agent_core.db.models import (
    Tenant, ApiKey, SyncedInvoice, SyncedExpense,
    SyncedClient, CashSnapshot, AuditLog
)
from agent_core.security.auth import require_scopes
from agent_core.engine.context.builder import TenantContextBuilder

router = APIRouter(prefix="/sync", tags=["Data Sync Pipeline"])

class InvoiceSyncItem(BaseModel):
    external_id: str = Field(..., example="INV-2026-001")
    client_name: str = Field(..., example="Dhaka Central Clinic")
    client_email: Optional[str] = Field(None, example="accounts@centralclinic.bd")
    amount: float = Field(..., example=145000.0)
    subtotal: Optional[float] = None
    tax_amount: Optional[float] = None
    status: str = Field(default="sent", example="overdue")
    due_date: str = Field(..., example="2026-10-15")
    items: Optional[List[dict]] = Field(default_factory=list)
    notes: Optional[str] = None

class ExpenseSyncItem(BaseModel):
    category: str = Field(..., example="Operations")
    amount: float = Field(..., example=32000.0)
    vendor: Optional[str] = Field(None, example="Square Pharmaceuticals")
    description: Optional[str] = None
    date: Optional[str] = Field(None, example="2026-10-10")
    tax_deductible: Optional[bool] = True

class ClientSyncItem(BaseModel):
    external_id: Optional[str] = Field(None, example="CLI-001")
    name: str = Field(..., example="Popular Diagnostic Centre")
    company: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    payment_terms_days: Optional[int] = 30
    credit_limit: Optional[float] = 200000.0

class CashSnapshotSyncItem(BaseModel):
    current_balance: float = Field(..., example=2450000.0)
    monthly_burn_rate: Optional[float] = Field(None, example=650000.0)
    notes: Optional[str] = None

class FullSyncPayload(BaseModel):
    invoices: Optional[List[InvoiceSyncItem]] = None
    expenses: Optional[List[ExpenseSyncItem]] = None
    clients: Optional[List[ClientSyncItem]] = None
    cash_snapshot: Optional[CashSnapshotSyncItem] = None

def parse_iso_date(date_str: Optional[str]) -> datetime:
    if not date_str:
        return datetime.now(timezone.utc)
    try:
        return datetime.fromisoformat(date_str)
    except Exception:
        try:
            return datetime.strptime(date_str[:10], "%Y-%m-%d")
        except Exception:
            return datetime.now(timezone.utc)

@router.post("/full")
def full_data_sync(
    payload: FullSyncPayload,
    auth_data: tuple[Tenant, ApiKey] = Depends(require_scopes(["sync"])),
    db: Session = Depends(get_db)
):
    """
    Ingests full financial ledger dataset from any host SME.
    Updates synced tables and immediately rebuilds the tenant's self-training context.
    """
    tenant, _ = auth_data
    synced_invoices_count = 0
    synced_expenses_count = 0
    synced_clients_count = 0

    # 1. Sync Invoices
    if payload.invoices:
        for item in payload.invoices:
            due_dt = parse_iso_date(item.due_date)
            existing = (
                db.query(SyncedInvoice)
                .filter_by(tenant_id=tenant.id, external_id=item.external_id)
                .first()
            )
            if existing:
                existing.client_name = item.client_name
                existing.client_email = item.client_email
                existing.amount = item.amount
                existing.subtotal = item.subtotal or item.amount
                existing.tax_amount = item.tax_amount or 0.0
                existing.status = item.status
                existing.due_date = due_dt
                existing.items = item.items or []
                existing.notes = item.notes
                existing.synced_at = datetime.now(timezone.utc)
            else:
                new_inv = SyncedInvoice(
                    tenant_id=tenant.id,
                    external_id=item.external_id,
                    client_name=item.client_name,
                    client_email=item.client_email,
                    amount=item.amount,
                    subtotal=item.subtotal or item.amount,
                    tax_amount=item.tax_amount or 0.0,
                    status=item.status,
                    due_date=due_dt,
                    items=item.items or [],
                    notes=item.notes
                )
                db.add(new_inv)
            synced_invoices_count += 1

    # 2. Sync Expenses
    if payload.expenses:
        for exp in payload.expenses:
            exp_dt = parse_iso_date(exp.date)
            new_exp = SyncedExpense(
                tenant_id=tenant.id,
                category=exp.category,
                amount=exp.amount,
                vendor=exp.vendor,
                description=exp.description,
                date=exp_dt,
                tax_deductible=exp.tax_deductible if exp.tax_deductible is not None else True
            )
            db.add(new_exp)
            synced_expenses_count += 1

    # 3. Sync Clients
    if payload.clients:
        for cli in payload.clients:
            existing_cli = (
                db.query(SyncedClient)
                .filter_by(tenant_id=tenant.id, name=cli.name)
                .first()
            )
            if existing_cli:
                existing_cli.company = cli.company or cli.name
                existing_cli.email = cli.email
                existing_cli.phone = cli.phone
                existing_cli.payment_terms_days = cli.payment_terms_days or 30
                existing_cli.credit_limit = cli.credit_limit or 100000.0
            else:
                new_cli = SyncedClient(
                    tenant_id=tenant.id,
                    external_id=cli.external_id,
                    name=cli.name,
                    company=cli.company or cli.name,
                    email=cli.email,
                    phone=cli.phone,
                    payment_terms_days=cli.payment_terms_days or 30,
                    credit_limit=cli.credit_limit or 100000.0
                )
                db.add(new_cli)
            synced_clients_count += 1

    # 4. Sync Cash Snapshot
    if payload.cash_snapshot:
        snap = CashSnapshot(
            tenant_id=tenant.id,
            snapshot_date=datetime.now(timezone.utc),
            current_balance=payload.cash_snapshot.current_balance,
            monthly_burn_rate=payload.cash_snapshot.monthly_burn_rate or 450000.0,
            notes=payload.cash_snapshot.notes
        )
        db.add(snap)

    tenant.last_sync_at = datetime.now(timezone.utc)
    db.commit()

    # 5. Automatically trigger self-contextualization engine
    builder = TenantContextBuilder(db, tenant)
    computed_metrics = builder.compute_all_metrics()

    # Log audit event
    audit = AuditLog(
        tenant_id=tenant.id,
        action="data_sync",
        resource_type="sync_pipeline",
        details={
            "invoices": synced_invoices_count,
            "expenses": synced_expenses_count,
            "clients": synced_clients_count
        }
    )
    db.add(audit)
    db.commit()

    return {
        "status": "success",
        "message": f"Data synced successfully for '{tenant.company_name}'. AI context recomputed.",
        "records_ingested": {
            "invoices": synced_invoices_count,
            "expenses": synced_expenses_count,
            "clients": synced_clients_count
        },
        "computed_health_metrics": {
            "liquid_balance": computed_metrics["current_balance"],
            "monthly_burn": computed_metrics["monthly_burn_rate"],
            "runway_months": computed_metrics["runway_months"],
            "health_score": computed_metrics["health_score"],
            "overdue_receivables": computed_metrics["total_overdue_ar"]
        }
    }
