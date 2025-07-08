"""
Review management endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_active_user
from app.crud_utils import (
    create_review,
    get_review,
    get_reviews,
    update_review,
    delete_review
)
from app.schemas import (
    ReviewCreate,
    Review,
    ReviewUpdate,
    MessageResponse,
    PaginatedResponse
)
from app.db_models import Review as DBReview

router = APIRouter()


@router.post("/", response_model=Review)
def create_new_review(
    review_data: ReviewCreate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new review."""
    # Check if user already reviewed this task
    existing_reviews = get_reviews(
        db, task_id=review_data.task_id, reviewer_id=current_user.id
    )
    if existing_reviews:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this task"
        )
    
    # Create review
    review = create_review(db, review_data, current_user.id)
    return review


@router.get("/", response_model=PaginatedResponse)
def get_all_reviews(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    task_id: Optional[int] = Query(None),
    reviewer_id: Optional[int] = Query(None),
    reviewee_id: Optional[int] = Query(None),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get reviews with filters and pagination."""
    reviews = get_reviews(
        db, skip=skip, limit=limit, task_id=task_id,
        reviewer_id=reviewer_id, reviewee_id=reviewee_id
    )
    
    # Get total count
    total_query = db.query(DBReview)
    if task_id is not None:
        total_query = total_query.filter(DBReview.task_id == task_id)
    if reviewer_id is not None:
        total_query = total_query.filter(DBReview.reviewer_id == reviewer_id)
    if reviewee_id is not None:
        total_query = total_query.filter(DBReview.reviewee_id == reviewee_id)
    
    total = total_query.count()
    pages = (total + limit - 1) // limit
    
    return PaginatedResponse(
        items=reviews,
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=pages
    )


@router.get("/{review_id}", response_model=Review)
def get_review_by_id(
    review_id: int,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get review by ID."""
    review = get_review(db, review_id)
    if review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    return review


@router.put("/{review_id}", response_model=Review)
def update_review_details(
    review_id: int,
    review_data: ReviewUpdate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update review details."""
    review = get_review(db, review_id)
    if review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    # Check if user is authorized to update this review
    if getattr(review, 'reviewer_id', None) != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this review"
        )
    
    # Update review
    updated_review = update_review(
        db, review_id, review_data.dict(exclude_unset=True)
    )
    if updated_review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    return updated_review


@router.delete("/{review_id}", response_model=MessageResponse)
def delete_review_by_id(
    review_id: int,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete review."""
    review = get_review(db, review_id)
    if review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    # Check if user is authorized to delete this review
    if getattr(review, 'reviewer_id', None) != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this review"
        )
    
    success = delete_review(db, review_id)
    if success is None or success is False:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    return {"message": "Review deleted successfully"}


@router.get("/me/given", response_model=List[Review])
def get_my_given_reviews(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get reviews given by current user."""
    reviews = get_reviews(
        db, skip=skip, limit=limit, reviewer_id=current_user.id
    )
    return reviews


@router.get("/me/received", response_model=List[Review])
def get_my_received_reviews(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get reviews received by current user."""
    reviews = get_reviews(
        db, skip=skip, limit=limit, reviewee_id=current_user.id
    )
    return reviews


@router.get("/user/{user_id}", response_model=List[Review])
def get_user_reviews(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get reviews for a specific user."""
    reviews = get_reviews(
        db, skip=skip, limit=limit, reviewee_id=user_id
    )
    return reviews


@router.get("/task/{task_id}", response_model=List[Review])
def get_task_reviews(
    task_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get reviews for a specific task."""
    reviews = get_reviews(
        db, skip=skip, limit=limit, task_id=task_id
    )
    return reviews
