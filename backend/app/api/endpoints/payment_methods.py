"""
Payment methods management endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_active_user
from app.crud_utils import (
    create_payment_method,
    get_payment_method,
    get_payment_methods,
    update_payment_method,
    delete_payment_method
)
from app.schemas import (
    PaymentMethodCreate,
    PaymentMethod,
    PaymentMethodUpdate,
    MessageResponse,
    PaginatedResponse
)
from app.db_models import PaymentMethod as DBPaymentMethod

router = APIRouter()


@router.post("/", response_model=PaymentMethod)
def create_new_payment_method(
    payment_method_data: PaymentMethodCreate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new payment method."""
    # Create payment method
    payment_method = create_payment_method(db, payment_method_data, current_user.id)
    return payment_method


@router.get("/", response_model=PaginatedResponse)
def get_all_payment_methods(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    user_id: Optional[int] = Query(None),
    method_type: Optional[str] = Query(None),
    is_default: Optional[bool] = Query(None),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get payment methods with filters and pagination."""
    payment_methods = get_payment_methods(
        db, skip=skip, limit=limit, user_id=user_id,
        method_type=method_type, is_default=is_default
    )
    
    # Get total count
    total_query = db.query(DBPaymentMethod)
    if user_id is not None:
        total_query = total_query.filter(DBPaymentMethod.user_id == user_id)
    if method_type is not None:
        total_query = total_query.filter(DBPaymentMethod.method_type == method_type)
    if is_default is not None:
        total_query = total_query.filter(DBPaymentMethod.is_default == is_default)
    
    total = total_query.count()
    pages = (total + limit - 1) // limit
    
    return PaginatedResponse(
        items=payment_methods,
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=pages
    )


@router.get("/{payment_method_id}", response_model=PaymentMethod)
def get_payment_method_by_id(
    payment_method_id: int,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get payment method by ID."""
    payment_method = get_payment_method(db, payment_method_id)
    if payment_method is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment method not found"
        )
    
    # Check if user is authorized to view this payment method
    if getattr(payment_method, 'user_id', None) != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this payment method"
        )
    
    return payment_method


@router.put("/{payment_method_id}", response_model=PaymentMethod)
def update_payment_method_details(
    payment_method_id: int,
    payment_method_data: PaymentMethodUpdate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update payment method details."""
    payment_method = get_payment_method(db, payment_method_id)
    if payment_method is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment method not found"
        )
    
    # Check if user is authorized to update this payment method
    if getattr(payment_method, 'user_id', None) != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this payment method"
        )
    
    # Update payment method
    updated_payment_method = update_payment_method(
        db, payment_method_id, payment_method_data.dict(exclude_unset=True)
    )
    if updated_payment_method is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment method not found"
        )
    
    return updated_payment_method


@router.delete("/{payment_method_id}", response_model=MessageResponse)
def delete_payment_method_by_id(
    payment_method_id: int,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete payment method."""
    payment_method = get_payment_method(db, payment_method_id)
    if payment_method is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment method not found"
        )
    
    # Check if user is authorized to delete this payment method
    if getattr(payment_method, 'user_id', None) != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this payment method"
        )
    
    # Don't allow deletion if it's the default payment method
    if getattr(payment_method, 'is_default', False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete default payment method"
        )
    
    success = delete_payment_method(db, payment_method_id)
    if success is None or success is False:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment method not found"
        )
    
    return {"message": "Payment method deleted successfully"}


@router.post("/{payment_method_id}/set-default", response_model=MessageResponse)
def set_default_payment_method(
    payment_method_id: int,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Set payment method as default."""
    payment_method = get_payment_method(db, payment_method_id)
    if payment_method is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment method not found"
        )
    
    # Check if user is authorized to update this payment method
    if getattr(payment_method, 'user_id', None) != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this payment method"
        )
    
    # Remove default from all other payment methods
    user_payment_methods = get_payment_methods(db, user_id=current_user.id)
    for pm in user_payment_methods:
        if getattr(pm, 'id', None) != payment_method_id:
            setattr(pm, 'is_default', False)  # type: ignore
    
    # Set this payment method as default
    setattr(payment_method, 'is_default', True)  # type: ignore
    db.commit()
    
    return {"message": "Payment method set as default"}


@router.get("/me/methods", response_model=List[PaymentMethod])
def get_my_payment_methods(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get payment methods for current user."""
    payment_methods = get_payment_methods(
        db, skip=skip, limit=limit, user_id=current_user.id
    )
    return payment_methods


@router.get("/me/default", response_model=PaymentMethod)
def get_my_default_payment_method(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get default payment method for current user."""
    payment_methods = get_payment_methods(
        db, user_id=current_user.id, is_default=True, limit=1
    )
    if not payment_methods:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No default payment method found"
        )
    return payment_methods[0]


@router.get("/types", response_model=List[str])
def get_payment_method_types(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all payment method types."""
    payment_methods = get_payment_methods(db)
    types = list(set(getattr(pm, 'method_type', None) for pm in payment_methods if getattr(pm, 'method_type', None)))
    return types


@router.get("/me/summary", response_model=dict)
def get_my_payment_methods_summary(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get summary of user's payment methods."""
    payment_methods = get_payment_methods(db, user_id=current_user.id)
    
    # Count by type
    type_counts = {}
    for pm in payment_methods:
        if getattr(pm, 'method_type', None) not in type_counts:
            type_counts[getattr(pm, 'method_type', None)] = 0
        type_counts[getattr(pm, 'method_type', None)] += 1
    
    default_method = next((pm for pm in payment_methods if getattr(pm, 'is_default', False)), None)
    
    return {
        "total_methods": len(payment_methods),
        "has_default": default_method is not None,
        "default_method_type": getattr(default_method, 'method_type', None) if default_method else None,
        "type_breakdown": type_counts
    }
