import os
import smtplib
from typing import List, Dict, Optional, Any
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from jinja2 import Template

class EmailService:
    def __init__(self, smtp_server, smtp_port, smtp_username, smtp_password, from_email, from_name="FreelanceAI"):
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port
        self.smtp_username = smtp_username
        self.smtp_password = smtp_password
        self.from_email = from_email
        self.from_name = from_name

    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
        attachments: Optional[List[Dict[str, str]]] = None
    ) -> bool:
        """Send an email"""
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{self.from_name} <{self.from_email}>"
            msg["To"] = to_email

            # Add text content
            if text_content:
                text_part = MIMEText(text_content, "plain")
                msg.attach(text_part)

            # Add HTML content
            html_part = MIMEText(html_content, "html")
            msg.attach(html_part)

            # Add attachments
            if attachments:
                for attachment in attachments:
                    with open(attachment["path"], "rb") as f:
                        part = MIMEImage(f.read())
                        part.add_header(
                            "Content-Disposition",
                            "attachment",
                            filename=attachment["filename"]
                        )
                        msg.attach(part)

            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)

            return True
        except Exception as e:
            print(f"Failed to send email: {e}")
            return False

    def send_notification_email(
        self,
        to_email: str,
        to_name: str,
        notification_type: str,
        notification_data: Dict[str, str]
    ) -> bool:
        """Send a notification email using templates"""
        templates = {
            "task_created": {
                "subject": "New Task Created",
                "template": "task_created.html"},
            "application_received": {
                "subject": "New Application Received",
                "template": "application_received.html"},
            "application_accepted": {
                "subject": "Application Accepted!",
                "template": "application_accepted.html"},
            "application_rejected": {
                "subject": "Application Update",
                "template": "application_rejected.html"},
            "task_completed": {
                "subject": "Task Completed",
                "template": "task_completed.html"},
            "payment_received": {
                "subject": "Payment Received",
                "template": "payment_received.html"},
            "achievement_unlocked": {
                "subject": "Achievement Unlocked!",
                "template": "achievement_unlocked.html"},
            "level_up": {"subject": "Level Up! 🎉",
                "template": "level_up.html"},
            "message_received": {
                "subject": "New Message",
                "template": "message_received.html"},
            "system_alert": {
                "subject": "System Alert",
                "template": "system_alert.html"}
        }

        if notification_type not in templates:
            return False
        template_info = templates[notification_type]
        html_content = self._render_template(
            template_info["template"],
            {
                "user_name": to_name,
                "data": notification_data,
                "current_date": datetime.now().strftime("%B %d, %Y"),
                "unsubscribe_url": f"https://freelanceai.com/unsubscribe?email={to_email}"
            }
        )

        return self.send_email(
            to_email=to_email,
            subject=template_info["subject"],
            html_content=html_content
        )

    def _render_template(
        self,
        template_name: str,
        context: Dict[str, Any]
    ) -> str:
        """Render email template with context"""
        template_path = f"app/templates/emails/{template_name}"

        if not os.path.exists(template_path):
            # Return a simple fallback template
            return self._get_fallback_template(context)

        with open(template_path, "r", encoding="utf-8") as f:
            template_content = f.read()

        template = Template(template_content)
        return template.render(**context)

    def _get_fallback_template(self, context: Dict[str, Any]) -> str:
        """Fallback template if custom template doesn't exist"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset=\"utf-8\">
            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
            <title>FreelanceAI Notification</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 10px 10px 0 0;
                }}
                .content {{
                    background: #f9f9f9;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }}
                .button {{
                    display: inline-block;
                    padding: 12px 24px;
                    background: #667eea;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 10px 0;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 30px;
                    color: #666;
                    font-size: 12px;
                }}
            </style>
        </head>
        <body>
            <div class=\"container\">
                <div class=\"header\">
                    <h1>FreelanceAI</h1>
                    <p>Hello {context.get('user_name', 'there')}!</p>
                </div>
                <div class=\"content\">
                    <h2>Notification</h2>
                    <p>You have a new notification from FreelanceAI.</p>
                    <p><strong>Date:</strong> {context.get('current_date', '')}</p>
                    <a href=\"https://freelanceai.com\" class=\"button\">View Details</a>
                </div>
                <div class=\"footer\">
                    <p>This email was sent from FreelanceAI. If you don't want to receive these emails, you can
                    <a href=\"{context.get('unsubscribe_url', '#')}\">unsubscribe here</a>.</p>
                </div>
            </div>
        </body>
        </html>
        """

    def send_digest_email(
        self,
        to_email: str,
        to_name: str,
        notifications: List[Dict[str, Any]],
        digest_type: str = "daily"
    ) -> bool:
        """Send a digest email with multiple notifications"""
        subject = f"Your {digest_type.capitalize()} FreelanceAI Digest"

        html_content = self._render_digest_template(
            to_name=to_name,
            notifications=notifications,
            digest_type=digest_type
        )

        return self.send_email(
            to_email=to_email,
            subject=subject,
            html_content=html_content
        )

    def _render_digest_template(
        self,
        to_name: str,
        notifications: List[Dict[str, Any]],
        digest_type: str
    ) -> str:
        """Render digest email template"""
        notification_items = ""
        for notification in notifications:
            notification_items += f"""
            <div style=\"border-left: 3px solid #667eea; padding-left: 15px; margin: 15px 0;\">
                <h3 style=\"margin: 0 0 5px 0; color: #333;\">{notification.get('title', 'Notification')}</h3>
                <p style=\"margin: 0; color: #666;\">{notification.get('message', '')}</p>
                <small style=\"color: #999;\">{notification.get('created_at', '')}</small>
            </div>
            """

        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset=\"utf-8\">
            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
            <title>FreelanceAI {digest_type.capitalize()} Digest</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 10px 10px 0 0;
                }}
                .content {{
                    background: #f9f9f9;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }}
                .button {{
                    display: inline-block;
                    padding: 12px 24px;
                    background: #667eea;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 10px 0;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 30px;
                    color: #666;
                    font-size: 12px;
                }}
            </style>
        </head>
        <body>
            <div class=\"container\">
                <div class=\"header\">
                    <h1>FreelanceAI</h1>
                    <p>Your {digest_type.capitalize()} Digest</p>
                </div>
                <div class=\"content\">
                    <h2>Hello {to_name}!</h2>
                    <p>Here's a summary of your {digest_type} activity:</p>
                    {notification_items}
                    <a href=\"https://freelanceai.com/dashboard\" class=\"button\">
                        View Dashboard
                    </a>
                </div>
                <div class=\"footer\">
                    <p>This email was sent from FreelanceAI. You can manage your notification preferences in your account settings.</p>
                </div>
            </div>
        </body>
        </html>
        """
