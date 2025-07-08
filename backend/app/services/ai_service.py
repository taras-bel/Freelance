"""
AI Service for the freelance platform.
"""

import asyncio
import json
import os
from typing import List, Dict, Any, Tuple, Optional
from decimal import Decimal
from datetime import datetime, timedelta
import httpx
import random
from pydantic import BaseModel
# from app.schemas import AIInterviewQuestion, AIRecommendation
# from app.utils.ai_client import ChatMessage  # adjust import as needed
# from app.utils.logger import logger  # adjust import as needed

from app.db_models import User, Task, Application
from app.schemas import SmartMatch, PricingRecommendation, SkillAnalysis, AIResponse

# Configuration
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"
MISTRAL_MODEL = "mistral-large-latest"

# Minimal stubs for type checking if real classes are missing
class AIInterviewQuestion(dict):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.__dict__.update(kwargs)

class AIRecommendation(dict):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.__dict__.update(kwargs)

class ChatMessage:
    def __init__(self, role: str, content: str):
        self.role = role
        self.content = content

# Use print as a fallback logger
logger = type('logger', (), {'error': staticmethod(print)})

class MistralMessage(BaseModel):
    role: str
    content: str

class MistralResponse(BaseModel):
    id: str
    object: str
    created: int
    model: str
    choices: List[Dict[str, Any]]
    usage: Dict[str, int]

class TaskComplexityAnalysis(BaseModel):
    complexity_level: int  # 1-5 scale
    estimated_hours: int
    suggested_min_price: Decimal
    suggested_max_price: Decimal
    required_skills: List[str]
    risk_factors: List[str]
    market_demand: str  # low, medium, high
    confidence_score: float  # 0-1

class AIService:
    """AI service for various platform features."""
    
    def __init__(self):
        self.api_key = MISTRAL_API_KEY
        self.api_url = MISTRAL_API_URL
        self.model = MISTRAL_MODEL
        self.model_name = "mistral-large-latest"  # Using user's preferred model
        self.cache = {}
        self.cache_duration = timedelta(hours=1)
        
    async def _call_mistral_api(self, messages: List[MistralMessage]) -> Optional[str]:
        """Вызывает Mistral AI API"""
        if not self.api_key:
            print("Warning: MISTRAL_API_KEY not set")
            return None
            
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": [msg.dict() for msg in messages],
            "temperature": 0.3,
            "max_tokens": 2000
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.api_url,
                    headers=headers,
                    json=payload,
                    timeout=30.0
                )
                response.raise_for_status()
                result = response.json()
                return result["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"Error calling Mistral API: {e}")
            return None

    async def analyze_task_complexity_and_pricing(
        self,
        task_title: str,
        task_description: str,
        category: str,
        skills_required: List[str],
        deadline: Optional[datetime] = None,
        current_budget_min: Optional[Decimal] = None,
        current_budget_max: Optional[Decimal] = None
    ) -> TaskComplexityAnalysis:
        """Анализирует сложность задачи и предлагает ценовой диапазон"""
        
        prompt = f"""
        Проанализируй следующую фриланс-задачу и определи её сложность и рекомендуемую стоимость:

        Название: {task_title}
        Описание: {task_description}
        Категория: {category}
        Требуемые навыки: {', '.join(skills_required)}
        Дедлайн: {deadline.strftime('%Y-%m-%d') if deadline else 'Не указан'}
        Текущий бюджет: ${current_budget_min} - ${current_budget_max} (если указан)

        Проанализируй и верни результат в формате JSON:
        {{
            "complexity_level": 3,
            "estimated_hours": 20,
            "suggested_min_price": 500.00,
            "suggested_max_price": 1500.00,
            "required_skills": ["Python", "FastAPI", "SQL"],
            "risk_factors": ["Сложные требования", "Жесткий дедлайн"],
            "market_demand": "high",
            "confidence_score": 0.85,
            "reasoning": "Объяснение анализа"
        }}

        Критерии сложности:
        - 1 (Начинающий): Простые задачи, базовые навыки, 1-5 часов
        - 2 (Начальный-средний): Стандартные задачи, 5-15 часов  
        - 3 (Средний): Сложные задачи, 15-40 часов
        - 4 (Средний-высокий): Очень сложные задачи, 40-80 часов
        - 5 (Эксперт): Экспертные задачи, 80+ часов

        Учитывай рыночные цены, сложность, время выполнения и спрос на навыки.
        """
        
        messages = [MistralMessage(role="user", content=prompt)]
        response = await self._call_mistral_api(messages)
        
        if not response:
            # Fallback values
            return TaskComplexityAnalysis(
                complexity_level=2,
                estimated_hours=10,
                suggested_min_price=Decimal('100'),
                suggested_max_price=Decimal('500'),
                required_skills=skills_required,
                risk_factors=["Не удалось проанализировать"],
                market_demand="medium",
                confidence_score=0.5
            )
        
        try:
            data = json.loads(response)
            return TaskComplexityAnalysis(
                complexity_level=data.get("complexity_level", 2),
                estimated_hours=data.get("estimated_hours", 10),
                suggested_min_price=Decimal(str(data.get("suggested_min_price", 100))),
                suggested_max_price=Decimal(str(data.get("suggested_max_price", 500))),
                required_skills=data.get("required_skills", skills_required),
                risk_factors=data.get("risk_factors", []),
                market_demand=data.get("market_demand", "medium"),
                confidence_score=data.get("confidence_score", 0.5)
            )
        except Exception as e:
            print(f"Error parsing AI response: {e}")
            return TaskComplexityAnalysis(
                complexity_level=2,
                estimated_hours=10,
                suggested_min_price=Decimal('100'),
                suggested_max_price=Decimal('500'),
                required_skills=skills_required,
                risk_factors=["Ошибка анализа"],
                market_demand="medium",
                confidence_score=0.3
            )

    async def generate_interview_questions(
        self,
        task_description: str,
        skills_required: List[str],
        complexity_level: int
    ) -> List[Dict[str, Any]]:
        """Генерирует вопросы для интервью на основе сложности задачи"""
        
        prompt = f"""
        Создай 5 технических вопросов для интервью фрилансера:

        Описание задачи: {task_description}
        Требуемые навыки: {', '.join(skills_required)}
        Уровень сложности: {complexity_level}/5

        Вопросы должны соответствовать уровню сложности:
        - Уровень 1-2: Базовые вопросы, простые задачи
        - Уровень 3: Средние вопросы, практические задачи  
        - Уровень 4-5: Сложные вопросы, архитектурные решения

        Верни в формате JSON:
        {{
            "questions": [
                {{
                    "question": "текст вопроса",
                    "category": "технический/поведенческий/практический",
                    "difficulty": "easy/medium/hard",
                    "expected_answer": "ожидаемый ответ",
                    "skills_tested": ["навыки"]
                }}
            ]
        }}
        """
        
        messages = [MistralMessage(role="user", content=prompt)]
        response = await self._call_mistral_api(messages)
        
        if not response:
            return []
            
        try:
            data = json.loads(response)
            return data.get("questions", [])
        except Exception as e:
            print(f"Error parsing interview questions: {e}")
            return []

    async def analyze_application(
        self,
        application_text: str,
        task_requirements: str,
        task_complexity: int
    ) -> Dict[str, Any]:
        """Анализирует заявку фрилансера"""
        
        prompt = f"""
        Проанализируй заявку фрилансера:

        Заявка: {application_text}
        Требования к задаче: {task_requirements}
        Сложность задачи: {task_complexity}/5

        Оцени по критериям (1-10):
        - Релевантность опыта
        - Качество предложения
        - Техническая компетентность
        - Соответствие уровню сложности
        - Коммуникативные навыки

        Верни в формате JSON:
        {{
            "overall_score": 8.5,
            "scores": {{
                "relevance": 9,
                "proposal_quality": 8,
                "technical_competence": 9,
                "complexity_match": 8,
                "communication": 7
            }},
            "recommendation": "strong_recommend/consider/reject",
            "feedback": "детальный фидбек",
            "strengths": ["сильные стороны"],
            "weaknesses": ["слабые стороны"],
            "suggested_questions": ["вопросы для интервью"]
        }}
        """
        
        messages = [MistralMessage(role="user", content=prompt)]
        response = await self._call_mistral_api(messages)
        
        if not response:
            return {"error": "Не удалось проанализировать заявку"}
            
        try:
            return json.loads(response)
        except Exception as e:
            print(f"Error parsing application analysis: {e}")
            return {"error": str(e)}

    async def generate_task_recommendations(
        self,
        user_profile: Dict[str, Any],
        user_history: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Генерирует персональные рекомендации задач"""
        
        prompt = f"""
        Создай персональные рекомендации задач для фрилансера:

        Профиль: {json.dumps(user_profile, ensure_ascii=False)}
        История: {json.dumps(user_history, ensure_ascii=False)}

        Создай 3-5 рекомендаций задач, которые:
        - Соответствуют навыкам и уровню пользователя
        - Позволяют развиваться
        - Хорошо оплачиваются
        - Имеют подходящую сложность

        Верни в формате JSON:
        {{
            "recommendations": [
                {{
                    "type": "task_recommendation",
                    "title": "Название рекомендуемой задачи",
                    "description": "Описание",
                    "category": "категория",
                    "estimated_budget": "1000-2000",
                    "complexity_level": 3,
                    "confidence": 0.85,
                    "reasoning": "объяснение"
                }}
            ]
        }}
        """
        
        messages = [MistralMessage(role="user", content=prompt)]
        response = await self._call_mistral_api(messages)
        
        if not response:
            return []
            
        try:
            data = json.loads(response)
            return data.get("recommendations", [])
        except Exception as e:
            print(f"Error parsing recommendations: {e}")
            return []

    async def generate_smart_assistant_response(
        self,
        user_message: str,
        context: Dict[str, Any]
    ) -> str:
        """Генерирует ответ умного помощника"""
        
        prompt = f"""
        Ты умный помощник для фриланс-платформы. Ответь на вопрос пользователя:

        Вопрос: {user_message}
        Контекст: {json.dumps(context, ensure_ascii=False)}

        Будь полезным, дружелюбным и профессиональным. Давай конкретные советы.
        Отвечай на русском языке.
        """
        
        messages = [MistralMessage(role="user", content=prompt)]
        response = await self._call_mistral_api(messages)
        
        if not response:
            return "Извините, произошла ошибка. Попробуйте позже."
            
        return response

    async def suggest_user_level_upgrade(
        self,
        user_profile: Dict[str, Any],
        completed_tasks: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Предлагает повышение уровня пользователя"""
        
        prompt = f"""
        Проанализируй профиль пользователя и предложи повышение уровня:

        Профиль: {json.dumps(user_profile, ensure_ascii=False)}
        Выполненные задачи: {json.dumps(completed_tasks, ensure_ascii=False)}

        Оцени текущий уровень и предложи повышение.
        Верни в формате JSON:
        {{
            "current_level": 2,
            "suggested_level": 3,
            "reasoning": "объяснение",
            "requirements_met": true,
            "missing_requirements": ["требования"],
            "recommendations": ["рекомендации"]
        }}
        """
        
        messages = [MistralMessage(role="user", content=prompt)]
        response = await self._call_mistral_api(messages)
        
        if not response:
            return {"error": "Не удалось проанализировать"}
            
        try:
            return json.loads(response)
        except Exception as e:
            print(f"Error parsing level upgrade: {e}")
            return {"error": str(e)}

    async def analyze_task(self, task: Task) -> Dict[str, Any]:
        """Analyze a task and provide insights."""
        # In production, this would call the actual AI model
        # For now, we'll provide intelligent mock analysis
        
        complexity_keywords = {
            "easy": ["simple", "basic", "entry", "beginner", "quick", "small"],
            "medium": ["intermediate", "standard", "moderate", "average"],
            "hard": ["complex", "advanced", "expert", "sophisticated", "challenging"],
            "expert": ["enterprise", "mission-critical", "high-performance", "scalable"]
        }
        
        description_lower = task.description.lower()
        complexity_level = 1
        
        for level, keywords in complexity_keywords.items():
            if any(keyword in description_lower for keyword in keywords):
                if level == "easy":
                    complexity_level = 1
                elif level == "medium":
                    complexity_level = 2
                elif level == "hard":
                    complexity_level = 3
                elif level == "expert":
                    complexity_level = 4
                break
        
        # Calculate suggested pricing based on complexity and skills
        base_price = 50
        skill_multiplier = len(task.skills_required) * 0.2
        complexity_multiplier = complexity_level * 0.5
        
        suggested_min_price = base_price * (1 + skill_multiplier + complexity_multiplier)
        suggested_max_price = suggested_min_price * 2.5
        
        return {
            "complexity_level": complexity_level,
            "suggested_min_price": float(suggested_min_price),
            "suggested_max_price": float(suggested_max_price),
            "recommendations": [
                f"Consider breaking this into {complexity_level + 1} phases for better management",
                "Add detailed requirements to attract better candidates",
                "Set clear milestones and deliverables"
            ],
            "market_insights": {
                "demand_level": "high" if complexity_level <= 2 else "medium",
                "competition": "high" if complexity_level <= 2 else "medium",
                "avg_completion_time": f"{complexity_level * 2} weeks"
            },
            "skill_gaps": ["project management", "communication"] if complexity_level > 2 else [],
            "estimated_duration": f"{complexity_level * 2} weeks",
            "success_probability": max(0.3, 1 - (complexity_level * 0.15))
        }
    
    async def get_smart_matches(self, task: Task, freelancers: List[User], limit: int) -> List[SmartMatch]:
        """Get smart matches for a task."""
        matches = []
        
        for freelancer in freelancers[:limit]:
            # Calculate match score based on skills overlap
            task_skills = task.skills_required or []
            freelancer_skills = freelancer.skills or []
            skill_overlap = set(task_skills) & set(freelancer_skills)
            match_score = len(skill_overlap) / max(len(task_skills), 1)
            
            # Adjust score based on experience level
            if freelancer.level >= task.complexity_level:
                match_score *= 1.2
            
            # Adjust score based on rating
            if freelancer.rating:
                match_score *= (1 + freelancer.rating * 0.1)
            
            match_score = min(1.0, match_score)
            
            if match_score > 0.3:  # Only include relevant matches
                matches.append(SmartMatch(
                    freelancer_id=freelancer.id,
                    match_score=match_score,
                    skills_match=list(skill_overlap),
                    experience_level=f"Level {freelancer.level}",
                    hourly_rate=freelancer.hourly_rate,
                    availability="Available" if freelancer.is_active else "Busy",
                    recommendations=[
                        "Strong skill match",
                        "Good completion rate" if freelancer.completed_tasks > 5 else "New freelancer"
                    ]
                ))
        
        # Sort by match score
        matches.sort(key=lambda x: x.match_score, reverse=True)
        return matches[:limit]
    
    async def get_pricing_recommendation(self, task: Task, freelancer: Optional[User] = None) -> PricingRecommendation:
        """Get pricing recommendations for a task."""
        # Base pricing logic
        base_price = 100
        complexity_factor = task.complexity_level * 0.3
        demand_factor = 1.2 if task.complexity_level <= 2 else 0.8
        skill_rarity_factor = 1.1 if len(task.skills_required) > 3 else 0.9
        
        if freelancer:
            # Adjust based on freelancer's hourly rate
            if freelancer.hourly_rate:
                base_price = float(freelancer.hourly_rate) * 8  # 8 hours per day
        
        recommended_min = base_price * (1 + complexity_factor) * demand_factor * skill_rarity_factor
        recommended_max = recommended_min * 2.5
        market_average = (recommended_min + recommended_max) / 2
        
        return PricingRecommendation(
            task_id=task.id,
            recommended_min=Decimal(str(recommended_min)),
            recommended_max=Decimal(str(recommended_max)),
            market_average=Decimal(str(market_average)),
            complexity_factor=complexity_factor,
            demand_factor=demand_factor,
            skill_rarity_factor=skill_rarity_factor,
            justification=f"Based on {task.complexity_level} complexity level and {len(task.skills_required)} required skills",
            confidence_score=0.85
        )
    
    async def analyze_user_profile(self, user: User) -> SkillAnalysis:
        """Analyze user profile and provide skill insights."""
        skills = user.skills or []
        
        # Identify skill gaps based on user level
        all_skills = [
            "Python", "JavaScript", "React", "Node.js", "SQL", "AWS", "Docker",
            "Machine Learning", "Data Analysis", "UI/UX Design", "Project Management",
            "Communication", "Leadership", "Problem Solving", "Time Management"
        ]
        
        skill_gaps = [skill for skill in all_skills if skill not in skills]
        skill_strengths = skills[:3] if skills else []
        
        # Market demand simulation
        market_demand = {}
        for skill in skills:
            market_demand[skill] = random.uniform(0.6, 1.0)
        
        skill_score = len(skills) / len(all_skills) if all_skills else 0
        
        return SkillAnalysis(
            user_id=user.id,
            skill_gaps=skill_gaps[:5],
            skill_strengths=skill_strengths,
            market_demand=market_demand,
            learning_recommendations=[
                "Take advanced courses in your strongest skills",
                "Learn complementary technologies",
                "Build a portfolio showcasing your expertise"
            ],
            career_path_suggestions=[
                "Senior Developer" if user.level >= 3 else "Mid-level Developer",
                "Technical Lead" if user.level >= 4 else "Individual Contributor",
                "Architect" if user.level >= 5 else "Specialist"
            ],
            skill_score=skill_score
        )
    
    async def optimize_proposal(self, proposal_text: str, task: Task, user: User) -> Dict[str, Any]:
        """Optimize a proposal using AI."""
        # In production, this would use NLP to improve the proposal
        optimized_text = proposal_text
        
        # Add structure if missing
        if "approach" not in proposal_text.lower():
            optimized_text += "\n\nApproach:\nI will approach this project systematically, ensuring clear communication and regular updates."
        
        if "timeline" not in proposal_text.lower():
            optimized_text += "\n\nTimeline:\nI estimate this project will take 2-3 weeks to complete with regular milestones."
        
        if "deliverables" not in proposal_text.lower():
            optimized_text += "\n\nDeliverables:\nI will provide all source code, documentation, and testing results upon completion."
        
        return {
            "original_proposal": proposal_text,
            "optimized_proposal": optimized_text,
            "improvements": [
                "Added structured approach section",
                "Included timeline estimates",
                "Specified deliverables",
                "Enhanced professionalism"
            ],
            "confidence_score": 0.9
        }
    
    async def predict_task_success(self, task: Task) -> Dict[str, Any]:
        """Predict the success probability of a task."""
        # Factors affecting success
        factors = {
            "clear_description": len(task.description) > 100,
            "realistic_budget": task.budget_max and task.budget_max > 50,
            "specific_skills": len(task.skills_required) > 0,
            "reasonable_deadline": task.deadline and task.deadline > datetime.utcnow() + timedelta(days=7)
        }
        
        success_probability = sum(factors.values()) / len(factors)
        
        return {
            "task_id": task.id,
            "success_probability": success_probability,
            "risk_factors": [k for k, v in factors.items() if not v],
            "recommendations": [
                "Add more detail to description" if not factors["clear_description"] else None,
                "Adjust budget expectations" if not factors["realistic_budget"] else None,
                "Specify required skills" if not factors["specific_skills"] else None,
                "Extend deadline" if not factors["reasonable_deadline"] else None
            ],
            "confidence_score": 0.8
        }
    
    async def generate_keywords(self, task_description: str) -> List[str]:
        """Generate relevant keywords for a task description."""
        # In production, this would use NLP/ML
        common_keywords = [
            "development", "design", "analysis", "management", "testing",
            "deployment", "maintenance", "optimization", "integration"
        ]
        
        description_lower = task_description.lower()
        relevant_keywords = [kw for kw in common_keywords if kw in description_lower]
        
        # Add some generic but relevant keywords
        if "web" in description_lower or "website" in description_lower:
            relevant_keywords.extend(["frontend", "backend", "full-stack"])
        
        if "mobile" in description_lower or "app" in description_lower:
            relevant_keywords.extend(["iOS", "Android", "React Native"])
        
        if "data" in description_lower:
            relevant_keywords.extend(["database", "analytics", "visualization"])
        
        return list(set(relevant_keywords))[:10]
    
    async def suggest_profile_improvements(self, user: User) -> Dict[str, Any]:
        """Get AI suggestions for profile improvements."""
        suggestions = []
        
        if not user.bio or len(user.bio) < 50:
            suggestions.append("Add a detailed bio describing your expertise and experience")
        
        if not user.skills or len(user.skills) < 3:
            suggestions.append("Add more skills to increase your visibility")
        
        if not user.avatar_url:
            suggestions.append("Add a professional profile picture")
        
        if user.completed_tasks < 5:
            suggestions.append("Complete more tasks to build your reputation")
        
        if not user.hourly_rate or user.hourly_rate == 0:
            suggestions.append("Set a competitive hourly rate based on your experience")
        
        return {
            "user_id": user.id,
            "suggestions": suggestions,
            "priority": "high" if len(suggestions) > 3 else "medium",
            "estimated_impact": "High impact on profile visibility and client attraction"
        }
    
    async def get_market_analysis(self, category: str, skills: List[str]) -> Dict[str, Any]:
        """Get AI-powered market analysis for a category or skills."""
        # Mock market analysis
        demand_levels = ["low", "medium", "high"]
        demand = random.choice(demand_levels)
        
        avg_rates = {
            "low": (20, 40),
            "medium": (40, 80),
            "high": (60, 120)
        }
        
        min_rate, max_rate = avg_rates[demand]
        
        return {
            "category": category,
            "skills": skills,
            "demand_level": demand,
            "avg_hourly_rate": {
                "min": min_rate,
                "max": max_rate,
                "median": (min_rate + max_rate) / 2
            },
            "market_trends": [
                f"Growing demand for {category} professionals",
                "Remote work increasing opportunities",
                "Specialized skills commanding premium rates"
            ],
            "opportunities": [
                "High demand for experienced professionals",
                "Good potential for rate increases",
                "Growing market segment"
            ],
            "risks": [
                "Increasing competition",
                "Market saturation in some areas",
                "Technology changes affecting demand"
            ]
        }
    
    async def screen_applications_async(self, task: Task, applications: List[Application]):
        """Asynchronously screen applications."""
        # This would run in the background
        for application in applications:
            # Analyze application quality
            quality_score = self._analyze_application_quality(application)
            
            # Update application with screening results
            application.screening_score = quality_score
            application.screening_status = "passed" if quality_score > 0.7 else "failed"
            application.screened_at = datetime.utcnow()
    
    def _analyze_application_quality(self, application: Application) -> float:
        """Analyze the quality of an application."""
        score = 0.5  # Base score
        
        # Proposal length
        if len(application.proposal) > 200:
            score += 0.2
        
        # Bid amount (reasonable range)
        if application.bid_amount and 50 <= application.bid_amount <= 1000:
            score += 0.1
        
        # Cover letter
        if application.cover_letter and len(application.cover_letter) > 100:
            score += 0.2
        
        return min(1.0, score)
    
    async def get_screening_results(self, task_id: int) -> Dict[str, Any]:
        """Get results of automated application screening."""
        # In production, this would fetch from database
        return {
            "task_id": task_id,
            "total_applications": 15,
            "passed_screening": 8,
            "failed_screening": 7,
            "avg_screening_score": 0.72,
            "top_candidates": [
                {"application_id": 1, "score": 0.95, "freelancer_id": 101},
                {"application_id": 3, "score": 0.88, "freelancer_id": 103},
                {"application_id": 7, "score": 0.82, "freelancer_id": 107}
            ]
        }
    
    async def chatbot_response(self, prompt: str, user: User, context: Optional[Dict[str, Any]] = None) -> AIResponse:
        """Generate chatbot response."""
        # In production, this would use a real chatbot model
        responses = {
            "help": "I'm here to help! You can ask me about creating tasks, finding freelancers, managing payments, or any other platform features.",
            "pricing": "Our platform uses a 5% fee on completed transactions. We also offer premium features for advanced users.",
            "payment": "We support multiple payment methods including credit cards, bank transfers, and digital wallets. All payments are secured through escrow.",
            "dispute": "If you have a dispute, please contact our support team. We have a fair dispute resolution process in place."
        }
        
        prompt_lower = prompt.lower()
        response = "I understand you're asking about our platform. How can I assist you further?"
        
        for key, resp in responses.items():
            if key in prompt_lower:
                response = resp
                break
        
        return AIResponse(
            response=response,
            confidence=0.9,
            suggestions=["Create a task", "Find freelancers", "Manage payments", "Get help"]
        )
    
    async def generate_contract(self, task: Task, freelancer_id: int, terms: Dict[str, Any]) -> Dict[str, Any]:
        """Generate AI-powered contract for a task."""
        contract_template = {
            "task_id": task.id,
            "freelancer_id": freelancer_id,
            "client_id": task.creator_id,
            "project_title": task.title,
            "scope_of_work": task.description,
            "deliverables": terms.get("deliverables", ["Project completion", "Source code", "Documentation"]),
            "timeline": terms.get("timeline", "2-3 weeks"),
            "payment_terms": terms.get("payment_terms", "50% upfront, 50% upon completion"),
            "milestones": terms.get("milestones", ["Project kickoff", "First review", "Final delivery"]),
            "terms_and_conditions": [
                "All work will be original and free of plagiarism",
                "Client will provide timely feedback",
                "Freelancer will maintain confidentiality",
                "Disputes will be resolved through platform mediation"
            ],
            "generated_at": datetime.utcnow().isoformat()
        }
        
        return contract_template
    
    async def analyze_dispute(self, dispute_data: Dict[str, Any]) -> Dict[str, Any]:
        """AI-powered dispute resolution assistance."""
        # Analyze dispute factors
        factors = {
            "communication_issues": dispute_data.get("communication_issues", False),
            "quality_concerns": dispute_data.get("quality_concerns", False),
            "timeline_issues": dispute_data.get("timeline_issues", False),
            "payment_disputes": dispute_data.get("payment_disputes", False)
        }
        
        severity = sum(factors.values())
        
        recommendations = []
        if factors["communication_issues"]:
            recommendations.append("Schedule a call to clarify expectations")
        if factors["quality_concerns"]:
            recommendations.append("Request revisions with specific feedback")
        if factors["timeline_issues"]:
            recommendations.append("Agree on a revised timeline")
        if factors["payment_disputes"]:
            recommendations.append("Review payment terms and milestones")
        
        return {
            "dispute_analysis": {
                "severity": "high" if severity > 2 else "medium" if severity > 1 else "low",
                "primary_issues": [k for k, v in factors.items() if v],
                "resolution_complexity": "high" if severity > 2 else "medium"
            },
            "recommendations": recommendations,
            "suggested_actions": [
                "Open communication channel",
                "Document all interactions",
                "Set clear expectations",
                "Consider mediation if needed"
            ],
            "estimated_resolution_time": f"{severity * 2} days"
        }
    
    async def get_user_insights(self, user: User) -> Dict[str, Any]:
        """Get personalized AI insights for the user."""
        insights = {
            "performance_metrics": {
                "completion_rate": 0.95 if user.completed_tasks > 10 else 0.85,
                "avg_rating": user.rating or 4.2,
                "earnings_trend": "increasing" if user.total_earnings > 1000 else "stable",
                "response_time": "2 hours" if user.completed_tasks > 5 else "4 hours"
            },
            "market_position": {
                "competitive_advantage": "High skill level" if user.level >= 4 else "Good communication",
                "pricing_strategy": "Premium" if user.hourly_rate and user.hourly_rate > 50 else "Competitive",
                "target_clients": "Enterprise" if user.level >= 4 else "Small businesses"
            },
            "growth_opportunities": [
                "Expand skill set in high-demand areas",
                "Increase hourly rates gradually",
                "Build long-term client relationships",
                "Create portfolio showcasing best work"
            ],
            "risk_factors": [
                "Market competition increasing",
                "Technology changes affecting demand",
                "Client concentration risk" if user.completed_tasks < 5 else None
            ],
            "recommendations": [
                "Focus on quality over quantity",
                "Develop specialized expertise",
                "Build strong client relationships",
                "Stay updated with industry trends"
            ]
        }
        
        return insights

    async def translate_text(self, text: str, source_lang: str = None, target_lang: str = "en") -> dict:
        """Перевести текст на целевой язык через ИИ (заглушка, можно интегрировать OpenAI/DeepL)."""
        # Здесь можно интегрировать реальный API перевода (например, OpenAI, DeepL, Google Translate)
        # Пока что просто возвращаем тот же текст для демонстрации
        # В реальной реализации используйте API и определяйте detected_source_lang
        return {
            "translated_text": text if not target_lang or target_lang == source_lang else f"[{target_lang}] {text}",
            "detected_source_lang": source_lang or "auto"
        }

    async def review_kyc_document(
        self,
        document_type: str,
        comment: str = "",
        document_url: str = None,
        user_info: dict = None
    ) -> dict:
        """
        Автоматически проверяет KYC-документ с помощью Mistral AI и возвращает статус и причину.
        """
        prompt = f"""
        Ты — KYC-эксперт. Проверь заявку на верификацию пользователя по следующим данным:
        Тип документа: {document_type}
        Комментарий пользователя: {comment}
        {f'Ссылка на файл: {document_url}' if document_url else ''}
        {f'Информация о пользователе: {json.dumps(user_info, ensure_ascii=False)}' if user_info else ''}
        
        Ответь строго в формате JSON:
        {{
          "status": "APPROVED" или "REJECTED",
          "reason": "Краткое объяснение решения на русском языке"
        }}
        Если есть подозрение на подделку, плохое качество или несоответствие — отклоняй.
        """
        messages = [MistralMessage(role="user", content=prompt)]
        response = await self._call_mistral_api(messages)
        if not response:
            return {"status": "REJECTED", "reason": "AI недоступен"}
        try:
            data = json.loads(response)
            if data.get("status") not in ("APPROVED", "REJECTED"):
                raise ValueError("Invalid status")
            return data
        except Exception as e:
            print(f"Error parsing AI KYC review: {e}")
            return {"status": "REJECTED", "reason": "Ошибка разбора ответа ИИ"}

# Создаем глобальный экземпляр сервиса
ai_service = AIService()  # Укажите реальный client/model при инициализации
