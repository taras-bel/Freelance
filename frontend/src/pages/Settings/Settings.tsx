import { useState } from 'react'
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  CreditCard, 
  Download,
  Eye,
  EyeOff,
  Save,
  Trash2
} from 'lucide-react'
import { useAuthStore } from '../../store/auth'
import { useThemeStore } from '../../store/theme'

interface SettingsTab {
  id: string
  name: string
  icon: React.ComponentType<{ size?: number }>
  description: string
}

const settingsTabs: SettingsTab[] = [
  {
    id: 'profile',
    name: 'Profile',
    icon: User,
    description: 'Manage your personal information and preferences'
  },
  {
    id: 'notifications',
    name: 'Notifications',
    icon: Bell,
    description: 'Configure how you receive notifications'
  },
  {
    id: 'security',
    name: 'Security',
    icon: Shield,
    description: 'Password, 2FA, and account security settings'
  },
  {
    id: 'appearance',
    name: 'Appearance',
    icon: Palette,
    description: 'Theme, colors, and display preferences'
  },
  {
    id: 'language',
    name: 'Language',
    icon: Globe,
    description: 'Language and regional settings'
  },
  {
    id: 'billing',
    name: 'Billing',
    icon: CreditCard,
    description: 'Payment methods and subscription'
  }
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const { user } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-2xl font-bold">
          {user?.first_name?.[0]}{user?.last_name?.[0]}
        </div>
        <div>
          <h3 className="text-lg font-semibold">{user?.first_name} {user?.last_name}</h3>
          <p className="text-muted-foreground">{user?.email}</p>
          <p className="text-sm text-muted-foreground">Member since {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="text-sm font-medium">First Name</label>
          <input
            type="text"
            defaultValue={user?.first_name}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div className="space-y-4">
          <label className="text-sm font-medium">Last Name</label>
          <input
            type="text"
            defaultValue={user?.last_name}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div className="space-y-4">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            defaultValue={user?.email}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div className="space-y-4">
          <label className="text-sm font-medium">Username</label>
          <input
            type="text"
            defaultValue={user?.username}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-medium">Bio</label>
        <textarea
          defaultValue={user?.bio}
          rows={4}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Tell us about yourself..."
        />
      </div>

      <div className="flex gap-3">
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Save size={16} />
          Save Changes
        </button>
        <button className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
          Cancel
        </button>
      </div>
    </div>
  )

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Email Notifications</h3>
        <div className="space-y-3">
          {[
            'New task matches',
            'Application updates',
            'Message notifications',
            'Weekly digest',
            'Security alerts'
          ].map((notification) => (
            <div key={notification} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-sm">{notification}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Push Notifications</h3>
        <div className="space-y-3">
          {[
            'Task alerts',
            'Chat messages',
            'Achievement unlocks',
            'Ranking updates'
          ].map((notification) => (
            <div key={notification} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-sm">{notification}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Change Password</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Current Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full px-3 py-2 pr-10 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">New Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Confirm New Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          Update Password
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
        <div className="p-4 border border-border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">2FA is disabled</p>
              <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
            </div>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Enable 2FA
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Danger Zone</h3>
        <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-destructive">Delete Account</p>
              <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors flex items-center gap-2">
              <Trash2 size={16} />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Theme</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Light', value: 'light', icon: '☀️' },
            { name: 'Dark', value: 'dark', icon: '🌙' },
            { name: 'System', value: 'system', icon: '💻' }
          ].map((themeOption) => (
            <button
              key={themeOption.value}
              onClick={() => toggleTheme()}
              className={`p-4 border rounded-lg text-center transition-colors ${
                theme === themeOption.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-muted'
              }`}
            >
              <div className="text-2xl mb-2">{themeOption.icon}</div>
              <div className="font-medium">{themeOption.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Accent Color</h3>
        <div className="grid grid-cols-6 gap-3">
          {['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'].map((color) => (
            <button
              key={color}
              className="w-12 h-12 rounded-lg border-2 border-border hover:border-primary transition-colors"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  )

  const renderLanguageTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Language</h3>
        <select className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent">
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="ru">Русский</option>
        </select>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Time Zone</h3>
        <select className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent">
          <option value="UTC">UTC</option>
          <option value="EST">Eastern Time</option>
          <option value="PST">Pacific Time</option>
          <option value="GMT">GMT</option>
        </select>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Date Format</h3>
        <select className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent">
          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
        </select>
      </div>
    </div>
  )

  const renderBillingTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Current Plan</h3>
        <div className="p-4 border border-border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Free Plan</p>
              <p className="text-sm text-muted-foreground">Basic features included</p>
            </div>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Upgrade
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Payment Methods</h3>
        <div className="space-y-3">
          <div className="p-4 border border-border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard size={20} />
                <div>
                  <p className="font-medium">•••• •••• •••• 4242</p>
                  <p className="text-sm text-muted-foreground">Expires 12/25</p>
                </div>
              </div>
              <button className="text-destructive hover:text-destructive/80">Remove</button>
            </div>
          </div>
          <button className="w-full p-4 border border-dashed border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary transition-colors">
            + Add Payment Method
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Billing History</h3>
        <div className="space-y-2">
          {[
            { date: '2024-01-15', amount: '$0.00', description: 'Free Plan' },
            { date: '2023-12-15', amount: '$0.00', description: 'Free Plan' },
            { date: '2023-11-15', amount: '$0.00', description: 'Free Plan' }
          ].map((invoice) => (
            <div key={invoice.date} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium">{invoice.description}</p>
                <p className="text-sm text-muted-foreground">{invoice.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{invoice.amount}</span>
                <button className="text-primary hover:text-primary/80">
                  <Download size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab()
      case 'notifications':
        return renderNotificationsTab()
      case 'security':
        return renderSecurityTab()
      case 'appearance':
        return renderAppearanceTab()
      case 'language':
        return renderLanguageTab()
      case 'billing':
        return renderBillingTab()
      default:
        return renderProfileTab()
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon size={18} />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">
                {settingsTabs.find(tab => tab.id === activeTab)?.name}
              </h2>
              <p className="text-muted-foreground">
                {settingsTabs.find(tab => tab.id === activeTab)?.description}
              </p>
            </div>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  )
} 
