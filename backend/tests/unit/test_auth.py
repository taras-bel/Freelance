"""
Unit tests for authentication module.
"""

import pytest
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    verify_token,
    validate_password_strength,
)
from app.crud_utils import create_user, get_user_by_email
from app.schemas import UserCreate


class TestPasswordHashing:
    """Test password hashing functions."""

    def test_get_password_hash(self):
        """Test password hashing."""
        password = "testpassword123"
        hashed = get_password_hash(password)

        assert hashed != password
        assert len(hashed) > len(password)
        assert hashed.startswith("$2b$")

    def test_verify_password(self):
        """Test password verification."""
        password = "testpassword123"
        hashed = get_password_hash(password)

        assert verify_password(password, hashed) is True
        assert verify_password("wrongpassword", hashed) is False

    def test_validate_password_strength(self):
        """Test password strength validation."""
        # Valid password
        assert validate_password_strength("TestPass123!") is True

        # Invalid passwords
        assert validate_password_strength("short") is False  # Too short
        assert validate_password_strength("nouppercase123!") is False  # No uppercase
        assert validate_password_strength("NOLOWERCASE123!") is False  # No lowercase
        assert validate_password_strength("NoDigits!") is False  # No digits
        assert validate_password_strength("NoSpecial123") is False  # No special chars


class TestJWTTokens:
    """Test JWT token functions."""

    def test_create_access_token(self):
        """Test access token creation."""
        data = {"sub": "test@example.com"}
        token = create_access_token(data)

        assert isinstance(token, str)
        assert len(token) > 0

    def test_verify_token(self):
        """Test token verification."""
        data = {"sub": "test@example.com"}
        token = create_access_token(data)

        payload = verify_token(token)
        assert payload["sub"] == "test@example.com"

    def test_verify_invalid_token(self):
        """Test invalid token verification."""
        with pytest.raises(HTTPException) as exc_info:
            verify_token("invalid_token")

        assert exc_info.value.status_code == 401


class TestUserAuthentication:
    """Test user authentication functions."""

    def test_create_user(self, db_session: Session, test_user_data: dict):
        """Test user creation."""
        user_create = UserCreate(**test_user_data)
        user = create_user(db_session, user_create)

        assert user.email == test_user_data["email"]
        assert user.username == test_user_data["username"]
        assert user.hashed_password != test_user_data["password"]
        assert verify_password(test_user_data["password"], user.hashed_password)

    def test_get_user_by_email(self, db_session: Session, test_user_data: dict):
        """Test getting user by email."""
        # Create user first
        user_create = UserCreate(**test_user_data)
        created_user = create_user(db_session, user_create)

        # Get user by email
        user = get_user_by_email(db_session, email=test_user_data["email"])

        assert user is not None
        assert user.id == created_user.id
        assert user.email == test_user_data["email"]

    def test_get_user_by_email_not_found(self, db_session: Session):
        """Test getting non-existent user by email."""
        user = get_user_by_email(db_session, email="nonexistent@example.com")
        assert user is None
