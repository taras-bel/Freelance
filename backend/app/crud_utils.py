"""
CRUD utility functions for all models.
"""

from typing import List, Optional, Dict, Any, Union
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc
from datetime import datetime, timedelta
from decimal import Decimal

from app.db_models import (
    User, Task, Application, Review, Payment, Notification, Message, Chat,
    PortfolioItem, Achievement, Level, Certificate, Escrow, FinancialGoal,
    Invoice, NotificationSetting, PaymentMethod, Transaction, Budget
)
from app.schemas import (
    UserCreate, UserUpdate, TaskCreate, TaskUpdate, ApplicationCreate,
    ApplicationUpdate, ReviewCreate, ReviewUpdate, PaymentCreate, PaymentUpdate,
    NotificationCreate, NotificationUpdate, MessageCreate, MessageUpdate,
    ChatCreate, ChatUpdate, PortfolioItemCreate, PortfolioItemUpdate,
    AchievementCreate, AchievementUpdate, LevelCreate, LevelUpdate,
    CertificateCreate, CertificateUpdate, EscrowCreate, EscrowUpdate,
    FinancialGoalCreate, FinancialGoalUpdate, InvoiceCreate, InvoiceUpdate,
    NotificationSettingCreate, NotificationSettingUpdate,
    PaymentMethodCreate, PaymentMethodUpdate, TransactionCreate, TransactionUpdate,
    BudgetCreate, BudgetUpdate
)


# User CRUD functions
def create_user(db: Session, user_data: UserCreate) -> User:
    """Create a new user."""
    from app.auth import get_password_hash
    
    # Create user data dict and hash the password
    user_dict = user_data.dict()
    hashed_password = get_password_hash(user_dict.pop("password"))
    
    # Create user with hashed password
    db_user = User(**user_dict, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    # Явно установить created_at и updated_at, если они None
    now = datetime.utcnow()
    if getattr(db_user, "created_at", None) is None:
        setattr(db_user, "created_at", now)
    if getattr(db_user, "updated_at", None) is None:
        setattr(db_user, "updated_at", now)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user(db: Session, user_id: int) -> Optional[User]:
    """Get user by ID."""
    return db.query(User).filter(User.id == user_id).first()


def get_users(
    db: Session, skip: int = 0, limit: int = 100,
    username: Optional[str] = None, email: Optional[str] = None,
    is_active: Optional[bool] = None
) -> List[User]:
    """Get users with filters."""
    query = db.query(User)
    
    if username:
        query = query.filter(User.username.ilike(f"%{username}%"))
    if email:
        query = query.filter(User.email.ilike(f"%{email}%"))
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    return query.offset(skip).limit(limit).all()


def update_user(db: Session, user_id: int, user_data: Dict[str, Any]) -> Optional[User]:
    """Update user."""
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    
    for field, value in user_data.items():
        setattr(db_user, field, value)
    
    setattr(db_user, "updated_at", datetime.utcnow())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int) -> bool:
    """Delete user."""
    db_user = get_user(db, user_id)
    if not db_user:
        return False
    
    db.delete(db_user)
    db.commit()
    return True


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email."""
    return db.query(User).filter(User.email == email).first()


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Get user by username."""
    return db.query(User).filter(User.username == username).first()


# Application CRUD functions
def create_application(db: Session, application_data: ApplicationCreate, applicant_id: int) -> Application:
    """Create a new application."""
    db_application = Application(**application_data.dict(), applicant_id=applicant_id)
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application


def get_application(db: Session, application_id: int) -> Optional[Application]:
    """Get application by ID."""
    return db.query(Application).filter(Application.id == application_id).first()


def get_applications(
    db: Session, skip: int = 0, limit: int = 100,
    task_id: Optional[int] = None, applicant_id: Optional[int] = None,
    status: Optional[str] = None
) -> List[Application]:
    """Get applications with filters."""
    query = db.query(Application)
    
    if task_id:
        query = query.filter(Application.task_id == task_id)
    if applicant_id:
        query = query.filter(Application.applicant_id == applicant_id)
    if status:
        query = query.filter(Application.status == status)
    
    return query.order_by(desc(Application.created_at)).offset(skip).limit(limit).all()


def update_application(db: Session, application_id: int, application_data: Dict[str, Any]) -> Optional[Application]:
    """Update application."""
    db_application = get_application(db, application_id)
    if not db_application:
        return None
    
    for field, value in application_data.items():
        setattr(db_application, field, value)
    
    setattr(db_application, "updated_at", datetime.utcnow())
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application


def delete_application(db: Session, application_id: int) -> bool:
    """Delete application."""
    db_application = get_application(db, application_id)
    if not db_application:
        return False
    
    db.delete(db_application)
    db.commit()
    return True


# Review CRUD functions
def create_review(db: Session, review_data: ReviewCreate, reviewer_id: int) -> Review:
    """Create a new review."""
    db_review = Review(**review_data.dict(), reviewer_id=reviewer_id)
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review


def get_review(db: Session, review_id: int) -> Optional[Review]:
    """Get review by ID."""
    return db.query(Review).filter(Review.id == review_id).first()


def get_reviews(
    db: Session, skip: int = 0, limit: int = 100,
    task_id: Optional[int] = None, reviewer_id: Optional[int] = None,
    reviewee_id: Optional[int] = None
) -> List[Review]:
    """Get reviews with filters."""
    query = db.query(Review)
    
    if task_id:
        query = query.filter(Review.task_id == task_id)
    if reviewer_id:
        query = query.filter(Review.reviewer_id == reviewer_id)
    if reviewee_id:
        query = query.filter(Review.reviewee_id == reviewee_id)
    
    return query.order_by(desc(Review.created_at)).offset(skip).limit(limit).all()


def update_review(db: Session, review_id: int, review_data: Dict[str, Any]) -> Optional[Review]:
    """Update review."""
    db_review = get_review(db, review_id)
    if not db_review:
        return None
    
    for field, value in review_data.items():
        setattr(db_review, field, value)
    
    setattr(db_review, "updated_at", datetime.utcnow())
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review


def delete_review(db: Session, review_id: int) -> bool:
    """Delete review."""
    db_review = get_review(db, review_id)
    if not db_review:
        return False
    
    db.delete(db_review)
    db.commit()
    return True


# Payment CRUD functions
def create_payment(db: Session, payment_data: PaymentCreate, sender_id: int) -> Payment:
    """Create a new payment."""
    db_payment = Payment(**payment_data.dict(), sender_id=sender_id)
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment


def get_payment(db: Session, payment_id: int) -> Optional[Payment]:
    """Get payment by ID."""
    return db.query(Payment).filter(Payment.id == payment_id).first()


def get_payments(
    db: Session, skip: int = 0, limit: int = 100,
    sender_id: Optional[int] = None, recipient_id: Optional[int] = None,
    task_id: Optional[int] = None, status: Optional[str] = None
) -> List[Payment]:
    """Get payments with filters."""
    query = db.query(Payment)
    
    if sender_id:
        query = query.filter(Payment.sender_id == sender_id)
    if recipient_id:
        query = query.filter(Payment.recipient_id == recipient_id)
    if task_id:
        query = query.filter(Payment.task_id == task_id)
    if status:
        query = query.filter(Payment.status == status)
    
    return query.order_by(desc(Payment.created_at)).offset(skip).limit(limit).all()


def update_payment(db: Session, payment_id: int, payment_data: Dict[str, Any]) -> Optional[Payment]:
    """Update payment."""
    db_payment = get_payment(db, payment_id)
    if not db_payment:
        return None
    
    for field, value in payment_data.items():
        setattr(db_payment, field, value)
    
    setattr(db_payment, "updated_at", datetime.utcnow())
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment


def delete_payment(db: Session, payment_id: int) -> bool:
    """Delete payment."""
    db_payment = get_payment(db, payment_id)
    if not db_payment:
        return False
    
    db.delete(db_payment)
    db.commit()
    return True


# Notification CRUD functions
def create_notification(db: Session, notification_data: NotificationCreate, user_id: int) -> Notification:
    """Create a new notification."""
    db_notification = Notification(**notification_data.dict(), user_id=user_id)
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification


def get_notification(db: Session, notification_id: int) -> Optional[Notification]:
    """Get notification by ID."""
    return db.query(Notification).filter(Notification.id == notification_id).first()


def get_notifications(
    db: Session, skip: int = 0, limit: int = 100,
    user_id: Optional[int] = None, type: Optional[str] = None,
    is_read: Optional[bool] = None
) -> List[Notification]:
    """Get notifications with filters."""
    query = db.query(Notification)
    
    if user_id:
        query = query.filter(Notification.user_id == user_id)
    if type:
        query = query.filter(Notification.type == type)
    if is_read is not None:
        query = query.filter(Notification.is_read == is_read)
    
    return query.order_by(desc(Notification.created_at)).offset(skip).limit(limit).all()


def update_notification(db: Session, notification_id: int, notification_data: Dict[str, Any]) -> Optional[Notification]:
    """Update notification."""
    db_notification = get_notification(db, notification_id)
    if not db_notification:
        return None
    
    for field, value in notification_data.items():
        setattr(db_notification, field, value)
    
    setattr(db_notification, "updated_at", datetime.utcnow())
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification


def delete_notification(db: Session, notification_id: int) -> bool:
    """Delete notification."""
    db_notification = get_notification(db, notification_id)
    if not db_notification:
        return False
    
    db.delete(db_notification)
    db.commit()
    return True


def mark_notification_as_read(db: Session, notification_id: int) -> bool:
    """Mark notification as read."""
    db_notification = get_notification(db, notification_id)
    if not db_notification:
        return False
    
    setattr(db_notification, "is_read", True)
    setattr(db_notification, "updated_at", datetime.utcnow())
    db.add(db_notification)
    db.commit()
    return True


# Message CRUD functions
def create_message(db: Session, message_data: MessageCreate, sender_id: int) -> Message:
    """Create a new message."""
    db_message = Message(**message_data.dict(), sender_id=sender_id)
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message


def get_message(db: Session, message_id: int) -> Optional[Message]:
    """Get message by ID."""
    return db.query(Message).filter(Message.id == message_id).first()


def get_messages(
    db: Session, skip: int = 0, limit: int = 100,
    chat_id: Optional[int] = None, sender_id: Optional[int] = None
) -> List[Message]:
    """Get messages with filters."""
    query = db.query(Message)
    
    if chat_id:
        query = query.filter(Message.chat_id == chat_id)
    if sender_id:
        query = query.filter(Message.sender_id == sender_id)
    
    return query.order_by(desc(Message.created_at)).offset(skip).limit(limit).all()


def update_message(db: Session, message_id: int, message_data: Dict[str, Any]) -> Optional[Message]:
    """Update message."""
    db_message = get_message(db, message_id)
    if not db_message:
        return None
    
    for field, value in message_data.items():
        setattr(db_message, field, value)
    
    setattr(db_message, "updated_at", datetime.utcnow())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message


def delete_message(db: Session, message_id: int) -> bool:
    """Delete message."""
    db_message = get_message(db, message_id)
    if not db_message:
        return False
    
    db.delete(db_message)
    db.commit()
    return True


# Chat CRUD functions
def create_chat(db: Session, chat_data: ChatCreate, creator_id: int) -> Chat:
    """Create a new chat."""
    db_chat = Chat(**chat_data.dict(), creator_id=creator_id)
    db.add(db_chat)
    db.commit()
    db.refresh(db_chat)
    return db_chat


def get_chat(db: Session, chat_id: int) -> Optional[Chat]:
    """Get chat by ID."""
    return db.query(Chat).filter(Chat.id == chat_id).first()


def get_chats(
    db: Session, skip: int = 0, limit: int = 100,
    participant_id: Optional[int] = None
) -> List[Chat]:
    """Get chats with filters."""
    query = db.query(Chat)
    
    if participant_id:
        query = query.filter(Chat.participant_ids.contains([participant_id]))
    
    return query.order_by(desc(Chat.updated_at)).offset(skip).limit(limit).all()


def update_chat(db: Session, chat_id: int, chat_data: Dict[str, Any]) -> Optional[Chat]:
    """Update chat."""
    db_chat = get_chat(db, chat_id)
    if not db_chat:
        return None
    
    for field, value in chat_data.items():
        setattr(db_chat, field, value)
    
    setattr(db_chat, "updated_at", datetime.utcnow())
    db.add(db_chat)
    db.commit()
    db.refresh(db_chat)
    return db_chat


def delete_chat(db: Session, chat_id: int) -> bool:
    """Delete chat."""
    db_chat = get_chat(db, chat_id)
    if not db_chat:
        return False
    
    db.delete(db_chat)
    db.commit()
    return True


# Portfolio CRUD functions
def create_portfolio_item(db: Session, portfolio_data: PortfolioItemCreate, user_id: int) -> PortfolioItem:
    """Create a new portfolio item."""
    db_portfolio_item = PortfolioItem(**portfolio_data.dict(), user_id=user_id)
    db.add(db_portfolio_item)
    db.commit()
    db.refresh(db_portfolio_item)
    return db_portfolio_item


def get_portfolio_item(db: Session, portfolio_id: int) -> Optional[PortfolioItem]:
    """Get portfolio item by ID."""
    return db.query(PortfolioItem).filter(PortfolioItem.id == portfolio_id).first()


def get_portfolio_items(
    db: Session, skip: int = 0, limit: int = 100,
    user_id: Optional[int] = None, category: Optional[str] = None
) -> List[PortfolioItem]:
    """Get portfolio items with filters."""
    query = db.query(PortfolioItem)
    
    if user_id:
        query = query.filter(PortfolioItem.user_id == user_id)
    if category:
        query = query.filter(PortfolioItem.category == category)
    
    return query.order_by(desc(PortfolioItem.created_at)).offset(skip).limit(limit).all()


def update_portfolio_item(db: Session, portfolio_id: int, portfolio_data: Dict[str, Any]) -> Optional[PortfolioItem]:
    """Update portfolio item."""
    db_portfolio_item = get_portfolio_item(db, portfolio_id)
    if not db_portfolio_item:
        return None
    
    for field, value in portfolio_data.items():
        setattr(db_portfolio_item, field, value)
    
    setattr(db_portfolio_item, "updated_at", datetime.utcnow())
    db.add(db_portfolio_item)
    db.commit()
    db.refresh(db_portfolio_item)
    return db_portfolio_item


def delete_portfolio_item(db: Session, portfolio_id: int) -> bool:
    """Delete portfolio item."""
    db_portfolio_item = get_portfolio_item(db, portfolio_id)
    if not db_portfolio_item:
        return False
    
    db.delete(db_portfolio_item)
    db.commit()
    return True


# Achievement CRUD functions
def create_achievement(db: Session, achievement_data: AchievementCreate, user_id: int) -> Achievement:
    """Create a new achievement."""
    db_achievement = Achievement(**achievement_data.dict(), user_id=user_id)
    db.add(db_achievement)
    db.commit()
    db.refresh(db_achievement)
    return db_achievement


def get_achievement(db: Session, achievement_id: int) -> Optional[Achievement]:
    """Get achievement by ID."""
    return db.query(Achievement).filter(Achievement.id == achievement_id).first()


def get_achievements(
    db: Session, skip: int = 0, limit: int = 100,
    user_id: Optional[int] = None, category: Optional[str] = None
) -> List[Achievement]:
    """Get achievements with filters."""
    query = db.query(Achievement)
    
    if user_id:
        query = query.filter(Achievement.user_id == user_id)
    if category:
        query = query.filter(Achievement.category == category)
    
    return query.order_by(desc(Achievement.created_at)).offset(skip).limit(limit).all()


def update_achievement(db: Session, achievement_id: int, achievement_data: Dict[str, Any]) -> Optional[Achievement]:
    """Update achievement."""
    db_achievement = get_achievement(db, achievement_id)
    if not db_achievement:
        return None
    
    for field, value in achievement_data.items():
        setattr(db_achievement, field, value)
    
    setattr(db_achievement, "updated_at", datetime.utcnow())
    db.add(db_achievement)
    db.commit()
    db.refresh(db_achievement)
    return db_achievement


def delete_achievement(db: Session, achievement_id: int) -> bool:
    """Delete achievement."""
    db_achievement = get_achievement(db, achievement_id)
    if not db_achievement:
        return False
    
    db.delete(db_achievement)
    db.commit()
    return True


# Level CRUD functions
def create_level(db: Session, level_data: LevelCreate, user_id: int) -> Level:
    """Create a new level."""
    db_level = Level(**level_data.dict(), user_id=user_id)
    db.add(db_level)
    db.commit()
    db.refresh(db_level)
    return db_level


def get_level(db: Session, level_id: int) -> Optional[Level]:
    """Get level by ID."""
    return db.query(Level).filter(Level.id == level_id).first()


def get_levels(
    db: Session, skip: int = 0, limit: int = 100,
    user_id: Optional[int] = None
) -> List[Level]:
    """Get levels with filters."""
    query = db.query(Level)
    
    if user_id:
        query = query.filter(Level.user_id == user_id)
    
    return query.order_by(desc(Level.created_at)).offset(skip).limit(limit).all()


def update_level(db: Session, level_id: int, level_data: Dict[str, Any]) -> Optional[Level]:
    """Update level."""
    db_level = get_level(db, level_id)
    if not db_level:
        return None
    
    for field, value in level_data.items():
        setattr(db_level, field, value)
    
    setattr(db_level, "updated_at", datetime.utcnow())
    db.add(db_level)
    db.commit()
    db.refresh(db_level)
    return db_level


def delete_level(db: Session, level_id: int) -> bool:
    """Delete level."""
    db_level = get_level(db, level_id)
    if not db_level:
        return False
    
    db.delete(db_level)
    db.commit()
    return True


# Certificate CRUD functions
def create_certificate(db: Session, certificate_data: CertificateCreate, user_id: int) -> Certificate:
    """Create a new certificate."""
    db_certificate = Certificate(**certificate_data.dict(), user_id=user_id)
    db.add(db_certificate)
    db.commit()
    db.refresh(db_certificate)
    return db_certificate


def get_certificate(db: Session, certificate_id: int) -> Optional[Certificate]:
    """Get certificate by ID."""
    return db.query(Certificate).filter(Certificate.id == certificate_id).first()


def get_certificates(
    db: Session, skip: int = 0, limit: int = 100,
    user_id: Optional[int] = None, category: Optional[str] = None
) -> List[Certificate]:
    """Get certificates with filters."""
    query = db.query(Certificate)
    
    if user_id:
        query = query.filter(Certificate.user_id == user_id)
    if category:
        query = query.filter(Certificate.category == category)
    
    return query.order_by(desc(Certificate.created_at)).offset(skip).limit(limit).all()


def update_certificate(db: Session, certificate_id: int, certificate_data: Dict[str, Any]) -> Optional[Certificate]:
    """Update certificate."""
    db_certificate = get_certificate(db, certificate_id)
    if not db_certificate:
        return None
    
    for field, value in certificate_data.items():
        setattr(db_certificate, field, value)
    
    setattr(db_certificate, "updated_at", datetime.utcnow())
    db.add(db_certificate)
    db.commit()
    db.refresh(db_certificate)
    return db_certificate


def delete_certificate(db: Session, certificate_id: int) -> bool:
    """Delete certificate."""
    db_certificate = get_certificate(db, certificate_id)
    if not db_certificate:
        return False
    
    db.delete(db_certificate)
    db.commit()
    return True


# Escrow CRUD functions
def create_escrow(db: Session, escrow_data: EscrowCreate, buyer_id: int) -> Escrow:
    """Create a new escrow."""
    db_escrow = Escrow(**escrow_data.dict(), buyer_id=buyer_id)
    db.add(db_escrow)
    db.commit()
    db.refresh(db_escrow)
    return db_escrow


def get_escrow(db: Session, escrow_id: int) -> Optional[Escrow]:
    """Get escrow by ID."""
    return db.query(Escrow).filter(Escrow.id == escrow_id).first()


def get_escrows(
    db: Session, skip: int = 0, limit: int = 100,
    buyer_id: Optional[int] = None, seller_id: Optional[int] = None,
    task_id: Optional[int] = None, status: Optional[str] = None
) -> List[Escrow]:
    """Get escrows with filters."""
    query = db.query(Escrow)
    
    if buyer_id:
        query = query.filter(Escrow.buyer_id == buyer_id)
    if seller_id:
        query = query.filter(Escrow.seller_id == seller_id)
    if task_id:
        query = query.filter(Escrow.task_id == task_id)
    if status:
        query = query.filter(Escrow.status == status)
    
    return query.order_by(desc(Escrow.created_at)).offset(skip).limit(limit).all()


def update_escrow(db: Session, escrow_id: int, escrow_data: Dict[str, Any]) -> Optional[Escrow]:
    """Update escrow."""
    db_escrow = get_escrow(db, escrow_id)
    if not db_escrow:
        return None
    
    for field, value in escrow_data.items():
        setattr(db_escrow, field, value)
    
    setattr(db_escrow, "updated_at", datetime.utcnow())
    db.add(db_escrow)
    db.commit()
    db.refresh(db_escrow)
    return db_escrow


def delete_escrow(db: Session, escrow_id: int) -> bool:
    """Delete escrow."""
    db_escrow = get_escrow(db, escrow_id)
    if not db_escrow:
        return False
    
    db.delete(db_escrow)
    db.commit()
    return True


# Financial Goal CRUD functions
def create_financial_goal(db: Session, goal_data: FinancialGoalCreate, user_id: int) -> FinancialGoal:
    """Create a new financial goal."""
    db_goal = FinancialGoal(**goal_data.dict(), user_id=user_id)
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal


def get_financial_goal(db: Session, goal_id: int) -> Optional[FinancialGoal]:
    """Get financial goal by ID."""
    return db.query(FinancialGoal).filter(FinancialGoal.id == goal_id).first()


def get_financial_goals(
    db: Session, skip: int = 0, limit: int = 100,
    user_id: Optional[int] = None, category: Optional[str] = None,
    status: Optional[str] = None
) -> List[FinancialGoal]:
    """Get financial goals with filters."""
    query = db.query(FinancialGoal)
    
    if user_id:
        query = query.filter(FinancialGoal.user_id == user_id)
    if category:
        query = query.filter(FinancialGoal.category == category)
    if status:
        query = query.filter(FinancialGoal.status == status)
    
    return query.order_by(desc(FinancialGoal.created_at)).offset(skip).limit(limit).all()


def update_financial_goal(db: Session, goal_id: int, goal_data: Dict[str, Any]) -> Optional[FinancialGoal]:
    """Update financial goal."""
    db_goal = get_financial_goal(db, goal_id)
    if not db_goal:
        return None
    
    for field, value in goal_data.items():
        setattr(db_goal, field, value)
    
    setattr(db_goal, "updated_at", datetime.utcnow())
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal


def delete_financial_goal(db: Session, goal_id: int) -> bool:
    """Delete financial goal."""
    db_goal = get_financial_goal(db, goal_id)
    if not db_goal:
        return False
    
    db.delete(db_goal)
    db.commit()
    return True


# Invoice CRUD functions
def create_invoice(db: Session, invoice_data: InvoiceCreate, issuer_id: int) -> Invoice:
    """Create a new invoice."""
    db_invoice = Invoice(**invoice_data.dict(), issuer_id=issuer_id)
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice


def get_invoice(db: Session, invoice_id: int) -> Optional[Invoice]:
    """Get invoice by ID."""
    return db.query(Invoice).filter(Invoice.id == invoice_id).first()


def get_invoices(
    db: Session, skip: int = 0, limit: int = 100,
    issuer_id: Optional[int] = None, recipient_id: Optional[int] = None,
    task_id: Optional[int] = None, status: Optional[str] = None
) -> List[Invoice]:
    """Get invoices with filters."""
    query = db.query(Invoice)
    
    if issuer_id:
        query = query.filter(Invoice.issuer_id == issuer_id)
    if recipient_id:
        query = query.filter(Invoice.recipient_id == recipient_id)
    if task_id:
        query = query.filter(Invoice.task_id == task_id)
    if status:
        query = query.filter(Invoice.status == status)
    
    return query.order_by(desc(Invoice.created_at)).offset(skip).limit(limit).all()


def update_invoice(db: Session, invoice_id: int, invoice_data: Dict[str, Any]) -> Optional[Invoice]:
    """Update invoice."""
    db_invoice = get_invoice(db, invoice_id)
    if not db_invoice:
        return None
    
    for field, value in invoice_data.items():
        setattr(db_invoice, field, value)
    
    setattr(db_invoice, "updated_at", datetime.utcnow())
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice


def delete_invoice(db: Session, invoice_id: int) -> bool:
    """Delete invoice."""
    db_invoice = get_invoice(db, invoice_id)
    if not db_invoice:
        return False
    
    db.delete(db_invoice)
    db.commit()
    return True


# Notification Setting CRUD functions
def create_notification_setting(db: Session, setting_data: NotificationSettingCreate, user_id: int) -> NotificationSetting:
    """Create a new notification setting."""
    db_setting = NotificationSetting(**setting_data.dict(), user_id=user_id)
    db.add(db_setting)
    db.commit()
    db.refresh(db_setting)
    return db_setting


def get_notification_setting(db: Session, setting_id: int) -> Optional[NotificationSetting]:
    """Get notification setting by ID."""
    return db.query(NotificationSetting).filter(NotificationSetting.id == setting_id).first()


def get_notification_settings(
    db: Session, skip: int = 0, limit: int = 100,
    user_id: Optional[int] = None, notification_type: Optional[str] = None
) -> List[NotificationSetting]:
    """Get notification settings with filters."""
    query = db.query(NotificationSetting)
    
    if user_id:
        query = query.filter(NotificationSetting.user_id == user_id)
    if notification_type:
        query = query.filter(NotificationSetting.notification_type == notification_type)
    
    return query.order_by(desc(NotificationSetting.created_at)).offset(skip).limit(limit).all()


def update_notification_setting(db: Session, setting_id: int, setting_data: Dict[str, Any]) -> Optional[NotificationSetting]:
    """Update notification setting."""
    db_setting = get_notification_setting(db, setting_id)
    if not db_setting:
        return None
    
    for field, value in setting_data.items():
        setattr(db_setting, field, value)
    
    setattr(db_setting, "updated_at", datetime.utcnow())
    db.add(db_setting)
    db.commit()
    db.refresh(db_setting)
    return db_setting


def delete_notification_setting(db: Session, setting_id: int) -> bool:
    """Delete notification setting."""
    db_setting = get_notification_setting(db, setting_id)
    if not db_setting:
        return False
    
    db.delete(db_setting)
    db.commit()
    return True


# Payment Method CRUD functions
def create_payment_method(db: Session, payment_method_data: PaymentMethodCreate, user_id: int) -> PaymentMethod:
    """Create a new payment method."""
    db_payment_method = PaymentMethod(**payment_method_data.dict(), user_id=user_id)
    db.add(db_payment_method)
    db.commit()
    db.refresh(db_payment_method)
    return db_payment_method


def get_payment_method(db: Session, payment_method_id: int) -> Optional[PaymentMethod]:
    """Get payment method by ID."""
    return db.query(PaymentMethod).filter(PaymentMethod.id == payment_method_id).first()


def get_payment_methods(
    db: Session, skip: int = 0, limit: int = 100,
    user_id: Optional[int] = None, method_type: Optional[str] = None,
    is_default: Optional[bool] = None
) -> List[PaymentMethod]:
    """Get payment methods with filters."""
    query = db.query(PaymentMethod)
    
    if user_id:
        query = query.filter(PaymentMethod.user_id == user_id)
    if method_type:
        query = query.filter(PaymentMethod.method_type == method_type)
    if is_default is not None:
        query = query.filter(PaymentMethod.is_default == is_default)
    
    return query.order_by(desc(PaymentMethod.created_at)).offset(skip).limit(limit).all()


def update_payment_method(db: Session, payment_method_id: int, payment_method_data: Dict[str, Any]) -> Optional[PaymentMethod]:
    """Update payment method."""
    db_payment_method = get_payment_method(db, payment_method_id)
    if not db_payment_method:
        return None
    
    for field, value in payment_method_data.items():
        setattr(db_payment_method, field, value)
    
    setattr(db_payment_method, "updated_at", datetime.utcnow())
    db.add(db_payment_method)
    db.commit()
    db.refresh(db_payment_method)
    return db_payment_method


def delete_payment_method(db: Session, payment_method_id: int) -> bool:
    """Delete payment method."""
    db_payment_method = get_payment_method(db, payment_method_id)
    if not db_payment_method:
        return False
    
    db.delete(db_payment_method)
    db.commit()
    return True


# Transaction CRUD functions
def create_transaction(db: Session, transaction_data: TransactionCreate, user_id: int) -> Transaction:
    """Create a new transaction."""
    db_transaction = Transaction(**transaction_data.dict(), user_id=user_id)
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def get_transaction(db: Session, transaction_id: int) -> Optional[Transaction]:
    """Get transaction by ID."""
    return db.query(Transaction).filter(Transaction.id == transaction_id).first()


def get_transactions(
    db: Session, skip: int = 0, limit: int = 100,
    user_id: Optional[int] = None, transaction_type: Optional[str] = None,
    status: Optional[str] = None
) -> List[Transaction]:
    """Get transactions with filters."""
    query = db.query(Transaction)
    
    if user_id:
        query = query.filter(Transaction.user_id == user_id)
    if transaction_type:
        query = query.filter(Transaction.transaction_type == transaction_type)
    if status:
        query = query.filter(Transaction.status == status)
    
    return query.order_by(desc(Transaction.created_at)).offset(skip).limit(limit).all()


def update_transaction(db: Session, transaction_id: int, transaction_data: Dict[str, Any]) -> Optional[Transaction]:
    """Update transaction."""
    db_transaction = get_transaction(db, transaction_id)
    if not db_transaction:
        return None
    
    for field, value in transaction_data.items():
        setattr(db_transaction, field, value)
    
    setattr(db_transaction, "updated_at", datetime.utcnow())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def delete_transaction(db: Session, transaction_id: int) -> bool:
    """Delete transaction."""
    db_transaction = get_transaction(db, transaction_id)
    if not db_transaction:
        return False
    
    db.delete(db_transaction)
    db.commit()
    return True


# Budget CRUD functions
def create_budget(db: Session, budget_data: BudgetCreate, user_id: int) -> Budget:
    """Create a new budget."""
    db_budget = Budget(**budget_data.dict(), user_id=user_id)
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget


def get_budget(db: Session, budget_id: int) -> Optional[Budget]:
    """Get budget by ID."""
    return db.query(Budget).filter(Budget.id == budget_id).first()


def get_budgets(
    db: Session, skip: int = 0, limit: int = 100,
    user_id: Optional[int] = None, category: Optional[str] = None,
    period: Optional[str] = None
) -> List[Budget]:
    """Get budgets with filters."""
    query = db.query(Budget)
    
    if user_id:
        query = query.filter(Budget.user_id == user_id)
    if category:
        query = query.filter(Budget.category == category)
    if period:
        query = query.filter(Budget.period == period)
    
    return query.order_by(desc(Budget.created_at)).offset(skip).limit(limit).all()


def update_budget(db: Session, budget_id: int, budget_data: Dict[str, Any]) -> Optional[Budget]:
    """Update budget."""
    db_budget = get_budget(db, budget_id)
    if not db_budget:
        return None
    
    for field, value in budget_data.items():
        setattr(db_budget, field, value)
    
    setattr(db_budget, "updated_at", datetime.utcnow())
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget


def delete_budget(db: Session, budget_id: int) -> bool:
    """Delete budget."""
    db_budget = get_budget(db, budget_id)
    if not db_budget:
        return False
    
    db.delete(db_budget)
    db.commit()
    return True
