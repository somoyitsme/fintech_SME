import numpy as np
import pandas as pd
from datetime import datetime, timedelta, timezone
from typing import Any
from sqlalchemy.orm import Session
from app.db.models import CashFlowSnapshot, Invoice, Expense, Income

def calculate_cash_flow_metrics(db: Session, tenant_id: str) -> dict[str, Any]:
    """Calculates real-time burn rate, current balance, and runway months."""
    latest_snapshot = (
        db.query(CashFlowSnapshot)
        .filter_by(tenant_id=tenant_id)
        .order_by(CashFlowSnapshot.snapshot_date.desc())
        .first()
    )
    current_balance = latest_snapshot.ending_balance if latest_snapshot else 500000.0

    # Calculate 90-day expenses to derive monthly burn rate
    now = datetime.now(timezone.utc)
    ninety_days_ago = now - timedelta(days=90)
    
    expenses_past_90d = (
        db.query(Expense)
        .filter(Expense.tenant_id == tenant_id, Expense.date >= ninety_days_ago)
        .all()
    )
    total_expenses = sum(e.amount for e in expenses_past_90d)
    monthly_burn_rate = (total_expenses / 3.0) if expenses_past_90d else 250000.0

    runway_months = round(current_balance / monthly_burn_rate, 1) if monthly_burn_rate > 0 else 999.0

    return {
        "current_balance": round(current_balance, 2),
        "monthly_burn_rate": round(monthly_burn_rate, 2),
        "runway_months": runway_months,
        "as_of_date": now.isoformat()
    }

def forecast_cash_flow(db: Session, tenant_id: str, days: int = 60) -> dict[str, Any]:
    """Generates daily cash flow projections, confidence intervals, and dip detection."""
    metrics = calculate_cash_flow_metrics(db, tenant_id)
    current_balance = metrics["current_balance"]
    daily_burn = metrics["monthly_burn_rate"] / 30.0

    # Fetch pending & overdue invoices (expected receivables)
    open_invoices = (
        db.query(Invoice)
        .filter(Invoice.tenant_id == tenant_id, Invoice.status.in_(["sent", "overdue"]))
        .all()
    )

    now = datetime.now(timezone.utc)
    daily_projections = []
    running_balance = current_balance
    safety_threshold = 300000.0
    liquidity_dip_day = None
    min_projected_balance = current_balance

    for day in range(1, days + 1):
        target_date = now + timedelta(days=day)
        
        # Base daily cash out (burn) + weekend variance
        day_out = daily_burn * (0.8 if target_date.weekday() >= 5 else 1.08)
        
        # Check if any invoices are scheduled/expected to be collected on this day
        day_in = 0.0
        for inv in open_invoices:
            # If due date falls roughly near this day or is overdue and being collected
            due_delta = (inv.due_date.replace(tzinfo=timezone.utc) if inv.due_date.tzinfo is None else inv.due_date) - now
            if int(due_delta.days) == day:
                # 85% probability weighting for timely collection
                day_in += inv.total * 0.85
            elif inv.status == "overdue" and day == 14:
                # Assume overdue invoices are recovered around day 14 if pursued
                day_in += inv.total * 0.70

        running_balance = running_balance + day_in - day_out
        
        # Compute statistical confidence intervals (± standard deviation growing with sqrt(days))
        sigma = daily_burn * 0.25 * np.sqrt(day)
        conf_low = max(0.0, running_balance - (1.96 * sigma))
        conf_high = running_balance + (1.96 * sigma)

        if running_balance < safety_threshold and liquidity_dip_day is None:
            liquidity_dip_day = day

        if running_balance < min_projected_balance:
            min_projected_balance = running_balance

        daily_projections.append({
            "day": day,
            "date": target_date.strftime("%Y-%m-%d"),
            "projected_balance": round(running_balance, 2),
            "projected_cash_in": round(day_in, 2),
            "projected_cash_out": round(day_out, 2),
            "confidence_low": round(conf_low, 2),
            "confidence_high": round(conf_high, 2)
        })

    return {
        "tenant_id": tenant_id,
        "forecast_horizon_days": days,
        "current_balance": current_balance,
        "monthly_burn_rate": metrics["monthly_burn_rate"],
        "runway_months": metrics["runway_months"],
        "safety_threshold": safety_threshold,
        "liquidity_dip_day": liquidity_dip_day,
        "min_projected_balance": round(min_projected_balance, 2),
        "danger_detected": liquidity_dip_day is not None,
        "daily_projections": daily_projections
    }
