import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "DocuMind" in data["message"]

def test_auth_login_and_me_integration():
    # Attempt login with default seeded admin credentials
    login_payload = {
        "email": "admin@documind.ai",
        "password": "AdminPass123!"
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    token_data = response.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # Call /api/auth/me with bearer token
    headers = {"Authorization": f"Bearer {token}"}
    me_response = client.get("/api/auth/me", headers=headers)
    assert me_response.status_code == 200
    user_info = me_response.json()
    assert user_info["email"] == "admin@documind.ai"

def test_unauthenticated_protected_route():
    response = client.get("/api/documents")
    assert response.status_code == 401
