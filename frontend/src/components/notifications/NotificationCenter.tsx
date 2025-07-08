import { useState, useEffect } from 'react'
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Star,
  MessageSquare,
  Target,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Settings,
  Trash2,
  Loader2,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface Notification {
  id: string
  type: 'success' | 'warning' | 'info' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  action?: {
    label: string
    onClick: () => void
  }
  category: 'task' | 'interview' | 'message' | 'achievement' | 'reminder' | 'system'
}

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
  onMarkAllAsRead: () => void
  loading?: boolean
  error?: string | null
  wsConnected?: boolean
  onRetry?: () => void
  onRefresh?: () => void
}

// Skeleton component for loading state
const NotificationSkeleton = () => (
  <div className="p-4 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-4 h-4 bg-muted rounded-full mt-1"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-3 bg-muted rounded w-full"></div>
        <div className="h-3 bg-muted rounded w-1/2"></div>
      </div>
    </div>
  </div>
)

// Error state component
const ErrorState = ({ error, onRetry }: { error: string; onRetry?: () => void }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8">
    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
      <AlertCircle size={32} className="text-red-500" />
    </div>
    <h3 className="text-lg font-semibold mb-2">Failed to load notifications</h3>
    <p className="text-muted-foreground mb-4 max-w-sm">{error}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
      >
        <RefreshCw size={16} />
        Try again
      </button>
    )}
  </div>
)

// Empty state component
const EmptyState = ({ searchQuery, activeFilter }: { searchQuery: string; activeFilter: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center h-full text-center p-8"
  >
    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
      <Bell size={32} className="text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold mb-2">
      {searchQuery || activeFilter !== 'all' ? 'No matching notifications' : 'No notifications yet'}
    </h3>
    <p className="text-muted-foreground max-w-sm">
      {searchQuery || activeFilter !== 'all' 
        ? 'Try adjusting your search or filters'
        : 'You\'re all caught up! New notifications will appear here.'
      }
    </p>
  </motion.div>
)

// WebSocket status indicator
const WebSocketStatus = ({ connected }: { connected?: boolean }) => (
  <div className="flex items-center gap-2 text-xs">
    <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
    <span className="text-muted-foreground">
      {connected ? 'Real-time' : 'Offline'}
    </span>
  </div>
)

const getNotificationIcon = (type: Notification['type'], category: Notification['category']) => {
  if (category === 'achievement') return <Star size={16} className="text-yellow-500" />
  if (category === 'message') return <MessageSquare size={16} className="text-blue-500" />
  if (category === 'task') return <Target size={16} className="text-green-500" />
  if (category === 'reminder') return <Calendar size={16} className="text-purple-500" />
  
  switch (type) {
    case 'success':
      return <CheckCircle size={16} className="text-green-500" />
    case 'warning':
      return <AlertCircle size={16} className="text-yellow-500" />
    case 'error':
      return <AlertCircle size={16} className="text-red-500" />
    default:
      return <Info size={16} className="text-blue-500" />
  }
}

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return 'border-green-500/20 bg-green-500/10'
    case 'warning':
      return 'border-yellow-500/20 bg-yellow-500/10'
    case 'error':
      return 'border-red-500/20 bg-red-500/10'
    default:
      return 'border-blue-500/20 bg-blue-500/10'
  }
}

export default function NotificationCenter({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onDelete,
  onMarkAllAsRead,
  loading = false,
  error = null,
  wsConnected = false,
  onRetry,
  onRefresh
}: NotificationCenterProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'achievement' | 'task' | 'message'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = activeFilter === 'all' || 
      (activeFilter === 'unread' && !notification.read) ||
      notification.category === activeFilter
    
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const categories = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'unread', label: 'Unread', count: unreadCount },
    { id: 'achievement', label: 'Achievements', count: notifications.filter(n => n.category === 'achievement').length },
    { id: 'task', label: 'Tasks', count: notifications.filter(n => n.category === 'task').length },
    { id: 'message', label: 'Messages', count: notifications.filter(n => n.category === 'message').length }
  ]

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  const handleMarkAsRead = async (id: string) => {
    setActionLoading(id)
    try {
      await onMarkAsRead(id)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id: string) => {
    setActionLoading(id)
    try {
      await onDelete(id)
    } finally {
      setActionLoading(null)
    }
  }

  const handleMarkAllAsRead = async () => {
    setActionLoading('all')
    try {
      await onMarkAllAsRead()
    } finally {
      setActionLoading(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl h-[80vh] bg-background border border-border rounded-lg shadow-xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bell size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Notifications</h2>
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
                <WebSocketStatus connected={wsConnected} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
                title="Refresh notifications"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              </button>
            )}
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={actionLoading === 'all'}
                className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                {actionLoading === 'all' ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <CheckCircle size={12} />
                )}
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="p-4 border-b border-border">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Bell className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveFilter(category.id as any)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeFilter === category.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {category.label} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                {[...Array(5)].map((_, i) => (
                  <NotificationSkeleton key={i} />
                ))}
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ErrorState error={error} onRetry={onRetry} />
              </motion.div>
            ) : filteredNotifications.length > 0 ? (
              <motion.div
                key="notifications"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="divide-y divide-border"
              >
                {filteredNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 hover:bg-muted/50 transition-colors ${
                      !notification.read ? 'bg-blue-500/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type, notification.category)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notification.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(notification.timestamp)}
                              </span>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                disabled={actionLoading === notification.id}
                                className="p-1 hover:bg-muted rounded transition-colors disabled:opacity-50"
                                title="Mark as read"
                              >
                                {actionLoading === notification.id ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <CheckCircle size={14} />
                                )}
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification.id)}
                              disabled={actionLoading === notification.id}
                              className="p-1 hover:bg-red-500/10 text-red-500 rounded transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              {actionLoading === notification.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Trash2 size={14} />
                              )}
                            </button>
                          </div>
                        </div>
                        
                        {notification.action && (
                          <button
                            onClick={notification.action.onClick}
                            className="mt-2 px-3 py-1 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                          >
                            {notification.action.label}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <EmptyState searchQuery={searchQuery} activeFilter={activeFilter} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
} 
