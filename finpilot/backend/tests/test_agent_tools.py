import pytest
from app.db.database import SessionLocal
from app.db.models import Tenant
from app.agent.tools import execute_tool, TOOL_REGISTRY

@pytest.fixture
def db_and_tenant():
    db = SessionLocal()
    tenant = db.query(Tenant).first()
    yield db, tenant
    db.close()

def test_all_20_tools_registered():
    assert len(TOOL_REGISTRY) >= 20

def test_tool_get_cash_flow_metrics(db_and_tenant):
    db, tenant = db_and_tenant
    result = execute_tool("get_cash_flow_metrics", {}, db, tenant)
    assert result["status"] == "success"
    assert "current_balance" in result
    assert result["current_balance"] > 0
    assert "runway_months" in result

def test_tool_forecast_cash_flow(db_and_tenant):
    db, tenant = db_and_tenant
    result = execute_tool("forecast_cash_flow", {"days": 60}, db, tenant)
    assert result["status"] == "success"
    assert result["horizon_days"] == 60
    assert "danger_detected" in result

def test_tool_get_overdue_invoices(db_and_tenant):
    db, tenant = db_and_tenant
    result = execute_tool("get_overdue_invoices", {}, db, tenant)
    assert result["status"] == "success"
    assert result["overdue_count"] >= 1
    assert result["total_overdue_amount"] > 0

def test_tool_match_financing_options(db_and_tenant):
    db, tenant = db_and_tenant
    result = execute_tool("match_financing_options", {"amount_needed": 500000}, db, tenant)
    assert result["status"] == "success"
    assert len(result["recommended_products"]) >= 3
    # Verify WeBank Weiyedai is returned
    has_webank = any("weiyedai" in p["id"] for p in result["recommended_products"])
    assert has_webank is True

def test_tool_get_financial_health_score(db_and_tenant):
    db, tenant = db_and_tenant
    result = execute_tool("get_financial_health_score", {}, db, tenant)
    assert result["status"] == "success"
    assert 0 <= result["health_score"] <= 100
    assert "grade" in result
