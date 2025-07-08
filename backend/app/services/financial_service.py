from decimal import Decimal
from datetime import datetime, timedelta
import uuid
from typing import Dict, Optional, Any

from sqlalchemy.orm import Session

from app.db_models import Task, Application, Payment, Transaction
# from app.db_models import EscrowAccount  # Uncomment if exists
from app.schemas import PaymentCreate, TransactionCreate, InvoiceCreate, TransactionType
from app.crud import payments as payment_crud
from app.crud import transactions as transaction_crud
from app.crud import invoices as invoice_crud
# from app.services.notification_service import notification_service  # Uncomment if exists
from app.core.config import settings

# Minimal stub for notification_service if not present
class NotificationServiceStub:
    def send_notification(self, **kwargs):
        print("Notification sent:", kwargs)
notification_service = NotificationServiceStub()

# Minimal stub for EscrowAccount if not present
class EscrowAccount:
    pass

class FinancialService:
    def __init__(self):
        self.platform_fee_percentage = Decimal(str(settings.PLATFORM_FEE_PERCENTAGE))
        self.processing_fee_fixed = Decimal(str(settings.PROCESSING_FEE_FIXED))
        self.processing_fee_percentage = Decimal(str(settings.PROCESSING_FEE_PERCENTAGE))

    def calculate_fees(self, amount: Decimal) -> Dict[str, Decimal]:
        """Calculate service commission (3%)"""
        service_commission = amount * self.platform_fee_percentage
        net_amount = amount - service_commission
        return {
            "gross_amount": amount,
            "service_commission": service_commission,
            "total_fees": service_commission,
            "net_amount": net_amount,
        }

    def create_service_commission_transaction(
        self, 
        db: Session, 
        user_id: int, 
        amount: Decimal, 
        task_id: Optional[int] = None,
        description: str = "Service Commission"
    ) -> Transaction:
        """Create a service commission transaction"""
        commission_data = TransactionCreate(
            amount=amount,
            currency="USD",
            transaction_type=TransactionType.FEE,
            description=description,
            reference_id=str(task_id) if task_id else None
        )
        return transaction_crud.create_transaction(db, commission_data, user_id)

    def process_task_payment(
        self,
        db: Session,
        task_id: int,
        application_id: int,
        amount: Decimal,
        payment_method_id: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Process payment for a task with 3% service commission"""
        task = db.query(Task).filter(Task.id == task_id).first()
        application = db.query(Application).filter(Application.id == application_id).first()

        if not task or not application:
            raise ValueError("Task or application not found")

        # Calculate fees (3% service commission)
        fees = self.calculate_fees(amount)
        service_commission = fees["service_commission"]
        net_amount = fees["net_amount"]

        applicant_id = (
            application.applicant_id
            if isinstance(application.applicant_id, int)
            else getattr(application.applicant, 'id', None)
        )
        creator_id = (
            task.creator_id if isinstance(task.creator_id, int) else getattr(task.creator, 'id', None)
        )
        recipient_id = creator_id
        sender_id = applicant_id
        if recipient_id is None or sender_id is None:
            raise ValueError("Invalid sender or recipient id")

        # Create payment with net amount (after commission)
        payment_data = PaymentCreate(
            recipient_id=recipient_id,
            task_id=int(task_id),
            amount=net_amount,  # Amount after commission
            currency="USD",
            description=f"Payment for task: {getattr(task, 'title', '')} (Net after 3% commission)"
        )
        payment = payment_crud.create_payment(db, payment_data, sender_id)

        # Create main transaction
        transaction_data = TransactionCreate(
            amount=amount,  # Original amount
            currency="USD",
            transaction_type=TransactionType.PAYMENT,
            description=f"Payment for task: {getattr(task, 'title', '')}",
            reference_id=None
        )
        transaction = transaction_crud.create_transaction(db, transaction_data, sender_id)

        # Create service commission transaction
        commission_transaction = self.create_service_commission_transaction(
            db=db,
            user_id=sender_id,
            amount=service_commission,
            task_id=task_id,
            description=f"Service Commission (3%) for task: {getattr(task, 'title', '')}"
        )

        # Create invoice
        invoice_data = InvoiceCreate(
            recipient_id=recipient_id,
            amount=net_amount,  # Net amount after commission
            currency="USD",
            description=f"Invoice for task: {getattr(task, 'title', '')} (Net after 3% commission)"
        )
        invoice = invoice_crud.create_invoice(db, invoice_data, sender_id)

        # Send notifications
        notification_service.send_notification(
            db=db,
            user_id=applicant_id,
            title="Payment Processed",
            message=f"Payment of ${amount:.2f} processed for task: {getattr(task, 'title', '')}. Net amount: ${net_amount:.2f} (3% commission applied)",
            notification_type="payment",
            category="payment",
            priority="normal",
            data={
                "payment_id": getattr(payment, 'id', None),
                "amount": str(amount),
                "net_amount": str(net_amount),
                "commission": str(service_commission),
                "task_title": getattr(task, 'title', ''),
                "task_id": task_id,
            },
        )

        notification_service.send_notification(
            db=db,
            user_id=recipient_id,
            title="Payment Received",
            message=f"You received a payment of ${net_amount:.2f} for task: {getattr(task, 'title', '')}",
            notification_type="payment",
            category="payment",
            priority="normal",
            data={
                "payment_id": getattr(payment, 'id', None),
                "amount": str(net_amount),
                "task_title": getattr(task, 'title', ''),
                "task_id": task_id,
            },
        )

        return {
            "payment": payment,
            "transaction": transaction,
            "commission_transaction": commission_transaction,
            "invoice": invoice,
            "fees": fees,
        }

    def process_withdrawal(
        self, db: Session, user_id: int, amount: Decimal, payment_method_id: int
    ) -> Dict[str, Any]:
        """Process withdrawal request with 3% service commission"""
        user_balance = self.get_user_balance(db, user_id)
        if user_balance < amount:
            raise ValueError("Insufficient balance")

        # Calculate withdrawal commission (3%)
        fees = self.calculate_fees(amount)
        service_commission = fees["service_commission"]
        net_amount = fees["net_amount"]

        withdrawal_number = f"WD-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4())[:8].upper()}"

        # Create main withdrawal transaction
        transaction_data = TransactionCreate(
            amount=amount,
            currency="USD",
            transaction_type=TransactionType.WITHDRAWAL,
            description=f"Withdrawal request: {withdrawal_number}",
            reference_id=None
        )
        transaction = transaction_crud.create_transaction(db, transaction_data, user_id)

        # Create service commission transaction for withdrawal
        commission_transaction = self.create_service_commission_transaction(
            db=db,
            user_id=user_id,
            amount=service_commission,
            description=f"Service Commission (3%) for withdrawal: {withdrawal_number}"
        )

        notification_service.send_notification(
            db=db,
            user_id=int(user_id),
            title="Withdrawal Request Submitted",
            message=f"Your withdrawal request for ${amount:.2f} has been submitted. Net amount: ${net_amount:.2f} (3% commission applied)",
            notification_type="payment",
            category="payment",
            priority="normal",
            data={
                "withdrawal_number": withdrawal_number,
                "amount": str(amount),
                "net_amount": str(net_amount),
                "commission": str(service_commission),
            },
        )

        return {
            "withdrawal_number": withdrawal_number,
            "transaction": transaction,
            "commission_transaction": commission_transaction,
            "amount": amount,
            "net_amount": net_amount,
            "fees": fees,
        }

    def get_user_balance(self, db: Session, user_id: int) -> Decimal:
        """Get user's current balance"""
        payments = (
            db.query(Payment)
            .filter(Payment.recipient_id == user_id, Payment.status == "completed")
            .all()
        )
        withdrawals = (
            db.query(Transaction)
            .filter(
                Transaction.user_id == user_id,
                Transaction.transaction_type == "withdrawal",
                Transaction.status == "completed",
            )
            .all()
        )

        def to_decimal(val: Any) -> Decimal:
            """Convert any value to Decimal safely"""
            if isinstance(val, Decimal):
                return val
            if isinstance(val, (int, float)):
                return Decimal(str(val))
            try:
                return Decimal(str(val))
            except (ValueError, TypeError):
                return Decimal("0")

        total_earnings = sum(
            to_decimal(getattr(payment, "amount", Decimal("0")))
            for payment in payments
        )
        total_withdrawals = sum(
            to_decimal(getattr(withdrawal, "amount", Decimal("0")))
            for withdrawal in withdrawals
        )

        # Ensure the result is always Decimal
        return Decimal(total_earnings) - Decimal(total_withdrawals)

    def get_financial_summary(
        self, db: Session, user_id: int, period: str = "month"
    ) -> Dict[str, Any]:
        """Get comprehensive financial summary for user"""
        now = datetime.utcnow()

        if period == "week":
            start_date = now - timedelta(days=7)
        elif period == "month":
            start_date = now - timedelta(days=30)
        elif period == "year":
            start_date = now - timedelta(days=365)
        else:
            start_date = now - timedelta(days=30)

        transactions = transaction_crud.get_transactions(
            db, user_id=user_id, skip=0, limit=10000
        )
        transactions = [t for t in transactions if getattr(t, 'created_at', now) >= start_date and getattr(t, 'created_at', now) <= now]

        total_earnings = sum(
            getattr(t, 'amount', 0)
            for t in transactions
            if getattr(t, 'category', None) == "task_payment" and getattr(t, 'status', None) == "completed"
        )
        total_spent = sum(
            getattr(t, 'amount', 0)
            for t in transactions
            if getattr(t, 'transaction_type', None) == "payment" and getattr(t, 'status', None) == "completed"
        )
        total_withdrawals = sum(
            getattr(t, 'amount', 0)
            for t in transactions
            if getattr(t, 'transaction_type', None) == "withdrawal" and getattr(t, 'status', None) == "completed"
        )
        total_fees = sum(
            getattr(t, 'platform_fee', 0) + getattr(t, 'processing_fee', 0)
            for t in transactions
            if getattr(t, 'status', None) == "completed"
        )

        pending_balance = sum(
            getattr(t, 'amount', 0) for t in transactions if getattr(t, 'status', None) == "pending"
        )

        current_balance = self.get_user_balance(db, user_id)

        return {
            "total_earnings": total_earnings,
            "total_spent": total_spent,
            "total_withdrawals": total_withdrawals,
            "total_fees": total_fees,
            "net_balance": current_balance,
            "pending_balance": pending_balance,
            "currency": "USD",
            "period": period,
            "start_date": start_date,
            "end_date": now,
            "transaction_count": len(transactions),
            "payment_count": len(
                [t for t in transactions if getattr(t, 'transaction_type', None) == "payment"]
            ),
            "withdrawal_count": len(
                [t for t in transactions if getattr(t, 'transaction_type', None) == "withdrawal"]
            ),
        }

    def create_escrow_account(
        self, db: Session, task_id: int, amount: Decimal
    ) -> EscrowAccount:
        """Create escrow account for task"""
        # This is a stub. Implement as needed.
        return EscrowAccount()

    def release_escrow_funds(
        self, db: Session, escrow_account_id: int, amount: Decimal
    ) -> bool:
        """Release funds from escrow account"""
        # This is a stub. Implement as needed.
        return True

financial_service = FinancialService()
