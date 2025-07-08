"""
Budget management endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime
from decimal import Decimal

from app.database import get_db
from app.auth import get_current_active_user
from app.crud_utils import (
    create_budget,
    get_budget,
    get_budgets,
    update_budget,
    delete_budget
)
from app.schemas import (
    BudgetCreate,
    Budget,
    BudgetUpdate,
    MessageResponse,
    PaginatedResponse
)
from app.db_models import Budget as DBBudget

router = APIRouter()


@router.post("/", response_model=Budget)
def create_new_budget(
    budget_data: BudgetCreate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new budget."""
    # Create budget
    budget = create_budget(db, budget_data, current_user.id)
    return budget


@router.get("/", response_model=PaginatedResponse)
def get_all_budgets(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    user_id: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    period: Optional[str] = Query(None),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get budgets with filters and pagination."""
    budgets = get_budgets(
        db, skip=skip, limit=limit, user_id=user_id,
        category=category, period=period
    )
    
    # Get total count
    total_query = db.query(DBBudget)
    if user_id is not None:
        total_query = total_query.filter(DBBudget.user_id == user_id)
    if category is not None:
        total_query = total_query.filter(DBBudget.category == category)
    if period is not None:
        total_query = total_query.filter(DBBudget.period == period)
    
    total = total_query.count()
    pages = (total + limit - 1) // limit
    
    return PaginatedResponse(
        items=budgets,
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=pages
    )


@router.get("/{budget_id}", response_model=Budget)
def get_budget_by_id(
    budget_id: int,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get budget by ID."""
    budget = get_budget(db, budget_id)
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    # Check if user is authorized to view this budget
    if budget.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this budget"
        )
    
    return budget


@router.put("/{budget_id}", response_model=Budget)
def update_budget_details(
    budget_id: int,
    budget_data: BudgetUpdate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update budget details."""
    budget = get_budget(db, budget_id)
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    # Check if user is authorized to update this budget
    if budget.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this budget"
        )
    
    # Update budget
    updated_budget = update_budget(
        db, budget_id, budget_data.dict(exclude_unset=True)
    )
    if not updated_budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    return updated_budget


@router.delete("/{budget_id}", response_model=MessageResponse)
def delete_budget_by_id(
    budget_id: int,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete budget."""
    budget = get_budget(db, budget_id)
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    # Check if user is authorized to delete this budget
    if budget.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this budget"
        )
    
    success = delete_budget(db, budget_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    return {"message": "Budget deleted successfully"}


@router.get("/me/budgets", response_model=List[Budget])
def get_my_budgets(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get budgets for current user."""
    budgets = get_budgets(
        db, skip=skip, limit=limit, user_id=current_user.id
    )
    return budgets


@router.get("/me/active", response_model=List[Budget])
def get_my_active_budgets(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get active budgets for current user."""
    budgets = get_budgets(
        db, skip=skip, limit=limit, user_id=current_user.id
    )
    # Filter active budgets (not expired)
    active_budgets = [
        budget for budget in budgets 
        for _end in [get_end_date(budget)]
        if _end is None or _end > datetime.utcnow()
    ]
    return active_budgets


@router.get("/me/category/{category}", response_model=List[Budget])
def get_my_budgets_by_category(
    category: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get budgets for a specific category for current user."""
    budgets = get_budgets(
        db, skip=skip, limit=limit, user_id=current_user.id, category=category
    )
    return budgets


@router.get("/categories", response_model=List[str])
def get_budget_categories(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all budget categories."""
    budgets = get_budgets(db)
    categories = list(set(getattr(budget, "category", None) for budget in budgets if getattr(budget, "category", None) is not None))
    return categories


@router.get("/periods", response_model=List[str])
def get_budget_periods(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all budget periods."""
    budgets = get_budgets(db)
    periods = list(set(getattr(budget, "period", None) for budget in budgets if getattr(budget, "period", None) is not None))
    return periods


@router.get("/me/summary", response_model=dict)
def get_my_budgets_summary(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get summary of user's budgets."""
    all_budgets = get_budgets(db, user_id=current_user.id)
    
    total_budget = sum(getattr(budget, "amount", 0) for budget in all_budgets)
    total_spent = sum(getattr(budget, "spent_amount", 0) for budget in all_budgets)
    total_remaining = total_budget - total_spent
    
    # Count budgets by status
    active_budgets = len([
        b for b in all_budgets
        for _end in [get_end_date(b)]
        if _end is None or _end > datetime.utcnow()
    ])
    expired_budgets = len([
        b for b in all_budgets
        for _end in [get_end_date(b)]
        if _end is not None and _end <= datetime.utcnow()
    ])
    
    # Calculate overall progress
    if isinstance(total_budget, (int, float, Decimal)) and total_budget > 0:
        overall_progress = (total_spent / total_budget * 100)
    else:
        overall_progress = 0
    
    return {
        "total_budgets": len(all_budgets),
        "active_budgets": active_budgets,
        "expired_budgets": expired_budgets,
        "total_budget": total_budget,
        "total_spent": total_spent,
        "total_remaining": total_remaining,
        "overall_progress": overall_progress
    }


@router.post("/{budget_id}/update-spending", response_model=MessageResponse)
def update_budget_spending(
    budget_id: int,
    amount: float,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update spending for a budget."""
    budget = get_budget(db, budget_id)
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    # Check if user is authorized to update this budget
    if budget.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this budget"
        )
    
    # Update spending
    current_spent = get_decimal(budget, 'spent_amount')
    setattr(budget, 'spent_amount', current_spent + Decimal(str(amount)))
    amount_val = get_decimal(budget, 'amount')
    spent_val = get_decimal(budget, 'spent_amount')
    if spent_val > amount_val:
        budget.status = "exceeded"
    elif spent_val >= amount_val * Decimal('0.9'):
        budget.status = "warning"
    
    db.commit()
    
    return {"message": "Budget spending updated successfully"}


def get_end_date(budget):
    value = getattr(budget, 'end_date', None)
    if hasattr(value, 'comparator'):
        return None
    return value

def get_decimal(budget, field):
    value = getattr(budget, field, None)
    if hasattr(value, 'comparator') or value is None:
        return Decimal('0')
    return Decimal(str(value))
