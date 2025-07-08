"""
AI API endpoints.
"""

from fastapi import APIRouter
from app.ai import router as ai_router

router = APIRouter()

# Include AI router
router.include_router(ai_router, prefix="/ai", tags=["ai"])


@router.get("/health")
async def ai_health_check():
    """Health check for AI service."""
    return {"status": "healthy", "service": "ai-api"}
