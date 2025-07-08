import asyncio
import json
from typing import List, Dict, Optional, Any
from sqlalchemy.orm import Session
from app.db_models import User
from app.schemas import Notification, NotificationCreate, NotificationType
from app.crud_utils import create_notification
from app.crud import notification_settings as notification_settings_crud

class NotificationService:
    def __init__(self, email_service=None):
        self.websocket_connections: Dict[int, List[Any]] = {}
        self.email_service = email_service

    async def send_websocket_notification(self, user_id: int, notification_data: dict):
        """Send notification via WebSocket"""
        if user_id in self.websocket_connections:
            disconnected = []
            for websocket in self.websocket_connections[user_id]:
                try:
                    await websocket.send_text(json.dumps(notification_data))
                except Exception:
                    disconnected.append(websocket)
            for websocket in disconnected:
                self.remove_websocket_connection(user_id, websocket)

    def remove_websocket_connection(self, user_id: int, websocket: Any):
        if user_id in self.websocket_connections:
            self.websocket_connections[user_id] = [ws for ws in self.websocket_connections[user_id] if ws != websocket]
            if not self.websocket_connections[user_id]:
                del self.websocket_connections[user_id]

    def send_notification(
        self,
        db: Session,
        user_id: int,
        title: str,
        message: str,
        notification_type: str = "system",
        category: str = "general",
        priority: str = "normal",
        data: Optional[Dict[str, Any]] = None,
        send_email: bool = True,
        send_push: bool = True
    ) -> Optional[Notification]:
        """Send a notification to a user"""
        # Check user's notification settings
        settings = notification_settings_crud.get_notification_settings(db, user_id=user_id)
        # If settings exist, check notification type and quiet hours
        if settings:
            # Check if this notification type is enabled
            # (Assume all enabled for now, as is_notification_enabled is not implemented)
            pass
        # Create notification in database
        notification_create = NotificationCreate(
            user_id=user_id,
            title=title,
            message=message,
            type=self._safe_notification_type(notification_type),
            data=data or {}
        )
        notification = create_notification(db, notification_create, user_id)
        # Send via WebSocket (in-app notification)
        asyncio.create_task(
            self.send_websocket_notification(
                user_id,
                {
                    "type": "notification",
                    "data": {
                        "id": notification.id,
                        "title": notification.title,
                        "message": notification.message,
                        "notification_type": notification.type,
                        "category": category,
                        "priority": priority,
                        "created_at": notification.created_at.isoformat(),
                        "data": notification.data,
                    },
                },
            )
        )
        # Send email notification
        if send_email and self.email_service is not None:
            self._send_email_notification(db, user_id, notification)
        # Send push notification (for desktop app)
        if send_push:
            self._send_push_notification(user_id, notification)
        return notification

    def _safe_notification_type(self, notification_type: str) -> NotificationType:
        try:
            return NotificationType(notification_type)
        except Exception:
            return NotificationType.SYSTEM_MESSAGE

    def _send_email_notification(self, db: Session, user_id: int, notification: Notification):
        """Send email notification"""
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if user is None or getattr(user, "email", None) is None:
                return
            email_type_mapping = {
                NotificationType.TASK_CREATED: "task_created",
                NotificationType.APPLICATION_RECEIVED: "application_received",
                NotificationType.APPLICATION_ACCEPTED: "application_accepted",
                NotificationType.APPLICATION_REJECTED: "application_rejected",
                NotificationType.TASK_COMPLETED: "task_completed",
                NotificationType.PAYMENT_RECEIVED: "payment_received",
                NotificationType.REVIEW_RECEIVED: "review_received",
                NotificationType.SYSTEM_MESSAGE: "system_alert",
            }
            email_type = email_type_mapping.get(notification.type, "system_alert")
            email_data = {
                "title": notification.title,
                "message": notification.message,
                "notification_type": notification.type,
                "category": notification.data.get("category", "general") if notification.data else "general",
                "priority": notification.data.get("priority", "normal") if notification.data else "normal",
                **(notification.data or {}),
            }
            if self.email_service is not None:
                self.email_service.send_notification_email(
                    to_email=user.email,
                    to_name=getattr(user, 'username', None),
                    notification_type=email_type,
                    notification_data=email_data,
                )
        except Exception as e:
            print(f"Failed to send email notification: {e}")

    def _send_push_notification(self, user_id: int, notification: Notification):
        """Send push notification for desktop app"""
        try:
            print(f"Push notification for user {user_id}: {notification.title}")
        except Exception as e:
            print(f"Failed to send push notification: {e}")

    def send_bulk_notifications(
        self,
        db: Session,
        user_ids: List[int],
        title: str,
        message: str,
        notification_type: str = "system",
        category: str = "general",
        priority: str = "normal",
        data: Optional[Dict[str, Any]] = None
    ) -> List[Notification]:
        """Send notifications to multiple users"""
        notifications = []
        for user_id in user_ids:
            notification = self.send_notification(
                db=db,
                user_id=user_id,
                title=title,
                message=message,
                notification_type=notification_type,
                category=category,
                priority=priority,
                data=data,
            )
            if notification:
                notifications.append(notification)
        return notifications

    def send_task_notification(
        self,
        db: Session,
        task_id: int,
        task_title: str,
        notification_type: str,
        user_ids: List[int],
        additional_data: Optional[Dict[str, Any]] = None
    ):
        """Send task-related notifications"""
        notification_templates = {
            "task_created": {
                "title": "New Task Created",
                "message": f"Task '{task_title}' has been created and is now available for applications."
            },
            "task_updated": {
                "title": "Task Updated",
                "message": f"Task '{task_title}' has been updated with new information."
            },
            "task_completed": {
                "title": "Task Completed",
                "message": f"Task '{task_title}' has been marked as completed."
            },
            "task_cancelled": {
                "title": "Task Cancelled",
                "message": f"Task '{task_title}' has been cancelled."
            },
        }
        template = notification_templates.get(notification_type)
        if not template:
            return []
        data = {"task_id": task_id, "task_title": task_title, **(additional_data or {})}
        return self.send_bulk_notifications(
            db=db,
            user_ids=user_ids,
            title=template["title"],
            message=template["message"],
            notification_type="task",
            category="task",
            data=data,
        )

    def send_application_notification(
        self,
        db: Session,
        application_id: int,
        task_title: str,
        notification_type: str,
        user_ids: List[int],
        additional_data: Optional[Dict[str, Any]] = None
    ):
        """Send application-related notifications"""
        notification_templates = {
            "application_received": {
                "title": "New Application Received",
                "message": f"You have received a new application for task '{task_title}'."
            },
            "application_accepted": {
                "title": "Application Accepted!",
                "message": f"Your application for task '{task_title}' has been accepted!"
            },
            "application_rejected": {
                "title": "Application Update",
                "message": f"Your application for task '{task_title}' was not selected."
            },
            "application_withdrawn": {
                "title": "Application Withdrawn",
                "message": f"An application for task '{task_title}' has been withdrawn."
            },
        }
        template = notification_templates.get(notification_type)
        if not template:
            return []
        data = {"application_id": application_id, "task_title": task_title, **(additional_data or {})}
        return self.send_bulk_notifications(
            db=db,
            user_ids=user_ids,
            title=template["title"],
            message=template["message"],
            notification_type="application",
            category="application",
            data=data,
        )

    def send_payment_notification(
        self,
        db: Session,
        payment_id: int,
        amount: float,
        notification_type: str,
        user_ids: List[int],
        additional_data: Optional[Dict[str, Any]] = None
    ):
        """Send payment-related notifications"""
        notification_templates = {
            "payment_received": {
                "title": "Payment Received",
                "message": f"You have received a payment of ${amount:.2f}."
            },
            "payment_sent": {
                "title": "Payment Sent",
                "message": f"You have sent a payment of ${amount:.2f}."
            },
            "payment_failed": {
                "title": "Payment Failed",
                "message": f"A payment of ${amount:.2f} has failed. Please check your payment method."
            },
            "payment_refunded": {
                "title": "Payment Refunded",
                "message": f"A payment of ${amount:.2f} has been refunded to your account."
            },
        }
        template = notification_templates.get(notification_type)
        if not template:
            return []
        data = {"payment_id": payment_id, "amount": amount, **(additional_data or {})}
        return self.send_bulk_notifications(
            db=db,
            user_ids=user_ids,
            title=template["title"],
            message=template["message"],
            notification_type="payment",
            category="payment",
            priority="high",
            data=data,
        )

    def send_achievement_notification(
        self,
        db: Session,
        achievement_name: str,
        achievement_description: str,
        user_ids: List[int],
        additional_data: Optional[Dict[str, Any]] = None
    ):
        """Send achievement notifications"""
        data = {
            "achievement_name": achievement_name,
            "achievement_description": achievement_description,
            **(additional_data or {})
        }
        return self.send_bulk_notifications(
            db=db,
            user_ids=user_ids,
            title=f"Achievement Unlocked: {achievement_name}",
            message=achievement_description,
            notification_type="achievement",
            category="achievement",
            priority="normal",
            data=data,
        )

    def send_level_up_notification(
        self,
        db: Session,
        new_level: int,
        user_ids: List[int],
        additional_data: Optional[Dict[str, Any]] = None
    ):
        """Send level up notifications"""
        data = {"new_level": new_level, **(additional_data or {})}
        return self.send_bulk_notifications(
            db=db,
            user_ids=user_ids,
            title="Level Up! 🎉",
            message=f"Congratulations! You've reached level {new_level}.",
            notification_type="level_up",
            category="achievement",
            priority="normal",
            data=data,
        )

notification_service = NotificationService()
