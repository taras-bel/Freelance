from sqlalchemy.orm import Session
from typing import List
from app.db_models import Achievement

class AchievementService:
    def get_user_achievements(self, db: Session, user_id: int) -> List[dict]:
        """Получает все достижения пользователя"""
        achievements = db.query(Achievement).filter(Achievement.user_id == user_id).all()
        result = []
        for ach in achievements:
            result.append({
                "id": ach.id,
                "title": ach.title,
                "description": ach.description,
                "category": ach.category,
                "points": ach.points,
                "icon_url": ach.icon_url,
                "unlocked_at": ach.unlocked_at,
                "created_at": ach.created_at,
                "updated_at": ach.updated_at
            })
        return result

    def create_achievement(self, db: Session, user_id: int, data: dict) -> dict:
        """Создаёт новое достижение для пользователя"""
        achievement = Achievement(
            user_id=user_id,
            title=data.get("title"),
            description=data.get("description"),
            category=data.get("category"),
            points=data.get("points", 0),
            icon_url=data.get("icon_url"),
        )
        db.add(achievement)
        db.commit()
        db.refresh(achievement)
        return {
            "id": achievement.id,
            "title": achievement.title,
            "description": achievement.description,
            "category": achievement.category,
            "points": achievement.points,
            "icon_url": achievement.icon_url,
            "unlocked_at": achievement.unlocked_at,
            "created_at": achievement.created_at,
            "updated_at": achievement.updated_at
        }

    def get_all_achievements(self, db: Session) -> List[dict]:
        """Получает все достижения в системе (без фильтра по пользователю)"""
        achievements = db.query(Achievement).all()
        result = []
        for ach in achievements:
            result.append({
                "id": ach.id,
                "title": ach.title,
                "description": ach.description,
                "category": ach.category,
                "points": ach.points,
                "icon_url": ach.icon_url,
                "user_id": ach.user_id,
                "unlocked_at": ach.unlocked_at,
                "created_at": ach.created_at,
                "updated_at": ach.updated_at
            })
        return result

achievement_service = AchievementService()
