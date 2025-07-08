"""
Chat endpoints for messaging between users.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, File, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import os
from uuid import uuid4

from app.database import get_db
from app.auth import get_current_active_user
from app.schemas import Chat, ChatCreate, Message, MessageCreate, ChatFile as ChatFileSchema
from app.db_models import User, Chat as DBChat, Message as DBMessage, Task, ChatFile

router = APIRouter()

ALLOWED_EXTENSIONS = {"pdf", "docx", "xlsx", "png", "jpg", "jpeg", "zip", "txt", "csv", "gif"}
MAX_FILE_SIZE = 1 * 1024 * 1024 * 1024  # 1 GB
UPLOAD_DIR = "uploads/chat_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/", response_model=List[Chat])
def get_user_chats(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all chats for the current user."""
    # Get chats where user is a participant
    chats = db.query(DBChat).filter(
        (DBChat.user1_id == current_user.id) | (DBChat.user2_id == current_user.id)
    ).offset(skip).limit(limit).all()
    
    # Convert to Pydantic schemas
    from app.schemas import Chat as ChatSchema
    return [ChatSchema.from_orm(chat) for chat in chats]


@router.post("/", response_model=Chat)
def create_chat(
    chat_data: ChatCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new chat."""
    # Check if task exists if task_id is provided
    if chat_data.task_id:
        task = db.query(Task).filter(Task.id == chat_data.task_id).first()
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        # Check if user is involved in the task
        if task.creator_id != current_user.id and task.assigned_to_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to create chat for this task"
            )
    
    # Check if chat already exists between these users
    existing_chat = db.query(DBChat).filter(
        ((DBChat.user1_id == current_user.id) & (DBChat.user2_id == chat_data.user2_id)) |
        ((DBChat.user1_id == chat_data.user2_id) & (DBChat.user2_id == current_user.id))
    ).first()
    
    if existing_chat:
        # Return existing chat
        from app.schemas import Chat as ChatSchema
        return ChatSchema.from_orm(existing_chat)
    
    # Create new chat
    chat = DBChat(
        user1_id=current_user.id,
        user2_id=chat_data.user2_id,
        task_id=chat_data.task_id,
        created_at=datetime.utcnow()
    )
    
    db.add(chat)
    db.commit()
    db.refresh(chat)
    
    # Convert to Pydantic schema
    from app.schemas import Chat as ChatSchema
    return ChatSchema.from_orm(chat)


@router.get("/{chat_id}", response_model=Chat)
def get_chat_by_id(
    chat_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get chat by ID."""
    chat = db.query(DBChat).filter(DBChat.id == chat_id).first()
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    # Check if user is a participant
    if chat.user1_id != current_user.id and chat.user2_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this chat"
        )
    
    # Convert to Pydantic schema
    from app.schemas import Chat as ChatSchema
    return ChatSchema.from_orm(chat)


@router.get("/{chat_id}/messages", response_model=List[MessageSchema])
def get_chat_messages(
    chat_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get messages for a specific chat."""
    # Check if chat exists and user is a participant
    chat = db.query(DBChat).filter(DBChat.id == chat_id).first()
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    if chat.user1_id != current_user.id and chat.user2_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view messages in this chat"
        )
    
    # Get messages
    messages = db.query(DBMessage).filter(
        DBMessage.chat_id == chat_id
    ).order_by(DBMessage.created_at.desc()).offset(skip).limit(limit).all()
    
    # Включить файлы для каждого сообщения
    result = []
    for message in messages:
        files = db.query(ChatFile).filter(ChatFile.message_id == message.id).all()
        msg = MessageSchema.from_orm(message)
        msg.files = [ChatFileSchema.from_orm(f) for f in files]
        result.append(msg)
    return result


@router.post("/{chat_id}/messages", response_model=MessageSchema)
def send_message(
    chat_id: int,
    message_data: MessageCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Send a message in a chat."""
    # Check if chat exists and user is a participant
    chat = db.query(DBChat).filter(DBChat.id == chat_id).first()
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    if chat.user1_id != current_user.id and chat.user2_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to send messages in this chat"
        )
    
    # Create message
    message = DBMessage(
        chat_id=chat_id,
        sender_id=current_user.id,
        content=message_data.content,
        created_at=datetime.utcnow()
    )
    
    db.add(message)
    db.commit()
    db.refresh(message)
    
    # Create ChatFile record
    chat_file = ChatFile(
        message_id=message.id,
        chat_id=chat_id,
        user_id=current_user.id,
        filename=f"[file] {message_data.content}",
        file_url=f"/api/v1/chats/files/{uuid4().hex}_{message_data.content}",
        file_type="text/plain",
        file_size=len(message_data.content.encode('utf-8')),
        is_safe=True
    )
    db.add(chat_file)
    db.commit()

    # Вернуть message с files
    msg = MessageSchema.from_orm(message)
    msg.files = [ChatFileSchema.from_orm(chat_file)]
    return msg


@router.get("/task/{task_id}", response_model=List[Chat])
def get_task_chats(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all chats for a specific task."""
    # Check if task exists and user has access
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Check if user is involved in the task
    if task.creator_id != current_user.id and task.assigned_to_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view chats for this task"
        )
    
    # Get chats for this task
    chats = db.query(DBChat).filter(DBChat.task_id == task_id).all()
    
    # Convert to Pydantic schemas
    from app.schemas import Chat as ChatSchema
    return [ChatSchema.from_orm(chat) for chat in chats]


@router.delete("/{chat_id}")
def delete_chat(
    chat_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a chat."""
    chat = db.query(DBChat).filter(DBChat.id == chat_id).first()
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    # Check if user is a participant
    if chat.user1_id != current_user.id and chat.user2_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this chat"
        )
    
    # Delete all messages in the chat
    db.query(DBMessage).filter(DBMessage.chat_id == chat_id).delete()
    
    # Delete the chat
    db.delete(chat)
    db.commit()
    
    return {"message": "Chat deleted successfully"}


@router.post("/{chat_id}/upload", response_model=MessageSchema)
def upload_chat_file(
    chat_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload a file to a chat message (with security checks)."""
    # Check chat exists and user is a participant
    chat = db.query(DBChat).filter(DBChat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    if chat.user1_id != current_user.id and chat.user2_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to upload files in this chat")

    # Validate file extension
    ext = file.filename.split(".")[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="File type not allowed")

    # Validate file size
    contents = file.file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 1GB)")

    # (Optional) Antivirus scan placeholder
    is_safe = True  # TODO: Integrate with antivirus if needed

    # Save file
    unique_name = f"{uuid4().hex}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)
    with open(file_path, "wb") as f:
        f.write(contents)

    # Create message with file attachment
    message = DBMessage(
        chat_id=chat_id,
        sender_id=current_user.id,
        content=f"[file] {file.filename}",
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    # Create ChatFile record
    chat_file = ChatFile(
        message_id=message.id,
        chat_id=chat_id,
        user_id=current_user.id,
        filename=file.filename,
        file_url=f"/api/v1/chats/files/{unique_name}",
        file_type=file.content_type or ext,
        file_size=len(contents),
        is_safe=is_safe
    )
    db.add(chat_file)
    db.commit()

    # Вернуть message с files
    msg = MessageSchema.from_orm(message)
    msg.files = [ChatFileSchema.from_orm(chat_file)]
    return msg

from fastapi.responses import FileResponse

@router.get("/files/{file_name}")
def download_chat_file(
    file_name: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Download a file from chat (with access check)."""
    chat_file = db.query(ChatFile).filter(ChatFile.file_url == f"/api/v1/chats/files/{file_name}").first()
    if not chat_file:
        raise HTTPException(status_code=404, detail="File not found")
    # Check user is participant of the chat
    chat = db.query(DBChat).filter(DBChat.id == chat_file.chat_id).first()
    if not chat or (chat.user1_id != current_user.id and chat.user2_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to download this file")
    file_path = os.path.join(UPLOAD_DIR, file_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on server")
    return FileResponse(file_path, filename=chat_file.filename, media_type=chat_file.file_type)
