import asyncio
from typing import Dict, Set
from fastapi import WebSocket

class NotificationConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, Set[WebSocket]] = {}
        self.lock = asyncio.Lock()

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        async with self.lock:
            if user_id not in self.active_connections:
                self.active_connections[user_id] = set()
            self.active_connections[user_id].add(websocket)

    async def disconnect(self, user_id: int, websocket: WebSocket):
        async with self.lock:
            if user_id in self.active_connections:
                self.active_connections[user_id].discard(websocket)
                if not self.active_connections[user_id]:
                    del self.active_connections[user_id]

    async def send_personal_notification(self, user_id: int, data: dict):
        async with self.lock:
            connections = self.active_connections.get(user_id, set()).copy()
        for connection in connections:
            try:
                await connection.send_json(data)
            except Exception:
                await self.disconnect(user_id, connection)

    async def broadcast(self, data: dict):
        async with self.lock:
            all_connections = [ws for conns in self.active_connections.values() for ws in conns]
        for connection in all_connections:
            try:
                await connection.send_json(data)
            except Exception:
                # Unknown user_id, disconnect
                pass

notification_manager = NotificationConnectionManager()
