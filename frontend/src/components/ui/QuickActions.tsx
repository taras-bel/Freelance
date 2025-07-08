import { useState } from 'react'
import { 
  Plus, 
  Search, 
  MessageSquare, 
  TrendingUp, 
  Settings,
  X,
  Briefcase,
  User,
  Trophy,
  Target,
  Zap
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Modal from './Modal'
import { Button } from './Button'
import { Card, CardContent, CardHeader, CardTitle } from './Card'

interface QuickAction {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  href?: string
  action?: () => void
  color?: string
}

const quickActions: QuickAction[] = [
  {
    id: 'create-task',
    name: 'Create Task',
    description: 'Post a new task for freelancers',
    icon: Plus,
    href: '/create-task',
    color: 'bg-blue-500'
  },
  {
    id: 'browse-tasks',
    name: 'Browse Tasks',
    description: 'Find tasks that match your skills',
    icon: Briefcase,
    href: '/tasks',
    color: 'bg-green-500'
  },
  {
    id: 'start-interview',
    name: 'AI Interview',
    description: 'Practice with AI-powered interviews',
    icon: User,
    href: '/interview',
    color: 'bg-purple-500'
  },
  {
    id: 'view-progress',
    name: 'View Progress',
    description: 'Track your skills and achievements',
    icon: TrendingUp,
    href: '/progress',
    color: 'bg-orange-500'
  },
  {
    id: 'check-ranking',
    name: 'Check Ranking',
    description: 'See your position in leaderboards',
    icon: Trophy,
    href: '/ranking',
    color: 'bg-yellow-500'
  },
  {
    id: 'open-chats',
    name: 'Open Chats',
    description: 'View your conversations',
    icon: MessageSquare,
    href: '/chats',
    color: 'bg-pink-500'
  },
  {
    id: 'find-tasks',
    name: 'Find Tasks',
    description: 'Browse available tasks',
    icon: Target,
    href: '/tasks',
    color: 'bg-green-500/10 text-green-500'
  },
  {
    id: 'ai-assistant',
    name: 'AI Assistant',
    description: 'Get AI help',
    icon: Zap,
    href: '/ai',
    color: 'bg-cyan-500/10 text-cyan-500'
  }
]

export default function QuickActions() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus size={24} />
        </Button>
      </div>

      {/* Quick Actions Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40">
          <Card className="w-80 shadow-xl border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.id}
                    onClick={() => {
                      // Handle navigation here
                      setIsOpen(false)
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{action.name}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </button>
                )
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
} 
