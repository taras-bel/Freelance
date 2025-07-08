import { useState } from 'react'
import { 
  TrendingUp,
  Star,
  Trophy,
  DollarSign,
  Users,
  Calendar,
  CheckCircle,
  Medal,
  Gem,
  Crown,
  Target,
  BarChart3,
  BookOpen,
  Zap,
  ArrowUp,
  ArrowDown,
  Activity,
  Award,
  Flame
} from 'lucide-react'
import { useAuthStore } from '../../store/auth'
import { useProgress, Skill } from '../../hooks/useProgress'
import { useAchievements, Achievement as NewAchievement, UserLevel } from '../../hooks/useAchievements'
import { LevelProgress } from '../../components/Achievements/LevelProgress'
import { AchievementCard } from '../../components/Achievements/AchievementCard'

type ProgressView = 'dashboard' | 'level' | 'skills' | 'achievements' | 'earnings' | 'performance' | 'learning'

const XPProgressCircle = ({ current, total, level }: { current: number; total: number; level: number }) => {
  const percentage = (current / total) * 100
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-muted"
        />
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="text-primary transition-all duration-1000 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-bold">{level}</div>
        <div className="text-xs text-muted-foreground">Level</div>
        <div className="text-xs text-muted-foreground">
          {current}/{total} XP
        </div>
      </div>
    </div>
  )
}

const SkillCard = ({ skill }: { skill: Skill }) => {
  const getLevelColor = (level: number) => {
    if (level >= 80) return 'text-green-500'
    if (level >= 60) return 'text-yellow-500'
    if (level >= 40) return 'text-orange-500'
    return 'text-red-500'
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 60) return 'bg-yellow-500'
    if (progress >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className="card p-6 hover:shadow-lg transition-all duration-200 hover-glow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold">{skill.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(skill.level)} bg-muted/50`}>
              Level {skill.level}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {skill.category} • {skill.tasksCompleted} tasks completed
          </p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${getLevelColor(skill.level)}`}>
            {skill.progress}%
          </div>
          <div className="text-xs text-muted-foreground">
            {skill.xp} XP
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress</span>
          <span>{skill.progress}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(skill.progress)}`}
            style={{ width: `${skill.progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Last updated: {new Date(skill.lastUpdated).toLocaleDateString()}</span>
        <div className="flex items-center gap-1">
          <TrendingUp size={12} />
          <span>+{Math.floor(skill.xp / 100)} XP this week</span>
        </div>
      </div>
    </div>
  )
}

const ProgressAchievementCard = ({ achievement }: { achievement: NewAchievement }) => {
  const getRarityColor = (category: string) => {
    const colors = {
      earnings: 'text-green-500',
      tasks: 'text-blue-500',
      interviews: 'text-purple-500',
      clients: 'text-orange-500',
      skills: 'text-cyan-500'
    }
    return colors[category as keyof typeof colors] || 'text-gray-500'
  }

  const getRarityIcon = (category: string) => {
    const icons = {
      earnings: <DollarSign size={16} />,
      tasks: <Target size={16} />,
      interviews: <Users size={16} />,
      clients: <Users size={16} />,
      skills: <BookOpen size={16} />
    }
    return icons[category as keyof typeof icons] || <Medal size={16} />
  }

  return (
    <div className={`card p-4 transition-all duration-200 ${
      achievement.is_unlocked 
        ? 'hover:shadow-lg hover-glow' 
        : 'opacity-60'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`text-2xl ${achievement.is_unlocked ? getRarityColor(achievement.category) : 'text-muted-foreground'}`}>
          {achievement.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold">{achievement.name}</h4>
            {getRarityIcon(achievement.category)}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
          
          {achievement.is_unlocked ? (
            <div className="flex items-center gap-2 text-xs text-green-600">
              <CheckCircle size={12} />
              <span>Unlocked {achievement.unlocked_at && new Date(achievement.unlocked_at).toLocaleDateString()}</span>
            </div>
          ) : achievement.progress !== undefined ? (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{achievement.progress}/{achievement.requirement_value}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1">
                <div 
                  className="bg-primary h-1 rounded-full transition-all duration-300"
                  style={{ width: `${achievement.progress_percentage}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              Locked
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const StatsCard = ({ title, value, icon: Icon, color, change }: {
  title: string;
  value: string;
  icon: any;
  color: string;
  change?: { value: number; isPositive: boolean };
}) => {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
          <Icon size={20} className={color} />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-xs ${
            change.isPositive ? 'text-green-500' : 'text-red-500'
          }`}>
            {change.isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            <span>{change.value}%</span>
          </div>
        )}
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-xs text-muted-foreground">{title}</div>
    </div>
  )
}

export default function Progress() {
  const { user } = useAuthStore()
  const {
    skills,
    xpData,
    achievements,
    stats,
    topSkills,
    categories
  } = useProgress()

  const [activeView, setActiveView] = useState<ProgressView>('dashboard')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const views = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'skills', label: 'Skills', icon: Target },
    { id: 'level', label: 'Level Progress', icon: TrendingUp },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'performance', label: 'Performance', icon: Activity },
    { id: 'learning', label: 'Learning Path', icon: BookOpen }
  ]

  const filteredSkills = selectedCategory === 'all' 
    ? skills 
    : skills.filter(skill => skill.category === selectedCategory)

  const unlockedAchievements = achievements.filter(a => a.unlocked)
  const lockedAchievements = achievements.filter(a => !a.unlocked)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold">Progress & Analytics</h1>
        <p className="text-muted-foreground">
          Track your growth and achievements, {user?.firstName || user?.username}
        </p>
      </div>

      {/* View tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
        {views.map((view) => {
          const Icon = view.icon
          const isActive = activeView === view.id
          return (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={16} />
              {view.label}
            </button>
          )
        })}
      </div>

      {/* Dashboard View */}
      {activeView === 'dashboard' && (
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard
              title="Total XP"
              value={xpData.current.toLocaleString()}
              icon={Zap}
              color="text-yellow-500"
              change={{ value: 12, isPositive: true }}
            />
            <StatsCard
              title="Level"
              value={xpData.level.toString()}
              icon={Star}
              color="text-blue-500"
            />
            <StatsCard
              title="Skills"
              value={stats.skillsCount.toString()}
              icon={Target}
              color="text-green-500"
              change={{ value: 5, isPositive: true }}
            />
            <StatsCard
              title="Achievements"
              value={`${unlockedAchievements.length}/${achievements.length}`}
              icon={Trophy}
              color="text-purple-500"
            />
          </div>

          {/* XP Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Level Progress</h3>
              <XPProgressCircle 
                current={xpData.current} 
                total={xpData.total} 
                level={xpData.level} 
              />
              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">
                  {xpData.total - xpData.current} XP to next level
                </p>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Recent XP Gains</h3>
              <div className="space-y-3">
                {xpData.recentGains.map((gain, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Zap size={14} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{gain.source}</p>
                        <p className="text-xs text-muted-foreground">{gain.date}</p>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-green-500">
                      +{gain.amount} XP
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Skills */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Top Skills</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topSkills.map((skill) => (
                <SkillCard key={skill.name} skill={skill} />
              ))}
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unlockedAchievements.slice(0, 6).map((achievement) => (
                <ProgressAchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Skills View */}
      {activeView === 'skills' && (
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              All Categories ({skills.length})
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                {category} ({skills.filter(s => s.category === category).length})
              </button>
            ))}
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map((skill) => (
              <SkillCard key={skill.name} skill={skill} />
            ))}
          </div>
        </div>
      )}

      {/* Level Progress View */}
      {activeView === 'level' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-6">Level Progression</h3>
            <div className="flex justify-center mb-8">
              <XPProgressCircle 
                current={xpData.current} 
                total={xpData.total} 
                level={xpData.level} 
              />
            </div>
            
            <div className="space-y-4">
              {xpData.recentGains.map((gain, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Zap size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{gain.source}</p>
                      <p className="text-sm text-muted-foreground">{gain.date}</p>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-green-500">
                    +{gain.amount} XP
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Achievements View */}
      {activeView === 'performance' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">All Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...unlockedAchievements, ...lockedAchievements].map((achievement) => (
                <ProgressAchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Placeholder views */}
      {(activeView === 'earnings' || activeView === 'learning') && (
        <div className="card p-8 text-center">
          <div className="text-4xl mb-4">🚧</div>
          <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
          <p className="text-muted-foreground">
            {activeView === 'earnings' 
              ? 'Earnings analytics will be available soon'
              : 'Learning path features are under development'
            }
          </p>
        </div>
      )}
    </div>
  )
} 
