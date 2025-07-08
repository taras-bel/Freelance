import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../../../shared/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  initializeAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      
      login: async (email: string, password: string) => {
        set({ loading: true })
        try {
          const formData = new URLSearchParams();
          formData.append('username', email); // отправляем email в поле username
          formData.append('password', password);
          
          const response = await fetch('http://localhost:8000/api/v1/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.detail || 'Login failed')
          }

          const data = await response.json()
          
          const user: User = {
            id: data.user.id.toString(),
            email: data.user.email,
            username: data.user.username,
            full_name: data.user.full_name || '',
            level: data.user.level || 1,
            experience_points: 0,
            skills: data.user.skills || [],
            created_at: data.user.created_at,
            updated_at: data.user.updated_at,
            is_verified: data.user.is_verified || false,
            is_premium: false,
            user_type: 'freelancer'
          }
          
          set({
            user: user,
            token: data.access_token,
            isAuthenticated: true,
            loading: false
          })
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },
      
      register: async (userData: any) => {
        set({ loading: true })
        try {
          const response = await fetch('http://localhost:8000/api/v1/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.detail || 'Registration failed')
          }

          const data = await response.json()
          
          const user: User = {
            id: data.user.id.toString(),
            email: data.user.email,
            username: data.user.username,
            full_name: data.user.full_name || '',
            level: data.user.level || 1,
            experience_points: 0,
            skills: data.user.skills || [],
            created_at: data.user.created_at,
            updated_at: data.user.updated_at,
            is_verified: data.user.is_verified || false,
            is_premium: false,
            user_type: 'freelancer'
          }
          
          set({
            user: user,
            token: data.access_token,
            isAuthenticated: true,
            loading: false
          })
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        })
      },
      
      initializeAuth: () => {
        const { token, user } = get()
        if (token && user) {
          set({ isAuthenticated: true })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token 
      })
    }
  )
) 