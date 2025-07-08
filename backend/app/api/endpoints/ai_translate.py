from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import Optional
from app.auth import get_current_active_user
from app.db_models import User
from app.services.ai_service import AIService

router = APIRouter()
ai_service = AIService()

class TranslateRequest(BaseModel):
    text: str
    source_lang: Optional[str] = None
    target_lang: str

class TranslateResponse(BaseModel):
    translated_text: str
    detected_source_lang: Optional[str] = None

@router.post("/translate", response_model=TranslateResponse)
async def translate_text(
    req: TranslateRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Перевести текст на целевой язык через ИИ."""
    try:
        result = await ai_service.translate_text(
            text=req.text,
            source_lang=req.source_lang,
            target_lang=req.target_lang
        )
        return TranslateResponse(
            translated_text=result["translated_text"],
            detected_source_lang=result.get("detected_source_lang")
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Translation failed: {str(e)}"
        ) 