"""Pydantic v2 request/response schemas."""
from datetime import date, datetime
from decimal import Decimal
from typing import Literal, Optional

from pydantic import BaseModel, Field, ConfigDict


class TenantBase(BaseModel):
    name: str = Field(max_length=255)
    domain: Optional[str] = Field(None, max_length=255)
    country: str = Field(default="CN", max_length=2)
    currency: str = Field(default="CNY", max_length=3)
    industry: Optional[str] = Field(None, max_length=100)
    settings: dict = Field(default_factory=dict)


class TenantResponse(TenantBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    updated_at: datetime


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=8000)
    conversation_id: Optional[str] = None


class ChatStatusEvent(BaseModel):
    type: Literal["status", "complete", "error"] = "status"
    message: Optional[str] = None
    content: Optional[str] = None
    error: Optional[str] = None


class ChatResponse(BaseModel):
    conversation_id: str
    response: str
    pillar: Optional[str] = None
    tools_used: list[str] = Field(default_factory=list)
    requires_approval: bool = False
    pending_action_id: Optional[str] = None
    created_at: datetime


class InvoiceBase(BaseModel):
    invoice_number: str = Field(max_length=100)
    customer_name: str = Field(max_length=255)
    amount: Decimal = Field(ge=0)
    tax_rate: Decimal = Field(ge=0, le=1, default=Decimal("0.13"))
    currency: str = Field(default="CNY", max_length=3)
    issue_date: date
    due_date: date
    status: Literal["pending", "paid", "overdue"] = "pending"


class InvoiceResponse(InvoiceBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_id: str
    created_at: datetime


class ExpenseBase(BaseModel):
    category: str = Field(max_length=100)
    vendor: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    amount: Decimal = Field(ge=0)
    currency: str = Field(default="CNY", max_length=3)
    expense_date: date
    is_recurring: bool = False
    is_deductible: bool = True


class ExpenseResponse(ExpenseBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_id: str
    created_at: datetime


class SyncRequest(BaseModel):
    """Data sync payload from external SME sites."""
    invoices: list[InvoiceBase] = Field(default_factory=list)
    expenses: list[ExpenseBase] = Field(default_factory=list)


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_id: str
    action: str
    resource_type: Optional[str]
    permission_tier: Optional[str]
    outcome: Literal["ok", "blocked", "error"]
    details: dict
    ip_address: Optional[str]
    created_at: datetime
