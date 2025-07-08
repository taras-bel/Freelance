"""
Payment endpoints for handling transactions.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from decimal import Decimal

from app.database import get_db
from app.auth import get_current_active_user
from app.schemas import Payment, PaymentCreate, PaymentUpdate, PaymentMethod, PaymentMethodCreate
from app.db_models import User, Payment as DBPayment, PaymentMethod as DBPaymentMethod, Task
from app.services.financial_service import FinancialService
from app.core.config import Settings

router = APIRouter()
financial_service = FinancialService()


@router.get("/", response_model=List[Payment])
def get_all_payments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all payments for the current user."""
    payments = db.query(DBPayment).filter(
        DBPayment.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    # Convert to Pydantic schemas
    from app.schemas import Payment as PaymentSchema
    return [PaymentSchema.from_orm(payment) for payment in payments]


@router.get("/task/{task_id}", response_model=List[Payment])
def get_task_payments(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all payments for a specific task."""
    # Check if task exists and user has access
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Check if user is task creator or assigned freelancer
    if task.creator_id != current_user.id and task.assigned_to_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view payments for this task"
        )
    
    payments = db.query(DBPayment).filter(
        DBPayment.task_id == task_id
    ).all()
    
    # Convert to Pydantic schemas
    from app.schemas import Payment as PaymentSchema
    return [PaymentSchema.from_orm(payment) for payment in payments]


@router.post("/", response_model=Payment)
def create_payment(
    payment_data: PaymentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new payment. Прямые платежи между клиентом и фрилансером для задач запрещены, используйте escrow."""
    # Check if task exists
    if payment_data.task_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Direct payments for tasks are not allowed. Use escrow system."
        )
    # Create payment (разрешено только для пополнения баланса, вывода и т.п.)
    payment = DBPayment(
        **payment_data.dict(),
        user_id=current_user.id,
        status="pending"
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    from app.schemas import Payment as PaymentSchema
    return PaymentSchema.from_orm(payment)


@router.get("/{payment_id}", response_model=Payment)
def get_payment_by_id(
    payment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get payment by ID."""
    payment = db.query(DBPayment).filter(DBPayment.id == payment_id).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Check authorization
    if payment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this payment"
        )
    
    # Convert to Pydantic schema
    from app.schemas import Payment as PaymentSchema
    return PaymentSchema.from_orm(payment)


@router.put("/{payment_id}", response_model=Payment)
def update_payment(
    payment_id: int,
    payment_data: PaymentUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update payment."""
    payment = db.query(DBPayment).filter(DBPayment.id == payment_id).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Check authorization
    if payment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this payment"
        )
    
    # Update payment
    for key, value in payment_data.dict(exclude_unset=True).items():
        setattr(payment, key, value)
    
    db.commit()
    db.refresh(payment)
    
    # Convert to Pydantic schema
    from app.schemas import Payment as PaymentSchema
    return PaymentSchema.from_orm(payment)


@router.put("/{payment_id}/status")
def update_payment_status(
    payment_id: int,
    status_update: dict,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update payment status."""
    payment = db.query(DBPayment).filter(DBPayment.id == payment_id).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    new_status = status_update.get("status")
    if not new_status or new_status not in ["pending", "completed", "failed", "cancelled"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status"
        )
    
    payment.status = new_status
    db.commit()
    
    return {"message": f"Payment status updated to {new_status}"}


# Payment Methods endpoints
@router.get("/methods/", response_model=List[PaymentMethod])
def get_payment_methods(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's payment methods."""
    methods = db.query(DBPaymentMethod).filter(
        DBPaymentMethod.user_id == current_user.id
    ).all()
    
    # Convert to Pydantic schemas
    from app.schemas import PaymentMethod as PaymentMethodSchema
    return [PaymentMethodSchema.from_orm(method) for method in methods]


@router.post("/methods/", response_model=PaymentMethod)
def create_payment_method(
    method_data: PaymentMethodCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new payment method."""
    method = DBPaymentMethod(
        **method_data.dict(),
        user_id=current_user.id
    )
    
    db.add(method)
    db.commit()
    db.refresh(method)
    
    # Convert to Pydantic schema
    from app.schemas import PaymentMethod as PaymentMethodSchema
    return PaymentMethodSchema.from_orm(method)


@router.delete("/methods/{method_id}")
def delete_payment_method(
    method_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete payment method."""
    method = db.query(DBPaymentMethod).filter(DBPaymentMethod.id == method_id).first()
    if not method:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment method not found"
        )
    
    if method.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this payment method"
        )
    
    db.delete(method)
    db.commit()
    
    return {"message": "Payment method deleted successfully"}


@router.get("/calculate-commission")
def calculate_commission(
    amount: float = Query(..., gt=0, description="Payment/withdrawal amount"),
    transaction_type: str = Query("payment", description="Type of transaction: 'payment' or 'withdrawal'"),
    current_user: User = Depends(get_current_active_user)
):
    """Calculate service commission for a payment or withdrawal amount."""
    if transaction_type not in ["payment", "withdrawal"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="transaction_type must be 'payment' or 'withdrawal'"
        )
    
    fees = financial_service.calculate_fees(Decimal(str(amount)))
    return {
        "original_amount": float(fees["gross_amount"]),
        "service_commission": float(fees["service_commission"]),
        "commission_percentage": 3.0,
        "net_amount": float(fees["net_amount"]),
        "total_fees": float(fees["total_fees"]),
        "transaction_type": transaction_type
    }


@router.get("/methods/available")
def get_available_payment_methods(country: str = "US"):
    """Вернуть список доступных способов оплаты для страны."""
    settings = Settings()
    methods = [
        {"id": "stripe_card", "name": "Credit/Debit Card", "provider": "stripe"},
        {"id": "stripe_local", "name": "Local Methods (Stripe)", "provider": "stripe"},
    ]
    if settings.PAYPAL_CLIENT_ID:
        methods.append({"id": "paypal", "name": "PayPal", "provider": "paypal"})
    if country in ["RU", "KZ"] and settings.QIWI_PUBLIC_KEY:
        methods.append({"id": "qiwi", "name": "Qiwi Wallet", "provider": "qiwi"})
    if country in ["RU", "KZ", "UA", "BY"]:
        methods.append({"id": "yoomoney", "name": "ЮMoney (Яндекс.Деньги)", "provider": "yoomoney"})
    if country in ["KE", "NG", "GH", "TZ"]:
        methods.append({"id": "mpesa", "name": "M-Pesa", "provider": "mpesa"})
    return {"country": country, "methods": methods}
