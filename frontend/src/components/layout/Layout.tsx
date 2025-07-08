import { ReactNode, useState } from 'react'
import { Sidebar } from './Sidebar'
import Header from './Header'
import XPWidget from './XPWidget'
import QuickActions from '../ui/QuickActions'
import Breadcrumbs from '../ui/Breadcrumbs'
import AIAssistant from './AIAssistant'
import RealTimeNotifications from '../notifications/RealTimeNotifications'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />
        
        {/* Content area */}
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6">
            <Breadcrumbs />
            {children}
          </main>
          <div className="w-80 p-6 border-l border-border overflow-y-auto">
            <div className="space-y-6">
              <XPWidget 
                currentXP={2450}
                totalXP={3000}
                level={3}
                nextLevel={4}
              />
              {/* AI Assistant placeholder - will be rendered as floating widget */}
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <QuickActions />
      
      {/* AI Assistant */}
      <AIAssistant 
        isOpen={isAIAssistantOpen}
        onToggle={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
      />
      
      {/* Real-time Notifications */}
      <RealTimeNotifications />
    </div>
  )
} 
