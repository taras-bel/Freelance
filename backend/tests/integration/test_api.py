"""
Integration tests for API endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.crud_utils import create_user
from app.schemas import UserCreate


class TestAuthEndpoints:
    """Test authentication endpoints."""

    def test_register_user(self, client: TestClient, test_user_data: dict):
        """Test user registration."""
        response = client.post("/api/v1/auth/register", json=test_user_data)
        if response.status_code != 201:
            print("Registration error detail:", response.json())
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == test_user_data["email"]
        assert data["username"] == test_user_data["username"]
        assert "password" not in data

    def test_register_user_duplicate_email(self, client: TestClient, test_user_data: dict):
        """Test registration with duplicate email."""
        # Register first user
        client.post("/api/v1/auth/register", json=test_user_data)

        # Try to register with same email
        duplicate_data = test_user_data.copy()
        duplicate_data["username"] = "different_username"
        response = client.post("/api/v1/auth/register", json=duplicate_data)

        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]

    def test_register_user_duplicate_username(self, client: TestClient, test_user_data: dict):
        """Test registration with duplicate username."""
        # Register first user
        client.post("/api/v1/auth/register", json=test_user_data)

        # Try to register with same username
        duplicate_data = test_user_data.copy()
        duplicate_data["email"] = "different@example.com"
        response = client.post("/api/v1/auth/register", json=duplicate_data)

        assert response.status_code == 400
        assert "Username already taken" in response.json()["detail"]

    def test_login_user(self, client: TestClient, test_user_data: dict):
        """Test user login."""
        # Register user first
        client.post("/api/v1/auth/register", json=test_user_data)

        # Login
        login_data = {
            "email": test_user_data["email"],
            "password": test_user_data["password"],
        }
        response = client.post("/api/v1/auth/login", json=login_data)

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "user" in data

    def test_login_user_invalid_credentials(self, client: TestClient, test_user_data: dict):
        """Test login with invalid credentials."""
        # Register user first
        client.post("/api/v1/auth/register", json=test_user_data)

        # Try to login with wrong password
        login_data = {"email": test_user_data["email"], "password": "wrongpassword"}
        response = client.post("/api/v1/auth/login", json=login_data)

        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]

    def test_get_current_user(self, client: TestClient, test_user_data: dict):
        """Test getting current user."""
        # Register and login user
        client.post("/api/v1/auth/register", json=test_user_data)

        login_data = {
            "email": test_user_data["email"],
            "password": test_user_data["password"],
        }
        login_response = client.post("/api/v1/auth/login", json=login_data)
        token = login_response.json()["access_token"]

        # Get current user
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/v1/auth/me", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user_data["email"]
        assert data["username"] == test_user_data["username"]


class TestTaskEndpoints:
    """Test task endpoints."""

    def test_create_task(self, client: TestClient, test_user_data: dict, test_task_data: dict):
        """Test task creation."""
        # Register and login user
        client.post("/api/v1/auth/register", json=test_user_data)

        login_data = {
            "email": test_user_data["email"],
            "password": test_user_data["password"],
        }
        login_response = client.post("/api/v1/auth/login", json=login_data)
        token = login_response.json()["access_token"]

        # Create task
        headers = {"Authorization": f"Bearer {token}"}
        response = client.post("/api/v1/tasks", json=test_task_data, headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == test_task_data["title"]
        assert data["description"] == test_task_data["description"]
        assert data["category"] == test_task_data["category"]

    def test_get_tasks(self, client: TestClient, test_user_data: dict, test_task_data: dict):
        """Test getting tasks."""
        # Register and login user
        client.post("/api/v1/auth/register", json=test_user_data)

        login_data = {
            "email": test_user_data["email"],
            "password": test_user_data["password"],
        }
        login_response = client.post("/api/v1/auth/login", json=login_data)
        token = login_response.json()["access_token"]

        # Create a task
        headers = {"Authorization": f"Bearer {token}"}
        client.post("/api/v1/tasks", json=test_task_data, headers=headers)

        # Get tasks
        response = client.get("/api/v1/tasks", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0

    def test_get_task_by_id(self, client: TestClient, test_user_data: dict, test_task_data: dict):
        """Test getting task by ID."""
        # Register and login user
        client.post("/api/v1/auth/register", json=test_user_data)

        login_data = {
            "email": test_user_data["email"],
            "password": test_user_data["password"],
        }
        login_response = client.post("/api/v1/auth/login", json=login_data)
        token = login_response.json()["access_token"]

        # Create a task
        headers = {"Authorization": f"Bearer {token}"}
        create_response = client.post("/api/v1/tasks", json=test_task_data, headers=headers)
        task_id = create_response.json()["id"]

        # Get task by ID
        response = client.get(f"/api/v1/tasks/{task_id}", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == task_id
        assert data["title"] == test_task_data["title"]


class TestHealthEndpoints:
    """Test health check endpoints."""

    def test_root_endpoint(self, client: TestClient):
        """Test root endpoint."""
        response = client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        assert "environment" in data

    def test_health_check(self, client: TestClient):
        """Test health check endpoint."""
        response = client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert "version" in data

    def test_detailed_health_check(self, client: TestClient):
        """Test detailed health check endpoint."""
        response = client.get("/health/detailed")

        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "database" in data
        assert "timestamp" in data
