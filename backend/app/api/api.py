"""
Main API router.
"""

from fastapi import APIRouter

from app.api.endpoints import (
    auth,
    users,
    tasks,
    applications,
    chats,
    messages,
    notifications,
    notification_settings,
    reviews,
    portfolio,
    certificates,
    payments,
    payment_methods,
    transactions,
    invoices,
    budgets,
    financial_goals,
    escrow,
    achievements,
    levels,
    ai,
    profile,
    currencies,
    ai_features,
    ai_translate,
    kyc
)

api_router = APIRouter()

# Include all routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
api_router.include_router(applications.router, prefix="/applications", tags=["Applications"])
api_router.include_router(chats.router, prefix="/chats", tags=["Chats"])
api_router.include_router(messages.router, prefix="/messages", tags=["Messages"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(notification_settings.router, prefix="/notification-settings", tags=["Notification Settings"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])
api_router.include_router(portfolio.router, prefix="/portfolio", tags=["Portfolio"])
api_router.include_router(certificates.router, prefix="/certificates", tags=["Certificates"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
api_router.include_router(payment_methods.router, prefix="/payment-methods", tags=["Payment Methods"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])
api_router.include_router(invoices.router, prefix="/invoices", tags=["Invoices"])
api_router.include_router(budgets.router, prefix="/budgets", tags=["Budgets"])
api_router.include_router(financial_goals.router, prefix="/financial-goals", tags=["Financial Goals"])
api_router.include_router(escrow.router, prefix="/escrow", tags=["Escrow"])
api_router.include_router(achievements.router, prefix="/achievements", tags=["Achievements"])
api_router.include_router(levels.router, prefix="/levels", tags=["Levels"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI"])
api_router.include_router(profile.router, prefix="/profile", tags=["Profile"])
api_router.include_router(currencies.router, prefix="/currencies", tags=["Currencies"])
api_router.include_router(ai_features.router, prefix="/ai-features", tags=["AI Features"])
api_router.include_router(ai_translate.router, prefix="/ai", tags=["AI Translate"])
api_router.include_router(kyc.router, prefix="/kyc", tags=["KYC"])

# Basic health check
@api_router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
