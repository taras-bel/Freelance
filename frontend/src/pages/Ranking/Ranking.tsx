import { useState } from 'react'
import { 
  Search, 
  Trophy,
  Star,
  Crown,
  Medal,
  Gem,
  Users,
  Target,
  Calendar,
  Clock,
  Eye,
  Heart,
  Share2,
  MoreHorizontal,
  Plus,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Video,
  Wrench,
  Globe
} from 'lucide-react'
import { useAuthStore } from '../../store/auth'
import { useRanking, LeaderboardUser, Achievement, Competition } from '../../hooks/useRanking'

const LeaderboardCard = ({ user, rank }: { user: LeaderboardUser; rank: number }) => {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={20} className="text-yellow-500" />
    if (rank === 2) return <Medal size={20} className="text-gray-400" />
    if (rank === 3) return <Medal size={20} className="text-amber-600" />
    return <span className="text-lg font-bold text-muted-foreground">{rank}</span>
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500/10 border-yellow-500/20'
    if (rank === 2) return 'bg-gray-500/10 border-gray-500/20'
    if (rank === 3) return 'bg-amber-500/10 border-amber-500/20'
    return 'bg-muted/50 border-border'
  }

  return (
    <div className={`card p-4 border-2 transition-all duration-200 hover:shadow-lg hover-glow ${getRankColor(rank)}`}>
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
          {getRankIcon(rank)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold">{user.name}</h3>
            {user.isVerified && (
              <CheckCircle size={14} className="text-blue-500" />
            )}
            <span className="text-sm text-muted-foreground">@{user.username}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Trophy size={14} />
              <span>Level {user.level}</span>
            </div>
            <div className="flex items-center gap-1">
              <Target size={14} />
              <span>{user.tasksCompleted} tasks</span>
            </div>
            <div className="flex items-center gap-1">
              <Star size={14} />
              <span>{user.rating} rating</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{user.xp.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">XP</div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {user.skills.slice(0, 3).map((skill: string) => (
            <span
              key={skill}
              className="px-2 py-1 bg-muted/50 text-xs rounded-full text-muted-foreground"
            >
              {skill}
            </span>
          ))}
          {user.skills.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{user.skills.length - 3} more
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {user.trend === 'up' && <ArrowUp size={14} className="text-green-500" />}
          {user.trend === 'down' && <ArrowDown size={14} className="text-red-500" />}
          <span className={`text-xs ${user.trend === 'up' ? 'text-green-500' : user.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'}`}>
            {user.trend === 'up' ? 'Rising' : user.trend === 'down' ? 'Falling' : 'Stable'}
          </span>
        </div>
      </div>
    </div>
  )
}

const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'text-gray-500',
      rare: 'text-blue-500',
      epic: 'text-purple-500',
      legendary: 'text-yellow-500'
    }
    return colors[rarity as keyof typeof colors] || 'text-gray-500'
  }

  const getRarityIcon = (rarity: string) => {
    const icons = {
      common: <Medal size={16} />,
      rare: <Gem size={16} />,
      epic: <Trophy size={16} />,
      legendary: <Crown size={16} />
    }
    return icons[rarity as keyof typeof icons] || <Medal size={16} />
  }

  return (
    <div className="card p-4 hover:shadow-lg transition-all duration-200 hover-glow">
      <div className="flex items-start gap-3">
        <div className={`text-2xl ${getRarityColor(achievement.rarity)}`}>
          {achievement.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold">{achievement.title}</h4>
            {getRarityIcon(achievement.rarity)}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{achievement.unlockedCount} users unlocked</span>
            <span>{achievement.rarity.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const CompetitionCard = ({ competition }: { competition: Competition }) => {
  const getStatusBadge = (status: string) => {
    const badges = {
      active: { label: 'Active', color: 'bg-green-500/10 text-green-500' },
      upcoming: { label: 'Upcoming', color: 'bg-blue-500/10 text-blue-500' },
      ended: { label: 'Ended', color: 'bg-gray-500/10 text-gray-500' }
    }
    return badges[status as keyof typeof badges]
  }

  const badge = getStatusBadge(competition.status)

  return (
    <div className="card p-6 hover:shadow-lg transition-all duration-200 hover-glow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold">{competition.title}</h3>
            {badge && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                {badge.label}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm mb-3">{competition.description}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">${competition.prize.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Prize Pool</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {competition.tags.map((tag: string) => (
          <span
            key={tag}
            className="px-2 py-1 bg-muted/50 text-xs rounded-full text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>{competition.participants} participants</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{competition.startDate} - {competition.endDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{competition.duration}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{competition.organizer}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{competition.organizer}</span>
          {competition.isSponsored && (
            <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs rounded-full">
              Sponsored
            </span>
          )}
        </div>
        <button className="btn-primary text-sm">
          {competition.status === 'active' ? 'Join Now' : 
           competition.status === 'upcoming' ? 'Notify Me' : 'View Results'}
        </button>
      </div>
    </div>
  )
}

const StatsPanel = ({ stats }: { stats: any }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="card p-4 text-center">
        <div className="text-2xl font-bold text-primary mb-1">{stats.totalUsers}</div>
        <div className="text-xs text-muted-foreground">Total Users</div>
      </div>
      <div className="card p-4 text-center">
        <div className="text-2xl font-bold text-green-500 mb-1">{stats.activeUsers}</div>
        <div className="text-xs text-muted-foreground">Active This Week</div>
      </div>
      <div className="card p-4 text-center">
        <div className="text-2xl font-bold text-blue-500 mb-1">{stats.competitions}</div>
        <div className="text-xs text-muted-foreground">Active Competitions</div>
      </div>
      <div className="card p-4 text-center">
        <div className="text-2xl font-bold text-yellow-500 mb-1">{stats.totalPrizes}</div>
        <div className="text-xs text-muted-foreground">Total Prizes</div>
      </div>
    </div>
  )
}

export default function Ranking() {
  const { user } = useAuthStore()
  const {
    leaderboard,
    achievements,
    competitions,
    userRank,
    stats,
    filters,
    setFilters
  } = useRanking()

  const [activeTab, setActiveTab] = useState<'leaderboard' | 'achievements' | 'competitions'>('leaderboard')
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null)

  const tabs = [
    { id: 'leaderboard', label: 'Leaderboard', count: leaderboard.length },
    { id: 'achievements', label: 'Achievements', count: achievements.length },
    { id: 'competitions', label: 'Competitions', count: competitions.length }
  ]

  const filteredLeaderboard = leaderboard.filter((user: LeaderboardUser) => {
    const matchesSearch = user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         user.username.toLowerCase().includes(filters.search.toLowerCase()) ||
                         user.skills.some((skill: string) => skill.toLowerCase().includes(filters.search.toLowerCase()))
    const matchesCategory = filters.category === 'all' || user.category === filters.category
    const matchesLevel = filters.level === 'all' || user.level >= parseInt(filters.level)
    
    return matchesSearch && matchesCategory && matchesLevel
  })

  const filteredAchievements = achievements.filter((achievement: Achievement) => {
    const matchesSearch = achievement.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(filters.search.toLowerCase())
    const matchesRarity = filters.rarity === 'all' || achievement.rarity === filters.rarity
    
    return matchesSearch && matchesRarity
  })

  const filteredCompetitions = competitions.filter((competition: Competition) => {
    const matchesSearch = competition.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         competition.description.toLowerCase().includes(filters.search.toLowerCase())
    const matchesStatus = filters.status === 'all' || competition.status === filters.status
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold">Rankings & Competitions</h1>
        <p className="text-muted-foreground">
          Compete with the best and track your progress, {user?.firstName || user?.username}
        </p>
      </div>

      {/* Success message */}
      {showSuccessMessage && (
        <div className="card p-4 bg-green-500/10 border-green-500/20">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle size={16} />
            <span>{showSuccessMessage}</span>
          </div>
        </div>
      )}

      {/* User rank display */}
      {userRank && (
        <div className="card p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Your Ranking</h3>
                <p className="text-sm text-muted-foreground">
                  Rank #{userRank.rank} out of {userRank.totalUsers} users
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{userRank.xp.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Your XP</div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <StatsPanel stats={stats} />

      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Search users, achievements, or competitions..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="space-y-6">
        {/* Leaderboard */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Global Leaderboard</h2>
              <div className="flex gap-2">
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All Categories</option>
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="fullstack">Full Stack</option>
                  <option value="design">Design</option>
                  <option value="mobile">Mobile</option>
                </select>
                <select
                  value={filters.level}
                  onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                  className="px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All Levels</option>
                  <option value="1">Level 1+</option>
                  <option value="5">Level 5+</option>
                  <option value="10">Level 10+</option>
                  <option value="20">Level 20+</option>
                </select>
              </div>
            </div>
            {filteredLeaderboard.length > 0 ? (
              <div className="space-y-4">
                {filteredLeaderboard.map((user, index) => (
                  <LeaderboardCard key={user.id} user={user} rank={index + 1} />
                ))}
              </div>
            ) : (
              <div className="card p-8 text-center">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        )}

        {/* Achievements */}
        {activeTab === 'achievements' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Achievements</h2>
              <select
                value={filters.rarity}
                onChange={(e) => setFilters({ ...filters, rarity: e.target.value })}
                className="px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Rarities</option>
                <option value="common">Common</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
              </select>
            </div>
            {filteredAchievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAchievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            ) : (
              <div className="card p-8 text-center">
                <div className="text-4xl mb-4">🏅</div>
                <h3 className="text-lg font-semibold mb-2">No achievements found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        )}

        {/* Competitions */}
        {activeTab === 'competitions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Competitions</h2>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="ended">Ended</option>
              </select>
            </div>
            {filteredCompetitions.length > 0 ? (
              <div className="space-y-4">
                {filteredCompetitions.map((competition) => (
                  <CompetitionCard key={competition.id} competition={competition} />
                ))}
              </div>
            ) : (
              <div className="card p-8 text-center">
                <div className="text-4xl mb-4">🏁</div>
                <h3 className="text-lg font-semibold mb-2">No competitions found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 
