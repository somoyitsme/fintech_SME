import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Float, Integer, Boolean, DateTime,
    ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.db.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def now_utc():
    return datetime.now(timezone.utc)

class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    company_name = Column(String(255), nullable=False)
    industry = Column(String(100), nullable=False, default="Retail")
    country = Column(String(10), nullable=False, default="CN")
    currency = Column(String(10), nullable=False, default="CNY")
    tax_id = Column(String(100), nullable=True)
    annual_revenue = Column(Float, default=0.0)
    employee_count = Column(Integer, default=1)
    risk_score = Column(Float, default=75.0)  # 0 to 100, health index
    created_at = Column(DateTime, default=now_utc)
    updated_at = Column(DateTime, default=now_utc, onupdate=now_utc)

    # Relationships
    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
    api_keys = relationship("ApiKey", back_populates="tenant", cascade="all, delete-orphan")
    clients = relationship("Client", back_populates="tenant", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="tenant", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="tenant", cascade="all, delete-orphan")
    income_records = relationship("Income", back_populates="tenant", cascade="all, delete-orphan")
    cash_flow_snapshots = relationship("CashFlowSnapshot", back_populates="tenant", cascade="all, delete-orphan")
    conversations = relationship("AgentConversation", back_populates="tenant", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="tenant", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="admin")  # admin, accountant, viewer
    full_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=now_utc)
    updated_at = Column(DateTime, default=now_utc, onupdate=now_utc)

    tenant = relationship("Tenant", back_populates="users")
    conversations = relationship("AgentConversation", back_populates="user")


class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    key_hash = Column(String(255), nullable=False)
    key_prefix = Column(String(20), nullable=False)
    name = Column(String(100), nullable=False)
    permissions = Column(JSON, default=list)  # ["read", "write", "agent"]
    last_used_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=now_utc)

    tenant = relationship("Tenant", back_populates="api_keys")


class Client(Base):
    __tablename__ = "clients"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    company = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    tax_number = Column(String(100), nullable=True)
    payment_terms_days = Column(Integer, default=30)
    credit_limit = Column(Float, default=100000.0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=now_utc)
    updated_at = Column(DateTime, default=now_utc, onupdate=now_utc)

    tenant = relationship("Tenant", back_populates="clients")
    invoices = relationship("Invoice", back_populates="client")


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    client_id = Column(String(36), ForeignKey("clients.id", ondelete="SET NULL"), nullable=True)
    invoice_number = Column(String(100), nullable=False)
    issue_date = Column(DateTime, nullable=False, default=now_utc)
    due_date = Column(DateTime, nullable=False)
    status = Column(String(50), nullable=False, default="draft")  # draft, sent, paid, overdue, cancelled
    subtotal = Column(Float, default=0.0)
    tax_rate = Column(Float, default=0.0)  # e.g., 0.13 for 13% VAT
    tax_amount = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    payment_method = Column(String(100), nullable=True)
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=now_utc)
    updated_at = Column(DateTime, default=now_utc, onupdate=now_utc)

    tenant = relationship("Tenant", back_populates="invoices")
    client = relationship("Client", back_populates="invoices")
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")


class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    invoice_id = Column(String(36), ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False, index=True)
    description = Column(String(255), nullable=False)
    quantity = Column(Float, default=1.0)
    unit_price = Column(Float, default=0.0)
    tax_rate = Column(Float, default=0.0)
    total = Column(Float, default=0.0)

    invoice = relationship("Invoice", back_populates="items")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(100), nullable=False, default="Operations")
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="CNY")
    description = Column(String(255), nullable=True)
    vendor = Column(String(255), nullable=True)
    date = Column(DateTime, nullable=False, default=now_utc)
    payment_method = Column(String(100), default="Bank Transfer")
    receipt_url = Column(String(500), nullable=True)
    tax_deductible = Column(Boolean, default=True)
    status = Column(String(50), default="approved")  # pending, approved, rejected
    created_at = Column(DateTime, default=now_utc)
    updated_at = Column(DateTime, default=now_utc, onupdate=now_utc)

    tenant = relationship("Tenant", back_populates="expenses")


class Income(Base):
    __tablename__ = "income"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    source = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="CNY")
    description = Column(String(255), nullable=True)
    date = Column(DateTime, nullable=False, default=now_utc)
    payment_method = Column(String(100), default="Bank Transfer")
    invoice_id = Column(String(36), ForeignKey("invoices.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=now_utc)

    tenant = relationship("Tenant", back_populates="income_records")


class CashFlowSnapshot(Base):
    __tablename__ = "cash_flow_snapshots"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    snapshot_date = Column(DateTime, nullable=False, default=now_utc)
    cash_in = Column(Float, default=0.0)
    cash_out = Column(Float, default=0.0)
    net_cash = Column(Float, default=0.0)
    ending_balance = Column(Float, default=0.0)
    forecasted_balance_30d = Column(Float, nullable=True)
    forecasted_balance_60d = Column(Float, nullable=True)
    forecasted_balance_90d = Column(Float, nullable=True)
    run_rate = Column(Float, nullable=True)
    runway_months = Column(Float, nullable=True)
    confidence_interval_low = Column(Float, nullable=True)
    confidence_interval_high = Column(Float, nullable=True)
    created_at = Column(DateTime, default=now_utc)

    tenant = relationship("Tenant", back_populates="cash_flow_snapshots")


class AgentConversation(Base):
    __tablename__ = "agent_conversations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), default="New Financial Consultation")
    context = Column(JSON, default=dict)  # session metadata, page source, etc.
    created_at = Column(DateTime, default=now_utc)
    updated_at = Column(DateTime, default=now_utc, onupdate=now_utc)

    tenant = relationship("Tenant", back_populates="conversations")
    user = relationship("User", back_populates="conversations")
    messages = relationship("AgentMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="AgentMessage.created_at")


class AgentMessage(Base):
    __tablename__ = "agent_messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(36), ForeignKey("agent_conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    sender = Column(String(50), nullable=False)  # user, agent, system
    specialist = Column(String(50), nullable=True)  # orchestrator, cashflow, financing, analyst, invoice, tax
    content = Column(Text, nullable=False)
    tool_calls = Column(JSON, default=list)  # [{tool_name, arguments, result}]
    citations = Column(JSON, default=list)   # data sources, invoice IDs, etc.
    guardrail_flags = Column(JSON, default=list)  # safety checks passed/warned
    created_at = Column(DateTime, default=now_utc)

    conversation = relationship("AgentConversation", back_populates="messages")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), nullable=True)
    action = Column(String(100), nullable=False)  # e.g., create_invoice, run_agent_tool
    resource_type = Column(String(100), nullable=False)  # invoice, agent, expense
    resource_id = Column(String(36), nullable=True)
    details = Column(JSON, default=dict)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=now_utc)

    tenant = relationship("Tenant", back_populates="audit_logs")
