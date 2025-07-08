"""
Integration tests for AI endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, Mock
from sqlalchemy.orm import Session

from app.crud_utils import create_user, create_task_for_user, create_application
from app.schemas import UserCreate, TaskCreate, ApplicationCreate


class TestAIEndpoints:
    """Test AI endpoints functionality."""

    def test_generate_interview_questions_success(self, client: TestClient, test_user_data: dict, test_task_data: dict):
        """Test successful interview questions generation."""
        # Register and login user
        client.post("/api/v1/auth/register", json=test_user_data)
        login_response = client.post("/api/v1/auth/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create task first
        task_response = client.post("/api/v1/tasks", json=test_task_data, headers=headers)
        task_id = task_response.json()["id"]

        # Mock AI service response
        mock_questions = [
            {
                "question": "What is your experience with Python?",
                "category": "technical",
                "difficulty": "medium",
                "expected_answer": "I have 3 years of experience..."
            }
        ]

        with patch('app.services.ai_service.ai_service.generate_interview_questions', return_value=mock_questions):
            response = client.post("/api/v1/ai/interview-questions", json={
                "task_id": task_id,
                "difficulty": "medium"
            }, headers=headers)

            assert response.status_code == 200
            data = response.json()
            assert "questions" in data
            assert len(data["questions"]) == 1
            assert data["questions"][0]["question"] == "What is your experience with Python?"

    def test_generate_interview_questions_task_not_found(self, client: TestClient, test_user_data: dict):
        """Test interview questions generation with non-existent task."""
        # Register and login user
        client.post("/api/v1/auth/register", json=test_user_data)
        login_response = client.post("/api/v1/auth/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        response = client.post("/api/v1/ai/interview-questions", json={
            "task_id": 999,
            "difficulty": "medium"
        }, headers=headers)

        assert response.status_code == 404
        assert "Task not found" in response.json()["detail"]

    def test_generate_interview_questions_unauthorized(self, client: TestClient, test_user_data: dict, test_task_data: dict):
        """Test interview questions generation without authorization."""
        # Register and login user
        client.post("/api/v1/auth/register", json=test_user_data)
        login_response = client.post("/api/v1/auth/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create task
        task_response = client.post("/api/v1/tasks", json=test_task_data, headers=headers)
        task_id = task_response.json()["id"]

        # Try to access without token
        response = client.post("/api/v1/ai/interview-questions", json={
            "task_id": task_id,
            "difficulty": "medium"
        })

        assert response.status_code == 401

    def test_analyze_application_success(self, client: TestClient, test_user_data: dict, test_task_data: dict):
        """Test successful application analysis."""
        # Register and login user
        client.post("/api/v1/auth/register", json=test_user_data)
        login_response = client.post("/api/v1/auth/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create task
        task_response = client.post("/api/v1/tasks", json=test_task_data, headers=headers)
        task_id = task_response.json()["id"]

        # Create application
        application_data = {
            "cover_letter": "I have 5 years of experience in Python development",
            "proposed_budget": 1000.0,
            "estimated_duration": 30
        }
        app_response = client.post(f"/api/v1/tasks/{task_id}/apply", json=application_data, headers=headers)
        application_id = app_response.json()["id"]

        # Mock AI service response
        mock_analysis = {
            "overall_score": 8.5,
            "scores": {
                "relevance": 9,
                "proposal_quality": 8,
                "technical_competence": 9,
                "communication": 7
            },
            "recommendation": "strong_recommend",
            "feedback": "Great candidate",
            "strengths": ["Strong technical skills"],
            "weaknesses": ["Could improve communication"]
        }

        with patch('app.services.ai_service.ai_service.analyze_application', return_value=mock_analysis):
            response = client.post("/api/v1/ai/analyze-application", json={
                "application_id": application_id
            }, headers=headers)

            assert response.status_code == 200
            data = response.json()
            assert "analysis" in data
            assert data["analysis"]["overall_score"] == 8.5
            assert data["analysis"]["recommendation"] == "strong_recommend"

    def test_analyze_application_not_found(self, client: TestClient, test_user_data: dict):
        """Test application analysis with non-existent application."""
        # Register and login user
        client.post("/api/v1/auth/register", json=test_user_data)
        login_response = client.post("/api/v1/auth/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        response = client.post("/api/v1/ai/analyze-application", json={
            "application_id": 999
        }, headers=headers)

        assert response.status_code == 404
        assert "Application not found" in response.json()["detail"]

    def test_get_task_recommendations_success(self, client: TestClient, test_user_data: dict):
        """Test successful task recommendations."""
        # Register and login user
        client.post("/api/v1/auth/register", json=test_user_data)
        login_response = client.post("/api/v1/auth/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Mock AI service response
        mock_recommendations = [
            {
                "type": "task_recommendation",
                "content": "Web development project",
                "confidence": 0.85,
                "reasoning": "Matches your skills"
            }
        ]

        with patch('app.services.ai_service.ai_service.generate_task_recommendations', return_value=mock_recommendations):
            response = client.post("/api/v1/ai/task-recommendations", json={
                "user_id": 1,
                "limit": 5
            }, headers=headers)

            assert response.status_code == 200
            data = response.json()
            assert "recommendations" in data
            assert len(data["recommendations"]) == 1
            assert data["recommendations"][0]["type"] == "task_recommendation"

    def test_get_task_recommendations_unauthorized_user(self, client: TestClient, test_user_data: dict):
        """Test task recommendations for different user."""
        # Register and login user
        client.post("/api/v1/auth/register", json=test_user_data)
        login_response = client.post("/api/v1/auth/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        response = client.post("/api/v1/ai/task-recommendations", json={
            "user_id": 999,  # Different user ID
            "limit": 5
        }, headers=headers)

        assert response.status_code == 403
        assert "Not authorized" in response.json()["detail"]

    def test_smart_assistant_success(self, client: TestClient, test_user_data: dict):
        """Test successful smart assistant interaction."""
        # Register and login user
        client.post("/api/v1/auth/register", json=test_user_data)
        login_response = client.post("/api/v1/auth/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Mock AI service response
        mock_response = "Here's how to improve your profile: add more skills, complete your portfolio, and get more reviews."

        with patch('app.services.ai_service.ai_service.generate_smart_assistant_response', return_value=mock_response):
            response = client.post("/api/v1/ai/smart-assistant", json={
                "message": "How can I improve my profile?",
                "context": {"user_id": 1}
            }, headers=headers)

            assert response.status_code == 200
            data = response.json()
            assert "response" in data
            assert "timestamp" in data
            assert "Here's how to improve your profile" in data["response"]

    def test_analyze_task_complexity_success(self, client: TestClient, test_user_data: dict):
        """Test successful task complexity analysis."""
        # Register and login user
        client.post("/api/v1/auth/register", json=test_user_data)
        login_response = client.post("/api/v1/auth/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Mock AI service response
        mock_analysis = {
            "complexity_score": 7,
            "estimated_hours": 20,
            "budget_adequacy": "adequate",
            "recommended_skills": ["Python", "FastAPI"],
            "risk_factors": ["Tight deadline"],
            "suggestions": "Consider breaking into smaller tasks"
        }

        with patch('app.services.ai_service.ai_service.analyze_task_complexity', return_value=mock_analysis):
            response = client.post("/api/v1/ai/analyze-task-complexity", json={
                "task_description": "Create a web application with user authentication",
                "budget_min": 1000.0,
                "budget_max": 5000.0
            }, headers=headers)

            assert response.status_code == 200
            data = response.json()
            assert "analysis" in data
            assert data["analysis"]["complexity_score"] == 7
            assert data["analysis"]["estimated_hours"] == 20

    def test_generate_project_timeline_success(self, client: TestClient, test_user_data: dict):
        """Test successful project timeline generation."""
        # Register and login user
        client.post("/api/v1/auth/register", json=test_user_data)
        login_response = client.post("/api/v1/auth/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Mock AI service response
        mock_timeline = {
            "timeline": [
                {
                    "milestone": "Requirements gathering",
                    "duration_days": 5,
                    "dependencies": [],
                    "deliverables": ["Requirements document"],
                    "risks": ["Unclear requirements"]
                }
            ],
            "total_duration": 30,
            "critical_path": ["Requirements gathering"]
        }

        with patch('app.services.ai_service.ai_service.generate_project_timeline', return_value=mock_timeline):
            response = client.post("/api/v1/ai/generate-project-timeline", json={
                "task_description": "Create a web application",
                "milestones": ["Requirements", "Development", "Testing"]
            }, headers=headers)

            assert response.status_code == 200
            data = response.json()
            assert "timeline" in data
            assert len(data["timeline"]["timeline"]) == 1
            assert data["timeline"]["total_duration"] == 30

    def test_ai_health_check(self, client: TestClient):
        """Test AI health check endpoint."""
        # Mock AI service response
        with patch('app.services.ai_service.ai_service.client.chat') as mock_chat:
            mock_chat.return_value = Mock()
            mock_chat.return_value.choices = [Mock()]
            mock_chat.return_value.choices[0].message.content = "Hello"

            response = client.get("/api/v1/ai/health")

            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "healthy"
            assert "model" in data

    def test_ai_health_check_unhealthy(self, client: TestClient):
        """Test AI health check when service is unhealthy."""
        # Mock AI service error
        with patch('app.services.ai_service.ai_service.client.chat', side_effect=Exception("API Error")):
            response = client.get("/api/v1/ai/health")

            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "unhealthy"
            assert "error" in data 