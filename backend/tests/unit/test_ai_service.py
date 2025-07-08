"""
Unit tests for AI service.
"""

import pytest
from unittest.mock import Mock, patch, AsyncMock
from app.services.ai_service import AIService, AIInterviewQuestion, AIRecommendation


class TestAIService:
    """Test AI service functionality."""

    @pytest.fixture
    def ai_service(self):
        """Create AI service instance with mocked API key."""
        with patch.dict('os.environ', {'MISTRAL_API_KEY': 'test-key'}):
            return AIService()

    @pytest.fixture
    def mock_client(self):
        """Mock Mistral client."""
        mock = Mock()
        mock.chat.return_value.choices = [Mock()]
        mock.chat.return_value.choices[0].message.content = '{"questions": [{"question": "Test question", "category": "technical", "difficulty": "medium", "expected_answer": "Test answer"}]}'
        return mock

    @pytest.mark.asyncio
    async def test_generate_interview_questions_success(self, ai_service, mock_client):
        """Test successful interview questions generation."""
        ai_service.client = mock_client
        
        questions = await ai_service.generate_interview_questions(
            task_description="Create a web application",
            skills_required=["Python", "FastAPI"],
            difficulty="medium"
        )
        
        assert len(questions) == 1
        assert isinstance(questions[0], AIInterviewQuestion)
        assert questions[0].question == "Test question"
        assert questions[0].category == "technical"
        assert questions[0].difficulty == "medium"

    @pytest.mark.asyncio
    async def test_generate_interview_questions_api_error(self, ai_service):
        """Test interview questions generation with API error."""
        ai_service.client = Mock()
        ai_service.client.chat.side_effect = Exception("API Error")
        
        questions = await ai_service.generate_interview_questions(
            task_description="Create a web application",
            skills_required=["Python", "FastAPI"],
            difficulty="medium"
        )
        
        assert questions == []

    @pytest.mark.asyncio
    async def test_analyze_application_success(self, ai_service, mock_client):
        """Test successful application analysis."""
        ai_service.client = mock_client
        mock_client.chat.return_value.choices[0].message.content = '''
        {
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
            "weaknesses": ["Could improve communication"],
            "suggested_questions": ["Tell me about your experience"]
        }
        '''
        
        analysis = await ai_service.analyze_application(
            application_text="I have 5 years of experience in Python development",
            task_requirements="Need a Python developer for web application"
        )
        
        assert analysis["overall_score"] == 8.5
        assert analysis["recommendation"] == "strong_recommend"
        assert "strengths" in analysis
        assert "weaknesses" in analysis

    @pytest.mark.asyncio
    async def test_analyze_application_api_error(self, ai_service):
        """Test application analysis with API error."""
        ai_service.client = Mock()
        ai_service.client.chat.side_effect = Exception("API Error")
        
        analysis = await ai_service.analyze_application(
            application_text="I have experience",
            task_requirements="Need developer"
        )
        
        assert "error" in analysis

    @pytest.mark.asyncio
    async def test_generate_task_recommendations_success(self, ai_service, mock_client):
        """Test successful task recommendations generation."""
        ai_service.client = mock_client
        mock_client.chat.return_value.choices[0].message.content = '''
        {
            "recommendations": [
                {
                    "type": "task_recommendation",
                    "content": "Web development project",
                    "confidence": 0.85,
                    "reasoning": "Matches your skills"
                }
            ]
        }
        '''
        
        user_profile = {
            "skills": "Python, FastAPI",
            "hourly_rate": 50,
            "experience_years": 3
        }
        user_history = [{"title": "Previous project", "category": "web"}]
        
        recommendations = await ai_service.generate_task_recommendations(
            user_profile=user_profile,
            user_history=user_history
        )
        
        assert len(recommendations) == 1
        assert isinstance(recommendations[0], AIRecommendation)
        assert recommendations[0].type == "task_recommendation"
        assert recommendations[0].confidence == 0.85

    @pytest.mark.asyncio
    async def test_generate_task_recommendations_api_error(self, ai_service):
        """Test task recommendations generation with API error."""
        ai_service.client = Mock()
        ai_service.client.chat.side_effect = Exception("API Error")
        
        recommendations = await ai_service.generate_task_recommendations(
            user_profile={},
            user_history=[]
        )
        
        assert recommendations == []

    @pytest.mark.asyncio
    async def test_generate_smart_assistant_response_success(self, ai_service, mock_client):
        """Test successful smart assistant response generation."""
        ai_service.client = mock_client
        mock_client.chat.return_value.choices[0].message.content = "Here's how to improve your profile"
        
        response = await ai_service.generate_smart_assistant_response(
            user_message="How can I improve my profile?",
            context={"user_id": 1, "user_skills": "Python"}
        )
        
        assert response == "Here's how to improve your profile"

    @pytest.mark.asyncio
    async def test_generate_smart_assistant_response_api_error(self, ai_service):
        """Test smart assistant response generation with API error."""
        ai_service.client = Mock()
        ai_service.client.chat.side_effect = Exception("API Error")
        
        response = await ai_service.generate_smart_assistant_response(
            user_message="Help me",
            context={}
        )
        
        assert "Извините, произошла ошибка" in response

    def test_ai_service_initialization_missing_api_key(self):
        """Test AI service initialization without API key."""
        with patch.dict('os.environ', {}, clear=True):
            with pytest.raises(ValueError, match="MISTRAL_API_KEY environment variable is required"):
                AIService()

    def test_ai_service_initialization_success(self):
        """Test successful AI service initialization."""
        with patch.dict('os.environ', {'MISTRAL_API_KEY': 'test-key'}):
            service = AIService()
            assert service.api_key == 'test-key'
            assert service.model == 'mistral-large-latest' 