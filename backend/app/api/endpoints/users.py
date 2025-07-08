"""
User management endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_active_user
from app.crud_utils import (
    get_user,
    get_users,
    update_user,
    delete_user
)
from app.schemas import UserResponse, UserUpdate, MessageResponse
from app.core.security import validate_email, validate_username

router = APIRouter()


@router.get("/", response_model=List[UserResponse])
def get_all_users(
    skip: int=Query(0, ge=0),
    limit: int=Query(100, ge=1, le=1000),
    current_user=Depends(get_current_active_user),
    db: Session=Depends(get_db)
):
    """Get all users with pagination and search."""
    users = get_users(db, skip=skip, limit=limit)
    return users


@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(
    user_id: int,
    current_user=Depends(get_current_active_user),
    db: Session=Depends(get_db)
):
    """Get user by ID."""
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.put("/{user_id}", response_model=UserResponse)
def update_user_profile(
    user_id: int,
    user_data: UserUpdate,
    current_user=Depends(get_current_active_user),
    db: Session=Depends(get_db)
):
    """Update user profile."""
    # Check if user is updating their own profile or is admin
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this user"
        )

    # Validate email if provided
    if user_data.email and not validate_email(user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )

    # Validate username if provided
    if user_data.username and not validate_username(user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid username format"
        )

    # Update user
    updated_user = update_user(db, user_id, user_data.dict(exclude_unset=True))
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return updated_user


@router.delete("/{user_id}", response_model=MessageResponse)
def delete_user_account(
    user_id: int,
    current_user=Depends(get_current_active_user),
    db: Session=Depends(get_db)
):
    """Delete user account."""
    # Check if user is deleting their own account or is admin
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this user"
        )

    success = delete_user(db, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return {"message": "User account deleted successfully"}


@router.get("/me/profile", response_model=UserResponse)
def get_my_profile(current_user=Depends(get_current_active_user)):
    """Get current user's profile."""
    return current_user


@router.put("/me/profile", response_model=UserResponse)
def update_my_profile(
    user_data: UserUpdate,
    current_user=Depends(get_current_active_user),
    db: Session=Depends(get_db)
):
    """Update current user's profile."""
    # Validate email if provided
    if user_data.email and not validate_email(user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )

    # Validate username if provided
    if user_data.username and not validate_username(user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid username format"
        )

    # Update user
    updated_user = update_user(db, current_user.id, user_data.dict(exclude_unset=True))
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return updated_user


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user=Depends(get_current_active_user)):
    """Get current user information."""
    return current_user


@router.put("/me", response_model=UserResponse)
def update_current_user(
    user_data: UserUpdate,
    current_user=Depends(get_current_active_user),
    db: Session=Depends(get_db)
):
    """Update current user information."""
    updated_user = update_user(db, current_user.id, user_data.dict(exclude_unset=True))
    return updated_user


@router.delete("/me")
def delete_current_user(
    current_user=Depends(get_current_active_user),
    db: Session=Depends(get_db)
):
    """Delete current user account."""
    delete_user(db, current_user.id)
    return {"message": "User account deleted successfully"}
