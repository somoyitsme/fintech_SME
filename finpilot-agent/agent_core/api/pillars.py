from typing import Optional, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from agent_core.db.database import get_db
from agent_core.db.models import Tenant, ApiKey
from agent_core.security.auth import get_tenant_from_api_key
from agent_core.engine.tools.pillars_engine import (
    calculate_cash_flow_forecast,
    run_what_if_scenario,
    match_financing_options,
    analyze_financials,
    track_invoices,
    draft_payment_reminder,
    calculate_tax_and_compliance
)

router = APIRouter(prefix="/pillars", tags=["5 Pillars Financial Intelligence"])

# --- PILLAR 1: Cash Flow & What-If ---
class ForecastRequest(BaseModel):
    current_balance: Optional[float] = 385000.0
    daily_base_revenue: Optional[float] = 28500.0
    days: Optional[int] = 90
    safety_buffer: Optional[float] = 50000.0

class WhatIfRequest(BaseModel):
    current_balance: Optional[float] = 385000.0
    daily_base_revenue: Optional[float] = 28500.0
    days: Optional[int] = 90
    scenario_changes: list[dict] = Field(default_factory=list)

@router.post("/cashflow/forecast")
def get_cash_flow_forecast(payload: ForecastRequest = ForecastRequest()):
    return calculate_cash_flow_forecast(
        current_balance=payload.current_balance,
        daily_base_revenue=payload.daily_base_revenue,
        days=payload.days,
        safety_buffer=payload.safety_buffer
    )

@router.post("/cashflow/what-if")
def get_what_if_scenario(payload: WhatIfRequest):
    return run_what_if_scenario(
        base_params={
            "current_balance": payload.current_balance,
            "daily_base_revenue": payload.daily_base_revenue,
            "days": payload.days
        },
        scenario_changes=payload.scenario_changes
    )

# --- PILLAR 2: Financing Option Matching ---
class FinancingMatchRequest(BaseModel):
    business_type: Optional[str] = "Computer Wholesale & Retail"
    years_in_operation: Optional[float] = 2.5
    monthly_revenue: Optional[float] = 850000.0
    monthly_expenses: Optional[float] = 720000.0
    existing_debt: Optional[float] = 150000.0
    has_collateral: Optional[bool] = False
    number_of_employees: Optional[int] = 6
    tax_registration: Optional[bool] = True
    digital_payment_history: Optional[bool] = True
    amount_needed: Optional[float] = 500000.0
    purpose_of_loan: Optional[str] = "Bulk GPU container inventory expansion"

@router.post("/financing/match")
def match_financing(payload: FinancingMatchRequest = FinancingMatchRequest()):
    return match_financing_options(payload.model_dump())

# --- PILLAR 3: Health Analysis & P&L ---
class HealthAnalysisRequest(BaseModel):
    revenue_items: Optional[list[dict]] = None
    expense_items: Optional[list[dict]] = None
    period: Optional[str] = "September 2026"
    industry: Optional[str] = "Computer Wholesale & Retail"

@router.post("/health/analyze")
def analyze_health(payload: HealthAnalysisRequest = HealthAnalysisRequest()):
    return analyze_financials(
        revenue_items=payload.revenue_items,
        expense_items=payload.expense_items,
        period=payload.period,
        industry=payload.industry
    )

# --- PILLAR 4: Accounts Receivable & Invoices ---
class TrackInvoicesRequest(BaseModel):
    invoices: Optional[list[dict]] = None

class DraftReminderRequest(BaseModel):
    invoice_data: dict
    tone: Optional[str] = "firm"
    channel: Optional[str] = "email"

@router.post("/invoices/track")
def get_invoices_intelligence(payload: TrackInvoicesRequest = TrackInvoicesRequest()):
    return track_invoices(payload.invoices)

@router.post("/invoices/draft-reminder")
def draft_reminder(payload: DraftReminderRequest):
    return draft_payment_reminder(
        invoice_data=payload.invoice_data,
        tone=payload.tone or "firm",
        channel=payload.channel or "email"
    )

# --- PILLAR 5: Tax & NBR Compliance ---
class TaxComplianceRequest(BaseModel):
    annual_turnover: Optional[float] = 8500000.0
    annual_deductible_expenses: Optional[float] = 6800000.0

@router.post("/tax/compliance")
def get_tax_compliance(payload: TaxComplianceRequest = TaxComplianceRequest()):
    return calculate_tax_and_compliance(
        annual_turnover=payload.annual_turnover or 8500000.0,
        annual_deductible_expenses=payload.annual_deductible_expenses or 6800000.0
    )
