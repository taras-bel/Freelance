"""
Portfolio management endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_active_user
from app.crud_utils import (
    create_portfolio_item,
    get_portfolio_item,
    get_portfolio_items,
    update_portfolio_item,
    delete_portfolio_item
)
from app.schemas import (
    PortfolioItemCreate,
    PortfolioItem,
    PortfolioItemUpdate,
    MessageResponse,
    PaginatedResponse
)
from app.db_models import PortfolioItem as DBPortfolioItem

router = APIRouter()


@router.post("/", response_model=PortfolioItem)
def create_new_portfolio_item(
    portfolio_data: PortfolioItemCreate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new portfolio item."""
    # Create portfolio item
    portfolio_item = create_portfolio_item(db, portfolio_data, current_user.id)
    return portfolio_item


@router.get("/", response_model=PaginatedResponse)
def get_all_portfolio_items(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    user_id: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get portfolio items with filters and pagination."""
    portfolio_items = get_portfolio_items(
        db, skip=skip, limit=limit, user_id=user_id, category=category
    )
    
    # Get total count
    total_query = db.query(DBPortfolioItem)
    if user_id is not None:
        total_query = total_query.filter(DBPortfolioItem.user_id == user_id)
    if category is not None:
        total_query = total_query.filter(DBPortfolioItem.category == category)
    
    total = total_query.count()
    pages = (total + limit - 1) // limit
    
    return PaginatedResponse(
        items=portfolio_items,
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=pages
    )


@router.get("/{portfolio_id}", response_model=PortfolioItem)
def get_portfolio_item_by_id(
    portfolio_id: int,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get portfolio item by ID."""
    portfolio_item = get_portfolio_item(db, portfolio_id)
    if portfolio_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio item not found"
        )
    
    return portfolio_item


@router.put("/{portfolio_id}", response_model=PortfolioItem)
def update_portfolio_item_details(
    portfolio_id: int,
    portfolio_data: PortfolioItemUpdate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update portfolio item details."""
    portfolio_item = get_portfolio_item(db, portfolio_id)
    if portfolio_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio item not found"
        )
    
    # Check if user is authorized to update this portfolio item
    if getattr(portfolio_item, 'user_id', None) != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this portfolio item"
        )
    
    # Update portfolio item
    updated_portfolio_item = update_portfolio_item(
        db, portfolio_id, portfolio_data.dict(exclude_unset=True)
    )
    if updated_portfolio_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio item not found"
        )
    
    return updated_portfolio_item


@router.delete("/{portfolio_id}", response_model=MessageResponse)
def delete_portfolio_item_by_id(
    portfolio_id: int,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete portfolio item."""
    portfolio_item = get_portfolio_item(db, portfolio_id)
    if portfolio_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio item not found"
        )
    
    # Check if user is authorized to delete this portfolio item
    if getattr(portfolio_item, 'user_id', None) != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this portfolio item"
        )
    
    success = delete_portfolio_item(db, portfolio_id)
    if success is None or success is False:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio item not found"
        )
    
    return {"message": "Portfolio item deleted successfully"}


@router.get("/me/portfolio", response_model=List[PortfolioItem])
def get_my_portfolio(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get portfolio items for current user."""
    portfolio_items = get_portfolio_items(
        db, skip=skip, limit=limit, user_id=current_user.id
    )
    return portfolio_items


@router.get("/user/{user_id}", response_model=List[PortfolioItem])
def get_user_portfolio(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get portfolio items for a specific user."""
    portfolio_items = get_portfolio_items(
        db, skip=skip, limit=limit, user_id=user_id
    )
    return portfolio_items


@router.get("/categories", response_model=List[str])
def get_portfolio_categories(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all portfolio categories."""
    portfolio_items = get_portfolio_items(db)
    categories = list(set(getattr(item, 'category', None) for item in portfolio_items if getattr(item, 'category', None) is not None))
    return categories
