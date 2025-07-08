import api from './axios'

export interface Chat {
  id: string
  title: string
  participants: {
    id: string
    name: string
    avatar?: string
  }[]
  last_message?: {
    id: string
    content: string
    sender_id: string
    created_at: string
  }
  unread_count: number
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  chat_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'file' | 'image'
  file_url?: string
  created_at: string
  updated_at: string
}

export interface CreateChatData {
  title: string
  participant_ids: string[]
}

export interface SendMessageData {
  content: string
  message_type?: 'text' | 'file' | 'image'
  file_url?: string
}

export const chatsApi = {
  // Получить список чатов пользователя
  getChats: async () => {
    const response = await api.get('/chats')
    return response.data
  },

  // Получить чат по ID
  getChat: async (chatId: string) => {
    const response = await api.get(`/chats/${chatId}`)
    return response.data
  },

  // Создать новый чат
  createChat: async (chatData: CreateChatData) => {
    const response = await api.post('/chats', chatData)
    return response.data
  },

  // Получить сообщения чата
  getChatMessages: async (chatId: string, limit?: number, offset?: number) => {
    const params = new URLSearchParams()
    if (limit) params.append('limit', limit.toString())
    if (offset) params.append('offset', offset.toString())
    
    const response = await api.get(`/chats/${chatId}/messages?${params.toString()}`)
    return response.data
  },

  // Отправить сообщение
  sendMessage: async (chatId: string, messageData: SendMessageData) => {
    const response = await api.post(`/chats/${chatId}/messages`, messageData)
    return response.data
  },

  // Обновить сообщение
  updateMessage: async (chatId: string, messageId: string, content: string) => {
    const response = await api.put(`/chats/${chatId}/messages/${messageId}`, { content })
    return response.data
  },

  // Удалить сообщение
  deleteMessage: async (chatId: string, messageId: string) => {
    const response = await api.delete(`/chats/${chatId}/messages/${messageId}`)
    return response.data
  },

  // Отметить сообщения как прочитанные
  markAsRead: async (chatId: string) => {
    const response = await api.post(`/chats/${chatId}/read`)
    return response.data
  },

  // Удалить чат
  deleteChat: async (chatId: string) => {
    const response = await api.delete(`/chats/${chatId}`)
    return response.data
  },

  // Загрузить файл в чат
  uploadChatFile: async (chatId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/chats/${chatId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
} 