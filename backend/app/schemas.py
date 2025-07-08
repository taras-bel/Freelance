"""
Pydantic schemas for request/response models.
"""

from __future__ import annotations
from typing import Optional, List, Dict, Any, Union
from datetime import datetime, date
from pydantic import BaseModel, EmailStr, Field, validator
from enum import Enum
from decimal import Decimal


class UserRole(str, Enum):
    """User roles."""
    FREELANCER = "freelancer"
    CLIENT = "client"
    ADMIN = "admin"


class TaskStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class ApplicationStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class NotificationType(str, Enum):
    TASK_CREATED = "task_created"
    APPLICATION_RECEIVED = "application_received"
    APPLICATION_ACCEPTED = "application_accepted"
    APPLICATION_REJECTED = "application_rejected"
    PAYMENT_RECEIVED = "payment_received"
    PAYMENT_SENT = "payment_sent"
    TASK_COMPLETED = "task_completed"
    REVIEW_RECEIVED = "review_received"
    SYSTEM_MESSAGE = "system_message"


class EscrowStatus(str, Enum):
    PENDING = "pending"
    FUNDED = "funded"
    RELEASED = "released"
    REFUNDED = "refunded"
    DISPUTED = "disputed"


class InvoiceStatus(str, Enum):
    DRAFT = "draft"
    SENT = "sent"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"


class TransactionType(str, Enum):
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    PAYMENT = "payment"
    REFUND = "refund"
    FEE = "fee"


class BudgetPeriod(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"


class BaseSchema(BaseModel):
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat(),
            Decimal: lambda v: float(v)
        }


class UserBase(BaseSchema):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = Field(None, max_length=500)
    skills: Optional[List[str]] = Field(default_factory=list)
    hourly_rate: Optional[Decimal] = Field(None, ge=0)
    is_freelancer: bool = False
    is_client: bool = False
    level: int = Field(default=1, ge=1, le=5)


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserUpdate(BaseSchema):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = Field(None, max_length=500)
    skills: Optional[List[str]] = Field(default_factory=list)
    hourly_rate: Optional[Decimal] = Field(None, ge=0)
    is_freelancer: Optional[bool] = None
    is_client: Optional[bool] = None
    avatar_url: Optional[str] = None
    level: Optional[int] = Field(None, ge=1, le=5)


class User(UserBase):
    id: int
    is_active: bool = True
    is_verified: bool = False
    rating: Optional[float] = Field(None, ge=0, le=5)
    total_earnings: Decimal = Decimal('0')
    total_spent: Decimal = Decimal('0')
    completed_tasks: int = 0
    avatar_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class UserProfile(User):
    pass


class TaskBase(BaseSchema):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=10, max_length=2000)
    budget_min: Optional[Decimal] = Field(None, ge=0)
    budget_max: Optional[Decimal] = Field(None, ge=0)
    category: str = Field(..., max_length=100)
    skills_required: List[str] = Field(default_factory=list)
    deadline: Optional[datetime] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    is_remote: bool = True
    location: Optional[str] = Field(None, max_length=200)


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseSchema):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=10, max_length=2000)
    budget_min: Optional[Decimal] = Field(None, ge=0)
    budget_max: Optional[Decimal] = Field(None, ge=0)
    category: Optional[str] = Field(None, max_length=100)
    skills_required: Optional[List[str]] = Field(default_factory=list)
    deadline: Optional[datetime] = None
    priority: Optional[TaskPriority] = None
    is_remote: Optional[bool] = None
    location: Optional[str] = Field(None, max_length=200)
    status: Optional[TaskStatus] = None
    complexity_level: Optional[int] = Field(None, ge=1, le=5)
    ai_suggested_min_price: Optional[Decimal] = Field(None, ge=0)
    ai_suggested_max_price: Optional[Decimal] = Field(None, ge=0)


class Task(TaskBase):
    id: int
    creator_id: int
    assigned_to_id: Optional[int] = None
    status: TaskStatus = TaskStatus.OPEN
    applications_count: int = 0
    complexity_level: int = 1
    ai_suggested_min_price: Optional[Decimal] = None
    ai_suggested_max_price: Optional[Decimal] = None
    ai_analysis_data: Dict[str, Any] = Field(default_factory=dict)
    ai_analyzed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class TaskDetail(Task):
    creator: Optional[User] = None
    assigned_to: Optional[User] = None
    applications: List['Application'] = Field(default_factory=list)


class ApplicationBase(BaseSchema):
    proposal: str = Field(..., min_length=10, max_length=2000)
    bid_amount: Optional[Decimal] = Field(None, ge=0)
    estimated_duration: Optional[int] = Field(None, ge=1)  # in days
    cover_letter: Optional[str] = Field(None, max_length=1000)


class ApplicationCreate(ApplicationBase):
    task_id: int


class ApplicationUpdate(BaseSchema):
    proposal: Optional[str] = Field(None, min_length=10, max_length=2000)
    bid_amount: Optional[Decimal] = Field(None, ge=0)
    estimated_duration: Optional[int] = Field(None, ge=1)
    cover_letter: Optional[str] = Field(None, max_length=1000)
    status: Optional[ApplicationStatus] = None


class Application(ApplicationBase):
    id: int
    task_id: int
    applicant_id: int
    status: ApplicationStatus = ApplicationStatus.PENDING
    created_at: datetime
    updated_at: datetime


class ApplicationDetail(Application):
    applicant: Optional[User] = None
    task: Optional[Task] = None


class ReviewBase(BaseSchema):
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=10, max_length=1000)
    task_id: int


class ReviewCreate(ReviewBase):
    reviewee_id: int


class ReviewUpdate(BaseSchema):
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = Field(None, min_length=10, max_length=1000)


class Review(ReviewBase):
    id: int
    reviewer_id: int
    reviewee_id: int
    created_at: datetime
    updated_at: datetime


class ReviewDetail(Review):
    reviewer: Optional[User] = None
    reviewee: Optional[User] = None
    task: Optional[Task] = None


class PaymentBase(BaseSchema):
    amount: Decimal = Field(..., gt=0)
    currency: str = Field(default="USD", max_length=3)
    description: Optional[str] = Field(None, max_length=500)
    task_id: Optional[int] = None


class PaymentCreate(PaymentBase):
    recipient_id: int


class PaymentUpdate(BaseSchema):
    amount: Optional[Decimal] = Field(None, gt=0)
    currency: Optional[str] = Field(None, max_length=3)
    description: Optional[str] = Field(None, max_length=500)
    status: Optional[PaymentStatus] = None


class Payment(PaymentBase):
    id: int
    sender_id: int
    recipient_id: int
    status: PaymentStatus = PaymentStatus.PENDING
    transaction_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class PaymentDetail(Payment):
    sender: Optional[User] = None
    recipient: Optional[User] = None
    task: Optional[Task] = None


class NotificationBase(BaseSchema):
    title: str = Field(..., max_length=200)
    message: str = Field(..., max_length=1000)
    type: NotificationType
    data: Optional[Dict[str, Any]] = None


class NotificationCreate(NotificationBase):
    user_id: int


class NotificationUpdate(BaseSchema):
    title: Optional[str] = Field(None, max_length=200)
    message: Optional[str] = Field(None, max_length=1000)
    type: Optional[NotificationType] = None
    data: Optional[Dict[str, Any]] = None
    is_read: Optional[bool] = None


class Notification(NotificationBase):
    id: int
    user_id: int
    is_read: bool = False
    created_at: datetime
    updated_at: datetime


class MessageBase(BaseSchema):
    content: str = Field(..., min_length=1, max_length=2000)
    chat_id: int


class MessageCreate(MessageBase):
    pass


class MessageUpdate(BaseSchema):
    content: Optional[str] = Field(None, min_length=1, max_length=2000)


class ChatFile(BaseSchema):
    id: int
    message_id: int
    chat_id: int
    user_id: int
    filename: str
    file_url: str
    file_type: str
    file_size: int
    is_safe: bool = True
    uploaded_at: datetime


class Message(MessageBase):
    id: int
    content: str
    chat_id: int
    sender_id: int
    is_read: bool = False
    created_at: datetime
    updated_at: datetime
    files: List[ChatFile] = Field(default_factory=list)


class ChatBase(BaseSchema):
    title: Optional[str] = Field(None, max_length=200)
    is_group: bool = False


class ChatCreate(ChatBase):
    participant_ids: List[int] = Field(..., min_items=1)


class ChatUpdate(BaseSchema):
    title: Optional[str] = Field(None, max_length=200)
    is_group: Optional[bool] = None
    participant_ids: Optional[List[int]] = None


class Chat(ChatBase):
    id: int
    creator_id: int
    participant_ids: List[int]
    last_message_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class ChatDetail(Chat):
    participants: List[User] = Field(default_factory=list)
    messages: List['Message'] = Field(default_factory=list)


class PortfolioItemBase(BaseSchema):
    title: str = Field(..., max_length=200)
    description: str = Field(..., min_length=10, max_length=2000)
    category: str = Field(..., max_length=100)
    skills_used: List[str] = Field(default_factory=list)
    project_url: Optional[str] = Field(None, max_length=500)
    image_url: Optional[str] = Field(None, max_length=500)


class PortfolioItemCreate(PortfolioItemBase):
    pass


class PortfolioItemUpdate(BaseSchema):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, min_length=10, max_length=2000)
    category: Optional[str] = Field(None, max_length=100)
    skills_used: Optional[List[str]] = Field(default_factory=list)
    project_url: Optional[str] = Field(None, max_length=500)
    image_url: Optional[str] = Field(None, max_length=500)


class PortfolioItem(PortfolioItemBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime


class AchievementBase(BaseSchema):
    title: str = Field(..., max_length=200)
    description: str = Field(..., max_length=500)
    category: str = Field(..., max_length=100)
    points: int = Field(..., ge=0)
    icon_url: Optional[str] = Field(None, max_length=500)


class AchievementCreate(AchievementBase):
    pass


class AchievementUpdate(BaseSchema):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=500)
    category: Optional[str] = Field(None, max_length=100)
    points: Optional[int] = Field(None, ge=0)
    icon_url: Optional[str] = Field(None, max_length=500)


class Achievement(AchievementBase):
    id: int
    user_id: int
    unlocked_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class LevelBase(BaseSchema):
    level: int = Field(..., ge=1)
    title: str = Field(..., max_length=100)
    description: str = Field(..., max_length=500)
    xp_required: int = Field(..., ge=0)
    rewards: Optional[Dict[str, Any]] = None


class LevelCreate(LevelBase):
    pass


class LevelUpdate(BaseSchema):
    level: Optional[int] = Field(None, ge=1)
    title: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    xp_required: Optional[int] = Field(None, ge=0)
    rewards: Optional[Dict[str, Any]] = None


class Level(LevelBase):
    id: int
    user_id: int
    current_xp: int = 0
    achieved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class CertificateBase(BaseSchema):
    title: str = Field(..., max_length=200)
    description: str = Field(..., max_length=500)
    category: str = Field(..., max_length=100)
    issuer: str = Field(..., max_length=200)
    issue_date: date
    expiry_date: Optional[date] = None
    certificate_url: Optional[str] = Field(None, max_length=500)


class CertificateCreate(CertificateBase):
    pass


class CertificateUpdate(BaseSchema):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=500)
    category: Optional[str] = Field(None, max_length=100)
    issuer: Optional[str] = Field(None, max_length=200)
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    certificate_url: Optional[str] = Field(None, max_length=500)


class Certificate(CertificateBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime


class EscrowBase(BaseSchema):
    amount: Decimal = Field(..., gt=0)
    currency: str = Field(default="USD", max_length=3)
    task_id: int


class EscrowCreate(EscrowBase):
    pass


class EscrowUpdate(BaseSchema):
    amount: Optional[Decimal] = Field(None, gt=0)
    currency: Optional[str] = Field(None, max_length=3)
    status: Optional[str] = None


class Escrow(EscrowBase):
    id: int
    client_id: int
    freelancer_id: int
    platform_fee: Decimal = Decimal('0')
    freelancer_amount: Decimal = Decimal('0')
    status: str = "pending"  # pending, funded, released, refunded, disputed, split
    funded_at: Optional[datetime] = None
    released_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    dispute_reason: Optional[str] = None
    disputed_at: Optional[datetime] = None
    disputed_by: Optional[int] = None
    resolution: Optional[str] = None  # client_win, freelancer_win, split
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime


class EscrowDetail(Escrow):
    client: Optional[User] = None
    freelancer: Optional[User] = None
    task: Optional[Task] = None


class FinancialGoalBase(BaseSchema):
    title: str = Field(..., max_length=200)
    description: str = Field(..., max_length=500)
    target_amount: Decimal = Field(..., gt=0)
    currency: str = Field(default="USD", max_length=3)
    category: str = Field(..., max_length=100)
    target_date: Optional[date] = None


class FinancialGoalCreate(FinancialGoalBase):
    pass


class FinancialGoalUpdate(BaseSchema):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=500)
    target_amount: Optional[Decimal] = Field(None, gt=0)
    currency: Optional[str] = Field(None, max_length=3)
    category: Optional[str] = Field(None, max_length=100)
    target_date: Optional[date] = None
    status: Optional[str] = None


class FinancialGoal(FinancialGoalBase):
    id: int
    user_id: int
    current_amount: Decimal = Decimal('0')
    status: str = "active"  # active, completed, cancelled
    created_at: datetime
    updated_at: datetime


class InvoiceBase(BaseSchema):
    amount: Decimal = Field(..., gt=0)
    currency: str = Field(default="USD", max_length=3)
    description: str = Field(..., max_length=500)
    due_date: Optional[date] = None
    task_id: Optional[int] = None


class InvoiceCreate(InvoiceBase):
    recipient_id: int


class InvoiceUpdate(BaseSchema):
    amount: Optional[Decimal] = Field(None, gt=0)
    currency: Optional[str] = Field(None, max_length=3)
    description: Optional[str] = Field(None, max_length=500)
    due_date: Optional[date] = None
    status: Optional[InvoiceStatus] = None


class Invoice(InvoiceBase):
    id: int
    issuer_id: int
    recipient_id: int
    status: InvoiceStatus = InvoiceStatus.DRAFT
    invoice_number: str
    paid_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class InvoiceDetail(Invoice):
    issuer: Optional[User] = None
    recipient: Optional[User] = None
    task: Optional[Task] = None


class NotificationSettingBase(BaseSchema):
    notification_type: NotificationType
    email_enabled: bool = True
    push_enabled: bool = True
    sms_enabled: bool = False


class NotificationSettingCreate(NotificationSettingBase):
    pass


class NotificationSettingUpdate(BaseSchema):
    notification_type: Optional[NotificationType] = None
    email_enabled: Optional[bool] = None
    push_enabled: Optional[bool] = None
    sms_enabled: Optional[bool] = None


class NotificationSetting(NotificationSettingBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime


class PaymentMethodBase(BaseSchema):
    method_type: str = Field(..., max_length=50)  # card, bank, paypal, etc.
    name: str = Field(..., max_length=200)
    account_number: Optional[str] = Field(None, max_length=100)
    routing_number: Optional[str] = Field(None, max_length=100)
    card_last4: Optional[str] = Field(None, max_length=4)
    card_brand: Optional[str] = Field(None, max_length=50)
    expiry_month: Optional[int] = Field(None, ge=1, le=12)
    expiry_year: Optional[int] = Field(None, ge=2020)
    is_default: bool = False


class PaymentMethodCreate(PaymentMethodBase):
    pass


class PaymentMethodUpdate(BaseSchema):
    method_type: Optional[str] = Field(None, max_length=50)
    name: Optional[str] = Field(None, max_length=200)
    account_number: Optional[str] = Field(None, max_length=100)
    routing_number: Optional[str] = Field(None, max_length=100)
    card_last4: Optional[str] = Field(None, max_length=4)
    card_brand: Optional[str] = Field(None, max_length=50)
    expiry_month: Optional[int] = Field(None, ge=1, le=12)
    expiry_year: Optional[int] = Field(None, ge=2020)
    is_default: Optional[bool] = None


class PaymentMethod(PaymentMethodBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime


class TransactionBase(BaseSchema):
    amount: Decimal = Field(..., gt=0)
    currency: str = Field(default="USD", max_length=3)
    transaction_type: TransactionType
    description: str = Field(..., max_length=500)
    reference_id: Optional[str] = Field(None, max_length=100)


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseSchema):
    amount: Optional[Decimal] = Field(None, gt=0)
    currency: Optional[str] = Field(None, max_length=3)
    transaction_type: Optional[TransactionType] = None
    description: Optional[str] = Field(None, max_length=500)
    reference_id: Optional[str] = Field(None, max_length=100)
    status: Optional[str] = None


class Transaction(TransactionBase):
    id: int
    user_id: int
    status: str = "pending"  # pending, completed, failed, cancelled
    external_id: Optional[str] = Field(None, max_length=100)
    created_at: datetime
    updated_at: datetime


class BudgetBase(BaseSchema):
    name: str = Field(..., max_length=200)
    amount: Decimal = Field(..., gt=0)
    currency: str = Field(default="USD", max_length=3)
    category: str = Field(..., max_length=100)
    period: BudgetPeriod
    start_date: date
    end_date: Optional[date] = None


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BaseSchema):
    name: Optional[str] = Field(None, max_length=200)
    amount: Optional[Decimal] = Field(None, gt=0)
    currency: Optional[str] = Field(None, max_length=3)
    category: Optional[str] = Field(None, max_length=100)
    period: Optional[BudgetPeriod] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class Budget(BudgetBase):
    id: int
    user_id: int
    spent_amount: Decimal = Decimal('0')
    remaining_amount: Decimal = Decimal('0')
    created_at: datetime
    updated_at: datetime


class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    size: int
    pages: int


class SuccessResponse(BaseModel):
    message: str
    data: Optional[Any] = None


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: User


class TokenData(BaseModel):
    username: Optional[str] = None


class AIRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=2000)
    context: Optional[Dict[str, Any]] = None


class AIResponse(BaseModel):
    response: str
    confidence: Optional[float] = Field(None, ge=0, le=1)
    suggestions: Optional[List[str]] = Field(default_factory=list)


class AnalyticsData(BaseModel):
    total_earnings: Decimal
    total_spent: Decimal
    completed_tasks: int
    active_tasks: int
    average_rating: Optional[float]
    monthly_earnings: List[Dict[str, Any]]
    top_categories: List[Dict[str, Any]]


class UserResponse(BaseSchema):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    bio: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False
    rating: Optional[float] = None
    total_earnings: Decimal = Decimal('0')
    total_spent: Decimal = Decimal('0')
    completed_tasks: int = 0
    avatar_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class Currency(BaseSchema):
    code: str = Field(..., max_length=10)
    name: str = Field(..., max_length=100)
    symbol: str = Field(..., max_length=10)
    decimals: int = Field(..., ge=0, le=18)


class CurrencyRate(BaseSchema):
    currency_code: str
    rate: float
    last_updated: datetime


class CurrencyConversion(BaseSchema):
    original_amount: Decimal
    original_currency: str
    converted_amount: Decimal
    target_currency: str
    exchange_rate: Decimal
    converted_at: datetime


class SmartMatch(BaseSchema):
    freelancer_id: int
    match_score: float = Field(..., ge=0, le=1)
    skills_match: List[str] = Field(default_factory=list)
    experience_level: str
    hourly_rate: Optional[Decimal] = None
    availability: str
    recommendations: List[str] = Field(default_factory=list)


class PricingRecommendation(BaseSchema):
    task_id: int
    recommended_min: Decimal
    recommended_max: Decimal
    market_average: Decimal
    complexity_factor: float
    demand_factor: float
    skill_rarity_factor: float
    justification: str
    confidence_score: float = Field(..., ge=0, le=1)


class SkillAnalysis(BaseSchema):
    user_id: int
    skill_gaps: List[str] = Field(default_factory=list)
    skill_strengths: List[str] = Field(default_factory=list)
    market_demand: Dict[str, float] = Field(default_factory=dict)
    learning_recommendations: List[str] = Field(default_factory=list)
    career_path_suggestions: List[str] = Field(default_factory=list)
    skill_score: float = Field(..., ge=0, le=1)


class MessageResponse(BaseModel):
    message: str


class KYCStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class KYCRequestBase(BaseSchema):
    document_type: str
    document_url: str
    comment: Optional[str] = None


class KYCRequestCreate(KYCRequestBase):
    pass


class KYCRequest(KYCRequestBase):
    id: int
    user_id: int
    status: KYCStatus = KYCStatus.PENDING
    submitted_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[int] = None


# Fix forward references for models with self/forward references
TaskDetail.update_forward_refs()
ApplicationDetail.update_forward_refs()
ReviewDetail.update_forward_refs()
PaymentDetail.update_forward_refs()
ChatDetail.update_forward_refs()
InvoiceDetail.update_forward_refs()
