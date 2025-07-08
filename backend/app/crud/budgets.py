from sqlalchemy.orm import Session
from typing import Optional, List, Dict
from decimal import Decimal
from datetime import datetime, timedelta
from sqlalchemy import func
from app.db_models import Budget, Transaction
from app.schemas import BudgetCreate, BudgetUpdate


def create_budget(db: Session, budget: BudgetCreate, user_id: int) -> Budget:
    """Create a new budget"""
    db_budget = Budget(user_id=user_id, **budget.dict())
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget


def get_budget(db: Session, budget_id: int, user_id: int) -> Optional[Budget]:
    """Get a specific budget by ID"""
    return db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user_id).first()


def get_user_budgets(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    period: Optional[str] = None,
    category: Optional[str] = None
) -> List[Budget]:
    """Get all budgets for a user with optional filters"""
    query = db.query(Budget).filter(Budget.user_id == user_id)
    if status:
        query = query.filter(Budget.status == status)
    if period:
        query = query.filter(Budget.period == period)
    if category:
        query = query.filter(Budget.category == category)
    return query.order_by(Budget.created_at.desc()).offset(skip).limit(limit).all()


def update_budget(
    db: Session,
    budget_id: int,
    user_id: int,
    budget_update: BudgetUpdate
) -> Optional[Budget]:
    """Update a budget"""
    db_budget = get_budget(db, budget_id, user_id)
    if not db_budget:
        return None
    update_data = budget_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_budget, field, value)
    db.commit()
    db.refresh(db_budget)
    return db_budget


def delete_budget(db: Session, budget_id: int, user_id: int) -> bool:
    """Delete a budget"""
    db_budget = get_budget(db, budget_id, user_id)
    if not db_budget:
        return False
    db.delete(db_budget)
    db.commit()
    return True


def get_budget_analytics(db: Session, user_id: int) -> Dict[str, any]:
    """Get analytics for user's budgets"""
    budgets = db.query(Budget).filter(Budget.user_id == user_id).all()
    total_budgets = len(budgets)
    active_budgets = 0
    expired_budgets = 0
    total_amount = 0.0
    total_spent = 0.0
    total_remaining = 0.0
    periods = set()
    categories = set()
    for b in budgets:
        end_date = getattr(b, 'end_date', None)
        amount = getattr(b, 'amount', None)
        spent = getattr(b, 'spent_amount', None)
        remaining = getattr(b, 'remaining_amount', None)
        period = getattr(b, 'period', None)
        category = getattr(b, 'category', None)
        if end_date is None or (isinstance(end_date, datetime) and end_date > datetime.utcnow()):
            active_budgets += 1
        if end_date is not None and isinstance(end_date, datetime) and end_date <= datetime.utcnow():
            expired_budgets += 1
        if amount is not None:
            total_amount += float(amount)
        if spent is not None:
            total_spent += float(spent)
        if remaining is not None:
            total_remaining += float(remaining)
        if period is not None:
            periods.add(str(period))
        if category is not None:
            categories.add(category)
    overall_progress = (total_spent / total_amount * 100) if total_amount > 0 else 0
    return {
        "total_budgets": total_budgets,
        "active_budgets": active_budgets,
        "expired_budgets": expired_budgets,
        "total_amount": total_amount,
        "total_spent": total_spent,
        "total_remaining": total_remaining,
        "overall_progress": overall_progress,
        "periods": list(periods),
        "categories": list(categories)
    }


def get_current_month_budget(db: Session, user_id: int) -> Optional[Budget]:
    """Get the current month's budget"""
    now = datetime.utcnow()
    month_start = now.replace(day=1)
    month_end = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
    return (
        db.query(Budget)
        .filter(
            Budget.user_id == user_id,
            Budget.period == 'monthly',
            Budget.start_date <= month_start,
            ((Budget.end_date == None) | (Budget.end_date >= month_end)),
        )
        .order_by(Budget.start_date.desc())
        .first()
    )


def get_budget_recommendations(db: Session, user_id: int) -> Dict[str, any]:
    """Get budget recommendations based on spending patterns (simple version)"""
    budgets = db.query(Budget).filter(Budget.user_id == user_id).all()
    recommendations = {"tips": [], "suggested_budget": {}}
    if not budgets:
        recommendations["tips"].append("No budgets found. Consider creating a budget to manage your finances.")
        return recommendations
    # Suggest increasing budgets that are always exceeded
    for b in budgets:
        spent = getattr(b, 'spent_amount', None)
        amount = getattr(b, 'amount', None)
        name = getattr(b, 'name', '')
        if spent is not None and amount is not None and float(spent) > float(amount):
            recommendations["tips"].append(f"You have exceeded your budget '{name}'. Consider increasing it or reducing expenses.")
    # Suggest 50/30/20 rule
    recommendations["suggested_budget"] = {
        "needs": 50,
        "wants": 30,
        "savings": 20
    }
    return recommendations


def get_budget_alerts(db: Session, user_id: int) -> List[Dict[str, any]]:
    """Get budget alerts for overspending and budgets ending soon"""
    alerts = []
    budgets = db.query(Budget).filter(Budget.user_id == user_id).all()
    for b in budgets:
        spent = getattr(b, 'spent_amount', None)
        amount = getattr(b, 'amount', None)
        name = getattr(b, 'name', '')
        end_date = getattr(b, 'end_date', None)
        if amount is None or spent is None:
            continue
        spent = float(spent)
        amount = float(amount)
        if amount == 0:
            continue
        if spent > amount:
            alerts.append({
                "type": "overspending",
                "budget_name": name,
                "message": f"You have exceeded your budget '{name}'."
            })
        elif spent >= amount * 0.9:
            alerts.append({
                "type": "warning",
                "budget_name": name,
                "message": f"You have used 90% or more of your budget '{name}'."
            })
        if end_date is not None and isinstance(end_date, datetime):
            days_left = (end_date - datetime.utcnow()).days
            if days_left <= 7:
                alerts.append({
                    "type": "ending_soon",
                    "budget_name": name,
                    "days_left": days_left,
                    "message": f"Your budget '{name}' ends in {days_left} days."
                })
    return alerts
