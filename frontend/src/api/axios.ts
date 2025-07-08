import axios from 'axios'

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api/v1',
  withCredentials: true
})

// Добавляем токен авторизации, если есть
api.interceptors.request.use((config) => {
  // Get token from authStore instead of localStorage
  const authStore = JSON.parse(localStorage.getItem('auth-storage') || '{}')
  const token = authStore?.state?.token || null
  
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

export default api 