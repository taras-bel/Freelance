"""
Transaction management endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_active_user
from app.crud_utils import (
    create_transaction,
    get_transaction,
    get_transactions,
    update_transaction,
    delete_transaction
)
from app.schemas import (
    TransactionCreate,
    Transaction,
    TransactionUpdate,
    MessageResponse,
    PaginatedResponse
)
from app import db_models

router = APIRouter()


@router.post("/", response_model=Transaction)
def create_new_transaction(
    transaction_data: TransactionCreate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new transaction."""
    # Create transaction
    transaction = create_transaction(db, transaction_data, current_user.id)
    return transaction


@router.get("/", response_model=PaginatedResponse)
def get_all_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    user_id: Optional[int] = Query(None),
    transaction_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get transactions with filters and pagination."""
    transactions = get_transactions(
        db, skip=skip, limit=limit, user_id=user_id,
        transaction_type=transaction_type, status=status
    )
    
    # Get total count
    total_query = db.query(db_models.Transaction)
    if user_id is not None:
        total_query = total_query.filter(db_models.Transaction.user_id == user_id)
    if transaction_type is not None:
        total_query = total_query.filter(db_models.Transaction.transaction_type == transaction_type)
    if status is not None:
        total_query = total_query.filter(db_models.Transaction.status == status)
    total = total_query.count()
    pages = (total + limit - 1) // limit
    
    return PaginatedResponse(
        items=transactions,
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=pages
    )


@router.get("/{transaction_id}", response_model=Transaction)
def get_transaction_by_id(
    transaction_id: int,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get transaction by ID."""
    transaction = get_transaction(db, transaction_id)
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Check if user is authorized to view this transaction
    if transaction.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this transaction"
        )
    
    return transaction


@router.put("/{transaction_id}", response_model=Transaction)
def update_transaction_details(
    transaction_id: int,
    transaction_data: TransactionUpdate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update transaction details."""
    transaction = get_transaction(db, transaction_id)
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Check if user is authorized to update this transaction
    if transaction.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this transaction"
        )
    
    # Don't allow updates if transaction is already completed or failed
    if transaction.status in ["completed", "failed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update transaction in current status"
        )
    
    # Update transaction
    updated_transaction = update_transaction(
        db, transaction_id, transaction_data.dict(exclude_unset=True)
    )
    if not updated_transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    return updated_transaction


@router.delete("/{transaction_id}", response_model=MessageResponse)
def delete_transaction_by_id(
    transaction_id: int,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete transaction."""
    transaction = get_transaction(db, transaction_id)
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Check if user is authorized to delete this transaction
    if transaction.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this transaction"
        )
    
    # Don't allow deletion if transaction is already completed or failed
    if transaction.status in ["completed", "failed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete transaction in current status"
        )
    
    success = delete_transaction(db, transaction_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    return {"message": "Transaction deleted successfully"}


@router.get("/me/transactions", response_model=List[Transaction])
def get_my_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get transactions for current user."""
    transactions = get_transactions(
        db, skip=skip, limit=limit, user_id=current_user.id
    )
    return transactions


@router.get("/me/income", response_model=List[Transaction])
def get_my_income_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get income transactions for current user."""
    transactions = get_transactions(
        db, skip=skip, limit=limit, user_id=current_user.id,
        transaction_type="income"
    )
    return transactions


@router.get("/me/expenses", response_model=List[Transaction])
def get_my_expense_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get expense transactions for current user."""
    transactions = get_transactions(
        db, skip=skip, limit=limit, user_id=current_user.id,
        transaction_type="expense"
    )
    return transactions


@router.get("/me/summary", response_model=dict)
def get_my_transactions_summary(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get summary of user's transactions."""
    all_transactions = get_transactions(db, user_id=current_user.id)
    
    total_income = sum(t.amount for t in all_transactions if getattr(t, "transaction_type", None) == "income" and getattr(t, "status", None) == "completed")
    total_expenses = sum(t.amount for t in all_transactions if getattr(t, "transaction_type", None) == "expense" and getattr(t, "status", None) == "completed")
    pending_transactions = [t for t in all_transactions if getattr(t, "status", None) == "pending"]
    
    return {
        "total_transactions": len(all_transactions),
        "total_income": total_income,
        "total_expenses": total_expenses,
        "net_income": total_income - total_expenses,
        "pending_transactions": len(pending_transactions),
        "completed_transactions": len([t for t in all_transactions if getattr(t, "status", None) == "completed"])
    }


@router.get("/types", response_model=List[str])
def get_transaction_types(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all transaction types."""
    transactions = get_transactions(db)
    types = list(set(t.transaction_type for t in transactions if getattr(t, "transaction_type", None) is not None))
    return types
