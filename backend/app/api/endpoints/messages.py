"""
Message management endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.auth import get_current_active_user
from app.crud_utils import (
    create_message,
    get_message,
    get_messages,
    update_message,
    delete_message
)
from app.schemas import (
    MessageCreate,
    MessageUpdate,
    Message,
    MessageResponse,
    PaginatedResponse
)
from app.db_models import User, Chat, Message as DBMessage
from app.auth import get_current_user

router = APIRouter()


@router.post("/", response_model=Message)
def create_new_message(
    message_data: MessageCreate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new message."""
    # Create message
    message = create_message(db, message_data, current_user.id)
    return message


@router.get("/", response_model=PaginatedResponse)
def get_all_messages(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    chat_id: Optional[int] = Query(None),
    sender_id: Optional[int] = Query(None),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get messages with filters and pagination."""
    messages = get_messages(
        db, skip=skip, limit=limit, chat_id=chat_id, sender_id=sender_id
    )
    
    # Get total count
    total_query = db.query(DBMessage)
    if chat_id is not None:
        total_query = total_query.filter(DBMessage.chat_id == chat_id)
    if sender_id is not None:
        total_query = total_query.filter(DBMessage.sender_id == sender_id)
    
    total = total_query.count()
    pages = (total + limit - 1) // limit
    
    return PaginatedResponse(
        items=messages,
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=pages
    )


@router.get("/{message_id}", response_model=Message)
def get_message_by_id(
    message_id: int,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get message by ID."""
    message = get_message(db, message_id)
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    return message


@router.put("/{message_id}", response_model=Message)
def update_message_details(
    message_id: int,
    message_data: MessageUpdate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update message details."""
    message = get_message(db, message_id)
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Check if user is authorized to update this message
    if message.sender_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this message"
        )
    
    # Update message
    updated_message = update_message(
        db, message_id, message_data.dict(exclude_unset=True)
    )
    if not updated_message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    return updated_message


@router.delete("/{message_id}", response_model=MessageResponse)
def delete_message_by_id(
    message_id: int,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete message."""
    message = get_message(db, message_id)
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Check if user is authorized to delete this message
    if message.sender_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this message"
        )
    
    success = delete_message(db, message_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    return {"message": "Message deleted successfully"}


@router.get("/chat/{chat_id}", response_model=List[Message])
def get_chat_messages(
    chat_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get messages for a specific chat."""
    messages = get_messages(
        db, skip=skip, limit=limit, chat_id=chat_id
    )
    return messages


@router.get("/me/sent", response_model=List[Message])
def get_my_sent_messages(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get messages sent by current user."""
    messages = get_messages(
        db, skip=skip, limit=limit, sender_id=current_user.id
    )
    return messages


@router.post("/{message_id}/like")
def like_message(
    message_id: int,
    current_user: User=Depends(get_current_user),
    db: Session=Depends(get_db)):
    """Like/unlike a message"""
    message = (
        db.query(DBMessage)
        .join(Chat)
        .filter(DBMessage.id == message_id)
        .filter(Chat.participant_ids.contains([current_user.id]))
        .first()
    )

    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Message not found"
        )

    # Toggle like status
    # NOTE: The 'liked_by' field must exist on the Message model as a JSON or ARRAY column for like/unlike to work.
    if not hasattr(message, 'liked_by') or message.liked_by is None:
        message.liked_by = []

    if current_user.id in message.liked_by:
        # Unlike
        message.liked_by = [uid for uid in message.liked_by if uid != current_user.id]
    else:
        # Like
        message.liked_by.append(current_user.id)

    db.add(message)
    db.commit()

    return {
        "message": ("Message liked" if current_user.id in (message.liked_by or []) else "Message unliked"),
        "liked": current_user.id in (message.liked_by or [])
    }


@router.get("/search")
def search_messages(
    query: str,
    current_user: User=Depends(get_current_user),
    db: Session=Depends(get_db),
    skip: int = 0,
    limit: int = 20):
    """Search messages by content"""
    message_query = (
        db.query(DBMessage)
        .join(Chat)
        .filter(Chat.participant_ids.contains([current_user.id]))
        .filter(DBMessage.content.ilike(f"%{query}%"))
    )

    messages = message_query.order_by(DBMessage.created_at.desc()).offset(skip).limit(limit).all()

    return {
        "messages": [Message.from_orm(message) for message in messages],
        "total": message_query.count()
    }


@router.get("/unread")
def get_unread_messages(
    current_user: User=Depends(get_current_user),
    db: Session=Depends(get_db),
    skip: int = 0,
    limit: int = 50):
    """Get unread messages for current user"""
    unread_messages = (
        db.query(DBMessage)
        .join(Chat)
        .filter(
            Chat.participant_ids.contains([current_user.id]),
            DBMessage.sender_id != current_user.id,
            ~DBMessage.read_by.contains([current_user.id]))
        .order_by(DBMessage.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {
        "unread_messages": [MessageResponse.from_orm(message) for message in unread_messages],
        "total": len(unread_messages)
    }


@router.post("/{message_id}/mark-read")
def mark_message_as_read(
    message_id: int,
    current_user: User=Depends(get_current_user),
    db: Session=Depends(get_db)):
    """Mark a specific message as read"""
    message = (
        db.query(DBMessage)
        .join(Chat)
        .filter(DBMessage.id == message_id)
        .filter(Chat.participant_ids.contains([current_user.id]))
        .first()
    )

    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Message not found"
        )

    # Mark as read if not message.read_by:
    if not hasattr(message, 'read_by') or message.read_by is None:
        message.read_by = []

    if current_user.id not in message.read_by:
        message.read_by.append(current_user.id)
        db.add(message)
        db.commit()

    return {"message": "Message marked as read"}


@router.get("/unread/count")
def get_unread_message_count(current_user: User=
    Depends(get_current_user), db: Session=Depends(get_db)):
    """Get count of unread messages"""
    unread_count = (
        db.query(DBMessage)
        .join(Chat)
        .filter(
            Chat.participant_ids.contains([current_user.id]),
            DBMessage.sender_id != current_user.id,
            DBMessage.read == False)
        .count()
    )

    return {"unread_count": unread_count}


@router.post("/mark-all-read")
def mark_all_messages_as_read(
    chat_id: Optional[int] = None,
    current_user: User=Depends(get_current_user),
    db: Session=Depends(get_db)):
    """Mark all messages as read"""
    message_query = (
        db.query(DBMessage)
        .join(Chat)
        .filter(
            Chat.participant_ids.contains([current_user.id]),
            DBMessage.sender_id != current_user.id,
            DBMessage.read == False)
    )

    if chat_id:
        message_query = message_query.filter(DBMessage.chat_id == chat_id)

    updated_count = message_query.update({"read": True, "read_at": datetime.utcnow()})

    db.commit()

    return {"message": f"Marked {updated_count} messages as read"}


@router.get("/recent")
def get_recent_messages(
    current_user: User=Depends(get_current_user),
    db: Session=Depends(get_db),
    limit: int = 10):
    """Get recent messages from all chats"""
    recent_messages = (
        db.query(DBMessage)
        .join(Chat)
        .filter(Chat.participant_ids.contains([current_user.id]))
        .order_by(DBMessage.created_at.desc())
        .limit(limit)
        .all()
    )

    return {
        "recent_messages": [
            {
                "message_id": message.id,
                "content": message.content,
                "sender_id": message.sender_id,
                "chat_id": message.chat_id,
                "created_at": message.created_at,
                "is_own_message": message.sender_id == current_user.id
            }
            for message in recent_messages
        ]
    }

router = APIRouter()


@router.get("/ping")
def ping():
    return {"message": "pong"}
