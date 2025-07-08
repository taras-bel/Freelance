import api from './axios'

export interface InterviewStartRequest {
  role: string
  level: string
  language?: string
}

export interface InterviewStartResponse {
  questions: string[]
  scenario: string
}

export interface InterviewAnswerRequest {
  question: string
  answer: string
  role: string
  level: string
  language?: string
}

export interface InterviewAnswerResponse {
  feedback: string
  score?: number
  recommendations?: string
}

export interface AssistantChatRequest {
  message: string
  context?: string
  language?: string
}

export interface AssistantChatResponse {
  reply: string
}

export interface AnalyzeTaskComplexityRequest {
  title: string
  description: string
  category: string
  skills_required: string[]
  deadline?: string
  budget_min?: number
  budget_max?: number
}

export interface AnalyzeTaskComplexityResponse {
  complexity_level: number
  estimated_hours: number
  suggested_min_price: number
  suggested_max_price: number
  required_skills: string[]
  risk_factors: string[]
  market_demand: string
  confidence_score: number
}

export const aiApi = {
  // Начать интервью
  startInterview: async (data: InterviewStartRequest): Promise<InterviewStartResponse> => {
    const response = await api.post('/api/ai/interview/start', data)
    return response.data
  },

  // Отправить ответ на вопрос интервью
  submitInterviewAnswer: async (data: InterviewAnswerRequest): Promise<InterviewAnswerResponse> => {
    const response = await api.post('/api/ai/interview/answer', data)
    return response.data
  },

  // Чат с AI-ассистентом
  chatWithAssistant: async (data: AssistantChatRequest): Promise<AssistantChatResponse> => {
    const response = await api.post('/api/ai/assistant/chat', data)
    return response.data
  },

  analyzeTaskComplexity: async (
    data: AnalyzeTaskComplexityRequest
  ): Promise<AnalyzeTaskComplexityResponse> => {
    const response = await api.post('/api/ai/analyze-task-complexity', data)
    return response.data
  }
} 