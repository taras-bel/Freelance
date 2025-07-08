import { useState, useCallback, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { tasksApi, Task as ApiTask, TaskFilters as ApiTaskFilters } from '../api/tasks'

export interface Task {
  id: string
  title: string
  description: string
  budget: {
    min: number
    max: number
    currency: string
  }
  skills: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  client: {
    name: string
    rating: number
    avatar: string
  }
  postedAt: string
  proposals: number
  isBookmarked: boolean
  status: 'open' | 'in-progress' | 'completed'
  category: string
  tags: string[]
}

// Функция для преобразования API задачи в локальный формат
const transformApiTask = (apiTask: ApiTask): Task => ({
  id: apiTask.id,
  title: apiTask.title,
  description: apiTask.description,
  budget: {
    min: apiTask.budget_min,
    max: apiTask.budget_max,
    currency: 'USD'
  },
  skills: apiTask.skills_required,
  difficulty: apiTask.difficulty,
  duration: apiTask.duration || 'Not specified',
  client: {
    name: apiTask.creator.name,
    rating: apiTask.creator.rating,
    avatar: apiTask.creator.avatar || '👤'
  },
  postedAt: apiTask.created_at,
  proposals: apiTask.applications_count,
  isBookmarked: apiTask.is_bookmarked,
  status: 'open', // По умолчанию, так как API не возвращает статус
  category: apiTask.category,
  tags: apiTask.skills_required
})

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'React E-commerce Dashboard',
    description: 'Build a modern admin dashboard for an e-commerce platform using React and TypeScript. Include analytics, order management, and inventory tracking.',
    budget: { min: 800, max: 1500, currency: 'USD' },
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Chart.js'],
    difficulty: 'intermediate',
    duration: '2-3 weeks',
    client: { name: 'TechCorp Inc.', rating: 4.8, avatar: '🏢' },
    postedAt: '2024-01-15T10:30:00Z',
    proposals: 12,
    isBookmarked: false,
    status: 'open',
    category: 'Frontend Development',
    tags: ['React', 'Dashboard', 'E-commerce', 'TypeScript']
  },
  {
    id: '2',
    title: 'AI-Powered Chatbot Integration',
    description: 'Integrate OpenAI GPT-4 into existing customer support system. Implement conversation flow, sentiment analysis, and escalation to human agents.',
    budget: { min: 1200, max: 2500, currency: 'USD' },
    skills: ['Python', 'OpenAI API', 'FastAPI', 'PostgreSQL'],
    difficulty: 'advanced',
    duration: '3-4 weeks',
    client: { name: 'StartupXYZ', rating: 4.6, avatar: '🚀' },
    postedAt: '2024-01-14T14:20:00Z',
    proposals: 8,
    isBookmarked: true,
    status: 'open',
    category: 'AI/ML',
    tags: ['AI', 'Chatbot', 'OpenAI', 'Python']
  },
  {
    id: '3',
    title: 'Mobile App UI/UX Design',
    description: 'Design a complete UI/UX for a fitness tracking mobile app. Create wireframes, prototypes, and design system with modern aesthetics.',
    budget: { min: 600, max: 1200, currency: 'USD' },
    skills: ['Figma', 'UI/UX Design', 'Prototyping', 'Design Systems'],
    difficulty: 'intermediate',
    duration: '1-2 weeks',
    client: { name: 'HealthTech', rating: 4.9, avatar: '💪' },
    postedAt: '2024-01-13T09:15:00Z',
    proposals: 15,
    isBookmarked: false,
    status: 'open',
    category: 'Design',
    tags: ['UI/UX', 'Mobile', 'Fitness', 'Figma']
  },
  {
    id: '4',
    title: 'Backend API Development',
    description: 'Develop RESTful API for a social media platform. Include user authentication, post management, and real-time notifications.',
    budget: { min: 1000, max: 2000, currency: 'USD' },
    skills: ['Node.js', 'Express', 'MongoDB', 'Socket.io'],
    difficulty: 'intermediate',
    duration: '3-4 weeks',
    client: { name: 'SocialApp', rating: 4.7, avatar: '📱' },
    postedAt: '2024-01-12T16:45:00Z',
    proposals: 6,
    isBookmarked: false,
    status: 'open',
    category: 'Backend Development',
    tags: ['Node.js', 'API', 'Social Media', 'MongoDB']
  },
  {
    id: '5',
    title: 'WordPress Plugin Development',
    description: 'Create a custom WordPress plugin for event management. Include calendar integration, ticket sales, and email notifications.',
    budget: { min: 400, max: 800, currency: 'USD' },
    skills: ['PHP', 'WordPress', 'MySQL', 'JavaScript'],
    difficulty: 'beginner',
    duration: '1-2 weeks',
    client: { name: 'EventPro', rating: 4.5, avatar: '🎫' },
    postedAt: '2024-01-11T11:30:00Z',
    proposals: 9,
    isBookmarked: true,
    status: 'open',
    category: 'WordPress',
    tags: ['WordPress', 'Plugin', 'Events', 'PHP']
  },
  {
    id: '6',
    title: 'DevOps Infrastructure Setup',
    description: 'Set up CI/CD pipeline and cloud infrastructure for a microservices application. Configure Docker, Kubernetes, and monitoring.',
    budget: { min: 1500, max: 3000, currency: 'USD' },
    skills: ['Docker', 'Kubernetes', 'AWS', 'Jenkins'],
    difficulty: 'advanced',
    duration: '2-3 weeks',
    client: { name: 'CloudTech', rating: 4.8, avatar: '☁️' },
    postedAt: '2024-01-10T13:20:00Z',
    proposals: 4,
    isBookmarked: false,
    status: 'open',
    category: 'DevOps',
    tags: ['DevOps', 'CI/CD', 'Docker', 'Kubernetes']
  }
]

export function useTasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', initialTasks)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    difficulty: 'all',
    budgetRange: 'all',
    skills: [] as string[]
  })
  const [sortBy, setSortBy] = useState<'recent' | 'budget' | 'proposals'>('recent')

  // Загрузка задач с API
  const loadTasks = useCallback(async (apiFilters?: ApiTaskFilters) => {
    setLoading(true)
    setError(null)
    
    try {
      const apiTasks = await tasksApi.getTasks(apiFilters)
      const transformedTasks = apiTasks.map(transformApiTask)
      setTasks(transformedTasks)
    } catch (err) {
      console.error('Failed to load tasks:', err)
      setError('Failed to load tasks. Using cached data.')
      // Оставляем кэшированные данные при ошибке
    } finally {
      setLoading(false)
    }
  }, [setTasks])

  // Загрузка задач при монтировании компонента
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      loadTasks()
    } else {
      console.log('No auth token, skipping tasks fetch')
    }
  }, [loadTasks])

  // Toggle bookmark с API
  const toggleBookmark = useCallback(async (taskId: string) => {
    try {
      await tasksApi.toggleBookmark(taskId)
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, isBookmarked: !task.isBookmarked }
            : task
        )
      )
    } catch (err) {
      console.error('Failed to toggle bookmark:', err)
      setError('Failed to update bookmark')
    }
  }, [setTasks])

  // Apply for task с API
  const applyForTask = useCallback(async (taskId: string, applicationData: {
    cover_letter: string
    proposed_budget?: number
    estimated_duration?: string
  }) => {
    try {
      await tasksApi.applyForTask(taskId, applicationData)
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, proposals: task.proposals + 1 }
            : task
        )
      )
      return { success: true }
    } catch (err) {
      console.error('Failed to apply for task:', err)
      setError('Failed to submit application')
      return { success: false, error: 'Failed to submit application' }
    }
  }, [setTasks])

  // Создание новой задачи
  const createTask = useCallback(async (taskData: {
    title: string
    description: string
    category: string
    skills_required?: string[]
    budget_min: number
    budget_max: number
    difficulty?: string
    duration?: string
    deadline?: string
    location?: string
  }) => {
    try {
      const newApiTask = await tasksApi.createTask(taskData)
      const newTask = transformApiTask(newApiTask)
      setTasks(prevTasks => [newTask, ...prevTasks])
      return { success: true, task: newTask }
    } catch (err) {
      console.error('Failed to create task:', err)
      setError('Failed to create task')
      return { success: false, error: 'Failed to create task' }
    }
  }, [setTasks])

  // Обновление задачи
  const updateTask = useCallback(async (taskId: string, taskData: Partial<{
    title: string
    description: string
    category: string
    skills_required?: string[]
    budget_min: number
    budget_max: number
    difficulty?: string
    duration?: string
    deadline?: string
    location?: string
  }>) => {
    try {
      const updatedApiTask = await tasksApi.updateTask(taskId, taskData)
      const updatedTask = transformApiTask(updatedApiTask)
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? updatedTask : task
        )
      )
      return { success: true, task: updatedTask }
    } catch (err) {
      console.error('Failed to update task:', err)
      setError('Failed to update task')
      return { success: false, error: 'Failed to update task' }
    }
  }, [setTasks])

  // Удаление задачи
  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await tasksApi.deleteTask(taskId)
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId))
      return { success: true }
    } catch (err) {
      console.error('Failed to delete task:', err)
      setError('Failed to delete task')
      return { success: false, error: 'Failed to delete task' }
    }
  }, [setTasks])

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         task.description.toLowerCase().includes(filters.search.toLowerCase()) ||
                         task.skills.some(skill => skill.toLowerCase().includes(filters.search.toLowerCase()))
    
    const matchesCategory = filters.category === 'all' || task.category === filters.category
    const matchesDifficulty = filters.difficulty === 'all' || task.difficulty === filters.difficulty
    
    const matchesSkills = filters.skills.length === 0 || 
                         filters.skills.some(skill => task.skills.includes(skill))
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesSkills
  })

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'budget':
        return b.budget.max - a.budget.max
      case 'proposals':
        return a.proposals - b.proposals
      case 'recent':
      default:
        return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
    }
  })

  // Get bookmarked tasks
  const bookmarkedTasks = tasks.filter(task => task.isBookmarked)

  // Get categories
  const categories = ['all', ...Array.from(new Set(tasks.map(task => task.category)))]

  // Get skills
  const allSkills = Array.from(new Set(tasks.flatMap(task => task.skills)))

  return {
    tasks: sortedTasks,
    bookmarkedTasks,
    loading,
    error,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    toggleBookmark,
    applyForTask,
    createTask,
    updateTask,
    deleteTask,
    loadTasks,
    categories,
    allSkills
  }
} 