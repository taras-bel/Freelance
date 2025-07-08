from sqlalchemy.orm import Session
from typing import Optional, List
from app.db_models import Invoice
from app.schemas import InvoiceCreate, InvoiceUpdate


def create_invoice(db: Session, invoice: InvoiceCreate, issuer_id: int) -> Invoice:
    db_invoice = Invoice(issuer_id=issuer_id, **invoice.dict())
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice


def get_invoice(db: Session, invoice_id: int) -> Optional[Invoice]:
    return db.query(Invoice).filter(Invoice.id == invoice_id).first()


def get_invoices(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    issuer_id: Optional[int] = None,
    recipient_id: Optional[int] = None,
    task_id: Optional[int] = None,
    status: Optional[str] = None
) -> List[Invoice]:
    query = db.query(Invoice)
    if issuer_id is not None:
        query = query.filter(Invoice.issuer_id == issuer_id)
    if recipient_id is not None:
        query = query.filter(Invoice.recipient_id == recipient_id)
    if task_id is not None:
        query = query.filter(Invoice.task_id == task_id)
    if status is not None:
        query = query.filter(Invoice.status == status)
    return query.order_by(Invoice.created_at.desc()).offset(skip).limit(limit).all()


def update_invoice(db: Session, invoice_id: int, invoice_update: InvoiceUpdate) -> Optional[Invoice]:
    db_invoice = get_invoice(db, invoice_id)
    if not db_invoice:
        return None
    update_data = invoice_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_invoice, field, value)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice


def delete_invoice(db: Session, invoice_id: int) -> bool:
    db_invoice = get_invoice(db, invoice_id)
    if not db_invoice:
        return False
    db.delete(db_invoice)
    db.commit()
    return True


def get_issued_invoices(db: Session, issuer_id: int, skip: int = 0, limit: int = 100) -> List[Invoice]:
    return db.query(Invoice).filter(Invoice.issuer_id == issuer_id).order_by(Invoice.created_at.desc()).offset(skip).limit(limit).all()


def get_received_invoices(db: Session, recipient_id: int, skip: int = 0, limit: int = 100) -> List[Invoice]:
    return db.query(Invoice).filter(Invoice.recipient_id == recipient_id).order_by(Invoice.created_at.desc()).offset(skip).limit(limit).all()


def get_task_invoices(db: Session, task_id: int, skip: int = 0, limit: int = 100) -> List[Invoice]:
    return db.query(Invoice).filter(Invoice.task_id == task_id).order_by(Invoice.created_at.desc()).offset(skip).limit(limit).all()
