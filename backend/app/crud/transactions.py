from sqlalchemy.orm import Session
from typing import Optional, List
from app.db_models import Transaction
from app.schemas import TransactionCreate, TransactionUpdate


def create_transaction(db: Session, transaction: TransactionCreate, user_id: int) -> Transaction:
    db_transaction = Transaction(user_id=user_id, **transaction.dict())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def get_transaction(db: Session, transaction_id: int) -> Optional[Transaction]:
    return db.query(Transaction).filter(Transaction.id == transaction_id).first()


def get_transactions(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
    transaction_type: Optional[str] = None,
    status: Optional[str] = None
) -> List[Transaction]:
    query = db.query(Transaction)
    if user_id is not None:
        query = query.filter(Transaction.user_id == user_id)
    if transaction_type is not None:
        query = query.filter(Transaction.transaction_type == transaction_type)
    if status is not None:
        query = query.filter(Transaction.status == status)
    return query.order_by(Transaction.created_at.desc()).offset(skip).limit(limit).all()


def update_transaction(db: Session, transaction_id: int, transaction_update: TransactionUpdate) -> Optional[Transaction]:
    db_transaction = get_transaction(db, transaction_id)
    if not db_transaction:
        return None
    update_data = transaction_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_transaction, field, value)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def delete_transaction(db: Session, transaction_id: int) -> bool:
    db_transaction = get_transaction(db, transaction_id)
    if not db_transaction:
        return False
    db.delete(db_transaction)
    db.commit()
    return True


def get_income_transactions(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Transaction]:
    return db.query(Transaction).filter(Transaction.user_id == user_id, Transaction.transaction_type == 'deposit').order_by(Transaction.created_at.desc()).offset(skip).limit(limit).all()


def get_expense_transactions(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Transaction]:
    return db.query(Transaction).filter(Transaction.user_id == user_id, Transaction.transaction_type == 'withdrawal').order_by(Transaction.created_at.desc()).offset(skip).limit(limit).all()
