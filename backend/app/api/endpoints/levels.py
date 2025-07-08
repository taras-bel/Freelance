"""
Level management endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_active_user
from app.schemas import Level, LevelCreate, LevelUpdate, MessageResponse, PaginatedResponse
from app.db_models import Level as LevelModel

router = APIRouter()


@router.post("/", response_model=Level)
def create_level(level_data: LevelCreate, current_user=Depends(get_current_active_user), db: Session = Depends(get_db)):
    level = LevelModel(**level_data.dict(), user_id=current_user.id)
    db.add(level)
    db.commit()
    db.refresh(level)
    return level


@router.get("/", response_model=List[Level])
def get_levels(skip: int = 0, limit: int = 100, current_user=Depends(get_current_active_user), db: Session = Depends(get_db)):
    levels = db.query(LevelModel).filter(LevelModel.user_id == current_user.id).offset(skip).limit(limit).all()
    return levels


@router.get("/{level_id}", response_model=Level)
def get_level(level_id: int, current_user=Depends(get_current_active_user), db: Session = Depends(get_db)):
    level = db.query(LevelModel).filter(LevelModel.id == level_id, LevelModel.user_id == current_user.id).first()
    if level is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Level not found")
    return level


@router.put("/{level_id}", response_model=Level)
def update_level(level_id: int, level_data: LevelUpdate, current_user=Depends(get_current_active_user), db: Session = Depends(get_db)):
    level = db.query(LevelModel).filter(LevelModel.id == level_id, LevelModel.user_id == current_user.id).first()
    if level is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Level not found")
    for key, value in level_data.dict(exclude_unset=True).items():
        setattr(level, key, value)
    db.commit()
    db.refresh(level)
    return level


@router.delete("/{level_id}", response_model=MessageResponse)
def delete_level(level_id: int, current_user=Depends(get_current_active_user), db: Session = Depends(get_db)):
    level = db.query(LevelModel).filter(LevelModel.id == level_id, LevelModel.user_id == current_user.id).first()
    if level is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Level not found")
    db.delete(level)
    db.commit()
    return {"message": "Level deleted successfully"}


@router.get("/me/level", response_model=Level)
def get_my_level(current_user=Depends(get_current_active_user), db: Session = Depends(get_db)):
    level = db.query(LevelModel).filter(LevelModel.user_id == current_user.id).order_by(LevelModel.level.desc()).first()
    if level is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No level found for user")
    return level


@router.get("/user/{user_id}", response_model=Level)
def get_user_level(user_id: int, db: Session = Depends(get_db)):
    level = db.query(LevelModel).filter(LevelModel.user_id == user_id).order_by(LevelModel.level.desc()).first()
    if level is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No level found for user")
    return level
