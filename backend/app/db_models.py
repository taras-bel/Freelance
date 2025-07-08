"""
SQLAlchemy database models.
"""

from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, Float, 
    ForeignKey, Table, MetaData, DECIMAL, JSON, Date, Enum as SQLEnum
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, backref
from sqlalchemy.sql import func
from datetime import datetime, date
from decimal import Decimal
from typing import List, Optional
import enum

Base = declarative_base()


# Enums
class TaskStatus(enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TaskPriority(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class ApplicationStatus(enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class PaymentStatus(enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class NotificationType(enum.Enum):
    TASK_CREATED = "task_created"
    APPLICATION_RECEIVED = "application_received"
    APPLICATION_ACCEPTED = "application_accepted"
    APPLICATION_REJECTED = "application_rejected"
    PAYMENT_RECEIVED = "payment_received"
    PAYMENT_SENT = "payment_sent"
    TASK_COMPLETED = "task_completed"
    REVIEW_RECEIVED = "review_received"
    SYSTEM_MESSAGE = "system_message"


class EscrowStatus(enum.Enum):
    PENDING = "pending"
    FUNDED = "funded"
    RELEASED = "released"
    REFUNDED = "refunded"
    DISPUTED = "disputed"


class InvoiceStatus(enum.Enum):
    DRAFT = "draft"
    SENT = "sent"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"


class TransactionType(enum.Enum):
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    PAYMENT = "payment"
    REFUND = "refund"
    FEE = "fee"


class BudgetPeriod(enum.Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"


class KYCStatus(enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


# User model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100))
    bio = Column(Text)
    skills = Column(JSON, default=list)
    hourly_rate = Column(DECIMAL(10, 2), default=0)
    is_freelancer = Column(Boolean, default=False)
    is_client = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    rating = Column(Float, default=0.0)
    total_earnings = Column(DECIMAL(10, 2), default=0)
    total_spent = Column(DECIMAL(10, 2), default=0)
    completed_tasks = Column(Integer, default=0)
    avatar_url = Column(String(500))
    
    # User level for AI matching
    level = Column(Integer, default=1)  # 1-5 scale (1=beginner, 5=expert)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    tasks_created = relationship("Task", back_populates="creator", foreign_keys="Task.creator_id")
    tasks_assigned = relationship("Task", back_populates="assigned_to", foreign_keys="Task.assigned_to_id")
    applications = relationship("Application", back_populates="applicant")
    reviews_given = relationship("Review", back_populates="reviewer", foreign_keys="Review.reviewer_id")
    reviews_received = relationship("Review", back_populates="reviewee", foreign_keys="Review.reviewee_id")
    payments_sent = relationship("Payment", back_populates="sender", foreign_keys="Payment.sender_id")
    payments_received = relationship("Payment", back_populates="recipient", foreign_keys="Payment.recipient_id")
    notifications = relationship("Notification", back_populates="user")
    messages_sent = relationship("Message", back_populates="sender")
    chats_created = relationship("Chat", back_populates="creator", foreign_keys="Chat.creator_id")
    portfolio_items = relationship("PortfolioItem", back_populates="user")
    achievements = relationship("Achievement", back_populates="user")
    levels = relationship("Level", back_populates="user")
    certificates = relationship("Certificate", back_populates="user")
    escrows_client = relationship("Escrow", back_populates="client", foreign_keys="Escrow.client_id")
    escrows_freelancer = relationship("Escrow", back_populates="freelancer", foreign_keys="Escrow.freelancer_id")
    financial_goals = relationship("FinancialGoal", back_populates="user")
    invoices_issued = relationship("Invoice", back_populates="issuer", foreign_keys="Invoice.issuer_id")
    invoices_received = relationship("Invoice", back_populates="recipient", foreign_keys="Invoice.recipient_id")
    notification_settings = relationship("NotificationSetting", back_populates="user")
    payment_methods = relationship("PaymentMethod", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")
    budgets = relationship("Budget", back_populates="user")


# Task model
class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    budget_min = Column(DECIMAL(10, 2))
    budget_max = Column(DECIMAL(10, 2))
    category = Column(String(100), nullable=False)
    skills_required = Column(JSON, default=list)
    deadline = Column(DateTime(timezone=True))
    priority = Column(SQLEnum(TaskPriority), default=TaskPriority.MEDIUM)
    is_remote = Column(Boolean, default=True)
    location = Column(String(200))
    status = Column(SQLEnum(TaskStatus), default=TaskStatus.OPEN)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_to_id = Column(Integer, ForeignKey("users.id"))
    applications_count = Column(Integer, default=0)
    
    # AI Analysis fields
    complexity_level = Column(Integer, default=1)  # 1-5 scale (1=easy, 5=expert)
    ai_suggested_min_price = Column(DECIMAL(10, 2))
    ai_suggested_max_price = Column(DECIMAL(10, 2))
    ai_analysis_data = Column(JSON, default=dict)  # Store full AI analysis
    ai_analyzed_at = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    creator = relationship("User", back_populates="tasks_created", foreign_keys=[creator_id])
    assigned_to = relationship("User", back_populates="tasks_assigned", foreign_keys=[assigned_to_id])
    applications = relationship("Application", back_populates="task")
    reviews = relationship("Review", back_populates="task")
    payments = relationship("Payment", back_populates="task")
    escrows = relationship("Escrow", back_populates="task")
    invoices = relationship("Invoice", back_populates="task")


# Application model
class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    proposal = Column(Text, nullable=False)
    bid_amount = Column(DECIMAL(10, 2))
    estimated_duration = Column(Integer)  # in days
    cover_letter = Column(Text)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    applicant_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(SQLEnum(ApplicationStatus), default=ApplicationStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    # AI screening fields
    screening_score = Column(Float)
    screening_status = Column(String(32))  # passed, failed, review, manual
    screening_comment = Column(Text)
    screened_at = Column(DateTime(timezone=True))

    # Relationships
    task = relationship("Task", back_populates="applications")
    applicant = relationship("User", back_populates="applications")


# Review model
class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reviewee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    task = relationship("Task", back_populates="reviews")
    reviewer = relationship("User", back_populates="reviews_given", foreign_keys=[reviewer_id])
    reviewee = relationship("User", back_populates="reviews_received", foreign_keys=[reviewee_id])


# Payment model
class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(DECIMAL(10, 2), nullable=False)
    currency = Column(String(3), default="USD")
    description = Column(String(500))
    payment_type = Column(String(50), default="payment")  # payment, escrow_release, dispute_resolution, etc.
    task_id = Column(Integer, ForeignKey("tasks.id"))
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING)
    transaction_id = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    task = relationship("Task", back_populates="payments")
    sender = relationship("User", back_populates="payments_sent", foreign_keys=[sender_id])
    recipient = relationship("User", back_populates="payments_received", foreign_keys=[recipient_id])


# Notification model
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(SQLEnum(NotificationType), nullable=False)
    data = Column(JSON)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="notifications")


# Message model
class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    chat_id = Column(Integer, ForeignKey("chats.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    chat = relationship("Chat", back_populates="messages")
    sender = relationship("User", back_populates="messages_sent")


# Chat model
class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200))
    is_group = Column(Boolean, default=False)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    participant_ids = Column(JSON, default=list)
    last_message_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    creator = relationship("User", back_populates="chats_created", foreign_keys=[creator_id])
    messages = relationship("Message", back_populates="chat")


# Portfolio Item model
class PortfolioItem(Base):
    __tablename__ = "portfolio_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    skills_used = Column(JSON, default=list)
    project_url = Column(String(500))
    image_url = Column(String(500))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="portfolio_items")


# Achievement model
class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    points = Column(Integer, default=0)
    icon_url = Column(String(500))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    unlocked_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="achievements")


# Level model
class Level(Base):
    __tablename__ = "levels"

    id = Column(Integer, primary_key=True, index=True)
    level = Column(Integer, nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    xp_required = Column(Integer, default=0)
    rewards = Column(JSON)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    current_xp = Column(Integer, default=0)
    achieved_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="levels")


# Certificate model
class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    issuer = Column(String(200), nullable=False)
    issue_date = Column(Date, nullable=False)
    expiry_date = Column(Date)
    certificate_url = Column(String(500))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="certificates")


# Escrow model
class Escrow(Base):
    __tablename__ = "escrows"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(DECIMAL(10, 2), nullable=False)
    currency = Column(String(3), default="USD")
    platform_fee = Column(DECIMAL(10, 2), default=0)
    freelancer_amount = Column(DECIMAL(10, 2), default=0)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    freelancer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(50), default="pending")  # pending, funded, released, refunded, disputed, split
    funded_at = Column(DateTime(timezone=True))
    released_at = Column(DateTime(timezone=True))
    expires_at = Column(DateTime(timezone=True))
    dispute_reason = Column(Text)
    disputed_at = Column(DateTime(timezone=True))
    disputed_by = Column(Integer, ForeignKey("users.id"))
    resolution = Column(String(50))  # client_win, freelancer_win, split
    resolved_at = Column(DateTime(timezone=True))
    resolved_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    task = relationship("Task", back_populates="escrows")
    client = relationship("User", back_populates="escrows_client", foreign_keys=[client_id])
    freelancer = relationship("User", back_populates="escrows_freelancer", foreign_keys=[freelancer_id])


# Financial Goal model
class FinancialGoal(Base):
    __tablename__ = "financial_goals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    target_amount = Column(DECIMAL(10, 2), nullable=False)
    currency = Column(String(3), default="USD")
    category = Column(String(100), nullable=False)
    target_date = Column(Date)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    current_amount = Column(DECIMAL(10, 2), default=0)
    status = Column(String(50), default="active")  # active, completed, cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="financial_goals")


# Invoice model
class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(DECIMAL(10, 2), nullable=False)
    currency = Column(String(3), default="USD")
    description = Column(Text, nullable=False)
    due_date = Column(Date)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    issuer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(SQLEnum(InvoiceStatus), default=InvoiceStatus.DRAFT)
    invoice_number = Column(String(100), unique=True, nullable=False)
    paid_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    task = relationship("Task", back_populates="invoices")
    issuer = relationship("User", back_populates="invoices_issued", foreign_keys=[issuer_id])
    recipient = relationship("User", back_populates="invoices_received", foreign_keys=[recipient_id])


# Notification Setting model
class NotificationSetting(Base):
    __tablename__ = "notification_settings"

    id = Column(Integer, primary_key=True, index=True)
    notification_type = Column(SQLEnum(NotificationType), nullable=False)
    email_enabled = Column(Boolean, default=True)
    push_enabled = Column(Boolean, default=True)
    sms_enabled = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="notification_settings")


# Payment Method model
class PaymentMethod(Base):
    __tablename__ = "payment_methods"

    id = Column(Integer, primary_key=True, index=True)
    method_type = Column(String(50), nullable=False)  # card, bank, paypal, etc.
    name = Column(String(200), nullable=False)
    account_number = Column(String(100))
    routing_number = Column(String(100))
    card_last4 = Column(String(4))
    card_brand = Column(String(50))
    expiry_month = Column(Integer)
    expiry_year = Column(Integer)
    is_default = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="payment_methods")


# Transaction model
class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(DECIMAL(10, 2), nullable=False)
    currency = Column(String(3), default="USD")
    transaction_type = Column(SQLEnum(TransactionType), nullable=False)
    description = Column(Text, nullable=False)
    reference_id = Column(String(100))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(50), default="pending")  # pending, completed, failed, cancelled
    external_id = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="transactions")


# Budget model
class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
    currency = Column(String(3), default="USD")
    category = Column(String(100), nullable=False)
    period = Column(SQLEnum(BudgetPeriod), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    spent_amount = Column(DECIMAL(10, 2), default=0)
    remaining_amount = Column(DECIMAL(10, 2), default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="budgets")


# ChatFile model
class ChatFile(Base):
    __tablename__ = "chat_files"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id"), nullable=False)
    chat_id = Column(Integer, ForeignKey("chats.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Integer, nullable=False)
    is_safe = Column(Boolean, default=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    message = relationship("Message", backref="files")
    chat = relationship("Chat", backref="files")
    user = relationship("User")


# KYC Request model
class KYCRequest(Base):
    __tablename__ = "kyc_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(SQLEnum(KYCStatus), default=KYCStatus.PENDING)
    document_type = Column(String(100), nullable=False)  # passport, id_card, selfie, etc.
    document_url = Column(String(500), nullable=False)
    comment = Column(String(500))
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True))
    reviewed_by = Column(Integer, ForeignKey("users.id"))

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    reviewer = relationship("User", foreign_keys=[reviewed_by])


# TwoFactorSecret model
class TwoFactorSecret(Base):
    __tablename__ = "two_factor_secrets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    secret = Column(String(64), nullable=False)
    is_enabled = Column(Boolean, default=False)
    method = Column(String(20), default="totp")  # totp, sms, email
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    confirmed_at = Column(DateTime(timezone=True))

    user = relationship("User")
