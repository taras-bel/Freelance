"""
Notification endpoints for user notifications.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.auth import get_current_active_user
from app.schemas import Notification, NotificationCreate
from app.db_models import User, Notification as DBNotification

router = APIRouter()


@router.get("/", response_model=List[Notification])
def get_user_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    unread_only: bool = Query(False, description="Filter unread notifications only"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all notifications for the current user."""
    query = db.query(DBNotification).filter(DBNotification.user_id == current_user.id)
    
    if unread_only:
        query = query.filter(DBNotification.is_read == False)
    
    notifications = query.order_by(DBNotification.created_at.desc()).offset(skip).limit(limit).all()
    
    # Convert to Pydantic schemas
    from app.schemas import Notification as NotificationSchema
    return [NotificationSchema.from_orm(notification) for notification in notifications]


@router.get("/unread-count")
def get_unread_count(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get count of unread notifications."""
    count = db.query(DBNotification).filter(
        DBNotification.user_id == current_user.id,
        DBNotification.is_read == False
    ).count()
    
    return {"unread_count": count}


@router.post("/", response_model=Notification)
def create_notification(
    notification_data: NotificationCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new notification."""
    notification = DBNotification(
        **notification_data.dict(),
        user_id=current_user.id,
        created_at=datetime.utcnow(),
        is_read=False
    )
    
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    # Convert to Pydantic schema
    from app.schemas import Notification as NotificationSchema
    return NotificationSchema.from_orm(notification)


@router.get("/{notification_id}", response_model=Notification)
def get_notification_by_id(
    notification_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get notification by ID."""
    notification = db.query(DBNotification).filter(DBNotification.id == notification_id).first()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    # Check authorization
    if notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this notification"
        )
    
    # Convert to Pydantic schema
    from app.schemas import Notification as NotificationSchema
    return NotificationSchema.from_orm(notification)


@router.put("/{notification_id}/read")
def mark_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Mark notification as read."""
    notification = db.query(DBNotification).filter(DBNotification.id == notification_id).first()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    # Check authorization
    if notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this notification"
        )
    
    notification.is_read = True
    notification.read_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Notification marked as read"}


@router.put("/read-all")
def mark_all_as_read(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Mark all notifications as read."""
    db.query(DBNotification).filter(
        DBNotification.user_id == current_user.id,
        DBNotification.is_read == False
    ).update({
        "is_read": True,
        "read_at": datetime.utcnow()
    })
    
    db.commit()
    
    return {"message": "All notifications marked as read"}


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete notification."""
    notification = db.query(DBNotification).filter(DBNotification.id == notification_id).first()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    # Check authorization
    if notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this notification"
        )
    
    db.delete(notification)
    db.commit()
    
    return {"message": "Notification deleted successfully"}


@router.delete("/")
def delete_all_notifications(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete all notifications for the current user."""
    db.query(DBNotification).filter(DBNotification.user_id == current_user.id).delete()
    db.commit()
    
    return {"message": "All notifications deleted successfully"}
