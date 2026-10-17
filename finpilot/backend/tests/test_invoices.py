from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_auth_token():
    res = client.post("/api/v1/auth/login", json={
        "email": "admin@nebulatech.cn",
        "password": "Admin123456!"
    })
    return res.json()["access_token"]

def test_list_invoices():
    token = get_auth_token()
    res = client.get("/api/v1/invoices", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    invoices = res.json()
    assert len(invoices) >= 5
    # Verify overdue calculation exists
    overdue_invs = [inv for inv in invoices if inv["status"] == "overdue"]
    assert len(overdue_invs) >= 1
    assert overdue_invs[0]["days_overdue"] > 0

def test_invoice_pdf_generation():
    token = get_auth_token()
    list_res = client.get("/api/v1/invoices", headers={"Authorization": f"Bearer {token}"})
    invoice_id = list_res.json()[0]["id"]

    pdf_res = client.get(f"/api/v1/invoices/{invoice_id}/pdf", headers={"Authorization": f"Bearer {token}"})
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert len(pdf_res.content) > 1000  # valid binary PDF bytes

def test_send_invoice_reminder():
    token = get_auth_token()
    list_res = client.get("/api/v1/invoices?status=overdue", headers={"Authorization": f"Bearer {token}"})
    overdue_id = list_res.json()[0]["id"]

    reminder_res = client.post(
        f"/api/v1/invoices/{overdue_id}/reminder?tone=firm",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert reminder_res.status_code == 200
    data = reminder_res.json()
    assert "draft" in data
    assert "URGENT" in data["draft"]["subject"] or "Payment Reminder" in data["draft"]["subject"]
