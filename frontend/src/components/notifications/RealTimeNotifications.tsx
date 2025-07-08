import React, { useEffect, useState } from 'react';
import { Bell, X, Check, AlertCircle, Star, MessageSquare, Trophy, Briefcase, RefreshCw } from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useNotifications } from '../../hooks/useNotifications';

interface NotificationData {
  type: string;
  title: string;
  message: string;
  task_id?: number;
  review_id?: number;
  achievement_id?: number;
  chat_id?: number;
  priority: 'low' | 'medium' | 'high';
}

const RealTimeNotifications: React.FC = () => {
  const { isConnected, lastMessage, error, retryCount, connect } = useWebSocket();
  const { addNotification, markAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<NotificationData[]>([]);

  // Обработка входящих WebSocket сообщений
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'notification' && lastMessage.data) {
      const notification = lastMessage.data as NotificationData;
      
      // Добавляем в локальное состояние для отображения
      setRecentNotifications(prev => [notification, ...prev.slice(0, 4)]);
      
      // Добавляем в глобальное состояние уведомлений
      addNotification({
        id: Date.now().toString(),
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        read: false,
        timestamp: new Date(),
        data: notification
      });

      // Автоматически скрываем через 5 секунд
      setTimeout(() => {
        setRecentNotifications(prev => 
          prev.filter(n => n !== notification)
        );
      }, 5000);
    }
  }, [lastMessage, addNotification]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_task':
        return <Briefcase className="w-4 h-4 text-blue-500" />;
      case 'task_assigned':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'new_review':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'achievement_unlocked':
        return <Trophy className="w-4 h-4 text-purple-500" />;
      case 'new_message':
        return <MessageSquare className="w-4 h-4 text-cyan-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const handleNotificationClick = (notification: NotificationData) => {
    // Обработка клика по уведомлению
    switch (notification.type) {
      case 'new_task':
        // Переход к задаче
        console.log('Navigate to task:', notification.task_id);
        break;
      case 'task_assigned':
        // Переход к назначенной задаче
        console.log('Navigate to assigned task:', notification.task_id);
        break;
      case 'new_review':
        // Переход к отзыву
        console.log('Navigate to review:', notification.review_id);
        break;
      case 'achievement_unlocked':
        // Переход к достижению
        console.log('Navigate to achievement:', notification.achievement_id);
        break;
      case 'new_message':
        // Переход к чату
        console.log('Navigate to chat:', notification.chat_id);
        break;
    }
    
    // Удаляем из локального состояния
    setRecentNotifications(prev => 
      prev.filter(n => n !== notification)
    );
  };

  const removeNotification = (notification: NotificationData) => {
    setRecentNotifications(prev => 
      prev.filter(n => n !== notification)
    );
  };

  const handleRetryConnection = () => {
    connect();
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {/* Индикатор статуса соединения */}
      <div className="flex items-center justify-end">
        <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Уведомления */}
      {recentNotifications.map((notification, index) => (
        <div
          key={`${notification.type}-${index}`}
          className={`
            relative max-w-sm w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg 
            border-l-4 p-4 transform transition-all duration-300 ease-out
            hover:scale-105 cursor-pointer
            ${getPriorityColor(notification.priority)}
          `}
          onClick={() => handleNotificationClick(notification)}
        >
          {/* Кнопка закрытия */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeNotification(notification);
            }}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Иконка */}
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {getNotificationIcon(notification.type)}
            </div>

            {/* Контент */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {notification.message}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date().toLocaleTimeString()}
                </span>
                <span className={`
                  text-xs px-2 py-1 rounded-full
                  ${notification.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}
                `}>
                  {notification.priority}
                </span>
              </div>
            </div>
          </div>

          {/* Анимация появления */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
        </div>
      ))}

      {/* Ошибка соединения */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 max-w-sm">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                {error}
              </p>
              {retryCount > 0 && retryCount < 3 && (
                <p className="text-xs text-red-600 dark:text-red-400 mb-2">
                  Retry attempt {retryCount}/3
                </p>
              )}
              {retryCount >= 3 && (
                <button
                  onClick={handleRetryConnection}
                  className="flex items-center space-x-1 text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry connection</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Информация о статусе */}
      {!isConnected && !error && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 max-w-sm">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-yellow-700 dark:text-yellow-300">
              Connecting to notification service...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeNotifications; 
