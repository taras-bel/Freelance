"""
Unit tests for financial service.
"""

import pytest
from decimal import Decimal
from unittest.mock import Mock, patch
from sqlalchemy.orm import Session

from app.services.financial_service import FinancialService
from app.crud_utils import create_user, create_task_for_user
from app.schemas import UserCreate, TaskCreate


class TestFinancialService:
    """Test financial service functionality."""

    @pytest.fixture
    def financial_service(self):
        """Create financial service instance."""
        return FinancialService()

    @pytest.fixture
    def test_user(self, db_session: Session, test_user_data: dict):
        """Create test user."""
        user_create = UserCreate(**test_user_data)
        return create_user(db_session, user_create)

    @pytest.fixture
    def test_task(self, db_session: Session, test_user, test_task_data: dict):
        """Create test task."""
        task_create = TaskCreate(**test_task_data)
        return create_task_for_user(db_session, task_create, user_id=test_user.id)

    def test_calculate_user_balance(self, financial_service, db_session: Session, test_user):
        """Test user balance calculation."""
        # Mock wallet with some balance
        mock_wallet = Mock()
        mock_wallet.balance = Decimal('1000.00')
        
        with patch('app.crud_utils.get_or_create_wallet', return_value=mock_wallet):
            balance = financial_service.get_user_balance(db_session, test_user.id)
            assert balance == Decimal('1000.00')

    def test_calculate_user_balance_no_wallet(self, financial_service, db_session: Session, test_user):
        """Test user balance calculation when wallet doesn't exist."""
        with patch('app.crud_utils.get_or_create_wallet', return_value=None):
            balance = financial_service.get_user_balance(db_session, test_user.id)
            assert balance == Decimal('0.00')

    def test_process_payment_success(self, financial_service, db_session: Session, test_user, test_task):
        """Test successful payment processing."""
        # Mock transaction creation
        mock_transaction = Mock()
        mock_transaction.id = 1
        mock_transaction.amount = Decimal('500.00')
        mock_transaction.status = 'completed'
        
        with patch('app.crud_utils.process_payment', return_value=mock_transaction):
            transaction = financial_service.process_payment(
                db_session,
                from_user_id=test_user.id,
                to_user_id=test_user.id,
                amount=Decimal('500.00'),
                task_id=test_task.id,
                description="Payment for task"
            )
            
            assert transaction.id == 1
            assert transaction.amount == Decimal('500.00')
            assert transaction.status == 'completed'

    def test_process_payment_insufficient_funds(self, financial_service, db_session: Session, test_user, test_task):
        """Test payment processing with insufficient funds."""
        with patch('app.crud_utils.process_payment', side_effect=ValueError("Insufficient funds")):
            with pytest.raises(ValueError, match="Insufficient funds"):
                financial_service.process_payment(
                    db_session,
                    from_user_id=test_user.id,
                    to_user_id=test_user.id,
                    amount=Decimal('10000.00'),
                    task_id=test_task.id,
                    description="Payment for task"
                )

    def test_calculate_budget_utilization(self, financial_service, db_session: Session, test_user):
        """Test budget utilization calculation."""
        # Mock budget data
        mock_budgets = [
            Mock(spent=Decimal('300.00'), limit=Decimal('1000.00')),
            Mock(spent=Decimal('200.00'), limit=Decimal('500.00'))
        ]
        
        with patch('app.crud_utils.get_user_budgets', return_value=mock_budgets):
            utilization = financial_service.calculate_budget_utilization(db_session, test_user.id)
            
            # Expected: (300+200)/(1000+500) = 500/1500 = 0.333...
            expected_utilization = Decimal('500.00') / Decimal('1500.00')
            assert abs(utilization - expected_utilization) < Decimal('0.01')

    def test_calculate_budget_utilization_no_budgets(self, financial_service, db_session: Session, test_user):
        """Test budget utilization calculation when no budgets exist."""
        with patch('app.crud_utils.get_user_budgets', return_value=[]):
            utilization = financial_service.calculate_budget_utilization(db_session, test_user.id)
            assert utilization == Decimal('0.00')

    def test_generate_financial_insights(self, financial_service, db_session: Session, test_user):
        """Test financial insights generation."""
        # Mock financial data
        mock_transactions = [
            Mock(amount=Decimal('100.00'), transaction_type='payment'),
            Mock(amount=Decimal('200.00'), transaction_type='payment'),
            Mock(amount=Decimal('50.00'), transaction_type='withdrawal')
        ]
        
        with patch('app.crud_utils.get_transactions', return_value=mock_transactions):
            insights = financial_service.generate_financial_insights(db_session, test_user.id)
            
            assert isinstance(insights, list)
            assert len(insights) > 0
            # Should contain insights about spending patterns, income, etc.

    def test_validate_payment_amount_positive(self, financial_service):
        """Test payment amount validation with positive amount."""
        assert financial_service.validate_payment_amount(Decimal('100.00')) is True

    def test_validate_payment_amount_zero(self, financial_service):
        """Test payment amount validation with zero amount."""
        assert financial_service.validate_payment_amount(Decimal('0.00')) is False

    def test_validate_payment_amount_negative(self, financial_service):
        """Test payment amount validation with negative amount."""
        assert financial_service.validate_payment_amount(Decimal('-100.00')) is False

    def test_calculate_tax_estimate(self, financial_service):
        """Test tax estimation calculation."""
        income = Decimal('10000.00')
        tax_rate = Decimal('0.15')  # 15%
        
        tax_estimate = financial_service.calculate_tax_estimate(income, tax_rate)
        expected_tax = income * tax_rate
        
        assert tax_estimate == expected_tax

    def test_calculate_savings_rate(self, financial_service):
        """Test savings rate calculation."""
        income = Decimal('5000.00')
        expenses = Decimal('3000.00')
        
        savings_rate = financial_service.calculate_savings_rate(income, expenses)
        expected_rate = (income - expenses) / income  # 2000/5000 = 0.4
        
        assert savings_rate == expected_rate

    def test_calculate_savings_rate_no_income(self, financial_service):
        """Test savings rate calculation with zero income."""
        income = Decimal('0.00')
        expenses = Decimal('1000.00')
        
        savings_rate = financial_service.calculate_savings_rate(income, expenses)
        assert savings_rate == Decimal('0.00')

    def test_format_currency(self, financial_service):
        """Test currency formatting."""
        amount = Decimal('1234.56')
        formatted = financial_service.format_currency(amount)
        
        assert formatted == "$1,234.56"

    def test_format_currency_zero(self, financial_service):
        """Test currency formatting for zero amount."""
        amount = Decimal('0.00')
        formatted = financial_service.format_currency(amount)
        
        assert formatted == "$0.00"

    def test_format_currency_negative(self, financial_service):
        """Test currency formatting for negative amount."""
        amount = Decimal('-1234.56')
        formatted = financial_service.format_currency(amount)
        
        assert formatted == "-$1,234.56" 