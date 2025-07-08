"""
Application endpoints for job applications.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import asyncio

from app.database import get_db
from app.auth import get_current_active_user
from app.schemas import Application, ApplicationCreate, ApplicationUpdate
from app.db_models import User, Application as DBApplication, Task
from app.services.ai_service import ai_service

router = APIRouter()


@router.get("/", response_model=List[Application])
def get_all_applications(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all applications for the current user."""
    # Simple implementation - get all applications
    applications = db.query(DBApplication).offset(skip).limit(limit).all()
    
    # Convert to Pydantic schemas
    from app.schemas import Application as ApplicationSchema
    return [ApplicationSchema.from_orm(app) for app in applications]


@router.get("/my", response_model=List[Application])
def get_my_applications(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's applications."""
    applications = db.query(DBApplication).filter(
        DBApplication.applicant_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    # Convert to Pydantic schemas
    from app.schemas import Application as ApplicationSchema
    return [ApplicationSchema.from_orm(app) for app in applications]


@router.post("/task/{task_id}", response_model=Application)
def create_application(
    task_id: int,
    application_data: ApplicationCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new application for a task. Встроен AI-скрининг."""
    # Check if task exists
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Create application
    application = DBApplication(
        **application_data.dict(),
        task_id=task_id,
        applicant_id=current_user.id,
        status="pending"
    )
    
    db.add(application)
    db.commit()
    db.refresh(application)
    
    # AI screening
    try:
        ai_result = asyncio.run(ai_service.analyze_application(
            application_text=application.proposal,
            task_requirements=task.description,
            task_complexity=getattr(task, 'complexity_level', 3)
        ))
        application.screening_score = ai_result.get('score')
        application.screening_status = ai_result.get('status', 'review')
        application.screening_comment = ai_result.get('comment', '')
        from datetime import datetime
        application.screened_at = datetime.utcnow()
        db.commit()
        db.refresh(application)
    except Exception as e:
        application.screening_status = 'manual'
        application.screening_comment = f'AI screening failed: {e}'
        db.commit()
        db.refresh(application)
    
    # Convert to Pydantic schema
    from app.schemas import Application as ApplicationSchema
    return ApplicationSchema.from_orm(application)


@router.get("/{application_id}", response_model=Application)
def get_application_by_id(
    application_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get application by ID."""
    application = db.query(DBApplication).filter(DBApplication.id == application_id).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Convert to Pydantic schema
    from app.schemas import Application as ApplicationSchema
    return ApplicationSchema.from_orm(application)


@router.put("/{application_id}", response_model=Application)
def update_application(
    application_id: int,
    application_data: ApplicationUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update application."""
    application = db.query(DBApplication).filter(DBApplication.id == application_id).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Update application
    for key, value in application_data.dict(exclude_unset=True).items():
        setattr(application, key, value)
    
    db.commit()
    db.refresh(application)
    
    # Convert to Pydantic schema
    from app.schemas import Application as ApplicationSchema
    return ApplicationSchema.from_orm(application)


@router.delete("/{application_id}")
def delete_application(
    application_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete application."""
    application = db.query(DBApplication).filter(DBApplication.id == application_id).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    db.delete(application)
    db.commit()
    
    return {"message": "Application deleted successfully"}
