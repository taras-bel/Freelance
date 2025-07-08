import { useState, useCallback } from 'react'
import { aiApi, InterviewStartRequest, InterviewAnswerRequest } from '../api/ai'

export interface InterviewQuestion {
  id: string
  question: string
  answer?: string
  feedback?: string
  score?: number
}

export interface InterviewSession {
  id: string
  role: string
  level: string
  questions: InterviewQuestion[]
  scenario: string
  currentQuestionIndex: number
  isActive: boolean
  results: any[]
  startedAt: Date
  completedAt?: Date
}

export function useAIInterview() {
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startInterview = useCallback(async (data: InterviewStartRequest) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await aiApi.startInterview(data)
      
      const session: InterviewSession = {
        id: Date.now().toString(),
        role: data.role,
        level: data.level,
        questions: response.questions.map((q, index) => ({
          id: index.toString(),
          question: q
        })),
        scenario: response.scenario,
        currentQuestionIndex: 0,
        isActive: true,
        results: [],
        startedAt: new Date()
      }

      setSessions(prev => [...prev, session])
      setCurrentSession(session)
      
      return session
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start interview'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const submitAnswer = useCallback(async (answer: string) => {
    if (!currentSession) return

    setIsLoading(true)
    setError(null)

    try {
      const currentQuestion = currentSession.questions[currentSession.currentQuestionIndex]
      
      const response = await aiApi.submitInterviewAnswer({
        question: currentQuestion.question,
        answer,
        role: currentSession.role,
        level: currentSession.level
      })

      // Обновляем вопрос с ответом и обратной связью
      const updatedQuestions = [...currentSession.questions]
      updatedQuestions[currentSession.currentQuestionIndex] = {
        ...currentQuestion,
        answer,
        feedback: response.feedback,
        score: response.score
      }

      const updatedSession = {
        ...currentSession,
        questions: updatedQuestions,
        results: [...currentSession.results, response]
      }

      // Переходим к следующему вопросу или завершаем интервью
      if (currentSession.currentQuestionIndex < currentSession.questions.length - 1) {
        updatedSession.currentQuestionIndex = currentSession.currentQuestionIndex + 1
      } else {
        updatedSession.isActive = false
        updatedSession.completedAt = new Date()
      }

      setCurrentSession(updatedSession)
      setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s))

      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit answer'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [currentSession])

  const finishInterview = useCallback(() => {
    if (!currentSession) return

    const updatedSession = {
      ...currentSession,
      isActive: false,
      completedAt: new Date()
    }

    setCurrentSession(null)
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s))
  }, [currentSession])

  const showResults = useCallback((sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      setCurrentSession(session)
    }
  }, [sessions])

  const hideResults = useCallback(() => {
    setCurrentSession(null)
  }, [])

  const getSessionById = useCallback((id: string) => {
    return sessions.find(s => s.id === id)
  }, [sessions])

  const getCompletedSessions = useCallback(() => {
    return sessions.filter(s => !s.isActive)
  }, [sessions])

  const getActiveSession = useCallback(() => {
    return sessions.find(s => s.isActive)
  }, [sessions])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    sessions,
    currentSession,
    isLoading,
    error,
    startInterview,
    submitAnswer,
    finishInterview,
    showResults,
    hideResults,
    getSessionById,
    getCompletedSessions,
    getActiveSession,
    clearError
  }
} 