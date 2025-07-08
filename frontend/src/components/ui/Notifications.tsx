import { useState } from 'react'
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Clock,
  MessageSquare,
  DollarSign,
  Award
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Notification {
  id: string
  type: 'success' | 'warning' | 'info' | 'error'
  title: string
  message: string
  time: string
  read: boolean
  action?: {
    label: string
    href: string
  }
}

const notifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Payment Received',
    message: 'You received $1,200 for React Component Library project',
    time: '2 minutes ago',
    read: false,
    action: {
      label: 'View Details',
      href: '/payments'
    }
  },
  {
    id: '2',
    type: 'info',
    title: 'New Task Match',
    message: 'A new task matches your skills: "Mobile App UI Design"',
    time: '15 minutes ago',
    read: false,
    action: {
      label: 'View Task',
      href: '/tasks'
    }
  },
  {
    id: '3',
    type: 'success',
    title: 'Interview Passed',
    message: 'Congratulations! You passed the AI interview for React Patterns',
    time: '1 hour ago',
    read: true
  },
  {
    id: '4',
    type: 'warning',
    title: 'Deadline Approaching',
    message: 'Task "API Documentation" is due in 2 days',
    time: '2 hours ago',
    read: false,
    action: {
      label: 'View Task',
      href: '/tasks'
    }
  },
  {
    id: '5',
    type: 'success',
    title: 'Achievement Unlocked',
    message: 'You earned the "Speed Demon" badge for completing 10 tasks this week',
    time: '1 day ago',
    read: true
  }
]

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success': return <CheckCircle size={16} />
    case 'warning': return <AlertCircle size={16} />
    case 'error': return <AlertCircle size={16} />
    case 'info': return <Info size={16} />
    default: return <Bell size={16} />
  }
}

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'success': return 'text-green-500 bg-green-500/10'
    case 'warning': return 'text-yellow-500 bg-yellow-500/10'
    case 'error': return 'text-red-500 bg-red-500/10'
    case 'info': return 'text-blue-500 bg-blue-500/10'
    default: return 'text-muted-foreground bg-muted/50'
  }
}

export default function Notifications() {
  const [isOpen, setIsOpen] = useState(false)
  const [notificationsList, setNotificationsList] = useState(notifications)

  const unreadCount = notificationsList.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotificationsList(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotificationsList(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotificationsList(prev => prev.filter(n => n.id !== id))
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </button>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notificationsList.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Bell size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                <div className="p-2">
                  {notificationsList.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`group relative p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                        notification.read 
                          ? 'hover:bg-muted/30' 
                          : 'bg-primary/5 hover:bg-primary/10'
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      {/* Unread indicator */}
                      {!notification.read && (
                        <div className="absolute top-3 left-3 w-2 h-2 bg-primary rounded-full" />
                      )}

                      <div className="flex gap-3 pl-4">
                        <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm mb-1">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{notification.time}</span>
                            
                            {notification.action && (
                              <button className="text-xs text-primary hover:text-primary/80 transition-colors">
                                {notification.action.label}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-muted/50 transition-all duration-200"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notificationsList.length > 0 && (
              <div className="p-3 border-t border-border">
                <button className="w-full text-sm text-primary hover:text-primary/80 transition-colors">
                  View all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
} 
