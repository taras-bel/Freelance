from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    Text,
    JSON,
    ForeignKey,
    Boolean)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class FinancialReport(Base):
    __tablename__ = "financial_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    report_type = Column(String(50), nullable=False)  # monthly, yearly, custom
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)

    # Financial Summary
    total_income = Column(Float, default=0.0)
    total_expenses = Column(Float, default=0.0)
    net_income = Column(Float, default=0.0)
    savings_rate = Column(Float, default=0.0)
    budget_efficiency = Column(Float, default=0.0)

    # Goals Progress
    goals_progress = Column(JSON)
    goals_completed = Column(Integer, default=0)
    goals_total = Column(Integer, default=0)

    # Budget Analysis
    budget_variance = Column(JSON)
    overspending_categories = Column(JSON)
    underspending_categories = Column(JSON)

    # Investment Performance
    investment_returns = Column(Float, default=0.0)
    portfolio_growth = Column(Float, default=0.0)
    risk_metrics = Column(JSON)

    # Cash Flow Analysis
    cash_flow_data = Column(JSON)
    cash_flow_trend = Column(String(20))

    # Recommendations
    insights = Column(JSON)
    recommendations = Column(JSON)
    risk_alerts = Column(JSON)

    # Metadata
    is_public = Column(Boolean, default=False)
    tags = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="financial_reports")


class SpendingAnalysis(Base):
    __tablename__ = "spending_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    analysis_date = Column(DateTime, nullable=False)
    period_type = Column(String(20), nullable=False)  # daily, weekly, monthly

    # Category Analysis
    category_spending = Column(JSON)
    category_percentages = Column(JSON)
    top_categories = Column(JSON)

    # Trend Analysis
    spending_trend = Column(String(20))
    trend_percentage = Column(Float, default=0.0)
    trend_direction = Column(String(10))

    # Anomaly Detection
    unusual_spending = Column(JSON)
    spending_spikes = Column(JSON)

    # Behavioral Insights
    spending_patterns = Column(JSON)
    seasonal_trends = Column(JSON)

    # Recommendations
    optimization_suggestions = Column(JSON)
    cost_reduction_opportunities = Column(JSON)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="spending_analyses")


class IncomeAnalysis(Base):
    __tablename__ = "income_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    analysis_date = Column(DateTime, nullable=False)
    period_type = Column(String(20), nullable=False)  # daily, weekly, monthly

    # Income Sources
    source_breakdown = Column(JSON)
    source_percentages = Column(JSON)
    primary_income_source = Column(String(100))

    # Income Trends
    income_trend = Column(String(20))
    trend_percentage = Column(Float, default=0.0)
    growth_rate = Column(Float, default=0.0)

    # Stability Analysis
    income_stability_score = Column(Float, default=0.0)
    volatility_metrics = Column(JSON)
    consistency_score = Column(Float, default=0.0)

    # Projections
    income_forecast = Column(JSON)
    forecast_confidence = Column(Float, default=0.0)

    # Recommendations
    diversification_suggestions = Column(JSON)
    income_optimization = Column(JSON)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="income_analyses")


class PortfolioAnalysis(Base):
    __tablename__ = "portfolio_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    analysis_date = Column(DateTime, nullable=False)

    # Portfolio Composition
    asset_allocation = Column(JSON)
    investment_breakdown = Column(JSON)
    sector_exposure = Column(JSON)

    # Performance Metrics
    total_return = Column(Float, default=0.0)
    annualized_return = Column(Float, default=0.0)
    sharpe_ratio = Column(Float, default=0.0)
    volatility = Column(Float, default=0.0)
    max_drawdown = Column(Float, default=0.0)

    # Risk Analysis
    risk_score = Column(Float, default=0.0)
    risk_tolerance = Column(String(20))
    diversification_score = Column(Float, default=0.0)

    # Benchmark Comparison
    benchmark_performance = Column(JSON)
    relative_performance = Column(Float, default=0.0)

    # Rebalancing
    rebalancing_needs = Column(JSON)
    target_allocation = Column(JSON)

    # Recommendations
    investment_suggestions = Column(JSON)
    risk_adjustments = Column(JSON)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="portfolio_analyses")


class FinancialInsight(Base):
    __tablename__ = "financial_insights"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    insight_type = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)

    # Insight Data
    data_points = Column(JSON)
    trend_data = Column(JSON)
    comparison_data = Column(JSON)

    # Impact Assessment
    impact_score = Column(Float, default=0.0)
    impact_type = Column(String(20))
    potential_savings = Column(Float, default=0.0)
    potential_gains = Column(Float, default=0.0)

    # Action Items
    action_items = Column(JSON)
    priority = Column(String(20))
    difficulty = Column(String(20))

    # Status
    is_read = Column(Boolean, default=False)
    is_actioned = Column(Boolean, default=False)
    actioned_at = Column(DateTime(timezone=True))

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="financial_insights")
