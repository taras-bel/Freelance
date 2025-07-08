"""
Achievement management endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
import logging

from app.database import get_db
from app.auth import get_current_active_user
from app.crud_utils import (
    create_achievement,
    get_achievement,
    get_achievements,
    update_achievement,
    delete_achievement
)
from app.schemas import (
    AchievementCreate,
    Achievement,
    AchievementUpdate,
    MessageResponse,
    PaginatedResponse
)
from app.db_models import Achievement as DBAchievement, User as DBUser, Level as DBLevel, Task, Application, TaskStatus, ApplicationStatus

router = APIRouter()


@router.post("/", response_model=Achievement)
def create_new_achievement(
    achievement_data: AchievementCreate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new achievement."""
    achievement = DBAchievement(**achievement_data.dict(), user_id=current_user.id)
    db.add(achievement)
    db.commit()
    db.refresh(achievement)
    # Convert to Pydantic schema
    from app.schemas import Achievement as AchievementSchema
    return AchievementSchema.from_orm(achievement)


@router.get("/unlocked", response_model=List[Achievement])
def get_unlocked_achievements(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get unlocked achievements for current user."""
    achievements = db.query(DBAchievement).filter(
        DBAchievement.user_id == current_user.id,
        DBAchievement.unlocked_at.isnot(None)
    ).all()
    # Convert to Pydantic schemas
    from app.schemas import Achievement as AchievementSchema
    return [AchievementSchema.from_orm(a) for a in achievements]


@router.get("/user-level", response_model=dict)
def get_user_level(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user level and progress information."""
    # Get user's total points from achievements
    total_points = db.query(func.sum(DBAchievement.points)).filter(
        DBAchievement.user_id == current_user.id,
        DBAchievement.unlocked_at.isnot(None)
    ).scalar() or 0
    
    # Calculate level based on points (simple formula: level = points / 100 + 1)
    level = (total_points // 100) + 1
    current_xp = total_points % 100
    xp_to_next_level = 100 - current_xp
    
    # Get user's task statistics
    try:
        tasks_completed = db.query(Task).filter(
            Task.assigned_to_id == current_user.id,
            Task.status == TaskStatus.COMPLETED
        ).count()
        
        tasks_created = db.query(Task).filter(
            Task.creator_id == current_user.id
        ).count()
        
        applications_submitted = db.query(Application).filter(
            Application.applicant_id == current_user.id
        ).count()
        
        applications_accepted = db.query(Application).filter(
            Application.applicant_id == current_user.id,
            Application.status == ApplicationStatus.ACCEPTED
        ).count()
        
        # Calculate total earnings (simplified)
        total_earnings = db.query(func.sum(Task.budget_max)).filter(
            Task.assigned_to_id == current_user.id,
            Task.status == TaskStatus.COMPLETED
        ).scalar() or 0
    except Exception as e:
        # If Task or Application models don't exist, use default values
        tasks_completed = 0
        tasks_created = 0
        applications_submitted = 0
        applications_accepted = 0
        total_earnings = 0
    
    return {
        "level": level,
        "current_xp": current_xp,
        "total_xp": total_points,
        "xp_to_next_level": xp_to_next_level,
        "tasks_completed": tasks_completed,
        "tasks_created": tasks_created,
        "applications_submitted": applications_submitted,
        "applications_accepted": applications_accepted,
        "total_earnings": float(total_earnings),
        "streak_days": 0  # Placeholder for future implementation
    }


@router.get("/categories", response_model=List[str])
def get_achievement_categories(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all achievement categories."""
    categories = db.query(DBAchievement.category).distinct().all()
    return [cat[0] for cat in categories if cat[0]]


@router.get("/my", response_model=List[Achievement])
def get_my_achievements(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get achievements for current user."""
    achievements = db.query(DBAchievement).filter(DBAchievement.user_id == current_user.id).offset(skip).limit(limit).all()
    # Convert to Pydantic schemas
    from app.schemas import Achievement as AchievementSchema
    return [AchievementSchema.from_orm(a) for a in achievements]


@router.get("/user/{user_id}", response_model=List[Achievement])
def get_user_achievements(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get achievements for a specific user."""
    achievements = db.query(DBAchievement).filter(DBAchievement.user_id == user_id).offset(skip).limit(limit).all()
    # Convert to Pydantic schemas
    from app.schemas import Achievement as AchievementSchema
    return [AchievementSchema.from_orm(a) for a in achievements]


@router.get("/ping")
def ping():
    return {"message": "pong"}


@router.get("/", response_model=PaginatedResponse)
def get_all_achievements(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    user_id: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get achievements with filters and pagination."""
    query = db.query(DBAchievement)
    if user_id:
        query = query.filter(DBAchievement.user_id == user_id)
    if category:
        query = query.filter(DBAchievement.category == category)
    total = query.count()
    achievements = query.offset(skip).limit(limit).all()
    pages = (total + limit - 1) // limit
    
    # Debug: print raw achievements
    print("[DEBUG] Raw achievements:", achievements)
    
    # Сериализуем объекты через Pydantic
    from app.schemas import Achievement as AchievementSchema
    try:
        items = [AchievementSchema.from_orm(a) for a in achievements]
    except Exception as e:
        print("[ERROR] Failed to serialize achievements:", e)
        for a in achievements:
            try:
                AchievementSchema.from_orm(a)
            except Exception as single_e:
                print(f"[ERROR] Failed to serialize achievement ID {getattr(a, 'id', None)}: {single_e}")
        raise HTTPException(status_code=500, detail=f"Serialization error: {e}")
    
    return PaginatedResponse(
        items=items,
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=pages
    )


@router.get("/{achievement_id}", response_model=Achievement)
def get_achievement_by_id(
    achievement_id: int,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get achievement by ID."""
    achievement = db.query(DBAchievement).filter(DBAchievement.id == achievement_id).first()
    if not achievement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Achievement not found"
        )
    
    # Convert to Pydantic schema
    from app.schemas import Achievement as AchievementSchema
    return AchievementSchema.from_orm(achievement)


@router.put("/{achievement_id}", response_model=Achievement)
def update_achievement_details(
    achievement_id: int,
    achievement_data: AchievementUpdate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update achievement details."""
    achievement = db.query(DBAchievement).filter(DBAchievement.id == achievement_id).first()
    if not achievement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Achievement not found"
        )
    
    # Check if user is authorized to update this achievement
    if achievement.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this achievement"
        )
    
    # Update achievement
    for key, value in achievement_data.dict(exclude_unset=True).items():
        setattr(achievement, key, value)
    db.commit()
    db.refresh(achievement)
    
    # Convert to Pydantic schema
    from app.schemas import Achievement as AchievementSchema
    return AchievementSchema.from_orm(achievement)


@router.delete("/{achievement_id}", response_model=MessageResponse)
def delete_achievement_by_id(
    achievement_id: int,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete achievement."""
    achievement = db.query(DBAchievement).filter(DBAchievement.id == achievement_id).first()
    if not achievement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Achievement not found"
        )
    
    # Check if user is authorized to delete this achievement
    if achievement.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this achievement"
        )
    
    db.delete(achievement)
    db.commit()
    
    return {"message": "Achievement deleted successfully"}
