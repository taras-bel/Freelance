"""
Notification settings management endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_active_user
from app.crud_utils import (
    create_notification_setting,
    get_notification_setting,
    get_notification_settings,
    update_notification_setting,
    delete_notification_setting
)
from app.schemas import (
    NotificationSettingCreate,
    NotificationSetting,
    NotificationSettingUpdate,
    MessageResponse,
    PaginatedResponse
)
from app.db_models import NotificationSetting as DBNotificationSetting

router = APIRouter()


@router.post("/", response_model=NotificationSetting)
def create_new_notification_setting(
    setting_data: NotificationSettingCreate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new notification setting."""
    # Create notification setting
    setting = create_notification_setting(db, setting_data, current_user.id)
    return setting


@router.get("/", response_model=PaginatedResponse)
def get_all_notification_settings(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    user_id: Optional[int] = Query(None),
    notif_type: Optional[str] = Query(None),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get notification settings with filters and pagination."""
    settings = get_notification_settings(
        db, skip=skip, limit=limit, user_id=user_id,
        notification_type=notif_type
    )
    
    # Get total count
    total_query = db.query(DBNotificationSetting)
    if user_id is not None:
        total_query = total_query.filter(DBNotificationSetting.user_id == user_id)
    if isinstance(notif_type, str) and notif_type != "":
        total_query = total_query.filter(DBNotificationSetting.notification_type == notif_type)
    
    total = total_query.count()
    pages = (total + limit - 1) // limit
    
    return PaginatedResponse(
        items=settings,
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=pages
    )


@router.get("/{setting_id}", response_model=NotificationSetting)
def get_notification_setting_by_id(
    setting_id: int,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get notification setting by ID."""
    setting = get_notification_setting(db, setting_id)
    if setting is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification setting not found"
        )
    
    # Check if user is authorized to view this setting
    if getattr(setting, 'user_id', None) != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this notification setting"
        )
    
    return setting


@router.put("/{setting_id}", response_model=NotificationSetting)
def update_notification_setting_details(
    setting_id: int,
    setting_data: NotificationSettingUpdate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update notification setting details."""
    setting = get_notification_setting(db, setting_id)
    if setting is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification setting not found"
        )
    
    # Check if user is authorized to update this setting
    if getattr(setting, 'user_id', None) != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this notification setting"
        )
    
    # Update notification setting
    updated_setting = update_notification_setting(
        db, setting_id, setting_data.dict(exclude_unset=True)
    )
    if updated_setting is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification setting not found"
        )
    
    return updated_setting


@router.delete("/{setting_id}", response_model=MessageResponse)
def delete_notification_setting_by_id(
    setting_id: int,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete notification setting."""
    setting = get_notification_setting(db, setting_id)
    if setting is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification setting not found"
        )
    
    # Check if user is authorized to delete this setting
    if getattr(setting, 'user_id', None) != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this notification setting"
        )
    
    success = delete_notification_setting(db, setting_id)
    if success is None or success is False:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification setting not found"
        )
    
    return {"message": "Notification setting deleted successfully"}


@router.get("/me/settings", response_model=List[NotificationSetting])
def get_my_notification_settings(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get notification settings for current user."""
    settings = get_notification_settings(
        db, skip=skip, limit=limit, user_id=current_user.id
    )
    return settings


@router.post("/me/bulk-update", response_model=MessageResponse)
def bulk_update_notification_settings(
    settings_data: List[NotificationSettingUpdate],
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Bulk update notification settings for current user."""
    updated_count = 0
    
    for setting_data in settings_data:
        # Find existing setting for this type
        existing_settings = get_notification_settings(
            db, user_id=current_user.id,
            notification_type=setting_data.notification_type
        )
        
        if existing_settings:
            # Update existing setting
            setting = existing_settings[0]
            update_notification_setting(
                db, int(getattr(setting, 'id', 0)), setting_data.dict(exclude_unset=True)
            )
        else:
            # Create new setting
            create_notification_setting(
                db, NotificationSettingCreate(**setting_data.dict(exclude_unset=True)), current_user.id
            )
        
        updated_count += 1
    
    return {"message": f"Updated {updated_count} notification settings"}


@router.post("/me/disable-all", response_model=MessageResponse)
def disable_all_notifications(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Disable all notifications for current user."""
    settings = get_notification_settings(db, user_id=current_user.id)
    
    for setting in settings:
        setattr(setting, 'enabled', False)  # type: ignore
        setattr(setting, 'email_enabled', False)  # type: ignore
        setattr(setting, 'push_enabled', False)  # type: ignore
        setattr(setting, 'sms_enabled', False)  # type: ignore
    
    db.commit()
    
    return {"message": f"Disabled {len(settings)} notification settings"}


@router.post("/me/enable-all", response_model=MessageResponse)
def enable_all_notifications(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Enable all notifications for current user."""
    settings = get_notification_settings(db, user_id=current_user.id)
    
    for setting in settings:
        setattr(setting, 'enabled', True)  # type: ignore
        setattr(setting, 'email_enabled', True)  # type: ignore
        setattr(setting, 'push_enabled', True)  # type: ignore
        setattr(setting, 'sms_enabled', True)  # type: ignore
    
    db.commit()
    
    return {"message": f"Enabled {len(settings)} notification settings"}


@router.get("/types", response_model=List[str])
def get_notification_types(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all notification types."""
    settings = get_notification_settings(db)
    types = list(set(getattr(setting, 'notification_type', None) for setting in settings if getattr(setting, 'notification_type', None) is not None))
    return types


@router.get("/me/summary", response_model=dict)
def get_my_settings_summary(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get summary of user's notification settings."""
    settings = get_notification_settings(db, user_id=current_user.id)
    
    summary = {
        "total_settings": len(settings),
        "enabled_settings": len([s for s in settings if getattr(s, 'enabled', False)]),
        "disabled_settings": len([s for s in settings if not getattr(s, 'enabled', False)]),
        "email_enabled": len([s for s in settings if getattr(s, 'email_enabled', False)]),
        "push_enabled": len([s for s in settings if getattr(s, 'push_enabled', False)]),
        "sms_enabled": len([s for s in settings if getattr(s, 'sms_enabled', False)]),
    }
    
    return summary
