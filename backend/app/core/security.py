"""
Security utilities and functions.
"""

import re
import os
from app.core.config import settings


def validate_email(email: str) -> bool:
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_username(username: str) -> bool:
    """Validate username format."""
    if len(username) < 3 or len(username) > 30:
        return False
    pattern = r'^[a-zA-Z0-9_-]+$'
    return re.match(pattern, username) is not None


def validate_password_strength(password: str) -> tuple[bool, str]:
    """Validate password strength and return (is_valid, error_message)."""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"

    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"

    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"

    if not re.search(r'\d', password):
        return False, "Password must contain at least one digit"

    return True, "Password is strong"


def sanitize_input(text: str) -> str:
    """Sanitize user input to prevent XSS."""
    # Remove potentially dangerous characters
    dangerous_chars = ['<', '>', '"', "'", '&']
    for char in dangerous_chars:
        text = text.replace(char, '')
    return text.strip()


def validate_budget_range(min_budget: float, max_budget: float) -> bool:
    """Validate budget range."""
    if min_budget <= 0 or max_budget <= 0:
        return False
    if min_budget >= max_budget:
        return False
    if max_budget > 1000000:  # $1M limit
        return False
    return True


def validate_task_title(title: str) -> bool:
    """Validate task title."""
    if len(title) < 5 or len(title) > 200:
        return False
    return True


def validate_task_description(description: str) -> bool:
    """Validate task description."""
    if len(description) < 10 or len(description) > 5000:
        return False
    return True


def rate_limit_check(user_id: int, action: str) -> bool:
    """Check if user has exceeded rate limits."""
    # This would typically check against Redis or database
    # For now, return True (no rate limiting)
    return True


def validate_file_upload(filename: str, file_size: int) -> tuple[bool, str]:
    """Validate file upload."""
    # Check file size
    if file_size > settings.MAX_FILE_SIZE:
        return False, f"File size exceeds maximum limit of {settings.MAX_FILE_SIZE} bytes"

    # Check file extension
    allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.txt']
    file_ext = filename.lower().split('.')[-1] if '.' in filename else ''

    if f'.{file_ext}' not in allowed_extensions:
        return False, f"File type .{file_ext} is not allowed"

    return True, "File is valid"


def generate_secure_filename(original_filename: str) -> str:
    """Generate a secure filename."""
    import uuid
    import os

    # Get file extension
    _, ext = os.path.splitext(original_filename)

    # Generate unique filename
    secure_name = f"{uuid.uuid4().hex}{ext}"

    return secure_name
