from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from decimal import Decimal
from datetime import datetime
import asyncio

from app.database import get_db
from app.schemas import AIRequest, AIResponse, TaskCreate, Task
from app.services.ai_service import AIService, TaskComplexityAnalysis, ai_service
from app.crud.tasks import create_task, get_task, update_task
from app.auth import get_current_user, get_current_active_user
from app.db_models import User, Task

router = APIRouter()
ai_service = AIService()


@router.post("/analyze-task-complexity", response_model=Dict[str, Any])
async def analyze_task_complexity(
    task_data: TaskCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Анализирует сложность задачи и предлагает ценовой диапазон"""
    try:
        analysis = await ai_service.analyze_task_complexity_and_pricing(
            task_title=task_data.title,
            task_description=task_data.description,
            category=task_data.category,
            skills_required=task_data.skills_required,
            deadline=task_data.deadline,
            current_budget_min=task_data.budget_min,
            current_budget_max=task_data.budget_max
        )
        
        return {
            "complexity_level": analysis.complexity_level,
            "estimated_hours": analysis.estimated_hours,
            "suggested_min_price": float(analysis.suggested_min_price),
            "suggested_max_price": float(analysis.suggested_max_price),
            "required_skills": analysis.required_skills,
            "risk_factors": analysis.risk_factors,
            "market_demand": analysis.market_demand,
            "confidence_score": analysis.confidence_score
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка анализа: {str(e)}")


@router.post("/create-task-with-ai-analysis", response_model=Task)
async def create_task_with_ai_analysis(
    task_data: TaskCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Создает задачу с автоматическим AI-анализом сложности и стоимости"""
    try:
        # Анализируем задачу с помощью AI
        analysis = await ai_service.analyze_task_complexity_and_pricing(
            task_title=task_data.title,
            task_description=task_data.description,
            category=task_data.category,
            skills_required=task_data.skills_required,
            deadline=task_data.deadline,
            current_budget_min=task_data.budget_min,
            current_budget_max=task_data.budget_max
        )
        
        # Создаем задачу с AI-анализом
        task_dict = task_data.dict()
        task_dict.update({
            "complexity_level": analysis.complexity_level,
            "ai_suggested_min_price": analysis.suggested_min_price,
            "ai_suggested_max_price": analysis.suggested_max_price,
            "ai_analysis_data": {
                "estimated_hours": analysis.estimated_hours,
                "required_skills": analysis.required_skills,
                "risk_factors": analysis.risk_factors,
                "market_demand": analysis.market_demand,
                "confidence_score": analysis.confidence_score
            },
            "ai_analyzed_at": datetime.utcnow()
        })
        
        # Если пользователь не указал бюджет, используем AI-рекомендации
        if not task_dict.get("budget_min") and not task_dict.get("budget_max"):
            task_dict["budget_min"] = analysis.suggested_min_price
            task_dict["budget_max"] = analysis.suggested_max_price
        
        task = create_task(db=db, task_data=task_data, creator_id=int(current_user.id))  # type: ignore
        
        # Обновляем задачу с AI-анализом
        update_task(db=db, task_id=int(task.id), task_data=task_dict)  # type: ignore
        
        return task
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка создания задачи: {str(e)}")


@router.post("/analyze-application", response_model=Dict[str, Any])
async def analyze_application(
    application_text: str,
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Анализирует заявку фрилансера на задачу"""
    try:
        # Получаем задачу
        task = get_task(db=db, task_id=task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Задача не найдена")
        
        analysis = await ai_service.analyze_application(
            application_text=application_text,
            task_requirements=str(task.description),
            task_complexity=int(task.complexity_level)  # type: ignore
        )
        
        return analysis
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка анализа заявки: {str(e)}")


@router.get("/generate-interview-questions", response_model=List[Dict[str, Any]])
async def generate_interview_questions(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Генерирует вопросы для интервью на основе задачи"""
    try:
        task = get_task(db=db, task_id=task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Задача не найдена")
        
        skills_required = task.skills_required if task.skills_required else []  # type: ignore
        
        questions = await ai_service.generate_interview_questions(
            task_description=str(task.description),
            skills_required=skills_required,  # type: ignore
            complexity_level=int(task.complexity_level)  # type: ignore
        )
        
        return questions
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка генерации вопросов: {str(e)}")


@router.get("/task-recommendations", response_model=List[Dict[str, Any]])
async def get_task_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Получает персональные рекомендации задач для пользователя"""
    try:
        # Формируем профиль пользователя
        user_profile = {
            "id": int(current_user.id),  # type: ignore
            "skills": current_user.skills if current_user.skills else [],  # type: ignore
            "level": int(current_user.level),  # type: ignore
            "hourly_rate": float(current_user.hourly_rate) if current_user.hourly_rate else 0,  # type: ignore
            "rating": current_user.rating,
            "completed_tasks": int(current_user.completed_tasks),  # type: ignore
            "total_earnings": float(current_user.total_earnings)  # type: ignore
        }
        
        # Получаем историю выполненных задач (упрощенно)
        user_history = [
            {
                "task_id": 1,
                "title": "Пример задачи",
                "category": "Web Development",
                "earnings": 1000,
                "rating": 5
            }
        ]
        
        recommendations = await ai_service.generate_task_recommendations(
            user_profile=user_profile,
            user_history=user_history
        )
        
        return recommendations
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения рекомендаций: {str(e)}")


@router.post("/smart-assistant", response_model=Dict[str, str])
async def smart_assistant(
    request: AIRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Умный помощник для ответов на вопросы пользователя"""
    try:
        context = request.context or {}
        context["user_id"] = int(current_user.id)  # type: ignore
        context["user_level"] = int(current_user.level)  # type: ignore
        
        response = await ai_service.generate_smart_assistant_response(
            user_message=request.prompt,
            context=context
        )
        
        return {"response": response}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка помощника: {str(e)}")


@router.post("/suggest-level-upgrade", response_model=Dict[str, Any])
async def suggest_level_upgrade(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Предлагает повышение уровня пользователя"""
    try:
        user_profile = {
            "id": int(current_user.id),  # type: ignore
            "skills": current_user.skills if current_user.skills else [],  # type: ignore
            "level": int(current_user.level),  # type: ignore
            "hourly_rate": float(current_user.hourly_rate) if current_user.hourly_rate else 0,  # type: ignore
            "rating": current_user.rating,
            "completed_tasks": int(current_user.completed_tasks),  # type: ignore
            "total_earnings": float(current_user.total_earnings)  # type: ignore
        }
        
        # Получаем историю выполненных задач (упрощенно)
        completed_tasks = [
            {
                "task_id": 1,
                "title": "Пример задачи",
                "complexity_level": 2,
                "earnings": 1000,
                "rating": 5
            }
        ]
        
        suggestion = await ai_service.suggest_user_level_upgrade(
            user_profile=user_profile,
            completed_tasks=completed_tasks
        )
        
        return suggestion
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка анализа уровня: {str(e)}")


@router.get("/ping")
def ping():
    """Проверка работоспособности AI сервиса"""
    return {"message": "AI service is running", "model": "mistral-large-latest"}


@router.get("/recommendations")
def get_task_recommendations(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Получить AI-рекомендации задач для текущего пользователя-фрилансера."""
    if not current_user.is_freelancer:
        raise HTTPException(status_code=403, detail="Only freelancers can get recommendations")
    # Получить задачи (например, открытые)
    tasks = db.query(Task).filter(Task.status == "open").all()
    user_profile = {
        "id": current_user.id,
        "email": current_user.email,
        "skills": current_user.skills,
        "level": current_user.level,
        "bio": current_user.bio,
        "completed_tasks": current_user.completed_tasks,
    }
    user_history = []  # Можно добавить историю заявок, выполненных задач и т.д.
    # Вызвать AI для рекомендаций
    try:
        recommendations = asyncio.run(ai_service.generate_task_recommendations(
            user_profile=user_profile,
            user_history=user_history
        ))
        return {"recommendations": recommendations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {e}")
