from sqlalchemy.orm import Session
from typing import Optional, List
from app.db_models import FinancialGoal
from app.schemas import FinancialGoalCreate, FinancialGoalUpdate
from decimal import Decimal


def create_financial_goal(db: Session, goal: FinancialGoalCreate, user_id: int) -> FinancialGoal:
    """Create a new financial goal"""
    db_goal = FinancialGoal(user_id=user_id, **goal.dict())
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal


def get_financial_goal(db: Session, goal_id: int) -> Optional[FinancialGoal]:
    """Get a specific financial goal by ID"""
    return db.query(FinancialGoal).filter(FinancialGoal.id == goal_id).first()


def get_financial_goals(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
    category: Optional[str] = None,
    status: Optional[str] = None
) -> List[FinancialGoal]:
    """Get all financial goals for a user with optional filters"""
    query = db.query(FinancialGoal)
    if user_id is not None:
        query = query.filter(FinancialGoal.user_id == user_id)
    if category is not None:
        query = query.filter(FinancialGoal.category == category)
    if status is not None:
        query = query.filter(FinancialGoal.status == status)
    return query.order_by(FinancialGoal.created_at.desc()).offset(skip).limit(limit).all()


def update_financial_goal(db: Session, goal_id: int, goal_update: FinancialGoalUpdate) -> Optional[FinancialGoal]:
    """Update a financial goal"""
    db_goal = get_financial_goal(db, goal_id)
    if not db_goal:
        return None
    update_data = goal_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_goal, field, value)
    db.commit()
    db.refresh(db_goal)
    return db_goal


def delete_financial_goal(db: Session, goal_id: int) -> bool:
    """Delete a financial goal"""
    db_goal = get_financial_goal(db, goal_id)
    if not db_goal:
        return False
    db.delete(db_goal)
    db.commit()
    return True


def get_financial_goal_categories(db: Session, user_id: int) -> List[str]:
    categories = db.query(FinancialGoal.category).filter(FinancialGoal.user_id == user_id).distinct().all()
    return [c[0] for c in categories if c[0] is not None]


def get_user_active_goals(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[FinancialGoal]:
    return db.query(FinancialGoal).filter(FinancialGoal.user_id == user_id, FinancialGoal.status == "active").order_by(FinancialGoal.created_at.desc()).offset(skip).limit(limit).all()


def get_user_completed_goals(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[FinancialGoal]:
    return db.query(FinancialGoal).filter(FinancialGoal.user_id == user_id, FinancialGoal.status == "completed").order_by(FinancialGoal.created_at.desc()).offset(skip).limit(limit).all()


def get_goals_summary(db: Session, user_id: int) -> dict:
    goals = db.query(FinancialGoal).filter(FinancialGoal.user_id == user_id).all()
    total_goals = len(goals)
    active_goals = len([g for g in goals if getattr(g, 'status', None) == "active"])
    completed_goals = len([g for g in goals if getattr(g, 'status', None) == "completed"])
    total_target = sum(float(getattr(g, 'target_amount', 0) or 0) for g in goals)
    total_current = sum(float(getattr(g, 'current_amount', 0) or 0) for g in goals)
    overall_progress = (total_current / total_target * 100) if total_target > 0 else 0
    return {
        "total_goals": total_goals,
        "active_goals": active_goals,
        "completed_goals": completed_goals,
        "total_target_amount": total_target,
        "total_current_amount": total_current,
        "overall_progress": overall_progress
    }
