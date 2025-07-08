from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime

from app.db_models import Task
from app.schemas import TaskCreate, TaskUpdate


def create_task(db: Session, task_data: TaskCreate, creator_id: int) -> Task:
    """Create a new task."""
    db_task = Task(**task_data.dict(), creator_id=creator_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def get_task(db: Session, task_id: int) -> Optional[Task]:
    """Get task by ID."""
    return db.query(Task).filter(Task.id == task_id).first()


def get_tasks(
    db: Session, skip: int = 0, limit: int = 100,
    creator_id: Optional[int] = None, assigned_to_id: Optional[int] = None,
    status: Optional[str] = None, category: Optional[str] = None,
    complexity_level: Optional[int] = None, min_budget: Optional[float] = None,
    max_budget: Optional[float] = None
) -> List[Task]:
    """Get tasks with filters."""
    query = db.query(Task)

    if creator_id:
        query = query.filter(Task.creator_id == creator_id)
    if assigned_to_id:
        query = query.filter(Task.assigned_to_id == assigned_to_id)
    if status:
        query = query.filter(Task.status == status)
    if category:
        query = query.filter(Task.category == category)
    if complexity_level:
        query = query.filter(Task.complexity_level <= complexity_level)
    if min_budget:
        query = query.filter(Task.budget_max >= min_budget)
    if max_budget:
        query = query.filter(Task.budget_min <= max_budget)

    return query.order_by(Task.created_at.desc()).offset(skip).limit(limit).all()


def update_task(db: Session, task_id: int, task_data: Dict[str, Any]) -> Optional[Task]:
    """Update task."""
    db_task = get_task(db, task_id)
    if not db_task:
        return None

    for field, value in task_data.items():
        setattr(db_task, field, value)

    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def delete_task(db: Session, task_id: int) -> bool:
    """Delete task."""
    db_task = get_task(db, task_id)
    if not db_task:
        return False

    db.delete(db_task)
    db.commit()
    return True