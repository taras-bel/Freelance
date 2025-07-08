import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { cn } from '../../utils/cn';
import NotificationCenter from '../notifications/NotificationCenter';

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    wsConnected,
    fetchNotifications
  } = useNotifications();

  // Получаем непрочитанные уведомления
  const unreadNotifications = notifications.filter(n => !n.is_read && !n.is_dismissed);
  const unreadCount = unreadNotifications.length;

  // Преобразуем уведомления в формат, ожидаемый NotificationCenter
  const transformedNotifications = notifications.map(notification => ({
    id: notification.id.toString(),
    type: notification.type as 'success' | 'warning' | 'info' | 'error',
    title: notification.title,
    message: notification.message,
    timestamp: new Date(notification.created_at),
    read: notification.is_read,
    category: notification.category as 'task' | 'interview' | 'message' | 'achievement' | 'reminder' | 'system',
    action: notification.action_url ? {
      label: notification.action_text || 'View',
      onClick: () => {
        // Handle action click
        console.log('Action clicked:', notification.action_url);
      }
    } : undefined
  }));

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(parseInt(id));
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(parseInt(id));
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  return (
    <>
      {/* Кнопка колокольчика */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'relative p-2 rounded-lg transition-all duration-200',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          'focus:outline-none focus:ring-2 focus:ring-blue-500'
        )}
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        
        {/* Индикатор непрочитанных */}
        {unreadCount > 0 && (
          <span className={cn(
            'absolute -top-1 -right-1 min-w-[18px] h-[18px]',
            'flex items-center justify-center text-xs font-medium',
            'bg-red-500 text-white rounded-full',
            'animate-pulse'
          )}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        
        {/* Индикатор WebSocket подключения */}
        <div className={cn(
          'absolute -bottom-1 -right-1 w-2 h-2 rounded-full',
          wsConnected ? 'bg-green-500' : 'bg-gray-400'
        )} />
      </button>

      {/* Notification Center Modal */}
      <NotificationCenter
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        notifications={transformedNotifications}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDelete}
        onMarkAllAsRead={handleMarkAllAsRead}
        loading={loading}
        error={error}
        wsConnected={wsConnected}
        onRetry={fetchNotifications}
        onRefresh={fetchNotifications}
      />
    </>
  );
}; 
