import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "finpilot-backend"}

def test_login_demo_admin():
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@nebulatech.cn",
        "password": "Admin123456!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "admin@nebulatech.cn"
    assert data["tenant"]["company_name"] in ["Dhaka Silicon & Hardware Ltd.", "Shenzhen Nebula Tech Co., Ltd."]

def test_auth_me():
    # Login first
    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@nebulatech.cn",
        "password": "Admin123456!"
    })
    token = login_res.json()["access_token"]
    
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    data = me_res.json()
    assert data["tenant"]["company_name"] in ["Dhaka Silicon & Hardware Ltd.", "Shenzhen Nebula Tech Co., Ltd."]
    assert data["user"]["role"] == "admin"

def test_create_and_list_api_keys():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@nebulatech.cn",
        "password": "Admin123456!"
    })
    token = login_res.json()["access_token"]

    create_res = client.post(
        "/api/v1/auth/api-keys",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": "Test SDK Key", "permissions": ["read", "agent"]}
    )
    assert create_res.status_code == 200
    created_data = create_res.json()
    assert "raw_key" in created_data
    assert created_data["raw_key"].startswith("fp_live_")

    list_res = client.get("/api/v1/auth/api-keys", headers={"Authorization": f"Bearer {token}"})
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1
