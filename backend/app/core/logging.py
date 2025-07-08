"""
Logging configuration for the application.
"""

import logging
import sys
from pathlib import Path
from typing import Any, Dict, Optional
from loguru import logger
from .config import settings

class InterceptHandler(logging.Handler):
    """
    Intercept standard logging and redirect to loguru.
    """
    def emit(self, record: logging.LogRecord) -> None:
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno
        frame, depth = logging.currentframe(), 2
        while frame and frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1
        logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())


def setup_logging() -> None:
    """
    Setup logging configuration.
    """
    # Remove default loguru handler
    logger.remove()

    # Create logs directory
    log_file = Path(settings.LOG_FILE)
    log_file.parent.mkdir(parents=True, exist_ok=True)

    # Configure loguru
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level=settings.LOG_LEVEL,
        colorize=True,
        backtrace=True,
        diagnose=True
    )

    logger.add(
        log_file,
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        level=settings.LOG_LEVEL,
        rotation="10 MB",
        retention="30 days",
        compression="zip",
        backtrace=True,
        diagnose=True
    )

    # Intercept standard logging
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)

    # Intercept uvicorn logging
    logging.getLogger("uvicorn").handlers = [InterceptHandler()]
    logging.getLogger("uvicorn.access").handlers = [InterceptHandler()]
    logging.getLogger("fastapi").handlers = [InterceptHandler()]
    logging.getLogger("sqlalchemy").handlers = [InterceptHandler()]
    logging.getLogger("alembic").handlers = [InterceptHandler()]


def get_logger(name: str) -> Any:
    """
    Get logger instance.
    Args:
        name: Logger name
    Returns:
        Logger instance
    """
    return logger.bind(name=name)


async def log_request_middleware(request, call_next):
    """
    Log incoming requests.
    """
    logger.info(
        f"Request: {request.method} {request.url.path} - Client: {request.client.host if request.client else 'unknown'}"
    )
    response = await call_next(request)
    logger.info(
        f"Response: {request.method} {request.url.path} - Status: {response.status_code}"
    )
    return response


def log_error(error: Exception, context: Optional[Dict[str, Any]] = None) -> None:
    """
    Log error with context.
    Args:
        error: Exception to log
        context: Additional context
    """
    logger.error(
        f"Error: {type(error).__name__}: {str(error)} | Context: {context or {}}",
        exc_info=True
    )


def log_performance(operation: str, duration: float, **kwargs) -> None:
    """
    Log performance metrics.
    Args:
        operation: Operation name
        duration: Duration in seconds
        **kwargs: Additional metrics
    """
    logger.info(
        f"Performance: {operation} took {duration:.3f}s | Extra: {kwargs}"
    )
