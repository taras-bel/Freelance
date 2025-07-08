"""
Main FastAPI application.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi import WebSocket, WebSocketDisconnect
import time

from app.core.config import settings
from app.database import create_tables
from app.api.api import api_router
from app.websockets.notification_manager import NotificationConnectionManager

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered freelance platform API",
    version=settings.VERSION,
    openapi_url="/openapi.json" if settings.DEBUG else None,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None
)

# WebSocket manager
websocket_manager = NotificationConnectionManager()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"] if settings.DEBUG else ["your-domain.com"]
)

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# Include API routes
app.include_router(api_router, prefix="/api/v1")

# WebSocket endpoint
@app.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    # Extract user_id from token (simplified - in real app you'd decode JWT)
    user_id = 1  # Default user ID, in real app decode from JWT
    await websocket_manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages if needed
            await websocket.send_text(f"Message received: {data}")
    except WebSocketDisconnect:
        websocket_manager.disconnect(user_id, websocket)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to Freelance Platform API",
        "version": settings.VERSION,
        "docs": "/docs" if settings.DEBUG else None
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "timestamp": time.time()
    }


@app.on_event("startup")
async def startup_event():
    """Startup event handler."""
    # Create database tables
    create_tables()
    print("Database tables created successfully")


@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event handler."""
    print("Application shutting down")
