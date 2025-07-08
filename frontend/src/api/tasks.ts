import api from './axios'

export interface Task {
  id: string
  title: string
  description: string
  category: string
  skills_required: string[]
  budget_min: number
  budget_max: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration?: string
  deadline?: string
  location?: string
  applications_count: number
  views_count: number
  is_bookmarked: boolean
  creator: {
    id: string
    name: string
    avatar?: string
    rating: number
  }
  created_at: string
  updated_at: string
}

export interface CreateTaskData {
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
}

export interface TaskFilters {
  skip?: number
  limit?: number
  category?: string
  difficulty?: string
  budget_min?: number
  budget_max?: number
  search?: string
  skills?: string[]
  location?: string
}

export const tasksApi = {
  // Получить список задач с фильтрами
  getTasks: async (filters?: TaskFilters) => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v))
          } else {
            params.append(key, value.toString())
          }
        }
      })
    }
    
    const response = await api.get(`/tasks?${params.toString()}`)
    return response.data
  },

  // Получить задачу по ID
  getTask: async (taskId: string) => {
    const response = await api.get(`/tasks/${taskId}`)
    return response.data
  },

  // Создать новую задачу
  createTask: async (taskData: CreateTaskData) => {
    const response = await api.post('/tasks', taskData)
    return response.data
  },

  // Обновить задачу
  updateTask: async (taskId: string, taskData: Partial<CreateTaskData>) => {
    const response = await api.put(`/tasks/${taskId}`, taskData)
    return response.data
  },

  // Удалить задачу
  deleteTask: async (taskId: string) => {
    const response = await api.delete(`/tasks/${taskId}`)
    return response.data
  },

  // Подать заявку на задачу
  applyForTask: async (taskId: string, applicationData: {
    cover_letter: string
    proposed_budget?: number
    estimated_duration?: string
  }) => {
    const response = await api.post(`/tasks/${taskId}/apply`, applicationData)
    return response.data
  },

  // Добавить/убрать закладку
  toggleBookmark: async (taskId: string) => {
    const response = await api.post(`/tasks/${taskId}/bookmark`)
    return response.data
  },

  // Получить заявки пользователя
  getUserApplications: async () => {
    const response = await api.get('/applications')
    return response.data
  },

  // Получить заявки на задачу
  getTaskApplications: async (taskId: string) => {
    const response = await api.get(`/tasks/${taskId}/applications`)
    return response.data
  }
} 