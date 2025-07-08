from sqlalchemy.orm import Session
from typing import Optional, List
from app.db_models import NotificationSetting
from app.schemas import NotificationSettingCreate, NotificationSettingUpdate


def create_notification_setting(db: Session, setting: NotificationSettingCreate, user_id: int) -> NotificationSetting:
    db_setting = NotificationSetting(user_id=user_id, **setting.dict())
    db.add(db_setting)
    db.commit()
    db.refresh(db_setting)
    return db_setting


def get_notification_setting(db: Session, setting_id: int) -> Optional[NotificationSetting]:
    return db.query(NotificationSetting).filter(NotificationSetting.id == setting_id).first()


def get_notification_settings(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
    notification_type: Optional[str] = None
) -> List[NotificationSetting]:
    query = db.query(NotificationSetting)
    if user_id is not None:
        query = query.filter(NotificationSetting.user_id == user_id)
    if notification_type is not None:
        query = query.filter(NotificationSetting.notification_type == notification_type)
    return query.order_by(NotificationSetting.created_at.desc()).offset(skip).limit(limit).all()


def update_notification_setting(db: Session, setting_id: int, setting_update: NotificationSettingUpdate) -> Optional[NotificationSetting]:
    db_setting = get_notification_setting(db, setting_id)
    if not db_setting:
        return None
    update_data = setting_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_setting, field, value)
    db.commit()
    db.refresh(db_setting)
    return db_setting


def delete_notification_setting(db: Session, setting_id: int) -> bool:
    db_setting = get_notification_setting(db, setting_id)
    if not db_setting:
        return False
    db.delete(db_setting)
    db.commit()
    return True
