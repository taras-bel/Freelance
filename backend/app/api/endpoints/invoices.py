"""
Invoice management endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_active_user
from app.crud_utils import (
    create_invoice,
    get_invoice,
    get_invoices,
    update_invoice,
    delete_invoice
)
from app.schemas import (
    InvoiceCreate,
    Invoice,
    InvoiceUpdate,
    MessageResponse,
    PaginatedResponse
)
from app.db_models import Invoice as DBInvoice

router = APIRouter()


@router.post("/", response_model=Invoice)
def create_new_invoice(
    invoice_data: InvoiceCreate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new invoice."""
    # Create invoice
    invoice = create_invoice(db, invoice_data, current_user.id)
    return invoice


@router.get("/", response_model=PaginatedResponse)
def get_all_invoices(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    issuer_id: Optional[int] = Query(None),
    recipient_id: Optional[int] = Query(None),
    task_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get invoices with filters and pagination."""
    invoices = get_invoices(
        db, skip=skip, limit=limit, issuer_id=issuer_id,
        recipient_id=recipient_id, task_id=task_id, status=status
    )
    
    # Get total count
    total_query = db.query(DBInvoice)
    if issuer_id is not None:
        total_query = total_query.filter(DBInvoice.issuer_id == issuer_id)
    if recipient_id is not None:
        total_query = total_query.filter(DBInvoice.recipient_id == recipient_id)
    if task_id is not None:
        total_query = total_query.filter(DBInvoice.task_id == task_id)
    if status is not None:
        total_query = total_query.filter(DBInvoice.status == status)
    
    total = total_query.count()
    pages = (total + limit - 1) // limit
    
    return PaginatedResponse(
        items=invoices,
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=pages
    )


@router.get("/{invoice_id}", response_model=Invoice)
def get_invoice_by_id(
    invoice_id: int,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get invoice by ID."""
    invoice = get_invoice(db, invoice_id)
    if invoice is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Check if user is authorized to view this invoice
    if (invoice.issuer_id != current_user.id and
            invoice.recipient_id != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this invoice"
        )
    
    return invoice


@router.put("/{invoice_id}", response_model=Invoice)
def update_invoice_details(
    invoice_id: int,
    invoice_data: InvoiceUpdate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update invoice details."""
    invoice = get_invoice(db, invoice_id)
    if invoice is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Check if user is authorized to update this invoice
    if invoice.issuer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this invoice"
        )
    
    # Don't allow updates if invoice is already paid or cancelled
    if str(invoice.status) in ["paid", "cancelled"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update invoice in current status"
        )
    
    # Update invoice
    updated_invoice = update_invoice(
        db, invoice_id, invoice_data.dict(exclude_unset=True)
    )
    if updated_invoice is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    return updated_invoice


@router.delete("/{invoice_id}", response_model=MessageResponse)
def delete_invoice_by_id(
    invoice_id: int,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete invoice."""
    invoice = get_invoice(db, invoice_id)
    if invoice is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Check if user is authorized to delete this invoice
    if invoice.issuer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this invoice"
        )
    
    # Don't allow deletion if invoice is already paid or cancelled
    if str(invoice.status) in ["paid", "cancelled"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete invoice in current status"
        )
    
    success = delete_invoice(db, invoice_id)
    if success is None or success is False:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    return {"message": "Invoice deleted successfully"}


@router.post("/{invoice_id}/pay", response_model=MessageResponse)
def pay_invoice(
    invoice_id: int,
    payment_method_id: int,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Pay an invoice."""
    invoice = get_invoice(db, invoice_id)
    if invoice is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Check if user is the recipient
    if invoice.recipient_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only recipient can pay invoice"
        )
    
    if str(invoice.status) != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only pay pending invoices"
        )
    
    # Update invoice status
    invoice.status = str("paid")  # type: ignore
    invoice.payment_method_id = payment_method_id
    db.commit()
    
    return {"message": "Invoice paid successfully"}


@router.post("/{invoice_id}/cancel", response_model=MessageResponse)
def cancel_invoice(
    invoice_id: int,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cancel an invoice."""
    invoice = get_invoice(db, invoice_id)
    if invoice is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Check if user is the issuer
    if invoice.issuer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only issuer can cancel invoice"
        )
    
    if str(invoice.status) != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only cancel pending invoices"
        )
    
    # Update invoice status
    invoice.status = str("cancelled")  # type: ignore
    db.commit()
    
    return {"message": "Invoice cancelled successfully"}


@router.get("/me/issued", response_model=List[Invoice])
def get_my_issued_invoices(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get invoices issued by current user."""
    invoices = get_invoices(
        db, skip=skip, limit=limit, issuer_id=current_user.id
    )
    return invoices


@router.get("/me/received", response_model=List[Invoice])
def get_my_received_invoices(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get invoices received by current user."""
    invoices = get_invoices(
        db, skip=skip, limit=limit, recipient_id=current_user.id
    )
    return invoices


@router.get("/task/{task_id}", response_model=List[Invoice])
def get_task_invoices(
    task_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get invoices for a specific task."""
    invoices = get_invoices(
        db, skip=skip, limit=limit, task_id=task_id
    )
    return invoices


@router.get("/ping")
def ping():
    return {"message": "pong"}
