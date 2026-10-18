"""Test deterministic tool calculations."""
import pytest
from decimal import Decimal
from datetime import date, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models import Tenant, BankAccount, Expense, Invoice
from app.tools.cashflow import compute_burn_rate, project_cash_flow_30_60_90
from app.tools.financing import webank_prequalification_score


@pytest.fixture
async def test_tenant(db: AsyncSession):
    """Create test tenant with financial data."""
    tenant = Tenant(name="Test SME", currency="CNY", country="CN")
    db.add(tenant)
    await db.flush()

    # Bank account
    bank = BankAccount(
        tenant_id=tenant.id,
        account_name="Test Account",
        balance=Decimal("500000"),
        currency="CNY",
        as_of=date.today(),
    )
    db.add(bank)

    # Expenses (30-day trailing)
    for i in range(30):
        expense = Expense(
            tenant_id=tenant.id,
            category="Operating",
            amount=Decimal("15000"),
            expense_date=date.today() - timedelta(days=i),
        )
        db.add(expense)

    await db.commit()
    return tenant


@pytest.mark.asyncio
async def test_burn_rate_calculation(db: AsyncSession, test_tenant):
    """Burn rate calculation is deterministic."""
    result1 = await compute_burn_rate(test_tenant.id, db, {"days": 30})
    result2 = await compute_burn_rate(test_tenant.id, db, {"days": 30})

    # Results must be identical
    assert result1 == result2

    # Verify calculation
    # 30 expenses × ¥15,000 = ¥450,000 total
    # Daily burn = ¥450,000 / 30 = ¥15,000
    assert result1["daily_burn_rate"] == 15000.0
    assert result1["monthly_burn_rate"] == 450000.0

    # Runway = ¥500,000 / ¥15,000/day ≈ 33.3 days ≈ 1.1 months
    assert result1["runway_days"] == pytest.approx(33.3, rel=0.01)
    assert result1["runway_months"] == 1.1


@pytest.mark.asyncio
async def test_webank_score_deterministic(db: AsyncSession, test_tenant):
    """WeBank score returns identical results."""
    score1 = await webank_prequalification_score(test_tenant.id, db, {})
    score2 = await webank_prequalification_score(test_tenant.id, db, {})

    assert score1 == score2
    assert score1["score"] >= 0
    assert score1["score"] <= 100


@pytest.mark.asyncio
async def test_cash_flow_projection_structure(db: AsyncSession, test_tenant):
    """Cash flow projection returns correct structure."""
    result = await project_cash_flow_30_60_90(test_tenant.id, db, {})

    assert "current_balance" in result
    assert "projections" in result
    assert len(result["projections"]) == 3

    for proj in result["projections"]:
        assert "period" in proj
        assert "inflows" in proj
        assert "outflows" in proj
        assert "net" in proj
        assert "ending_balance" in proj
