"""
Task endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.auth import get_current_active_user
from app.crud.tasks import get_task, get_tasks, create_task, update_task, delete_task
from app.schemas import Task, TaskCreate, TaskUpdate, TaskDetail
from app.db_models import User

router = APIRouter()


@router.get("/", response_model=List[Task])
def get_all_tasks(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = Query(None, description="Filter by category"),
    complexity_level: Optional[int] = Query(None, ge=1, le=5, description="Filter by complexity level"),
    min_budget: Optional[float] = Query(None, ge=0, description="Minimum budget"),
    max_budget: Optional[float] = Query(None, ge=0, description="Maximum budget"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all tasks with AI-based filtering for freelancers."""
    # Для фрилансеров показываем только задачи подходящего уровня
    if current_user.is_freelancer:  # type: ignore
        # Если не указан уровень сложности, используем уровень пользователя
        if complexity_level is None:
            complexity_level = current_user.level  # type: ignore
        
        # Показываем задачи, которые пользователь может выполнить
        tasks = get_tasks(
            db, 
            skip=skip, 
            limit=limit,
            category=category,
            complexity_level=complexity_level,
            min_budget=min_budget,
            max_budget=max_budget
        )
        
        # Фильтруем по уровню сложности (показываем только подходящие)
        filtered_tasks = [
            task for task in tasks 
            if task.complexity_level <= current_user.level  # type: ignore
        ]
        
        return filtered_tasks
    else:
        # Для клиентов показываем все задачи
        return get_tasks(
            db, 
            skip=skip, 
            limit=limit,
            category=category,
            complexity_level=complexity_level,
            min_budget=min_budget,
            max_budget=max_budget
        )


@router.get("/recommended", response_model=List[Task])
def get_recommended_tasks(
    skip: int = 0,
    limit: int = 10,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get AI-recommended tasks for the current user."""
    if not current_user.is_freelancer:  # type: ignore
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only freelancers can get recommended tasks"
        )
    
    # Получаем задачи подходящего уровня сложности
    tasks = get_tasks(
        db, 
        skip=skip, 
        limit=limit,
        complexity_level=current_user.level  # type: ignore
    )
    
    # Сортируем по релевантности (уровень сложности, бюджет, категория)
    sorted_tasks = sorted(
        tasks,
        key=lambda x: (
            x.complexity_level,
            float(x.budget_max) if x.budget_max else 0,  # type: ignore
            x.category in (current_user.skills or [])  # type: ignore
        ),
        reverse=True
    )
    
    return sorted_tasks


@router.post("/", response_model=Task)
def create_new_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new task."""
    task = create_task(db, task_data, current_user.id)  # type: ignore
    return task


@router.get("/{task_id}", response_model=TaskDetail)
def get_task_by_id(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get task by ID with AI analysis data."""
    task = get_task(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Проверяем доступ для фрилансеров
    if current_user.is_freelancer and task.complexity_level > current_user.level:  # type: ignore
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This task is too complex for your current level"
        )
    
    return task


@router.put("/{task_id}", response_model=Task)
def update_task_by_id(
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update task by ID."""
    task = update_task(db, task_id, task_data.dict(exclude_unset=True))
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return task


@router.delete("/{task_id}")
def delete_task_by_id(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete task by ID."""
    success = delete_task(db, task_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return {"message": "Task deleted successfully"}


@router.get("/{task_id}/ai-analysis")
def get_task_ai_analysis(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get AI analysis data for a specific task."""
    task = get_task(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return {
        "complexity_level": task.complexity_level,
        "ai_suggested_min_price": float(task.ai_suggested_min_price) if task.ai_suggested_min_price else None,  # type: ignore
        "ai_suggested_max_price": float(task.ai_suggested_max_price) if task.ai_suggested_max_price else None,  # type: ignore
        "ai_analysis_data": task.ai_analysis_data,
        "ai_analyzed_at": task.ai_analyzed_at
    }
