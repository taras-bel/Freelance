"""
Celery configuration for background tasks.
"""

from celery import Celery
from app.core.config import settings

# Create Celery app
celery_app = Celery(
    "freelance",
    broker=settings.REDIS_URL or "redis://localhost:6379/0",
    backend=settings.REDIS_URL or "redis://localhost:6379/0",
    include=[
        "app.services.email_service",
        "app.services.notification_service",
        "app.services.ai_service",
        "app.services.financial_service",
    ],
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
    broker_connection_retry_on_startup=True,
    result_expires=3600,  # 1 hour
    task_always_eager=settings.DEBUG,  # Run tasks synchronously in debug mode
)

# Task routing
celery_app.conf.task_routes = {
    "app.services.email_service.*": {"queue": "email"},
    "app.services.notification_service.*": {"queue": "notifications"},
    "app.services.ai_service.*": {"queue": "ai"},
    "app.services.financial_service.*": {"queue": "financial"},
}

# Beat schedule for periodic tasks
celery_app.conf.beat_schedule = {
    "send-daily-digest": {
        "task": "app.services.notification_service.send_daily_digest",
        "schedule": 86400.0,  # 24 hours
    },
    "cleanup-expired-tokens": {
        "task": "app.services.auth_service.cleanup_expired_tokens",
        "schedule": 3600.0,  # 1 hour
    },
    "update-user-stats": {
        "task": "app.services.user_service.update_user_statistics",
        "schedule": 1800.0,  # 30 minutes
    },
    "process-pending-payments": {
        "task": "app.services.financial_service.process_pending_payments",
        "schedule": 300.0,  # 5 minutes
    },
}

if __name__ == "__main__":
    celery_app.start()
