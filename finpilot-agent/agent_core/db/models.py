import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Float, Integer, Boolean, DateTime,
    ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from agent_core.db.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def now_utc():
    return datetime.now(timezone.utc)

class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    company_name = Column(String(255), nullable=False)
    industry = Column(String(100), nullable=False, default="Retail")
    country = Column(String(10), nullable=False, default="BD")
    currency = Column(String(10), nullable=False, default="BDT")
    tax_id = Column(String(100), nullable=True)
    annual_revenue = Column(Float, default=0.0)
    employee_count = Column(Integer, default=1)
    risk_score = Column(Float, default=80.0)  # 0 to 100, health index
    onboarding_status = Column(String(50), default="active")  # pending, active, suspended
    last_sync_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=now_utc)
    updated_at = Column(DateTime, default=now_utc, onupdate=now_utc)

    # Relationships
    api_keys = relationship("ApiKey", back_populates="tenant", cascade="all, delete-orphan")
    synced_invoices = relationship("SyncedInvoice", back_populates="tenant", cascade="all, delete-orphan")
    synced_expenses = relationship("SyncedExpense", back_populates="tenant", cascade="all, delete-orphan")
    synced_clients = relationship("SyncedClient", back_populates="tenant", cascade="all, delete-orphan")
    cash_snapshots = relationship("CashSnapshot", back_populates="tenant", cascade="all, delete-orphan")
    knowledge_entries = relationship("KnowledgeEntry", back_populates="tenant", cascade="all, delete-orphan")
    conversations = relationship("AgentConversation", back_populates="tenant", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="tenant", cascade="all, delete-orphan")


class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    key_hash = Column(String(255), nullable=False, index=True)
    key_prefix = Column(String(24), nullable=False)  # e.g., fpk_live_d7a1
    name = Column(String(100), nullable=False, default="Default SDK Key")
    scopes = Column(JSON, default=lambda: ["read", "write", "agent", "sync"])
    rate_limit_per_min = Column(Integer, default=120)
    last_used_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=now_utc)

    tenant = relationship("Tenant", back_populates="api_keys")


class SyncedInvoice(Base):
    __tablename__ = "synced_invoices"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    external_id = Column(String(100), nullable=False, index=True)  # e.g. INV-2026-001 from host SME
    client_name = Column(String(255), nullable=False)
    client_email = Column(String(255), nullable=True)
    amount = Column(Float, nullable=False, default=0.0)
    subtotal = Column(Float, nullable=False, default=0.0)
    tax_amount = Column(Float, nullable=False, default=0.0)
    status = Column(String(50), nullable=False, default="sent")  # sent, paid, overdue, cancelled
    due_date = Column(DateTime, nullable=False)
    issue_date = Column(DateTime, nullable=False, default=now_utc)
    paid_at = Column(DateTime, nullable=True)
    items = Column(JSON, default=list)  # list of line items
    notes = Column(Text, nullable=True)
    synced_at = Column(DateTime, default=now_utc)

    tenant = relationship("Tenant", back_populates="synced_invoices")


class SyncedExpense(Base):
    __tablename__ = "synced_expenses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    external_id = Column(String(100), nullable=True)
    category = Column(String(100), nullable=False, default="Operations")
    amount = Column(Float, nullable=False, default=0.0)
    vendor = Column(String(255), nullable=True)
    description = Column(String(255), nullable=True)
    date = Column(DateTime, nullable=False, default=now_utc)
    tax_deductible = Column(Boolean, default=True)
    status = Column(String(50), default="approved")
    synced_at = Column(DateTime, default=now_utc)

    tenant = relationship("Tenant", back_populates="synced_expenses")


class SyncedClient(Base):
    __tablename__ = "synced_clients"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    external_id = Column(String(100), nullable=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    company = Column(String(255), nullable=True)
    payment_terms_days = Column(Integer, default=30)
    credit_limit = Column(Float, default=100000.0)
    notes = Column(Text, nullable=True)
    synced_at = Column(DateTime, default=now_utc)

    tenant = relationship("Tenant", back_populates="synced_clients")


class CashSnapshot(Base):
    __tablename__ = "cash_snapshots"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    snapshot_date = Column(DateTime, nullable=False, default=now_utc)
    current_balance = Column(Float, nullable=False, default=0.0)
    monthly_burn_rate = Column(Float, nullable=False, default=0.0)
    runway_months = Column(Float, nullable=False, default=0.0)
    health_score = Column(Float, nullable=False, default=80.0)
    notes = Column(String(255), nullable=True)
    synced_at = Column(DateTime, default=now_utc)

    tenant = relationship("Tenant", back_populates="cash_snapshots")


class KnowledgeEntry(Base):
    __tablename__ = "knowledge_entries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(100), nullable=False)  # profile, pattern, risk, benchmark, metric
    key = Column(String(100), nullable=False)
    value = Column(Text, nullable=False)
    metadata_json = Column(JSON, default=dict)
    computed_at = Column(DateTime, default=now_utc)

    tenant = relationship("Tenant", back_populates="knowledge_entries")


class AgentConversation(Base):
    __tablename__ = "agent_conversations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    source = Column(String(50), default="sdk_widget")  # sdk_widget, api, playground, webhook
    title = Column(String(255), default="AI Financial Consultation")
    context = Column(JSON, default=dict)
    created_at = Column(DateTime, default=now_utc)
    updated_at = Column(DateTime, default=now_utc, onupdate=now_utc)

    tenant = relationship("Tenant", back_populates="conversations")
    messages = relationship("AgentMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="AgentMessage.created_at")


class AgentMessage(Base):
    __tablename__ = "agent_messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(36), ForeignKey("agent_conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    sender = Column(String(50), nullable=False)  # user, agent, system
    specialist = Column(String(50), nullable=True)  # orchestrator, cashflow, financing, analyst, invoice, tax
    content = Column(Text, nullable=False)
    tool_calls = Column(JSON, default=list)
    citations = Column(JSON, default=list)
    guardrail_flags = Column(JSON, default=list)
    created_at = Column(DateTime, default=now_utc)

    conversation = relationship("AgentConversation", back_populates="messages")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    action = Column(String(100), nullable=False)  # e.g., chat_query, data_sync, tool_execution
    resource_type = Column(String(100), nullable=False)  # agent, invoice, expense, key
    resource_id = Column(String(100), nullable=True)
    details = Column(JSON, default=dict)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=now_utc)

    tenant = relationship("Tenant", back_populates="audit_logs")
