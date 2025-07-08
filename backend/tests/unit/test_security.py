"""
Unit tests for security functionality.
"""

import pytest
import time
from unittest.mock import Mock, patch
from fastapi import HTTPException

from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    verify_token,
    validate_password_strength,
    hash_password,
    verify_password_hash,
    generate_secure_token,
    validate_email_format,
    sanitize_input,
    check_rate_limit,
    validate_file_upload,
    check_sql_injection,
    validate_xss_input
)


class TestPasswordSecurity:
    """Test password security functions."""

    def test_password_hashing_consistency(self):
        """Test that password hashing is consistent."""
        password = "testpassword123"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        
        # Hashes should be different (due to salt)
        assert hash1 != hash2
        
        # But both should verify correctly
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True

    def test_password_verification(self):
        """Test password verification."""
        password = "testpassword123"
        hashed = get_password_hash(password)
        
        assert verify_password(password, hashed) is True
        assert verify_password("wrongpassword", hashed) is False
        assert verify_password("", hashed) is False
        assert verify_password(password, "") is False

    def test_password_strength_validation(self):
        """Test password strength validation."""
        # Valid passwords
        assert validate_password_strength("TestPass123!") is True
        assert validate_password_strength("StrongP@ssw0rd") is True
        assert validate_password_strength("MySecureP@ss1") is True
        
        # Invalid passwords
        assert validate_password_strength("short") is False  # Too short
        assert validate_password_strength("nouppercase123!") is False  # No uppercase
        assert validate_password_strength("NOLOWERCASE123!") is False  # No lowercase
        assert validate_password_strength("NoDigits!") is False  # No digits
        assert validate_password_strength("NoSpecial123") is False  # No special chars
        assert validate_password_strength("") is False  # Empty
        assert validate_password_strength("123456789") is False  # Only digits
        assert validate_password_strength("abcdefgh") is False  # Only lowercase

    def test_password_strength_edge_cases(self):
        """Test password strength edge cases."""
        # Minimum length
        assert validate_password_strength("Abc123!") is True  # Exactly 7 chars
        assert validate_password_strength("Abc12!") is False  # 6 chars
        
        # Maximum length (if implemented)
        long_password = "A" * 100 + "b" * 100 + "1" * 100 + "!" * 100
        assert validate_password_strength(long_password) is True

    def test_hash_password_function(self):
        """Test hash_password function."""
        password = "testpassword"
        hashed = hash_password(password)
        
        assert hashed != password
        assert len(hashed) > len(password)
        assert hashed.startswith("$2b$")

    def test_verify_password_hash_function(self):
        """Test verify_password_hash function."""
        password = "testpassword"
        hashed = hash_password(password)
        
        assert verify_password_hash(password, hashed) is True
        assert verify_password_hash("wrong", hashed) is False


class TestJWTTokenSecurity:
    """Test JWT token security functions."""

    def test_create_access_token(self):
        """Test access token creation."""
        data = {"sub": "test@example.com", "user_id": 1}
        token = create_access_token(data)
        
        assert isinstance(token, str)
        assert len(token) > 0
        assert "." in token  # JWT format

    def test_verify_token_valid(self):
        """Test valid token verification."""
        data = {"sub": "test@example.com", "user_id": 1}
        token = create_access_token(data)
        
        payload = verify_token(token)
        assert payload["sub"] == "test@example.com"
        assert payload["user_id"] == 1

    def test_verify_token_invalid(self):
        """Test invalid token verification."""
        with pytest.raises(HTTPException) as exc_info:
            verify_token("invalid_token")
        
        assert exc_info.value.status_code == 401

    def test_verify_token_expired(self):
        """Test expired token verification."""
        # Create token with very short expiration
        with patch('app.core.security.ACCESS_TOKEN_EXPIRE_MINUTES', 0.001):
            data = {"sub": "test@example.com"}
            token = create_access_token(data)
            
            # Wait for token to expire
            time.sleep(0.1)
            
            with pytest.raises(HTTPException) as exc_info:
                verify_token(token)
            
            assert exc_info.value.status_code == 401

    def test_verify_token_malformed(self):
        """Test malformed token verification."""
        with pytest.raises(HTTPException) as exc_info:
            verify_token("not.a.valid.jwt.token")
        
        assert exc_info.value.status_code == 401

    def test_generate_secure_token(self):
        """Test secure token generation."""
        token = generate_secure_token()
        
        assert isinstance(token, str)
        assert len(token) >= 32  # Should be reasonably long
        assert token != generate_secure_token()  # Should be unique


class TestInputValidation:
    """Test input validation functions."""

    def test_email_format_validation(self):
        """Test email format validation."""
        # Valid emails
        assert validate_email_format("test@example.com") is True
        assert validate_email_format("user.name@domain.co.uk") is True
        assert validate_email_format("test+tag@example.com") is True
        
        # Invalid emails
        assert validate_email_format("invalid-email") is False
        assert validate_email_format("@example.com") is False
        assert validate_email_format("test@") is False
        assert validate_email_format("test@.com") is False
        assert validate_email_format("") is False
        assert validate_email_format("test..test@example.com") is False

    def test_sanitize_input(self):
        """Test input sanitization."""
        # Test HTML sanitization
        dirty_input = "<script>alert('xss')</script>Hello World"
        clean_input = sanitize_input(dirty_input)
        
        assert "<script>" not in clean_input
        assert "Hello World" in clean_input
        
        # Test SQL injection attempt
        sql_input = "'; DROP TABLE users; --"
        clean_sql = sanitize_input(sql_input)
        
        assert "DROP TABLE" not in clean_sql
        assert ";" not in clean_sql

    def test_check_sql_injection(self):
        """Test SQL injection detection."""
        # SQL injection attempts
        assert check_sql_injection("'; DROP TABLE users; --") is True
        assert check_sql_injection("' OR 1=1 --") is True
        assert check_sql_injection("' UNION SELECT * FROM users --") is True
        assert check_sql_injection("admin'--") is True
        
        # Safe inputs
        assert check_sql_injection("normal text") is False
        assert check_sql_injection("user@example.com") is False
        assert check_sql_injection("Hello World") is False
        assert check_sql_injection("") is False

    def test_validate_xss_input(self):
        """Test XSS input validation."""
        # XSS attempts
        assert validate_xss_input("<script>alert('xss')</script>") is False
        assert validate_xss_input("<img src=x onerror=alert('xss')>") is False
        assert validate_xss_input("javascript:alert('xss')") is False
        assert validate_xss_input("<iframe src='http://evil.com'>") is False
        
        # Safe inputs
        assert validate_xss_input("Hello World") is True
        assert validate_xss_input("user@example.com") is True
        assert validate_xss_input("") is True
        assert validate_xss_input("<b>bold text</b>") is True  # Basic HTML might be allowed

    def test_validate_file_upload(self):
        """Test file upload validation."""
        # Valid files
        assert validate_file_upload("document.pdf", 1024) is True
        assert validate_file_upload("image.jpg", 2048) is True
        assert validate_file_upload("script.py", 512) is True
        
        # Invalid files
        assert validate_file_upload("script.exe", 1024) is False  # Executable
        assert validate_file_upload("file.bat", 1024) is False  # Batch file
        assert validate_file_upload("document.pdf", 10485760) is False  # Too large (10MB)
        assert validate_file_upload("", 1024) is False  # Empty filename


class TestRateLimiting:
    """Test rate limiting functionality."""

    def test_check_rate_limit_normal_usage(self):
        """Test rate limiting for normal usage."""
        user_id = 1
        endpoint = "/api/v1/auth/login"
        
        # First few requests should be allowed
        assert check_rate_limit(user_id, endpoint) is True
        assert check_rate_limit(user_id, endpoint) is True
        assert check_rate_limit(user_id, endpoint) is True

    def test_check_rate_limit_exceeded(self):
        """Test rate limiting when exceeded."""
        user_id = 2
        endpoint = "/api/v1/auth/login"
        
        # Simulate many requests
        for _ in range(10):
            check_rate_limit(user_id, endpoint)
        
        # Should be rate limited
        assert check_rate_limit(user_id, endpoint) is False

    def test_check_rate_limit_different_users(self):
        """Test rate limiting for different users."""
        user1 = 1
        user2 = 2
        endpoint = "/api/v1/auth/login"
        
        # User 1 should not affect user 2
        for _ in range(10):
            check_rate_limit(user1, endpoint)
        
        assert check_rate_limit(user2, endpoint) is True

    def test_check_rate_limit_different_endpoints(self):
        """Test rate limiting for different endpoints."""
        user_id = 3
        endpoint1 = "/api/v1/auth/login"
        endpoint2 = "/api/v1/tasks"
        
        # Rate limit on one endpoint should not affect another
        for _ in range(10):
            check_rate_limit(user_id, endpoint1)
        
        assert check_rate_limit(user_id, endpoint2) is True


class TestSecurityEdgeCases:
    """Test security edge cases."""

    def test_empty_inputs(self):
        """Test security functions with empty inputs."""
        assert validate_password_strength("") is False
        assert validate_email_format("") is False
        assert sanitize_input("") == ""
        assert check_sql_injection("") is False
        assert validate_xss_input("") is True

    def test_very_long_inputs(self):
        """Test security functions with very long inputs."""
        long_string = "a" * 10000
        
        # Should not crash
        sanitize_input(long_string)
        check_sql_injection(long_string)
        validate_xss_input(long_string)

    def test_special_characters(self):
        """Test security functions with special characters."""
        special_chars = "!@#$%^&*()_+-=[]{}|;':\",./<>?"
        
        # Should handle special characters gracefully
        sanitize_input(special_chars)
        check_sql_injection(special_chars)
        validate_xss_input(special_chars)

    def test_unicode_inputs(self):
        """Test security functions with unicode inputs."""
        unicode_string = "Привет мир! 🌍"
        
        # Should handle unicode gracefully
        sanitize_input(unicode_string)
        check_sql_injection(unicode_string)
        validate_xss_input(unicode_string) 