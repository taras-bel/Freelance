import { useState, useEffect } from 'react'
import { 
  Trophy, 
  Star, 
  Target, 
  DollarSign, 
  Users, 
  MessageSquare,
  Calendar,
  Zap,
  Award,
  Eye,
  EyeOff,
  TrendingUp,
  Code,
  BookOpen,
  Heart,
  Crown,
  Gem,
  Flame,
  Shield
} from 'lucide-react'

export interface Achievement {
  id: string
  title: string
  description: string
  category: 'earnings' | 'tasks' | 'interviews' | 'clients' | 'skills' | 'streaks' | 'community' | 'special'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  icon: string
  progress: {
    current: number
    target: number
    unit: string
  }
  completed: boolean
  completedAt?: Date
  rewards: {
    xp: number
    badge?: string
    title?: string
    bonus?: string
  }
  requirements: string[]
}

interface AchievementSystemProps {
  achievements: Achievement[]
  onAchievementUnlocked: (achievement: Achievement) => void
}

const getRarityColor = (rarity: Achievement['rarity']) => {
  switch (rarity) {
    case 'common':
      return 'text-gray-500 border-gray-300'
    case 'rare':
      return 'text-blue-500 border-blue-300'
    case 'epic':
      return 'text-purple-500 border-purple-300'
    case 'legendary':
      return 'text-yellow-500 border-yellow-300'
    default:
      return 'text-gray-500 border-gray-300'
  }
}

const getRarityBg = (rarity: Achievement['rarity']) => {
  switch (rarity) {
    case 'common':
      return 'bg-gray-50 dark:bg-gray-900'
    case 'rare':
      return 'bg-blue-50 dark:bg-blue-900/20'
    case 'epic':
      return 'bg-purple-50 dark:bg-purple-900/20'
    case 'legendary':
      return 'bg-yellow-50 dark:bg-yellow-900/20'
    default:
      return 'bg-gray-50 dark:bg-gray-900'
  }
}

const getCategoryIcon = (category: Achievement['category']) => {
  switch (category) {
    case 'earnings':
      return <DollarSign size={16} />
    case 'tasks':
      return <Target size={16} />
    case 'interviews':
      return <MessageSquare size={16} />
    case 'clients':
      return <Users size={16} />
    case 'skills':
      return <Code size={16} />
    case 'streaks':
      return <Flame size={16} />
    case 'community':
      return <Heart size={16} />
    case 'special':
      return <Crown size={16} />
    default:
      return <Star size={16} />
  }
}

const getCategoryColor = (category: Achievement['category']) => {
  switch (category) {
    case 'earnings':
      return 'text-green-500'
    case 'tasks':
      return 'text-blue-500'
    case 'interviews':
      return 'text-purple-500'
    case 'clients':
      return 'text-orange-500'
    case 'skills':
      return 'text-cyan-500'
    case 'streaks':
      return 'text-red-500'
    case 'community':
      return 'text-pink-500'
    case 'special':
      return 'text-yellow-500'
    default:
      return 'text-gray-500'
  }
}

export default function AchievementSystem({ 
  achievements, 
  onAchievementUnlocked 
}: AchievementSystemProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | Achievement['category']>('all')
  const [activeRarity, setActiveRarity] = useState<'all' | Achievement['rarity']>('all')
  const [showCompleted, setShowCompleted] = useState(true)

  const categories = [
    { id: 'all', label: 'All', count: achievements.length },
    { id: 'earnings', label: 'Earnings', count: achievements.filter(a => a.category === 'earnings').length },
    { id: 'tasks', label: 'Tasks', count: achievements.filter(a => a.category === 'tasks').length },
    { id: 'interviews', label: 'Interviews', count: achievements.filter(a => a.category === 'interviews').length },
    { id: 'clients', label: 'Clients', count: achievements.filter(a => a.category === 'clients').length },
    { id: 'skills', label: 'Skills', count: achievements.filter(a => a.category === 'skills').length },
    { id: 'streaks', label: 'Streaks', count: achievements.filter(a => a.category === 'streaks').length },
    { id: 'community', label: 'Community', count: achievements.filter(a => a.category === 'community').length },
    { id: 'special', label: 'Special', count: achievements.filter(a => a.category === 'special').length }
  ]

  const rarities = [
    { id: 'all', label: 'All', count: achievements.length },
    { id: 'common', label: 'Common', count: achievements.filter(a => a.rarity === 'common').length },
    { id: 'rare', label: 'Rare', count: achievements.filter(a => a.rarity === 'rare').length },
    { id: 'epic', label: 'Epic', count: achievements.filter(a => a.rarity === 'epic').length },
    { id: 'legendary', label: 'Legendary', count: achievements.filter(a => a.rarity === 'legendary').length }
  ]

  const filteredAchievements = achievements.filter(achievement => {
    const matchesCategory = activeCategory === 'all' || achievement.category === activeCategory
    const matchesRarity = activeRarity === 'all' || achievement.rarity === activeRarity
    const matchesCompletion = showCompleted || !achievement.completed
    return matchesCategory && matchesRarity && matchesCompletion
  })

  const completedCount = achievements.filter(a => a.completed).length
  const totalCount = achievements.length
  const completionPercentage = Math.round((completedCount / totalCount) * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <Trophy size={20} className="text-yellow-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Achievements</h2>
            <p className="text-sm text-muted-foreground">
              {completedCount} of {totalCount} completed ({completionPercentage}%)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="rounded"
            />
            Show completed
          </label>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>{completedCount} unlocked</span>
          <span>{totalCount - completedCount} remaining</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        {/* Category Filter */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">Category</label>
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id as any)}
                className={`px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === category.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Rarity Filter */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">Rarity</label>
          <div className="flex gap-2">
            {rarities.map((rarity) => (
              <button
                key={rarity.id}
                onClick={() => setActiveRarity(rarity.id as any)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  activeRarity === rarity.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                {rarity.label} ({rarity.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => {
          const progressPercentage = Math.min((achievement.progress.current / achievement.progress.target) * 100, 100)
          const isCompleted = achievement.completed

          return (
            <div
              key={achievement.id}
              className={`card p-4 border-2 transition-all duration-300 hover:shadow-lg ${
                isCompleted 
                  ? getRarityColor(achievement.rarity)
                  : 'border-muted opacity-60'
              } ${getRarityBg(achievement.rarity)}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${
                    isCompleted ? getCategoryColor(achievement.category) : 'text-muted-foreground'
                  }`}>
                    {getCategoryIcon(achievement.category)}
                  </div>
                  <div>
                    <h3 className={`font-semibold text-sm ${
                      isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {achievement.title}
                    </h3>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        isCompleted 
                          ? getRarityColor(achievement.rarity).replace('text-', 'bg-').replace('border-', '') + '/20'
                          : 'bg-muted/50 text-muted-foreground'
                      }`}>
                        {achievement.rarity}
                      </span>
                    </div>
                  </div>
                </div>
                
                {isCompleted ? (
                  <div className="p-1 bg-yellow-500/20 rounded-full">
                    <Trophy size={16} className="text-yellow-500" />
                  </div>
                ) : (
                  <div className="p-1 bg-muted/50 rounded-full">
                    <EyeOff size={16} className="text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-3">
                {achievement.description}
              </p>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    {achievement.progress.current} / {achievement.progress.target} {achievement.progress.unit}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                        : 'bg-primary'
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Rewards */}
              {isCompleted && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="text-xs font-medium text-green-600 mb-1">Rewards</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1">
                      <Zap size={12} className="text-yellow-500" />
                      <span>{achievement.rewards.xp} XP</span>
                    </div>
                    {achievement.rewards.badge && (
                      <div className="flex items-center gap-1">
                        <Award size={12} className="text-blue-500" />
                        <span>{achievement.rewards.badge}</span>
                      </div>
                    )}
                    {achievement.rewards.title && (
                      <div className="flex items-center gap-1">
                        <Crown size={12} className="text-purple-500" />
                        <span>{achievement.rewards.title}</span>
                      </div>
                    )}
                    {achievement.rewards.bonus && (
                      <div className="flex items-center gap-1">
                        <Gem size={12} className="text-green-500" />
                        <span>{achievement.rewards.bonus}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {!isCompleted && achievement.requirements.length > 0 && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs font-medium text-muted-foreground mb-1">Requirements</div>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {achievement.requirements.map((req, index) => (
                      <li key={index} className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Completion Date */}
              {isCompleted && achievement.completedAt && (
                <div className="mt-3 text-xs text-muted-foreground">
                  Unlocked {achievement.completedAt.toLocaleDateString()}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <div className="card p-8 text-center">
          <div className="text-4xl mb-4">🏆</div>
          <h3 className="text-lg font-semibold mb-2">No achievements found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or complete more tasks to unlock achievements
          </p>
        </div>
      )}
    </div>
  )
} 
