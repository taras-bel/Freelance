"""
Financial goals management endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_active_user
from app.crud_utils import (
    create_financial_goal,
    get_financial_goal,
    get_financial_goals,
    update_financial_goal,
    delete_financial_goal
)
from app.schemas import (
    FinancialGoalCreate,
    FinancialGoal,
    FinancialGoalUpdate,
    MessageResponse,
    PaginatedResponse
)
from app.db_models import FinancialGoal as DBFinancialGoal

router = APIRouter()


@router.post("/", response_model=FinancialGoal)
def create_new_financial_goal(
    goal_data: FinancialGoalCreate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new financial goal."""
    # Create financial goal
    goal = create_financial_goal(db, goal_data, current_user.id)
    return goal


@router.get("/", response_model=PaginatedResponse)
def get_all_financial_goals(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    user_id: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get financial goals with filters and pagination."""
    goals = get_financial_goals(
        db, skip=skip, limit=limit, user_id=user_id,
        category=category, status=status
    )
    
    # Get total count
    total_query = db.query(DBFinancialGoal)
    if user_id is not None:
        total_query = total_query.filter(DBFinancialGoal.user_id == user_id)
    if category is not None:
        total_query = total_query.filter(DBFinancialGoal.category == category)
    if status is not None:
        total_query = total_query.filter(DBFinancialGoal.status == status)
    
    total = total_query.count()
    pages = (total + limit - 1) // limit
    
    return PaginatedResponse(
        items=goals,
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=pages
    )


@router.get("/{goal_id}", response_model=FinancialGoal)
def get_financial_goal_by_id(
    goal_id: int,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get financial goal by ID."""
    goal = get_financial_goal(db, goal_id)
    if goal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Financial goal not found"
        )
    
    # Check if user is authorized to view this goal
    if goal.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this financial goal"
        )
    
    return goal


@router.put("/{goal_id}", response_model=FinancialGoal)
def update_financial_goal_details(
    goal_id: int,
    goal_data: FinancialGoalUpdate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update financial goal details."""
    goal = get_financial_goal(db, goal_id)
    if goal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Financial goal not found"
        )
    
    # Check if user is authorized to update this goal
    if goal.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this financial goal"
        )
    
    # Update financial goal
    updated_goal = update_financial_goal(
        db, goal_id, goal_data.dict(exclude_unset=True)
    )
    if updated_goal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Financial goal not found"
        )
    
    return updated_goal


@router.delete("/{goal_id}", response_model=MessageResponse)
def delete_financial_goal_by_id(
    goal_id: int,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete financial goal."""
    goal = get_financial_goal(db, goal_id)
    if goal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Financial goal not found"
        )
    
    # Check if user is authorized to delete this goal
    if goal.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this financial goal"
        )
    
    success = delete_financial_goal(db, goal_id)
    if success is None or success is False:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Financial goal not found"
        )
    
    return {"message": "Financial goal deleted successfully"}


@router.post("/{goal_id}/update-progress", response_model=MessageResponse)
def update_goal_progress(
    goal_id: int,
    amount: float,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update progress towards a financial goal."""
    db_goal = db.query(DBFinancialGoal).filter(DBFinancialGoal.id == goal_id).first()
    if db_goal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Financial goal not found")
    if db_goal.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this financial goal")
    current_amount = float(getattr(db_goal, 'current_amount', 0))
    target_amount = float(getattr(db_goal, 'target_amount', 0))
    db_goal.current_amount = current_amount + float(amount)  # type: ignore
    if float(getattr(db_goal, 'current_amount', 0.0)) >= float(target_amount):
        db_goal.status = str("completed")  # type: ignore
    db.commit()
    return {"message": "Goal progress updated successfully"}


@router.get("/me/goals", response_model=List[FinancialGoal])
def get_my_financial_goals(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get financial goals for current user."""
    goals = get_financial_goals(
        db, skip=skip, limit=limit, user_id=current_user.id
    )
    return goals


@router.get("/me/active", response_model=List[FinancialGoal])
def get_my_active_goals(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get active financial goals for current user."""
    goals = get_financial_goals(
        db, skip=skip, limit=limit, user_id=current_user.id, status="active"
    )
    return goals


@router.get("/me/completed", response_model=List[FinancialGoal])
def get_my_completed_goals(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get completed financial goals for current user."""
    goals = get_financial_goals(
        db, skip=skip, limit=limit, user_id=current_user.id, status="completed"
    )
    return goals


@router.get("/categories", response_model=List[str])
def get_financial_goal_categories(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all financial goal categories."""
    goals = get_financial_goals(db)
    categories = list(set(goal.category for goal in goals if getattr(goal, 'category', None)))
    return categories


@router.get("/me/summary", response_model=dict)
def get_my_goals_summary(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get summary of user's financial goals."""
    all_goals = get_financial_goals(db, user_id=current_user.id)
    active_goals = [goal for goal in all_goals if getattr(goal, 'status', None) == "active"]
    completed_goals = [goal for goal in all_goals if getattr(goal, 'status', None) == "completed"]
    
    total_target = sum(float(getattr(goal, 'target_amount', 0.0)) for goal in active_goals)
    total_current = sum(float(getattr(goal, 'current_amount', 0.0)) for goal in active_goals)
    total_completed_value = sum(float(getattr(goal, 'target_amount', 0.0)) for goal in completed_goals)
    
    return {
        "total_goals": len(all_goals),
        "active_goals": len(active_goals),
        "completed_goals": len(completed_goals),
        "total_target": total_target,
        "total_current": total_current,
        "total_completed_value": total_completed_value,
        "overall_progress": (float(total_current) / float(total_target) * 100) if float(total_target) > 0 else 0
    }
