import json
from typing import List
from fastapi import WebSocket, WebSocketDisconnect, HTTPException
from sqlalchemy.orm import Session
from app.db_models import User
# from app.utils.jwt import verify_token, JWTError  # TODO: Uncomment and use real JWT verification
from app.database import get_db

def verify_token(token):
    # TODO: Replace with real JWT verification
    return {"sub": token}
class JWTError(Exception):
    pass

class ConnectionManager:
    def __init__(self):
        self.active_connections = {}
        self.groups = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        await self.add_to_group(user_id, "all")
        await self.add_to_group(user_id, f"user_{user_id}")
        await self.send_personal_message(
            {
                "type": "connection",
                "message": "Connected to notification service",
                "user_id": user_id,
            },
            user_id,
        )

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        for group_name in list(self.groups.keys()):
            if user_id in self.groups[group_name]:
                self.groups[group_name].discard(user_id)
                if not self.groups[group_name]:
                    del self.groups[group_name]

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_text(json.dumps(message))
            except Exception as e:
                print(f"Error sending message to user {user_id}: {e}")
                self.disconnect(user_id)

    async def broadcast(self, message: dict, group_name: str = "all"):
        if group_name not in self.groups:
            return
        disconnected_users = []
        for user_id in self.groups[group_name]:
            if user_id in self.active_connections:
                try:
                    await self.active_connections[user_id].send_text(json.dumps(message))
                except Exception as e:
                    print(f"Error broadcasting to user {user_id}: {e}")
                    disconnected_users.append(user_id)
        for user_id in disconnected_users:
            self.disconnect(user_id)

    async def add_to_group(self, user_id: int, group_name: str):
        if group_name not in self.groups:
            self.groups[group_name] = set()
        self.groups[group_name].add(user_id)

    async def remove_from_group(self, user_id: int, group_name: str):
        if group_name in self.groups and user_id in self.groups[group_name]:
            self.groups[group_name].discard(user_id)
            if not self.groups[group_name]:
                del self.groups[group_name]

manager = ConnectionManager()

def get_user_id(user):
    # Handles both SQLAlchemy Column and int
    try:
        # Try direct int conversion
        return int(user.id)
    except Exception:
        try:
            # Try .value for SQLAlchemy Column
            return int(user.id.value)
        except Exception:
            try:
                return int(getattr(user, 'id', 0))
            except Exception:
                return 0

async def get_user_from_token(token: str, db: Session) -> User:
    try:
        print(f"Verifying token: {token[:20]}...")
        payload = verify_token(token)
        print(f"Token payload: {payload}")
        email = payload.get("sub")
        if email is None:
            print("No email found in token payload")
            raise HTTPException(status_code=401, detail="Invalid token")
        print(f"Looking for user with email: {email}")
        user = db.query(User).filter(User.email == email).first()
        if user is None:
            print(f"User not found for email: {email}")
            raise HTTPException(status_code=401, detail="User not found")
        print(f"User found: {user.username} (ID: {user.id})")
        return user
    except JWTError as e:
        print(f"JWTError in get_user_from_token: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        print(f"Error in get_user_from_token: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")

async def websocket_endpoint(websocket: WebSocket, token: str):
    print(f"WebSocket connection attempt with token: {token[:20]}...")
    db = next(get_db())
    user = None
    try:
        user = await get_user_from_token(token, db)
        user_id = get_user_id(user)
        print(f"Token verified for user: {user.username} (ID: {user_id})")
        await manager.connect(websocket, user_id)
        print(f"User {user.username} connected to WebSocket")
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                await handle_websocket_message(message, user, db)
            except WebSocketDisconnect:
                print(f"User {user.username} disconnected")
                break
            except Exception as e:
                print(f"Error handling message from user {user.username}: {e}")
                await manager.send_personal_message({"type": "error", "message": "Internal server error"}, get_user_id(user))
    except HTTPException as e:
        print(f"HTTPException in WebSocket: {e.detail}")
        await websocket.close(code=1008, reason="Authentication failed")
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close(code=1011, reason="Internal server error")
    finally:
        if user is not None:
            manager.disconnect(get_user_id(user))
        db.close()

async def handle_websocket_message(message: dict, user: User, db: Session):
    message_type = message.get("type")
    user_id = get_user_id(user)
    if message_type == "join_group":
        group_name = message.get("group_name")
        if group_name:
            await manager.add_to_group(user_id, group_name)
            await manager.send_personal_message({"type": "group_joined", "group_name": group_name}, user_id)
    elif message_type == "leave_group":
        group_name = message.get("group_name")
        if group_name:
            await manager.remove_from_group(user_id, group_name)
            await manager.send_personal_message({"type": "group_left", "group_name": group_name}, user_id)
    elif message_type == "ping":
        await manager.send_personal_message({"type": "pong", "timestamp": message.get("timestamp")}, user_id)
    else:
        await manager.send_personal_message({"type": "error", "message": f"Unknown message type: {message_type}"}, user_id)

async def send_notification_to_user(user_id: int, notification_data: dict):
    await manager.send_personal_message({"type": "notification", "data": notification_data}, user_id)

async def send_notification_to_group(group_name: str, notification_data: dict):
    await manager.broadcast({"type": "notification", "data": notification_data}, group_name)

async def send_system_notification(message: str, group_name: str = "all"):
    import asyncio
    await manager.broadcast({"type": "system_notification", "message": message, "timestamp": asyncio.get_event_loop().time()}, group_name)

async def notify_new_task(task_data: dict, target_users: List[int]):
    for user_id in target_users:
        await send_notification_to_user(user_id, {
            "type": "new_task",
            "title": "New Task Available",
            "message": f"A new task '{task_data.get('title', 'Untitled')}' is available",
            "data": task_data,
        })

async def notify_task_assigned(task_data: dict, user_id: int):
    await send_notification_to_user(user_id, {
        "type": "task_assigned",
        "title": "Task Assigned",
        "message": f"You have been assigned to task '{task_data.get('title', 'Untitled')}'",
        "data": task_data,
    })

async def notify_new_review(review_data: dict, user_id: int):
    await send_notification_to_user(user_id, {
        "type": "new_review",
        "title": "New Review Received",
        "message": f"You have received a new review: {review_data.get('comment', '')}",
        "data": review_data,
    })

async def notify_achievement_unlocked(achievement_data: dict, user_id: int):
    await send_notification_to_user(user_id, {
        "type": "achievement_unlocked",
        "title": "Achievement Unlocked!",
        "message": f"You have unlocked a new achievement: {achievement_data.get('title', 'Achievement')}",
        "data": achievement_data,
    })

async def notify_new_message(chat_data: dict, user_id: int):
    await send_notification_to_user(user_id, {
        "type": "new_message",
        "title": "New Message",
        "message": f"You have a new message in chat {chat_data.get('chat_id', '')}",
        "data": chat_data,
    })
