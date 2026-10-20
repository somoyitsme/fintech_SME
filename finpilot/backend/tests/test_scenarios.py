from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_scenario_a_cashflow_dip_alert():
    """Scenario A: User asks about cash flow runway; agent detects Day 45 dip and alerts."""
    res = client.post("/api/v1/agent/chat", json={
        "message": "Can you analyze our cash flow runway and let me know if we face any deficit soon?"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["specialist"] == "cashflow"
    assert "842,500" in data["content"] or "Balance" in data["content"]
    assert len(data["tool_calls"]) >= 1

def test_scenario_b_ar_overdue_reminders():
    """Scenario B: User asks about overdue invoices; agent finds overdue list and provides collection plan."""
    res = client.post("/api/v1/agent/chat", json={
        "message": "Which clients have overdue invoices and how much do they owe?"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["specialist"] == "invoice"
    assert "Overdue" in data["content"]
    assert "Greater Bay" in data["content"] or "overdue" in data["content"].lower()

def test_scenario_c_webank_financing_recommendation():
    """Scenario C: User asks for working capital loan options; agent recommends WeBank Weiyedai and factoring."""
    res = client.post("/api/v1/agent/chat", json={
        "message": "We need 300,000 CNY in working capital to bridge our inventory. What financing or loan options fit us?"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["specialist"] == "financing"
    assert "WeBank" in data["content"] or "Weiyedai" in data["content"]
    assert "92%" in data["content"] or "Pre-Approved" in data["content"] or "Revolving" in data["content"]

def test_scenario_d_widget_chat_with_api_key():
    """Scenario D: External platform invokes Copilot through the widget SDK with an API key."""
    res = client.post(
        "/api/v1/widget/chat",
        headers={"X-API-Key": "fp_test_demo123456789abcdef"},
        json={"message": "What is our company financial health score?"}
    )
    assert res.status_code == 200
    data = res.json()
    assert "content" in data
    assert len(data["content"]) > 100
