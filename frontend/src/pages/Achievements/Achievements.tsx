import { useState } from 'react'
import { useAchievements } from '../../hooks/useAchievements'
import AchievementSystem, { Achievement } from '../../components/achievements/AchievementSystem'
import { useNotifications } from '../../hooks/useNotifications'
import { 
  Trophy, 
  Star, 
  TrendingUp, 
  Calendar,
  Award,
  Zap,
  Target,
  Users,
  MessageSquare,
  DollarSign,
  Code,
  Flame,
  Heart,
  Crown,
  BarChart3,
  Filter,
  Search,
  RefreshCw,
  Settings,
  EyeOff
} from 'lucide-react'

export default function Achievements() {
  const { 
    achievements, 
    loading, 
    error, 
    updateProgress, 
    unlockAchievement, 
    resetAchievements,
    getStats,
    getRecentAchievements,
    getNextAchievements
  } = useAchievements()
  
  const { addNotification } = useNotifications()
  const [showStats, setShowStats] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const stats = getStats()
  const recentAchievements = getRecentAchievements(3)
  const nextAchievements = getNextAchievements(3)

  const handleAchievementUnlocked = (achievement: Achievement) => {
    addNotification({
      id: Date.now().toString(),
      type: 'success',
      title: 'Achievement Unlocked!',
      message: `Congratulations! You've unlocked "${achievement.title}"`,
      duration: 5000
    })
  }

  const handleUnlockTest = (achievementId: string) => {
    const unlocked = unlockAchievement(achievementId)
    if (unlocked) {
      handleAchievementUnlocked(unlocked)
    }
  }

  const filteredAchievements = achievements.filter(achievement =>
    achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    achievement.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-6 text-center">
        <div className="text-red-500 mb-4">⚠️</div>
        <h3 className="text-lg font-semibold mb-2">Error Loading Achievements</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <Trophy size={20} className="text-yellow-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Achievements</h1>
            <p className="text-muted-foreground">
              Track your progress and unlock rewards
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="btn btn-outline btn-sm"
          >
            <BarChart3 size={16} />
            {showStats ? 'Hide' : 'Show'} Stats
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="btn btn-outline btn-sm"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics Panel */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Overall Progress */}
          <div className="card p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Target size={16} className="text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completion</p>
                <p className="text-xl font-bold">{stats.completionRate}%</p>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completed} of {stats.total} unlocked
            </p>
          </div>

          {/* Total XP */}
          <div className="card p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Zap size={16} className="text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total XP</p>
                <p className="text-xl font-bold">{stats.totalXP.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Earned from achievements
            </p>
          </div>

          {/* Rarity Distribution */}
          <div className="card p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Award size={16} className="text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rarest</p>
                <p className="text-xl font-bold">
                  {achievements.filter(a => a.rarity === 'legendary' && a.completed).length}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Legendary achievements
            </p>
          </div>

          {/* Streak */}
          <div className="card p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp size={16} className="text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-xl font-bold">
                  {recentAchievements.filter(a => {
                    const weekAgo = new Date()
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    return a.completedAt && a.completedAt > weekAgo
                  }).length}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Achievements unlocked
            </p>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Achievements */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Achievements</h3>
            <Calendar size={16} className="text-muted-foreground" />
          </div>
          
          {recentAchievements.length > 0 ? (
            <div className="space-y-3">
              {recentAchievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    achievement.rarity === 'legendary' ? 'bg-yellow-500/20' :
                    achievement.rarity === 'epic' ? 'bg-purple-500/20' :
                    achievement.rarity === 'rare' ? 'bg-blue-500/20' :
                    'bg-gray-500/20'
                  }`}>
                    <Trophy size={16} className={
                      achievement.rarity === 'legendary' ? 'text-yellow-500' :
                      achievement.rarity === 'epic' ? 'text-purple-500' :
                      achievement.rarity === 'rare' ? 'text-blue-500' :
                      'text-gray-500'
                    } />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {achievement.completedAt?.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                    +{achievement.rewards.xp} XP
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No recent achievements
            </p>
          )}
        </div>

        {/* Next Achievements */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Next Achievements</h3>
            <Target size={16} className="text-muted-foreground" />
          </div>
          
          {nextAchievements.length > 0 ? (
            <div className="space-y-3">
              {nextAchievements.map((achievement) => {
                const progressPercentage = Math.min(
                  (achievement.progress.current / achievement.progress.target) * 100, 
                  100
                )
                
                return (
                  <div key={achievement.id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                        <EyeOff size={12} className="text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{achievement.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {achievement.progress.current} / {achievement.progress.target} {achievement.progress.unit}
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div 
                        className="bg-primary h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              All achievements completed!
            </p>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search achievements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => handleUnlockTest('hundred-earner')}
            className="btn btn-outline btn-sm"
          >
            Test Unlock
          </button>
          
          <button
            onClick={resetAchievements}
            className="btn btn-outline btn-sm"
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Achievements System */}
      <AchievementSystem 
        achievements={filteredAchievements}
        onAchievementUnlocked={handleAchievementUnlocked}
      />

      {/* Category Breakdown */}
      <div className="card p-6">
        <h3 className="font-semibold mb-4">Achievement Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats.byCategory).map(([category, count]) => {
            const completed = achievements.filter(a => a.category === category && a.completed).length
            const percentage = Math.round((completed / count) * 100)
            
            return (
              <div key={category} className="text-center">
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-2">
                  {category === 'earnings' && <DollarSign size={20} className="text-green-500" />}
                  {category === 'tasks' && <Target size={20} className="text-blue-500" />}
                  {category === 'interviews' && <MessageSquare size={20} className="text-purple-500" />}
                  {category === 'clients' && <Users size={20} className="text-orange-500" />}
                  {category === 'skills' && <Code size={20} className="text-cyan-500" />}
                  {category === 'streaks' && <Flame size={20} className="text-red-500" />}
                  {category === 'community' && <Heart size={20} className="text-pink-500" />}
                  {category === 'special' && <Crown size={20} className="text-yellow-500" />}
                </div>
                <p className="text-sm font-medium capitalize">{category}</p>
                <p className="text-xs text-muted-foreground">
                  {completed}/{count} ({percentage}%)
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 
