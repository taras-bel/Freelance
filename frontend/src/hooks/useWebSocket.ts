import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useToastContext } from '../contexts/ToastContext';

interface WebSocketMessage {
  type: string;
  data?: any;
  message?: string;
  timestamp?: number;
  user_id?: number;
  group_name?: string;
}

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

export const useWebSocket = () => {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { token } = useAuthStore();
  const toast = useToastContext();

  const connect = useCallback(() => {
    if (!token) {
      const errorMsg = 'No authentication token available';
      setError(errorMsg);
      toast.error('WebSocket connection failed', errorMsg);
      return;
    }

    // Очищаем предыдущее соединение
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    try {
      // Создаем WebSocket соединение
      const wsUrl = `ws://localhost:8000/ws/${token}`;
      console.log('Attempting to connect to WebSocket:', wsUrl);
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        setError(null);
        setRetryCount(0);
        toast.success('Real-time notifications connected');
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          console.log('WebSocket message received:', message);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        
        // Обрабатываем различные коды закрытия
        if (event.code === 1000) {
          // Нормальное закрытие
          setError(null);
        } else if (event.code === 1006) {
          // Аномальное закрытие (сервер недоступен)
          const errorMsg = 'Server is not available. Please check if the backend is running.';
          setError(errorMsg);
          toast.error('Real-time notifications offline', errorMsg);
        } else if (event.code === 1008) {
          // Ошибка аутентификации
          const errorMsg = 'Authentication failed. Please log in again.';
          setError(errorMsg);
          toast.error('Authentication failed', errorMsg);
        } else {
          const errorMsg = `Connection closed: ${event.reason || `Code ${event.code}`}`;
          setError(errorMsg);
          toast.error('Connection lost', errorMsg);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        const errorMsg = 'Failed to connect to notification service';
        setError(errorMsg);
        toast.error('Connection failed', errorMsg);
        setIsConnected(false);
      };

    } catch (err) {
      console.error('Error creating WebSocket connection:', err);
      const errorMsg = 'Failed to create WebSocket connection';
      setError(errorMsg);
      toast.error('Connection failed', errorMsg);
      setIsConnected(false);
    }
  }, [token, toast]);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close(1000, 'User disconnected');
      ws.current = null;
    }
    setIsConnected(false);
    setError(null);
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
      toast.warning('Connection lost', 'Real-time notifications are currently unavailable');
    }
  }, [toast]);

  const joinGroup = useCallback((groupName: string) => {
    sendMessage({
      type: 'join_group',
      group_name: groupName
    });
  }, [sendMessage]);

  const leaveGroup = useCallback((groupName: string) => {
    sendMessage({
      type: 'leave_group',
      group_name: groupName
    });
  }, [sendMessage]);

  const ping = useCallback(() => {
    sendMessage({
      type: 'ping',
      timestamp: Date.now()
    });
  }, [sendMessage]);

  // Автоматическое подключение при изменении токена
  useEffect(() => {
    if (token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [token, connect, disconnect]);

  // Автоматический ping каждые 30 секунд для поддержания соединения
  useEffect(() => {
    if (!isConnected) return;

    const pingInterval = setInterval(() => {
      ping();
    }, 30000);

    return () => {
      clearInterval(pingInterval);
    };
  }, [isConnected, ping]);

  // Автоматическое переподключение при ошибке (с ограничением попыток)
  useEffect(() => {
    if (error && token && retryCount < 3) {
      const reconnectTimeout = setTimeout(() => {
        console.log(`Attempting to reconnect... (attempt ${retryCount + 1}/3)`);
        setRetryCount(prev => prev + 1);
        toast.info('Reconnecting...', `Attempt ${retryCount + 1} of 3`);
        connect();
      }, 5000 * (retryCount + 1)); // Увеличиваем интервал с каждой попыткой

      return () => {
        clearTimeout(reconnectTimeout);
      };
    } else if (retryCount >= 3) {
      const errorMsg = 'Failed to connect after 3 attempts. Please check your connection and try again.';
      setError(errorMsg);
      toast.error('Connection failed', errorMsg);
    }
  }, [error, token, connect, retryCount, toast]);

  // Сброс счетчика попыток при успешном подключении
  useEffect(() => {
    if (isConnected) {
      setRetryCount(0);
    }
  }, [isConnected]);

  return {
    isConnected,
    lastMessage,
    error,
    retryCount,
    connect,
    disconnect,
    sendMessage,
    joinGroup,
    leaveGroup,
    ping
  };
}; 