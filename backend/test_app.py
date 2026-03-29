import pytest
from fastapi.testclient import TestClient
from main import app
from database import Base, engine

client = TestClient(app)


# Reset database before each test so tests don't affect each other
@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


# --- Helper functions ---
def register(email, password, is_admin=False):
    return client.post("/auth/register", json={
        "email": email,
        "password": password,
        "is_admin": is_admin
    })

def login(email, password):
    return client.post("/auth/login", data={
        "username": email,
        "password": password
    })

def get_token(email, password):
    res = login(email, password)
    return res.json()["access_token"]

def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# --- Auth tests ---
def test_register_success():
    res = register("lian@test.com", "123456")
    assert res.status_code == 201
    assert res.json()["message"] == "User created successfully"


def test_register_duplicate_email():
    register("lian@test.com", "123456")
    res = register("lian@test.com", "654321")
    assert res.status_code == 400
    assert "already registered" in res.json()["detail"]


def test_login_success():
    register("lian@test.com", "123456")
    res = login("lian@test.com", "123456")
    assert res.status_code == 200
    assert "access_token" in res.json()


def test_login_wrong_password():
    register("lian@test.com", "123456")
    res = login("lian@test.com", "wrongpassword")
    assert res.status_code == 401


# --- Ticket tests ---
def test_submit_ticket():
    register("lian@test.com", "123456")
    token = get_token("lian@test.com", "123456")
    res = client.post("/tickets/", json={
        "title": "My screen is broken",
        "description": "Cracked screen after drop",
        "category": "hardware"
    }, headers=auth_headers(token))
    assert res.status_code == 201
    assert res.json()["title"] == "My screen is broken"
    assert res.json()["status"] == "open"


def test_user_sees_only_own_tickets():
    # Two users each submit a ticket
    register("user1@test.com", "123456")
    register("user2@test.com", "123456")
    token1 = get_token("user1@test.com", "123456")
    token2 = get_token("user2@test.com", "123456")

    client.post("/tickets/", json={"title": "User1 issue", "description": "desc", "category": "general"}, headers=auth_headers(token1))
    client.post("/tickets/", json={"title": "User2 issue", "description": "desc", "category": "general"}, headers=auth_headers(token2))

    res = client.get("/tickets/my", headers=auth_headers(token1))
    assert res.status_code == 200
    assert len(res.json()) == 1
    assert res.json()[0]["title"] == "User1 issue"


def test_admin_sees_all_tickets():
    register("user@test.com", "123456")
    register("admin@test.com", "123456", is_admin=True)
    user_token = get_token("user@test.com", "123456")
    admin_token = get_token("admin@test.com", "123456")

    client.post("/tickets/", json={"title": "A ticket", "description": "desc", "category": "general"}, headers=auth_headers(user_token))

    res = client.get("/tickets/all", headers=auth_headers(admin_token))
    assert res.status_code == 200
    assert len(res.json()) == 1


def test_regular_user_cannot_see_all_tickets():
    register("user@test.com", "123456")
    token = get_token("user@test.com", "123456")
    res = client.get("/tickets/all", headers=auth_headers(token))
    assert res.status_code == 403


def test_admin_can_update_ticket():
    register("user@test.com", "123456")
    register("admin@test.com", "123456", is_admin=True)
    user_token = get_token("user@test.com", "123456")
    admin_token = get_token("admin@test.com", "123456")

    ticket = client.post("/tickets/", json={"title": "Issue", "description": "desc", "category": "software"}, headers=auth_headers(user_token))
    ticket_id = ticket.json()["id"]

    res = client.patch(f"/tickets/{ticket_id}", json={"status": "in_progress", "priority": "high"}, headers=auth_headers(admin_token))
    assert res.status_code == 200
    assert res.json()["status"] == "in_progress"
    assert res.json()["priority"] == "high"


def test_user_cannot_update_ticket():
    register("user@test.com", "123456")
    token = get_token("user@test.com", "123456")

    ticket = client.post("/tickets/", json={"title": "Issue", "description": "desc", "category": "software"}, headers=auth_headers(token))
    ticket_id = ticket.json()["id"]

    res = client.patch(f"/tickets/{ticket_id}", json={"status": "resolved"}, headers=auth_headers(token))
    assert res.status_code == 403