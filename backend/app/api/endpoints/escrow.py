"""
Escrow system for secure payments between clients and freelancers.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from decimal import Decimal
import stripe
from app.core.config import Settings

from app.database import get_db
from app.auth import get_current_active_user
from app.schemas import Escrow, EscrowCreate, EscrowUpdate
from app.db_models import User, Escrow as DBEscrow, Task, Payment

router = APIRouter()


@router.get("/", response_model=List[Escrow])
def get_escrow_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status_filter: Optional[str] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get escrow transactions for the current user."""
    query = db.query(DBEscrow).filter(
        (DBEscrow.client_id == current_user.id) | (DBEscrow.freelancer_id == current_user.id)
    )
    
    if status_filter:
        query = query.filter(DBEscrow.status == status_filter)
    
    escrows = query.offset(skip).limit(limit).all()
    
    # Convert to Pydantic schemas
    from app.schemas import Escrow as EscrowSchema
    return [EscrowSchema.from_orm(escrow) for escrow in escrows]


@router.post("/", response_model=Escrow)
def create_escrow(
    escrow_data: EscrowCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new escrow transaction."""
    # Check if task exists and user is the client
    task = db.query(Task).filter(Task.id == escrow_data.task_id).first()
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    if task.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only task creator can create escrow"
        )
    
    # Check if freelancer is assigned
    if task.assigned_to_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task must be assigned to a freelancer"
        )
    
    # Check if escrow already exists for this task
    existing_escrow = db.query(DBEscrow).filter(DBEscrow.task_id == escrow_data.task_id).first()
    if existing_escrow is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Escrow already exists for this task"
        )
    
    # Create escrow
    escrow = DBEscrow(
        task_id=escrow_data.task_id,
        client_id=current_user.id,
        freelancer_id=task.assigned_to_id,
        amount=escrow_data.amount,
        platform_fee=escrow_data.amount * Decimal('0.05'),  # 5% platform fee
        freelancer_amount=escrow_data.amount * Decimal('0.95'),
        status="pending",
        created_at=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(days=30)
    )
    
    db.add(escrow)
    db.commit()
    db.refresh(escrow)
    
    # Convert to Pydantic schema
    from app.schemas import Escrow as EscrowSchema
    return EscrowSchema.from_orm(escrow)


@router.get("/{escrow_id}", response_model=Escrow)
def get_escrow_by_id(
    escrow_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get escrow by ID."""
    escrow = db.query(DBEscrow).filter(DBEscrow.id == escrow_id).first()
    if escrow is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Escrow not found"
        )
    
    # Check authorization
    if escrow.client_id != current_user.id and escrow.freelancer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this escrow"
        )
    
    # Convert to Pydantic schema
    from app.schemas import Escrow as EscrowSchema
    return EscrowSchema.from_orm(escrow)


@router.post("/{escrow_id}/fund")
def fund_escrow(
    escrow_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Fund the escrow (client pays the amount)."""
    escrow = db.query(DBEscrow).filter(DBEscrow.id == escrow_id).first()
    if escrow is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Escrow not found"
        )
    
    if escrow.client_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only client can fund escrow"
        )
    
    if escrow.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Escrow is not in pending status"
        )
    
    # Here you would integrate with payment gateway
    # For now, we'll simulate successful payment
    setattr(escrow, 'status', "funded")
    setattr(escrow, 'funded_at', datetime.utcnow())
    
    db.commit()
    
    return {"message": "Escrow funded successfully"}


@router.post("/{escrow_id}/release")
def release_escrow(
    escrow_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Release escrow funds to freelancer (client approves work)."""
    escrow = db.query(DBEscrow).filter(DBEscrow.id == escrow_id).first()
    if not escrow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Escrow not found"
        )
    
    if escrow.client_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only client can release escrow"
        )
    
    if escrow.status != "funded":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Escrow is not funded"
        )
    
    # Create payment record
    payment = Payment(
        amount=escrow.freelancer_amount,
        sender_id=escrow.client_id,
        recipient_id=escrow.freelancer_id,
        task_id=escrow.task_id,
        payment_type="escrow_release",
        status="completed",
        created_at=datetime.utcnow()
    )
    
    db.add(payment)
    
    # Update escrow status
    escrow.status = "released"
    escrow.released_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Escrow released successfully"}


@router.post("/{escrow_id}/dispute")
def dispute_escrow(
    escrow_id: int,
    reason: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a dispute for escrow."""
    escrow = db.query(DBEscrow).filter(DBEscrow.id == escrow_id).first()
    if not escrow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Escrow not found"
        )
    
    if escrow.client_id != current_user.id and escrow.freelancer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to dispute this escrow"
        )
    
    if escrow.status not in ["funded", "in_progress"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Escrow cannot be disputed in current status"
        )
    
    escrow.status = "disputed"
    escrow.dispute_reason = reason
    escrow.disputed_at = datetime.utcnow()
    escrow.disputed_by = current_user.id
    
    db.commit()
    
    return {"message": "Dispute created successfully"}


@router.post("/{escrow_id}/resolve")
def resolve_dispute(
    escrow_id: int,
    resolution: str,  # "client_win", "freelancer_win", "split"
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Resolve escrow dispute (admin only)."""
    escrow = db.query(DBEscrow).filter(DBEscrow.id == escrow_id).first()
    if not escrow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Escrow not found"
        )
    
    # Check if user is admin (you might want to add admin role)
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can resolve disputes"
        )
    
    if escrow.status != "disputed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Escrow is not in disputed status"
        )
    
    if resolution == "client_win":
        # Return funds to client
        escrow.status = "refunded"
        escrow.resolution = "client_win"
    elif resolution == "freelancer_win":
        # Release funds to freelancer
        escrow.status = "released"
        escrow.resolution = "freelancer_win"
        
        # Create payment record
        payment = Payment(
            amount=escrow.freelancer_amount,
            sender_id=escrow.client_id,
            recipient_id=escrow.freelancer_id,
            task_id=escrow.task_id,
            payment_type="dispute_resolution",
            status="completed",
            created_at=datetime.utcnow()
        )
        db.add(payment)
    elif resolution == "split":
        # Split funds between client and freelancer
        split_amount = escrow.freelancer_amount / 2
        
        escrow.status = "split"
        escrow.resolution = "split"
        
        # Create payment record for freelancer
        payment = Payment(
            amount=split_amount,
            sender_id=escrow.client_id,
            recipient_id=escrow.freelancer_id,
            task_id=escrow.task_id,
            payment_type="dispute_split",
            status="completed",
            created_at=datetime.utcnow()
        )
        db.add(payment)
    
    escrow.resolved_at = datetime.utcnow()
    escrow.resolved_by = current_user.id
    
    db.commit()
    
    return {"message": f"Dispute resolved: {resolution}"}


@router.get("/stats/summary")
def get_escrow_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get escrow statistics for the current user."""
    # Get escrows where user is client or freelancer
    escrows = db.query(DBEscrow).filter(
        (DBEscrow.client_id == current_user.id) | (DBEscrow.freelancer_id == current_user.id)
    ).all()
    
    total_amount = sum(escrow.amount for escrow in escrows)
    pending_amount = sum(escrow.amount for escrow in escrows if escrow.status == "pending")
    funded_amount = sum(escrow.amount for escrow in escrows if escrow.status == "funded")
    released_amount = sum(escrow.amount for escrow in escrows if escrow.status == "released")
    disputed_amount = sum(escrow.amount for escrow in escrows if escrow.status == "disputed")
    
    return {
        "total_transactions": len(escrows),
        "total_amount": float(total_amount),
        "pending_amount": float(pending_amount),
        "funded_amount": float(funded_amount),
        "released_amount": float(released_amount),
        "disputed_amount": float(disputed_amount)
    }


@router.post("/{escrow_id}/stripe-intent")
def create_stripe_payment_intent(
    escrow_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Создать Stripe PaymentIntent для пополнения эскроу."""
    settings = Settings()
    stripe.api_key = settings.STRIPE_API_KEY
    escrow = db.query(DBEscrow).filter(DBEscrow.id == escrow_id).first()
    if not escrow:
        raise HTTPException(status_code=404, detail="Escrow not found")
    if escrow.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only client can fund escrow")
    if escrow.status != "pending":
        raise HTTPException(status_code=400, detail="Escrow is not in pending status")
    # Создать PaymentIntent
    try:
        intent = stripe.PaymentIntent.create(
            amount=int(escrow.amount * 100),  # cents
            currency="usd",
            description=f"Escrow funding for task {escrow.task_id}",
            metadata={"escrow_id": escrow.id, "task_id": escrow.task_id},
            automatic_payment_methods={"enabled": True},
        )
        return {"client_secret": intent.client_secret}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")


@router.post("/stripe/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Обработка webhook Stripe для пополнения эскроу."""
    settings = Settings()
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook error: {str(e)}")
    # Обработка успешной оплаты
    if event["type"] == "payment_intent.succeeded":
        intent = event["data"]["object"]
        escrow_id = intent["metadata"].get("escrow_id")
        if escrow_id:
            escrow = db.query(DBEscrow).filter(DBEscrow.id == int(escrow_id)).first()
            if escrow and escrow.status == "pending":
                escrow.status = "funded"
                escrow.funded_at = datetime.utcnow()
                db.commit()
    return {"status": "ok"}


@router.post("/{escrow_id}/paypal")
def create_paypal_payment_link(
    escrow_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Создать PayPal ссылку для пополнения эскроу (заглушка)."""
    # TODO: Реализовать реальную интеграцию через PayPal API
    return {"payment_url": f"https://paypal.com/pay?escrow_id={escrow_id}"}


@router.post("/{escrow_id}/qiwi")
def create_qiwi_payment_link(
    escrow_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Создать Qiwi ссылку для пополнения эскроу (заглушка)."""
    # TODO: Реализовать реальную интеграцию через Qiwi API
    return {"payment_url": f"https://qiwi.com/payment/form/99?extra['comment']={escrow_id}"}
