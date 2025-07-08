// Export the main API client
export { apiClient as api } from './client'

// Export individual API modules
export * from './payments'
export * from './reviews'
export * from './ai'
export * from './chats'
export * from './tasks'

// Re-export axios instance if needed
export { default as axios } from './axios' 