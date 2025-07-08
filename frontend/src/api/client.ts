const API_BASE_URL = 'http://localhost:8000/api/v1'

interface ApiResponse<T> {
  data?: T
  error?: string
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }

    // Get token from authStore instead of localStorage
    const authStore = JSON.parse(localStorage.getItem('auth-storage') || '{}')
    const token = authStore?.state?.token || null

    if (token) {
      headers.Authorization = `Bearer ${token}`
    } else {
      console.warn('No access token found for request:', endpoint)
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // Handle 401 Unauthorized
        if (response.status === 401) {
          console.error('Unauthorized request:', endpoint, 'Token:', token ? 'Present' : 'Missing')
          // Clear invalid token from authStore
          localStorage.removeItem('auth-storage')
          // Redirect to login if not already there
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login'
          }
        }
        
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Auth endpoints
  async login(username: string, password: string) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    return this.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });
  }

  async register(userData: {
    email: string
    username: string
    password: string
    first_name?: string
    last_name?: string
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async getCurrentUser() {
    return this.request('/users/me')
  }

  // Task endpoints
  async getTasks(params?: {
    skip?: number
    limit?: number
    category?: string
    difficulty?: string
    search?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    return this.request(`/tasks?${searchParams.toString()}`)
  }

  async getTask(taskId: string) {
    return this.request(`/tasks/${taskId}`)
  }

  async createTask(taskData: {
    title: string
    description: string
    category: string
    skills_required?: string[]
    budget_min: number
    budget_max: number
    difficulty?: string
    duration?: string
    deadline?: string
  }) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    })
  }

  async updateTask(taskId: string, taskData: any) {
    return this.request(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    })
  }

  async deleteTask(taskId: string) {
    return this.request(`/tasks/${taskId}`, {
      method: 'DELETE',
    })
  }

  // Application endpoints
  async applyForTask(taskId: string, applicationData: {
    cover_letter: string
    proposed_budget?: number
    estimated_duration?: string
  }) {
    return this.request(`/tasks/${taskId}/apply`, {
      method: 'POST',
      body: JSON.stringify(applicationData),
    })
  }

  async getUserApplications() {
    return this.request('/applications')
  }

  async getTaskApplications(taskId: string) {
    return this.request(`/tasks/${taskId}/applications`)
  }

  // Chat endpoints
  async getChats() {
    return this.request('/chats')
  }

  async createChat(chatData: {
    user2_id: number
    task_id?: number
  }) {
    return this.request('/chats', {
      method: 'POST',
      body: JSON.stringify(chatData),
    })
  }

  async getChatMessages(chatId: string) {
    return this.request(`/chats/${chatId}/messages`)
  }

  async sendMessage(chatId: string, messageData: {
    content: string
  }) {
    return this.request(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    })
  }

  // Notification endpoints
  async getNotifications(page: number = 1, limit: number = 20) {
    return this.request(`/notifications?page=${page}&limit=${limit}`)
  }

  async getNotificationStats() {
    return this.request('/notifications/stats')
  }

  async markNotificationAsRead(notificationId: number) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'POST',
    })
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', {
      method: 'POST',
    })
  }

  async dismissNotification(notificationId: number) {
    return this.request(`/notifications/${notificationId}/dismiss`, {
      method: 'POST',
    })
  }

  async dismissAllNotifications() {
    return this.request('/notifications/dismiss-all', {
      method: 'POST',
    })
  }

  async deleteNotification(notificationId: number) {
    return this.request(`/notifications/${notificationId}`, {
      method: 'DELETE',
    })
  }

  // Profile endpoints
  async getProfile(userId: number) {
    return this.request(`/profile/${userId}`)
  }

  async updateProfile(data: any) {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async createPortfolioItem(data: any) {
    return this.request('/portfolio', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updatePortfolioItem(id: number, data: any) {
    return this.request(`/portfolio/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deletePortfolioItem(id: number) {
    return this.request(`/portfolio/${id}`, {
      method: 'DELETE',
    })
  }

  async createCertificate(data: any) {
    return this.request('/certificates', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateCertificate(id: number, data: any) {
    return this.request(`/certificates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteCertificate(id: number) {
    return this.request(`/certificates/${id}`, {
      method: 'DELETE',
    })
  }

  // Achievement endpoints
  async getAchievements(params?: {
    skip?: number
    limit?: number
    user_id?: number
    category?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    return this.request(`/achievements/?${searchParams.toString()}`)
  }

  async getUnlockedAchievements() {
    return this.request('/achievements/unlocked/')
  }

  async getMyAchievements(params?: {
    skip?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    return this.request(`/achievements/my/?${searchParams.toString()}`)
  }

  async getAchievementCategories() {
    return this.request('/achievements/categories/')
  }

  async getAchievementById(achievementId: number) {
    return this.request(`/achievements/${achievementId}/`)
  }

  async createAchievement(achievementData: {
    title: string
    description: string
    category: string
    points?: number
    icon_url?: string
  }) {
    return this.request('/achievements/', {
      method: 'POST',
      body: JSON.stringify(achievementData),
    })
  }

  async updateAchievement(achievementId: number, achievementData: any) {
    return this.request(`/achievements/${achievementId}/`, {
      method: 'PUT',
      body: JSON.stringify(achievementData),
    })
  }

  async deleteAchievement(achievementId: number) {
    return this.request(`/achievements/${achievementId}/`, {
      method: 'DELETE',
    })
  }

  // User level endpoint
  async getUserLevel() {
    return this.request('/achievements/user-level/')
  }
}

export const apiClient = new ApiClient()
export default apiClient 