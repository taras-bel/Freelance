"""
AI service for interview assistance and chat functionality.
"""

from typing import Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os

try:
    import openai
    openai.api_key = os.getenv("OPENAI_API_KEY")
except ImportError:
    openai = None

router = APIRouter()


class InterviewStartRequest(BaseModel):
    role: str
    level: str
    language: str = "English"


class InterviewStartResponse(BaseModel):
    scenario: str
    questions: List[str]


class InterviewAnswerRequest(BaseModel):
    question: str
    answer: str
    role: str
    level: str
    language: str = "English"


class InterviewAnswerResponse(BaseModel):
    feedback: str
    score: float
    recommendations: str


class AssistantChatRequest(BaseModel):
    message: str
    context: Optional[str] = None


class AssistantChatResponse(BaseModel):
    reply: str


@router.post("/ai/interview/start", response_model=InterviewStartResponse)
async def start_interview(data: InterviewStartRequest):
    """Start interview with mock data."""
    return InterviewStartResponse(
        scenario=
            f"You're interviewing for a {data.level} {data.role} position.",
        questions=[
            "Tell me about your experience.",
            "How do you handle challenges?",
            "What are your strengths?",
            "Where do you see yourself in 5 years?",
            "Why should we hire you?"
        ]
    )


@router.post("/ai/interview/answer", response_model=InterviewAnswerResponse)
async def interview_answer(data: InterviewAnswerRequest):
    """Evaluate interview answer."""
    return InterviewAnswerResponse(
        feedback="Good answer! Keep practicing.",
        score=7.5,
        recommendations="Provide more specific examples."
    )


@router.post("/ai/assistant/chat", response_model=AssistantChatResponse)
async def assistant_chat(data: AssistantChatRequest):
    """AI assistant chat."""
    return AssistantChatResponse(
        reply="I'm here to help with your freelance career!"
    )
