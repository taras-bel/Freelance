from sqlalchemy.orm import Session
from typing import Optional, List
from app.db_models import Payment
from app.schemas import PaymentCreate, PaymentUpdate


def create_payment(db: Session, payment: PaymentCreate, sender_id: int) -> Payment:
    db_payment = Payment(sender_id=sender_id, **payment.dict())
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment


def get_payment(db: Session, payment_id: int) -> Optional[Payment]:
    return db.query(Payment).filter(Payment.id == payment_id).first()


def get_payments(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    sender_id: Optional[int] = None,
    recipient_id: Optional[int] = None,
    task_id: Optional[int] = None,
    status: Optional[str] = None
) -> List[Payment]:
    query = db.query(Payment)
    if sender_id is not None:
        query = query.filter(Payment.sender_id == sender_id)
    if recipient_id is not None:
        query = query.filter(Payment.recipient_id == recipient_id)
    if task_id is not None:
        query = query.filter(Payment.task_id == task_id)
    if status is not None:
        query = query.filter(Payment.status == status)
    return query.order_by(Payment.created_at.desc()).offset(skip).limit(limit).all()


def update_payment(db: Session, payment_id: int, payment_update: PaymentUpdate) -> Optional[Payment]:
    db_payment = get_payment(db, payment_id)
    if not db_payment:
        return None
    update_data = payment_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_payment, field, value)
    db.commit()
    db.refresh(db_payment)
    return db_payment


def delete_payment(db: Session, payment_id: int) -> bool:
    db_payment = get_payment(db, payment_id)
    if not db_payment:
        return False
    db.delete(db_payment)
    db.commit()
    return True


def get_sent_payments(db: Session, sender_id: int, skip: int = 0, limit: int = 100) -> List[Payment]:
    return db.query(Payment).filter(Payment.sender_id == sender_id).order_by(Payment.created_at.desc()).offset(skip).limit(limit).all()


def get_received_payments(db: Session, recipient_id: int, skip: int = 0, limit: int = 100) -> List[Payment]:
    return db.query(Payment).filter(Payment.recipient_id == recipient_id).order_by(Payment.created_at.desc()).offset(skip).limit(limit).all()


def get_task_payments(db: Session, task_id: int, skip: int = 0, limit: int = 100) -> List[Payment]:
    return db.query(Payment).filter(Payment.task_id == task_id).order_by(Payment.created_at.desc()).offset(skip).limit(limit).all()
