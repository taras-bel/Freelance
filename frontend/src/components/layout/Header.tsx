import { useState } from 'react'
import { Bell, Search, Sun, Moon, User, Settings, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/auth'
import { useThemeStore } from '../../store/theme'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { cn } from '../../utils/cn'

export default function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const { theme, setTheme } = useThemeStore()

  const handleLogout = () => {
    logout()
    setIsProfileOpen(false)
  }

  return (
    <header className="glass bg-glass/80 border-b border-white/10 shadow-glass backdrop-blur-xl supports-[backdrop-filter]:bg-glass/60 font-inter">
      <div className="flex h-16 items-center px-6">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon-teal icon" size={18} />
            <Input
              placeholder="Search tasks, users, or skills..."
              className="pl-10 bg-glass/60 border border-white/10 rounded-xl text-neon-teal focus:ring-neon-teal focus:border-neon-teal transition"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="icon"
          >
            {theme === 'light' ? <Moon size={20} className="icon" /> : <Sun size={20} className="icon" />}
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative icon">
            <Bell size={20} className="icon" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-neon-violet rounded-full text-xs text-white flex items-center justify-center shadow-neon">
              3
            </span>
          </Button>

          {/* Profile dropdown */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="icon"
            >
              <User size={20} className="icon" />
            </Button>

            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 glass bg-glass/90 border border-white/10 rounded-2xl shadow-glass z-50 fade-in">
                <div className="p-4 border-b border-white/10">
                  <p className="font-medium text-neon-teal font-grotesk">{user?.username || 'User'}</p>
                  <p className="text-sm text-muted-foreground font-inter">{user?.email || 'user@example.com'}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-xl hover:bg-neon-teal/10 hover:text-neon-teal font-inter icon transition"
                  >
                    <User size={16} className="icon" />
                    Profile
                  </button>
                  <button
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-xl hover:bg-neon-violet/10 hover:text-neon-violet font-inter icon transition"
                  >
                    <Settings size={16} className="icon" />
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-xl hover:bg-red-500/10 text-red-500 hover:text-red-600 font-inter icon transition"
                  >
                    <LogOut size={16} className="icon" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </header>
  )
} 
