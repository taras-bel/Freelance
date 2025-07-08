import asyncio
from typing import Dict, List, Any, Optional
# from .websocket import (
#     notify_new_task,
#     notify_task_assigned,
#     notify_new_review,
#     notify_achievement_unlocked,
#     notify_new_message,
#     send_notification_to_user,
#     send_system_notification,
# )
# TODO: Uncomment the above imports when websocket module is available

async def notify_new_task(*args, **kwargs): return None
async def notify_task_assigned(*args, **kwargs): return None
async def notify_new_review(*args, **kwargs): return None
async def notify_achievement_unlocked(*args, **kwargs): return None
async def notify_new_message(*args, **kwargs): return None
async def send_notification_to_user(*args, **kwargs): return None
async def send_system_notification(*args, **kwargs): return None

class NotificationService:
    """Сервис для отправки уведомлений через WebSocket"""

    @staticmethod
    async def task_created(task_data: Dict[str, Any], target_users: List[int]):
        """Уведомляет о создании новой задачи"""
        try:
            await notify_new_task(task_data, target_users)
            print(f"Notification sent for new task {task_data.get('id')} to {len(target_users)} users")
        except Exception as e:
            print(f"Error sending task creation notification: {e}")

    @staticmethod
    async def task_assigned(task_data: Dict[str, Any], user_id: int):
        """Уведомляет о назначении задачи"""
        try:
            await notify_task_assigned(task_data, user_id)
            print(f"Task assignment notification sent to user {user_id}")
        except Exception as e:
            print(f"Error sending task assignment notification: {e}")

    @staticmethod
    async def review_received(review_data: Dict[str, Any], user_id: int):
        """Уведомляет о получении нового отзыва"""
        try:
            await notify_new_review(review_data, user_id)
            print(f"Review notification sent to user {user_id}")
        except Exception as e:
            print(f"Error sending review notification: {e}")

    @staticmethod
    async def achievement_unlocked(achievement_data: Dict[str, Any], user_id: int):
        """Уведомляет о разблокировке достижения"""
        try:
            await notify_achievement_unlocked(achievement_data, user_id)
            print(f"Achievement notification sent to user {user_id}")
        except Exception as e:
            print(f"Error sending achievement notification: {e}")

    @staticmethod
    async def new_message(chat_data: Dict[str, Any], user_id: int):
        """Уведомляет о новом сообщении"""
        try:
            await notify_new_message(chat_data, user_id)
            print(f"Message notification sent to user {user_id}")
        except Exception as e:
            print(f"Error sending message notification: {e}")

    @staticmethod
    async def custom_notification(
        user_id: int,
        title: str,
        message: str,
        notification_type: str = "info",
        priority: str = "medium",
        data: Optional[Dict[str, Any]] = None,
    ):
        """Отправляет кастомное уведомление"""
        try:
            if data is None:
                data = {}
            await send_notification_to_user(
                user_id,
                {
                    "type": notification_type,
                    "title": title,
                    "message": message,
                    "priority": priority,
                    "data": data,
                },
            )
            print(f"Custom notification sent to user {user_id}")
        except Exception as e:
            print(f"Error sending custom notification: {e}")

    @staticmethod
    async def system_announcement(message: str, group_name: str = "all"):
        """Отправляет системное объявление"""
        try:
            await send_system_notification(message, group_name)
            print(f"System announcement sent to group {group_name}")
        except Exception as e:
            print(f"Error sending system announcement: {e}")

# Функции-помощники для интеграции с существующим кодом
async def send_task_notifications(
    task_data: Dict[str, Any],
    action: str,
    user_id: Optional[int] = None,
    target_users: Optional[List[int]] = None,
):
    """Отправляет уведомления, связанные с задачами"""
    if action == "created" and target_users is not None:
        await NotificationService.task_created(task_data, target_users)
    elif action == "assigned" and user_id is not None:
        await NotificationService.task_assigned(task_data, user_id)

async def send_review_notifications(review_data: Dict[str, Any], user_id: int):
    """Отправляет уведомления, связанные с отзывами"""
    await NotificationService.review_received(review_data, user_id)

async def send_achievement_notifications(achievement_data: Dict[str, Any], user_id: int):
    """Отправляет уведомления, связанные с достижениями"""
    await NotificationService.achievement_unlocked(achievement_data, user_id)

async def send_message_notifications(chat_data: Dict[str, Any], user_id: int):
    """Отправляет уведомления, связанные с сообщениями"""
    await NotificationService.new_message(chat_data, user_id)

# Синхронные обертки для использования в существующем коде
def send_task_notifications_sync(
    task_data: Dict[str, Any],
    action: str,
    user_id: Optional[int] = None,
    target_users: Optional[List[int]] = None,
):
    """Синхронная обертка для отправки уведомлений о задачах"""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.create_task(send_task_notifications(task_data, action, user_id, target_users))
        else:
            loop.run_until_complete(send_task_notifications(task_data, action, user_id, target_users))
    except RuntimeError:
        asyncio.run(send_task_notifications(task_data, action, user_id, target_users))

def send_review_notifications_sync(review_data: Dict[str, Any], user_id: int):
    """Синхронная обертка для отправки уведомлений об отзывах"""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.create_task(send_review_notifications(review_data, user_id))
        else:
            loop.run_until_complete(send_review_notifications(review_data, user_id))
    except RuntimeError:
        asyncio.run(send_review_notifications(review_data, user_id))

def send_achievement_notifications_sync(achievement_data: Dict[str, Any], user_id: int):
    """Синхронная обертка для отправки уведомлений о достижениях"""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.create_task(send_achievement_notifications(achievement_data, user_id))
        else:
            loop.run_until_complete(send_achievement_notifications(achievement_data, user_id))
    except RuntimeError:
        asyncio.run(send_achievement_notifications(achievement_data, user_id))

def send_message_notifications_sync(chat_data: Dict[str, Any], user_id: int):
    """Синхронная обертка для отправки уведомлений о сообщениях"""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.create_task(send_message_notifications(chat_data, user_id))
        else:
            loop.run_until_complete(send_message_notifications(chat_data, user_id))
    except RuntimeError:
        asyncio.run(send_message_notifications(chat_data, user_id))
