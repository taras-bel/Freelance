import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.app.database import SessionLocal
from backend.app.db_models import Achievement, Level

def create_test_data():
    db = SessionLocal()
    try:
        # Create test levels
        levels = [
            Level(level_number=1, title="Beginner", description="Just getting started", xp_required=0),
            Level(level_number=2, title="Novice", description="Learning the ropes", xp_required=100),
            Level(level_number=3, title="Intermediate", description="Getting better", xp_required=300),
            Level(level_number=4, title="Advanced", description="Experienced user", xp_required=600),
            Level(level_number=5, title="Expert", description="Master of the platform", xp_required=1000),
        ]
        
        for level in levels:
            existing = db.query(Level).filter(Level.level_number == level.level_number).first()
            if not existing:
                db.add(level)
        
        # Create test achievements
        achievements = [
            Achievement(
                title="First Task",
                description="Complete your first task",
                icon_url="🎯",
                category="task_completion",
                points=50
            ),
            Achievement(
                title="Task Master",
                description="Complete 10 tasks",
                icon_url="🏆",
                category="task_completion",
                points=200
            ),
            Achievement(
                title="Earnings Champion",
                description="Earn your first $100",
                icon_url="💰",
                category="earnings",
                points=150
            ),
            Achievement(
                title="Profile Complete",
                description="Complete your profile",
                icon_url="👤",
                category="profile",
                points=75
            ),
        ]
        
        for achievement in achievements:
            existing = db.query(Achievement).filter(Achievement.title == achievement.title).first()
            if not existing:
                db.add(achievement)
        
        db.commit()
        print("Test data created successfully!")
        
    except Exception as e:
        print(f"Error creating test data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_data() 