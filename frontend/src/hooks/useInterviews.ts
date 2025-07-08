import { useState, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

export interface InterviewTest {
  id: string
  title: string
  type: 'technical' | 'behavioral' | 'mixed' | 'voice'
  duration: number
  difficulty: number
  skills: string[]
  description: string
  status?: 'completed' | 'scheduled' | 'available'
  score?: number
  completedAt?: string
  questions?: number
  company?: string
  isBookmarked?: boolean
  scheduledFor?: string
}

export interface InterviewMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

const initialTests: InterviewTest[] = [
  {
    id: '1',
    title: 'React Fundamentals',
    type: 'technical',
    duration: 30,
    difficulty: 2,
    skills: ['React', 'JavaScript', 'Frontend'],
    description: 'Test your knowledge of React basics, hooks, and component lifecycle',
    status: 'available',
    questions: 15,
    company: 'TechCorp Inc.',
    isBookmarked: false
  },
  {
    id: '2',
    title: 'System Design Interview',
    type: 'technical',
    duration: 60,
    difficulty: 4,
    skills: ['System Design', 'Architecture', 'Backend'],
    description: 'Design scalable systems and discuss trade-offs',
    status: 'completed',
    score: 85,
    completedAt: '2024-01-10',
    questions: 8,
    company: 'BigTech Solutions',
    isBookmarked: true
  },
  {
    id: '3',
    title: 'Behavioral Assessment',
    type: 'behavioral',
    duration: 45,
    difficulty: 3,
    skills: ['Communication', 'Leadership', 'Problem Solving'],
    description: 'Answer behavioral questions about your work experience',
    status: 'scheduled',
    questions: 12,
    company: 'StartupXYZ',
    isBookmarked: false,
    scheduledFor: '2024-01-20T14:00:00Z'
  },
  {
    id: '4',
    title: 'Voice Technical Interview',
    type: 'voice',
    duration: 40,
    difficulty: 3,
    skills: ['Technical Communication', 'Problem Solving'],
    description: 'Voice-based technical interview with real-time feedback',
    status: 'available',
    questions: 10,
    company: 'RemoteTech',
    isBookmarked: false
  },
  {
    id: '5',
    title: 'Python Backend Development',
    type: 'technical',
    duration: 45,
    difficulty: 3,
    skills: ['Python', 'Django', 'API Development'],
    description: 'Test your Python backend development skills and API design',
    status: 'available',
    questions: 18,
    company: 'DataFlow Systems',
    isBookmarked: true
  },
  {
    id: '6',
    title: 'UI/UX Design Challenge',
    type: 'mixed',
    duration: 90,
    difficulty: 4,
    skills: ['UI/UX', 'Figma', 'Design Thinking'],
    description: 'Complete a design challenge with technical implementation',
    status: 'completed',
    score: 92,
    completedAt: '2024-01-08',
    questions: 6,
    company: 'DesignStudio',
    isBookmarked: false
  },
  {
    id: '7',
    title: 'DevOps & Infrastructure',
    type: 'technical',
    duration: 50,
    difficulty: 4,
    skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
    description: 'Test your DevOps knowledge and infrastructure management',
    status: 'available',
    questions: 20,
    company: 'CloudTech Solutions',
    isBookmarked: false
  },
  {
    id: '8',
    title: 'Leadership & Team Management',
    type: 'behavioral',
    duration: 35,
    difficulty: 3,
    skills: ['Leadership', 'Team Management', 'Conflict Resolution'],
    description: 'Assess your leadership skills and team management experience',
    status: 'available',
    questions: 14,
    company: 'Enterprise Corp',
    isBookmarked: false
  }
]

export function useInterviews() {
  const [tests, setTests] = useLocalStorage<InterviewTest[]>('interviews', initialTests)
  const [messages, setMessages] = useLocalStorage<InterviewMessage[]>('interview-messages', [
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI interview assistant. I can help you prepare for interviews, answer questions, and provide tips. What would you like to know?',
      timestamp: new Date()
    }
  ])
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    difficulty: 'all',
    status: 'all',
    skills: [] as string[]
  })

  // Toggle bookmark
  const toggleBookmark = useCallback((testId: string) => {
    setTests(prevTests => 
      prevTests.map(test => 
        test.id === testId 
          ? { ...test, isBookmarked: !test.isBookmarked }
          : test
      )
    )
  }, [setTests])

  // Start test
  const startTest = useCallback((testId: string) => {
    setTests(prevTests => 
      prevTests.map(test => 
        test.id === testId 
          ? { ...test, status: 'scheduled' as const, scheduledFor: new Date().toISOString() }
          : test
      )
    )
    console.log('Starting test:', testId)
  }, [setTests])

  // Complete test
  const completeTest = useCallback((testId: string, score: number) => {
    setTests(prevTests => 
      prevTests.map(test => 
        test.id === testId 
          ? { 
              ...test, 
              status: 'completed' as const, 
              score, 
              completedAt: new Date().toISOString() 
            }
          : test
      )
    )
  }, [setTests])

  // Add message to chat
  const addMessage = useCallback((message: Omit<InterviewMessage, 'id' | 'timestamp'>) => {
    const newMessage: InterviewMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }, [setMessages])

  // Send AI response
  const sendAIResponse = useCallback(() => {
    const aiResponses = [
      "Great question! For technical interviews, always start by clarifying the requirements and asking follow-up questions.",
      "Practice explaining your thought process out loud. Interviewers want to see how you approach problems.",
      "Remember to discuss trade-offs when designing systems. There's rarely a perfect solution.",
      "For behavioral questions, use the STAR method: Situation, Task, Action, Result.",
      "Don't be afraid to ask for clarification if you don't understand a question.",
      "Practice coding on a whiteboard or paper to prepare for in-person interviews.",
      "Research the company and role beforehand to ask thoughtful questions.",
      "Focus on demonstrating your problem-solving skills rather than memorizing solutions.",
      "Always have questions ready to ask the interviewer about the role and company.",
      "Practice your elevator pitch and be ready to discuss your background confidently."
    ]
    
    const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]
    
    setTimeout(() => {
      addMessage({
        type: 'ai',
        content: randomResponse
      })
    }, 1000)
  }, [addMessage])

  // Filter tests
  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         test.description.toLowerCase().includes(filters.search.toLowerCase()) ||
                         test.skills.some(skill => skill.toLowerCase().includes(filters.search.toLowerCase()))
    const matchesType = filters.type === 'all' || test.type === filters.type
    const matchesDifficulty = filters.difficulty === 'all' || test.difficulty === parseInt(filters.difficulty)
    const matchesStatus = filters.status === 'all' || test.status === filters.status
    const matchesSkills = filters.skills.length === 0 || 
                         filters.skills.some(skill => test.skills.includes(skill))
    
    return matchesSearch && matchesType && matchesDifficulty && matchesStatus && matchesSkills
  })

  // Get statistics
  const stats = {
    total: tests.length,
    completed: tests.filter(t => t.status === 'completed').length,
    scheduled: tests.filter(t => t.status === 'scheduled').length,
    available: tests.filter(t => t.status === 'available').length,
    averageScore: tests
      .filter(t => t.score)
      .reduce((acc, t) => acc + (t.score || 0), 0) / tests.filter(t => t.score).length || 0
  }

  return {
    tests: filteredTests,
    messages,
    filters,
    setFilters,
    toggleBookmark,
    startTest,
    completeTest,
    addMessage,
    sendAIResponse,
    stats
  }
} 