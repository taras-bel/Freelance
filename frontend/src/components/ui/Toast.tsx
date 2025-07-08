import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  Loader2 
} from 'lucide-react'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'loading'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastProps {
  toast: Toast
  onRemove: (id: string) => void
}

const getToastIcon = (type: Toast['type']) => {
  switch (type) {
    case 'success':
      return <CheckCircle size={20} className="text-green-500" />
    case 'error':
      return <AlertCircle size={20} className="text-red-500" />
    case 'warning':
      return <AlertCircle size={20} className="text-yellow-500" />
    case 'loading':
      return <Loader2 size={20} className="text-blue-500 animate-spin" />
    default:
      return <Info size={20} className="text-blue-500" />
  }
}

const getToastColor = (type: Toast['type']) => {
  switch (type) {
    case 'success':
      return 'border-green-500/20 bg-green-500/5'
    case 'error':
      return 'border-red-500/20 bg-red-500/5'
    case 'warning':
      return 'border-yellow-500/20 bg-yellow-500/5'
    case 'loading':
      return 'border-blue-500/20 bg-blue-500/5'
    default:
      return 'border-blue-500/20 bg-blue-500/5'
  }
}

const ToastItem = ({ toast, onRemove }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (toast.duration && toast.duration > 0 && toast.type !== 'loading') {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onRemove(toast.id), 300) // Wait for exit animation
      }, toast.duration)

      return () => clearTimeout(timer)
    }
  }, [toast.duration, toast.type, toast.id, onRemove])

  const handleRemove = () => {
    setIsVisible(false)
    setTimeout(() => onRemove(toast.id), 300)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.3 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`relative flex items-start gap-3 p-4 rounded-lg border ${getToastColor(toast.type)} shadow-lg backdrop-blur-sm`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getToastIcon(toast.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-foreground">
          {toast.title}
        </h4>
        {toast.message && (
          <p className="text-sm text-muted-foreground mt-1">
            {toast.message}
          </p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 px-3 py-1 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      
      <button
        onClick={handleRemove}
        className="flex-shrink-0 p-1 hover:bg-muted/50 rounded transition-colors"
      >
        <X size={16} className="text-muted-foreground" />
      </button>
    </motion.div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

export const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Toast hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    setToasts(prev => [...prev, newToast])
    return id
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const success = (title: string, message?: string, duration = 4000) => {
    return addToast({ type: 'success', title, message, duration })
  }

  const error = (title: string, message?: string, duration = 6000) => {
    return addToast({ type: 'error', title, message, duration })
  }

  const warning = (title: string, message?: string, duration = 5000) => {
    return addToast({ type: 'warning', title, message, duration })
  }

  const info = (title: string, message?: string, duration = 4000) => {
    return addToast({ type: 'info', title, message, duration })
  }

  const loading = (title: string, message?: string) => {
    return addToast({ type: 'loading', title, message, duration: 0 })
  }

  const dismiss = (id: string) => {
    removeToast(id)
  }

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    loading,
    dismiss
  }
} 
