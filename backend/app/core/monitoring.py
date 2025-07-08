"""
Monitoring and metrics configuration.
"""

import time
from prometheus_client import (
    Counter,
    Histogram,
    Gauge,
    generate_latest,
    CONTENT_TYPE_LATEST)
from fastapi import Request, Response
from fastapi.responses import Response as FastAPIResponse
from .logging import get_logger
from .config import settings

logger = get_logger(__name__)

# Prometheus metrics
REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total number of HTTP requests",
    ["method", "endpoint", "status"]
)

REQUEST_DURATION = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration in seconds",
    ["method", "endpoint"]
)

ACTIVE_USERS = Gauge("active_users_total", "Total number of active users")

DATABASE_CONNECTIONS = Gauge(
    "database_connections_active",
    "Number of active database connections"
)

REDIS_CONNECTIONS = Gauge(
    "redis_connections_active",
    "Number of active Redis connections"
)

TASK_COUNT = Counter(
    "tasks_created_total",
    "Total number of tasks created",
    ["category", "status"]
)

PAYMENT_COUNT = Counter(
    "payments_processed_total",
    "Total number of payments processed",
    ["status", "currency"]
)

ERROR_COUNT = Counter(
    "errors_total",
    "Total number of errors",
    ["type", "endpoint"]
)


class MetricsMiddleware:
    """Middleware for collecting metrics."""

    def __init__(self):
        self.request_count = REQUEST_COUNT
        self.request_duration = REQUEST_DURATION
        self.error_count = ERROR_COUNT

    async def __call__(self, request: Request, call_next):
        """Process request and collect metrics."""
        start_time = time.time()

        try:
            response = await call_next(request)

            duration = time.time() - start_time
            self.request_count.labels(
                method=request.method,
                endpoint=request.url.path,
                status=response.status_code
            ).inc()

            self.request_duration.labels(
                method=request.method,
                endpoint=request.url.path
            ).observe(duration)

            return response
        except Exception as e:
            # Record error metrics
            self.error_count.labels(
                type=type(e).__name__,
                endpoint=request.url.path
            ).inc()

            logger.error(f"Request failed: {e}")
            raise


def get_metrics() -> Response:
    """Get Prometheus metrics."""
    return FastAPIResponse(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


def update_user_metrics(active_users: int) -> None:
    """Update user metrics."""
    ACTIVE_USERS.set(active_users)


def update_database_metrics(connections: int) -> None:
    """Update database metrics."""
    DATABASE_CONNECTIONS.set(connections)


def update_redis_metrics(connections: int) -> None:
    """Update Redis metrics."""
    REDIS_CONNECTIONS.set(connections)


def record_task_creation(category: str, status: str) -> None:
    """Record task creation metric."""
    TASK_COUNT.labels(category=category, status=status).inc()


def record_payment_processing(status: str, currency: str) -> None:
    """Record payment processing metric."""
    PAYMENT_COUNT.labels(status=status, currency=currency).inc()


def record_error(error_type: str, endpoint: str) -> None:
    """Record error metric."""
    ERROR_COUNT.labels(type=error_type, endpoint=endpoint).inc()


class HealthChecker:
    """Health check utilities."""

    @staticmethod
    async def check_database():
        """Check database health."""
        try:
            # Placeholder: always return healthy
            return {"status": "healthy", "database": "connected"}
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return {"status": "unhealthy", "database": str(e)}

    @staticmethod
    async def check_redis():
        """Check Redis health."""
        try:
            import redis
            r = redis.from_url(settings.REDIS_URL or "redis://localhost:6379/0")
            if r is not None:
                r.ping()
                return {"status": "healthy", "redis": "connected"}
            else:
                return {"status": "unhealthy", "redis": "not connected"}
        except Exception as e:
            logger.error(f"Redis health check failed: {e}")
            return {"status": "unhealthy", "redis": str(e)}

    @staticmethod
    async def check_external_services():
        """Check external services health."""
        checks = {}

        try:
            if hasattr(settings, "MISTRAL_API_KEY") and settings.MISTRAL_API_KEY:
                # Add AI service check here
                checks["ai_service"] = "healthy"
            else:
                checks["ai_service"] = "not_configured"
        except Exception as e:
            checks["ai_service"] = f"unhealthy: {str(e)}"

        return checks


class PerformanceMonitor:
    """Performance monitoring utilities."""

    @staticmethod
    def time_operation(operation_name: str):
        """Decorator to time operations."""

        def decorator(func):
            async def wrapper(*args, **kwargs):
                start_time = time.time()
                try:
                    result = await func(*args, **kwargs)
                    duration = time.time() - start_time
                    logger.info(f"Operation {operation_name} completed in {duration:.3f}s")
                    return result
                except Exception as e:
                    duration = time.time() - start_time
                    logger.error(f"Operation {operation_name} failed after {duration:.3f}s: {e}")
                    raise
            return wrapper
        return decorator

    @staticmethod
    def monitor_memory_usage():
        """Monitor memory usage."""
        import psutil
        process = psutil.Process()
        memory_info = process.memory_info()
        logger.info(f"Memory usage: {memory_info.rss / 1024 / 1024:.2f} MB")
        return memory_info.rss / 1024 / 1024  # MB
