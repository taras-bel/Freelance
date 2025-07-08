import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

// Типы для AI функций
export interface AIInterviewQuestion {
  question: string;
  category: string;
  difficulty: string;
  expected_answer?: string;
}

export interface AIRecommendation {
  type: string;
  content: string;
  confidence: number;
  reasoning: string;
}

export interface ApplicationAnalysis {
  overall_score: number;
  scores: {
    relevance: number;
    proposal_quality: number;
    technical_competence: number;
    communication: number;
  };
  recommendation: 'strong_recommend' | 'consider' | 'reject';
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  suggested_questions: string[];
}

export interface TaskComplexityAnalysis {
  complexity_score: number;
  estimated_hours: number;
  budget_adequacy: 'adequate' | 'too_low' | 'too_high';
  recommended_skills: string[];
  risk_factors: string[];
  suggestions: string;
}

export interface ProjectTimeline {
  timeline: Array<{
    milestone: string;
    duration_days: number;
    dependencies: string[];
    deliverables: string[];
    risks: string[];
  }>;
  total_duration: number;
  critical_path: string[];
}

// Хук для генерации вопросов интервью
export const useInterviewQuestions = (taskId: number, difficulty: string = 'medium') => {
  return useQuery({
    queryKey: ['interview-questions', taskId, difficulty],
    queryFn: async () => {
      const response = await api.post('/ai/interview-questions', {
        task_id: taskId,
        difficulty
      });
      return response.data;
    },
    enabled: !!taskId,
  });
};

// Хук для анализа заявки
export const useApplicationAnalysis = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (applicationId: number) => {
      const response = await api.post('/ai/analyze-application', {
        application_id: applicationId
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Инвалидируем кеш заявок
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
};

// Хук для получения рекомендаций задач
export const useTaskRecommendations = (userId: number, limit: number = 5) => {
  return useQuery({
    queryKey: ['task-recommendations', userId, limit],
    queryFn: async () => {
      const response = await api.post('/ai/task-recommendations', {
        user_id: userId,
        limit
      });
      return response.data;
    },
    enabled: !!userId,
  });
};

// Хук для умного помощника
export const useSmartAssistant = () => {
  return useMutation({
    mutationFn: async ({ message, context }: { message: string; context?: Record<string, any> }) => {
      const response = await api.post('/ai/smart-assistant', {
        message,
        context: context || {}
      });
      return response.data;
    },
  });
};

// Хук для анализа сложности задачи
export const useTaskComplexityAnalysis = () => {
  return useMutation({
    mutationFn: async ({ 
      taskDescription, 
      budgetMin, 
      budgetMax 
    }: { 
      taskDescription: string; 
      budgetMin: number; 
      budgetMax: number; 
    }) => {
      const response = await api.post('/ai/analyze-task-complexity', {
        task_description: taskDescription,
        budget_min: budgetMin,
        budget_max: budgetMax
      });
      return response.data;
    },
  });
};

// Хук для генерации временной шкалы проекта
export const useProjectTimeline = () => {
  return useMutation({
    mutationFn: async ({ 
      taskDescription, 
      milestones 
    }: { 
      taskDescription: string; 
      milestones: string[]; 
    }) => {
      const response = await api.post('/ai/generate-project-timeline', {
        task_description: taskDescription,
        milestones
      });
      return response.data;
    },
  });
};

// Хук для проверки здоровья AI сервиса
export const useAIHealthCheck = () => {
  return useQuery({
    queryKey: ['ai-health'],
    queryFn: async () => {
      const response = await api.get('/ai/health');
      return response.data;
    },
    refetchInterval: 30000, // Проверяем каждые 30 секунд
  });
};

// Общий хук для AI функций
export const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const interviewQuestions = useInterviewQuestions(0); // placeholder
  const applicationAnalysis = useApplicationAnalysis();
  const taskRecommendations = useTaskRecommendations(0); // placeholder
  const smartAssistant = useSmartAssistant();
  const taskComplexity = useTaskComplexityAnalysis();
  const projectTimeline = useProjectTimeline();
  const healthCheck = useAIHealthCheck();

  return {
    // Состояние
    isLoading,
    error,
    
    // Функции
    generateInterviewQuestions: interviewQuestions.refetch,
    analyzeApplication: applicationAnalysis.mutate,
    getTaskRecommendations: taskRecommendations.refetch,
    askSmartAssistant: smartAssistant.mutate,
    analyzeTaskComplexity: taskComplexity.mutate,
    generateProjectTimeline: projectTimeline.mutate,
    
    // Данные
    interviewQuestions: interviewQuestions.data,
    taskRecommendations: taskRecommendations.data,
    aiHealth: healthCheck.data,
    
    // Состояния загрузки
    isGeneratingQuestions: interviewQuestions.isLoading,
    isAnalyzingApplication: applicationAnalysis.isPending,
    isGettingRecommendations: taskRecommendations.isLoading,
    isAskingAssistant: smartAssistant.isPending,
    isAnalyzingComplexity: taskComplexity.isPending,
    isGeneratingTimeline: projectTimeline.isPending,
    isHealthChecking: healthCheck.isLoading,
    
    // Ошибки
    interviewQuestionsError: interviewQuestions.error,
    applicationAnalysisError: applicationAnalysis.error,
    taskRecommendationsError: taskRecommendations.error,
    smartAssistantError: smartAssistant.error,
    taskComplexityError: taskComplexity.error,
    projectTimelineError: projectTimeline.error,
    healthCheckError: healthCheck.error,
  };
}; 