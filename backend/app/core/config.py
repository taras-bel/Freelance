"""
Configuration settings for the application.
"""

from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import validator
import os


class Settings(BaseSettings):
    """Application settings."""

    # Application
    APP_NAME: str = "Freelance Platform API"
    VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///app/db.sqlite3"

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"

    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""

    # AI/OpenAI
    OPENAI_API_KEY: Optional[str] = None
    MISTRAL_API_KEY: Optional[str] = None

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # File uploads
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # Monitoring
    ENABLE_MONITORING: bool = True
    PROMETHEUS_PORT: int = 9090

    # Fees
    PLATFORM_FEE_PERCENTAGE: float = 0.03  # 3% service commission
    PROCESSING_FEE_FIXED: float = 0.0  # No fixed fee
    PROCESSING_FEE_PERCENTAGE: float = 0.0  # No processing fee percentage

    # Logging
    LOG_FILE: str = "logs/app.log"
    LOG_LEVEL: str = "INFO"

    # Stripe
    STRIPE_API_KEY: str = os.getenv("STRIPE_API_KEY", "")
    STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    PAYPAL_CLIENT_ID: str = os.getenv("PAYPAL_CLIENT_ID", "")
    PAYPAL_SECRET: str = os.getenv("PAYPAL_SECRET", "")
    PAYPAL_WEBHOOK_ID: str = os.getenv("PAYPAL_WEBHOOK_ID", "")

    # Qiwi
    QIWI_SECRET_KEY: str = os.getenv("QIWI_SECRET_KEY", "")
    QIWI_PUBLIC_KEY: str = os.getenv("QIWI_PUBLIC_KEY", "")

    @property
    def allowed_origins_list(self) -> List[str]:
        """Get allowed origins as a list."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = None
        case_sensitive = True

settings = Settings()
