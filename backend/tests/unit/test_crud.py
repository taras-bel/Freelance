"""
Unit tests for CRUD operations.
"""

import pytest
from sqlalchemy.orm import Session

from app.crud_utils import (
    create_user,
    get_user,
    get_user_by_email,
    update_user,
    create_task_for_user,
    get_task,
    update_task_by_id,
    delete_task_by_id,
)
from app.schemas import UserCreate, UserUpdate, TaskCreate, TaskUpdate


class TestUserCRUD:
    """Test user CRUD operations."""

    def test_create_user(self, db_session: Session, test_user_data: dict):
        """Test user creation."""
        user_create = UserCreate(**test_user_data)
        user = create_user(db_session, user_create)

        assert user.email == test_user_data["email"]
        assert user.username == test_user_data["username"]
        assert user.first_name == test_user_data["first_name"]
        assert user.last_name == test_user_data["last_name"]

    def test_get_user(self, db_session: Session, test_user_data: dict):
        """Test getting user by ID."""
        # Create user first
        user_create = UserCreate(**test_user_data)
        created_user = create_user(db_session, user_create)

        # Get user by ID
        user = get_user(db_session, user_id=created_user.id)

        assert user is not None
        assert user.id == created_user.id
        assert user.email == test_user_data["email"]

    def test_get_user_not_found(self, db_session: Session):
        """Test getting non-existent user."""
        user = get_user(db_session, user_id=999)
        assert user is None

    def test_update_user(self, db_session: Session, test_user_data: dict):
        """Test user update."""
        # Create user first
        user_create = UserCreate(**test_user_data)
        user = create_user(db_session, user_create)

        # Update user
        update_data = UserUpdate(first_name="Updated", bio="New bio")
        updated_user = update_user(db_session, user_id=user.id, user_update=update_data)

        assert updated_user is not None
        assert updated_user.first_name == "Updated"
        assert updated_user.bio == "New bio"
        assert updated_user.email == test_user_data["email"]  # Unchanged

    def test_update_user_not_found(self, db_session: Session):
        """Test updating non-existent user."""
        update_data = UserUpdate(first_name="Updated")
        result = update_user(db_session, user_id=999, user_update=update_data)
        assert result is None


class TestTaskCRUD:
    """Test task CRUD operations."""

    def test_create_task(self, db_session: Session, test_user_data: dict, test_task_data: dict):
        """Test task creation."""
        # Create user first
        user_create = UserCreate(**test_user_data)
        user = create_user(db_session, user_create)

        # Create task
        task_create = TaskCreate(**test_task_data)
        task = create_task_for_user(db_session, task_create, user_id=user.id)

        assert task.title == test_task_data["title"]
        assert task.description == test_task_data["description"]
        assert task.category == test_task_data["category"]
        assert task.creator_id == user.id

    def test_get_task(self, db_session: Session, test_user_data: dict, test_task_data: dict):
        """Test getting task by ID."""
        # Create user and task
        user_create = UserCreate(**test_user_data)
        user = create_user(db_session, user_create)

        task_create = TaskCreate(**test_task_data)
        created_task = create_task_for_user(db_session, task_create, user_id=user.id)

        # Get task by ID
        task = get_task(db_session, task_id=created_task.id)

        assert task is not None
        assert task.id == created_task.id
        assert task.title == test_task_data["title"]

    def test_get_task_not_found(self, db_session: Session):
        """Test getting non-existent task."""
        task = get_task(db_session, task_id=999)
        assert task is None

    def test_update_task(self, db_session: Session, test_user_data: dict, test_task_data: dict):
        """Test task update."""
        # Create user and task
        user_create = UserCreate(**test_user_data)
        user = create_user(db_session, user_create)

        task_create = TaskCreate(**test_task_data)
        task = create_task_for_user(db_session, task_create, user_id=user.id)

        # Update task
        update_data = TaskUpdate(title="Updated Task", description="Updated description")
        updated_task = update_task_by_id(db_session, task_id=task.id, task_update=update_data)

        assert updated_task is not None
        assert updated_task.title == "Updated Task"
        assert updated_task.description == "Updated description"
        assert updated_task.category == test_task_data["category"]  # Unchanged

    def test_update_task_not_found(self, db_session: Session):
        """Test updating non-existent task."""
        update_data = TaskUpdate(title="Updated Task")
        result = update_task_by_id(db_session, task_id=999, task_update=update_data)
        assert result is None

    def test_delete_task(self, db_session: Session, test_user_data: dict, test_task_data: dict):
        """Test task deletion."""
        # Create user and task
        user_create = UserCreate(**test_user_data)
        user = create_user(db_session, user_create)

        task_create = TaskCreate(**test_task_data)
        task = create_task_for_user(db_session, task_create, user_id=user.id)

        # Delete task
        deleted_task = delete_task_by_id(db_session, task_id=task.id)

        assert deleted_task is not None
        assert deleted_task.id == task.id

        # Verify task is deleted
        retrieved_task = get_task(db_session, task_id=task.id)
        assert retrieved_task is None

    def test_delete_task_not_found(self, db_session: Session):
        """Test deleting non-existent task."""
        result = delete_task_by_id(db_session, task_id=999)
        assert result is None
