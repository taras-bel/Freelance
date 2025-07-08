import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function Breadcrumbs() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  const breadcrumbMap: Record<string, string> = {
    dashboard: 'Dashboard',
    tasks: 'Tasks',
    interview: 'Interview',
    progress: 'Progress',
    ranking: 'Ranking',
    community: 'Community',
    ai: 'AI Assistant',
    finance: 'Finance',
    wallet: 'Wallet',
    'payment-methods': 'Payment Methods',
    goals: 'Goals',
    budgets: 'Budgets',
    profile: 'Profile',
    settings: 'Settings',
    notifications: 'Notifications',
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home size={16} />
        <span>Home</span>
      </Link>
      
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`
        const isLast = index === pathnames.length - 1
        const displayName = breadcrumbMap[name] || name

        return (
          <div key={name} className="flex items-center space-x-1">
            <ChevronRight size={16} />
            {isLast ? (
              <span className="text-foreground font-medium">{displayName}</span>
            ) : (
              <Link
                to={routeTo}
                className="hover:text-foreground transition-colors"
              >
                {displayName}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
} 
