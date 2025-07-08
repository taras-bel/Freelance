import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '../api/client'
import { useWebSocket } from './useWebSocket'
import { useToastContext } from '../contexts/ToastContext'

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'task' | 'application' | 'message' | 'payment' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_read: boolean;
  is_dismissed: boolean;
  action_url?: string;
  action_text?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  dismissed: number;
  by_category: Record<string, number>;
  by_priority: Record<string, number>;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Use the main WebSocket hook
  const { isConnected: wsConnected, lastMessage } = useWebSocket()
  
  // Use global toast context for user feedback
  const toast = useToastContext()

  // Получение уведомлений
  const fetchNotifications = useCallback(async (page: number = 1, limit: number = 20) => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.getNotifications(page, limit)
      if (response.data && Array.isArray(response.data)) {
        setNotifications(response.data)
      } else if (response.data && typeof response.data === 'object' && 'items' in response.data && Array.isArray((response.data as any).items)) {
        setNotifications((response.data as any).items)
      } else {
        setNotifications([])
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch notifications'
      setError(errorMessage)
      toast.error('Failed to load notifications', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Получение статистики
  const fetchStats = useCallback(async () => {
    try {
      const response = await apiClient.getNotificationStats()
      if (response.data && typeof response.data === 'object') {
        setStats(response.data as NotificationStats)
      } else {
        setStats(null)
      }
    } catch (err: any) {
      console.error('Failed to fetch notification stats:', err)
      // Don't show toast for stats errors as they're not critical
    }
  }, [])

  // Handle WebSocket messages for notifications
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'notification') {
      // Add new notification to the beginning of the list
      setNotifications(prev => [lastMessage.data, ...prev])
      // Update stats
      fetchStats()
      
      // Show toast for new notification
      if (lastMessage.data && lastMessage.data.title) {
        toast.info('New notification', lastMessage.data.title)
      }
    }
  }, [lastMessage, fetchStats, toast])

  // Отметить как прочитанное
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await apiClient.markNotificationAsRead(notificationId)
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      )
      fetchStats()
      toast.success('Notification marked as read')
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to mark notification as read'
      toast.error('Failed to mark as read', errorMessage)
      throw err // Re-throw to let UI handle the error state
    }
  }, [fetchStats, toast])

  // Отметить все как прочитанные
  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient.markAllNotificationsAsRead()
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      )
      fetchStats()
      toast.success('All notifications marked as read')
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to mark all notifications as read'
      toast.error('Failed to mark all as read', errorMessage)
      throw err
    }
  }, [fetchStats, toast])

  // Отклонить уведомление
  const dismissNotification = useCallback(async (notificationId: number) => {
    try {
      await apiClient.dismissNotification(notificationId)
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_dismissed: true }
            : notif
        )
      )
      fetchStats()
      toast.success('Notification dismissed')
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to dismiss notification'
      toast.error('Failed to dismiss notification', errorMessage)
      throw err
    }
  }, [fetchStats, toast])

  // Отклонить все уведомления
  const dismissAllNotifications = useCallback(async () => {
    try {
      await apiClient.dismissAllNotifications()
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_dismissed: true }))
      )
      fetchStats()
      toast.success('All notifications dismissed')
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to dismiss all notifications'
      toast.error('Failed to dismiss all notifications', errorMessage)
      throw err
    }
  }, [fetchStats, toast])

  // Удалить уведомление
  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      await apiClient.deleteNotification(notificationId)
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
      fetchStats()
      toast.success('Notification deleted')
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to delete notification'
      toast.error('Failed to delete notification', errorMessage)
      throw err
    }
  }, [fetchStats, toast])

  // Фильтрация уведомлений
  const getFilteredNotifications = useCallback((filters: {
    category?: string;
    priority?: string;
    is_read?: boolean;
    is_dismissed?: boolean;
  } = {}) => {
    return notifications.filter(notif => {
      if (filters.category && notif.category !== filters.category) return false;
      if (filters.priority && notif.priority !== filters.priority) return false;
      if (filters.is_read !== undefined && notif.is_read !== filters.is_read) return false;
      if (filters.is_dismissed !== undefined && notif.is_dismissed !== filters.is_dismissed) return false;
      return true;
    });
  }, [notifications]);

  // Загрузка начальных данных
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      fetchNotifications()
      fetchStats()
    } else {
      console.log('No auth token, skipping notification fetch')
    }
  }, [fetchNotifications, fetchStats])

  return {
    notifications,
    stats,
    loading,
    error,
    wsConnected,
    fetchNotifications,
    fetchStats,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    dismissAllNotifications,
    deleteNotification,
    getFilteredNotifications,
  }
} 