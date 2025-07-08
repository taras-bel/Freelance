"""
AI-powered features for the freelance platform.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from decimal import Decimal
import json
import asyncio

from app.database import get_db
from app.auth import get_current_active_user
from app.schemas import (
    AIRequest, AIResponse, Task, User, Application, 
    SmartMatch, PricingRecommendation, SkillAnalysis
)
from app.db_models import User as DBUser, Task as DBTask, Application as DBApplication
from app.services.ai_service import AIService

router = APIRouter()
ai_service = AIService()


@router.post("/analyze-task", response_model=Dict[str, Any])
async def analyze_task_with_ai(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Analyze a task using AI to provide insights and recommendations."""
    task = db.query(DBTask).filter(DBTask.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    try:
        # Analyze task complexity, required skills, and market demand
        analysis = await ai_service.analyze_task(task)
        
        # Update task with AI analysis
        task.complexity_level = analysis.get("complexity_level", 1)
        task.ai_suggested_min_price = Decimal(str(analysis.get("suggested_min_price", 0)))
        task.ai_suggested_max_price = Decimal(str(analysis.get("suggested_max_price", 0)))
        task.ai_analysis_data = analysis
        task.ai_analyzed_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "task_id": task_id,
            "analysis": analysis,
            "recommendations": analysis.get("recommendations", []),
            "market_insights": analysis.get("market_insights", {}),
            "skill_gaps": analysis.get("skill_gaps", []),
            "estimated_duration": analysis.get("estimated_duration", "Unknown"),
            "success_probability": analysis.get("success_probability", 0.5)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI analysis failed: {str(e)}"
        )


@router.post("/smart-matching", response_model=List[SmartMatch])
async def get_smart_matches(
    task_id: int,
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered smart matches for a task."""
    task = db.query(DBTask).filter(DBTask.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    try:
        # Get potential freelancers
        freelancers = db.query(DBUser).filter(
            DBUser.is_freelancer == True,
            DBUser.is_active == True
        ).all()
        
        # Get smart matches using AI
        matches = await ai_service.get_smart_matches(task, freelancers, limit)
        
        return matches
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Smart matching failed: {str(e)}"
        )


@router.post("/pricing-recommendation", response_model=PricingRecommendation)
async def get_pricing_recommendation(
    task_id: int,
    freelancer_id: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered pricing recommendations for a task."""
    task = db.query(DBTask).filter(DBTask.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    freelancer = None
    if freelancer_id:
        freelancer = db.query(DBUser).filter(DBUser.id == freelancer_id).first()
    
    try:
        recommendation = await ai_service.get_pricing_recommendation(task, freelancer)
        return recommendation
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Pricing recommendation failed: {str(e)}"
        )


@router.post("/analyze-profile", response_model=SkillAnalysis)
async def analyze_user_profile(
    user_id: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Analyze user profile and provide skill insights."""
    target_user_id = user_id or current_user.id
    user = db.query(DBUser).filter(DBUser.id == target_user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    try:
        analysis = await ai_service.analyze_user_profile(user)
        return analysis
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Profile analysis failed: {str(e)}"
        )


@router.post("/optimize-proposal", response_model=Dict[str, Any])
async def optimize_proposal(
    proposal_text: str,
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Optimize a proposal using AI."""
    task = db.query(DBTask).filter(DBTask.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    try:
        optimization = await ai_service.optimize_proposal(proposal_text, task, current_user)
        return optimization
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Proposal optimization failed: {str(e)}"
        )


@router.post("/predict-success", response_model=Dict[str, Any])
async def predict_task_success(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Predict the success probability of a task."""
    task = db.query(DBTask).filter(DBTask.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    try:
        prediction = await ai_service.predict_task_success(task)
        return prediction
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Success prediction failed: {str(e)}"
        )


@router.post("/generate-keywords", response_model=List[str])
async def generate_task_keywords(
    task_description: str,
    current_user: User = Depends(get_current_active_user)
):
    """Generate relevant keywords for a task description."""
    try:
        keywords = await ai_service.generate_keywords(task_description)
        return keywords
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Keyword generation failed: {str(e)}"
        )


@router.post("/suggest-improvements", response_model=Dict[str, Any])
async def suggest_profile_improvements(
    user_id: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get AI suggestions for profile improvements."""
    target_user_id = user_id or current_user.id
    user = db.query(DBUser).filter(DBUser.id == target_user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    try:
        suggestions = await ai_service.suggest_profile_improvements(user)
        return suggestions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Improvement suggestions failed: {str(e)}"
        )


@router.post("/market-analysis", response_model=Dict[str, Any])
async def get_market_analysis(
    category: str,
    skills: Optional[List[str]] = None,
    current_user: User = Depends(get_current_active_user)
):
    """Get AI-powered market analysis for a category or skills."""
    try:
        analysis = await ai_service.get_market_analysis(category, skills or [])
        return analysis
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Market analysis failed: {str(e)}"
        )


@router.post("/automated-screening", response_model=Dict[str, Any])
async def screen_applications(
    task_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Automatically screen applications for a task."""
    task = db.query(DBTask).filter(DBTask.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    if task.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only task creator can screen applications"
        )
    
    try:
        # Get applications for the task
        applications = db.query(DBApplication).filter(
            DBApplication.task_id == task_id,
            DBApplication.status == "pending"
        ).all()
        
        # Run screening in background
        background_tasks.add_task(
            ai_service.screen_applications_async,
            task,
            applications
        )
        
        return {
            "message": "Application screening started",
            "applications_count": len(applications),
            "task_id": task_id
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Application screening failed: {str(e)}"
        )


@router.get("/screening-results/{task_id}", response_model=Dict[str, Any])
async def get_screening_results(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get results of automated application screening."""
    task = db.query(DBTask).filter(DBTask.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    if task.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only task creator can view screening results"
        )
    
    try:
        results = await ai_service.get_screening_results(task_id)
        return results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get screening results: {str(e)}"
        )


@router.post("/chatbot", response_model=AIResponse)
async def chatbot_conversation(
    request: AIRequest,
    current_user: User = Depends(get_current_active_user)
):
    """AI chatbot for user support and guidance."""
    try:
        response = await ai_service.chatbot_response(request.prompt, current_user, request.context)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chatbot failed: {str(e)}"
        )


@router.post("/generate-contract", response_model=Dict[str, Any])
async def generate_contract(
    task_id: int,
    freelancer_id: int,
    terms: Dict[str, Any],
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Generate AI-powered contract for a task."""
    task = db.query(DBTask).filter(DBTask.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    if task.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only task creator can generate contracts"
        )
    
    try:
        contract = await ai_service.generate_contract(task, freelancer_id, terms)
        return contract
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Contract generation failed: {str(e)}"
        )


@router.post("/dispute-resolution", response_model=Dict[str, Any])
async def ai_dispute_resolution(
    dispute_data: Dict[str, Any],
    current_user: User = Depends(get_current_active_user)
):
    """AI-powered dispute resolution assistance."""
    try:
        resolution = await ai_service.analyze_dispute(dispute_data)
        return resolution
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Dispute analysis failed: {str(e)}"
        )


@router.get("/ai-insights", response_model=Dict[str, Any])
async def get_ai_insights(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get personalized AI insights for the user."""
    try:
        insights = await ai_service.get_user_insights(current_user)
        return insights
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get AI insights: {str(e)}"
        ) 