import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '../api/client'

export interface Achievement {
  id: number
  name: string
  description: string
  icon: string
  category: string
  requirement_type: string
  requirement_value: number
  xp_reward: number
  is_unlocked: boolean
  progress: number
  progress_percentage: number
  unlocked_at?: string
}

export interface UserLevel {
  level: number
  current_xp: number
  total_xp: number
  xp_to_next_level: number
  tasks_completed: number
  tasks_created: number
  applications_submitted: number
  applications_accepted: number
  total_earnings: number
  streak_days: number
}

// Mock achievements data
const mockAchievements: Achievement[] = [
  // Earnings achievements
  {
    id: 'first-earning',
    title: 'First Dollar',
    description: 'Earn your first dollar on the platform',
    category: 'earnings',
    rarity: 'common',
    icon: 'dollar',
    progress: { current: 1, target: 1, unit: 'dollars' },
    completed: true,
    completedAt: new Date('2024-01-15'),
    rewards: { xp: 100, badge: 'First Dollar' },
    requirements: ['Earn $1']
  },
  {
    id: 'hundred-earner',
    title: 'Hundred Dollar Club',
    description: 'Earn $100 from completed tasks',
    category: 'earnings',
    rarity: 'rare',
    icon: 'dollar',
    progress: { current: 75, target: 100, unit: 'dollars' },
    completed: false,
    rewards: { xp: 500, badge: 'Hundred Dollar Club', title: 'Centurion' },
    requirements: ['Earn $100']
  },
  {
    id: 'thousand-earner',
    title: 'Thousand Dollar Milestone',
    description: 'Earn $1,000 from completed tasks',
    category: 'earnings',
    rarity: 'epic',
    icon: 'dollar',
    progress: { current: 75, target: 1000, unit: 'dollars' },
    completed: false,
    rewards: { xp: 2000, badge: 'Thousand Dollar Club', title: 'Millionaire Mindset', bonus: 'Premium Support' },
    requirements: ['Earn $1,000']
  },

  // Task achievements
  {
    id: 'first-task',
    title: 'Task Master',
    description: 'Complete your first task',
    category: 'tasks',
    rarity: 'common',
    icon: 'target',
    progress: { current: 1, target: 1, unit: 'tasks' },
    completed: true,
    completedAt: new Date('2024-01-10'),
    rewards: { xp: 50, badge: 'Task Master' },
    requirements: ['Complete 1 task']
  },
  {
    id: 'ten-tasks',
    title: 'Decade of Tasks',
    description: 'Complete 10 tasks',
    category: 'tasks',
    rarity: 'rare',
    icon: 'target',
    progress: { current: 7, target: 10, unit: 'tasks' },
    completed: false,
    rewards: { xp: 300, badge: 'Decade Master' },
    requirements: ['Complete 10 tasks']
  },
  {
    id: 'hundred-tasks',
    title: 'Century of Excellence',
    description: 'Complete 100 tasks',
    category: 'tasks',
    rarity: 'epic',
    icon: 'target',
    progress: { current: 23, target: 100, unit: 'tasks' },
    completed: false,
    rewards: { xp: 1500, badge: 'Century Master', title: 'Task Legend' },
    requirements: ['Complete 100 tasks']
  },

  // Interview achievements
  {
    id: 'first-interview',
    title: 'Interview Novice',
    description: 'Complete your first AI interview',
    category: 'interviews',
    rarity: 'common',
    icon: 'message',
    progress: { current: 1, target: 1, unit: 'interviews' },
    completed: true,
    completedAt: new Date('2024-01-12'),
    rewards: { xp: 75, badge: 'Interview Novice' },
    requirements: ['Complete 1 interview']
  },
  {
    id: 'perfect-score',
    title: 'Perfect Score',
    description: 'Get a perfect score in any interview',
    category: 'interviews',
    rarity: 'rare',
    icon: 'message',
    progress: { current: 0, target: 1, unit: 'perfect scores' },
    completed: false,
    rewards: { xp: 400, badge: 'Perfect Score', title: 'Interview Master' },
    requirements: ['Get 100% score in any interview']
  },
  {
    id: 'interview-streak',
    title: 'Interview Streak',
    description: 'Complete 5 interviews in a row',
    category: 'interviews',
    rarity: 'epic',
    icon: 'message',
    progress: { current: 3, target: 5, unit: 'consecutive interviews' },
    completed: false,
    rewards: { xp: 800, badge: 'Interview Streak', title: 'Consistent Performer' },
    requirements: ['Complete 5 interviews in a row']
  },

  // Client achievements
  {
    id: 'first-client',
    title: 'First Client',
    description: 'Work with your first client',
    category: 'clients',
    rarity: 'common',
    icon: 'users',
    progress: { current: 1, target: 1, unit: 'clients' },
    completed: true,
    completedAt: new Date('2024-01-08'),
    rewards: { xp: 100, badge: 'First Client' },
    requirements: ['Work with 1 client']
  },
  {
    id: 'repeat-client',
    title: 'Repeat Business',
    description: 'Work with the same client 3 times',
    category: 'clients',
    rarity: 'rare',
    icon: 'users',
    progress: { current: 2, target: 3, unit: 'repeat clients' },
    completed: false,
    rewards: { xp: 300, badge: 'Repeat Business', title: 'Trusted Partner' },
    requirements: ['Work with same client 3 times']
  },
  {
    id: 'client-network',
    title: 'Client Network',
    description: 'Work with 10 different clients',
    category: 'clients',
    rarity: 'epic',
    icon: 'users',
    progress: { current: 4, target: 10, unit: 'unique clients' },
    completed: false,
    rewards: { xp: 1000, badge: 'Client Network', title: 'Network Builder' },
    requirements: ['Work with 10 different clients']
  },

  // Skills achievements
  {
    id: 'skill-master',
    title: 'Skill Master',
    description: 'Reach level 5 in any skill',
    category: 'skills',
    rarity: 'rare',
    icon: 'code',
    progress: { current: 3, target: 5, unit: 'skill level' },
    completed: false,
    rewards: { xp: 500, badge: 'Skill Master', title: 'Expert' },
    requirements: ['Reach level 5 in any skill']
  },
  {
    id: 'multi-skilled',
    title: 'Multi-Skilled',
    description: 'Reach level 3 in 5 different skills',
    category: 'skills',
    rarity: 'epic',
    icon: 'code',
    progress: { current: 2, target: 5, unit: 'skills at level 3' },
    completed: false,
    rewards: { xp: 1200, badge: 'Multi-Skilled', title: 'Versatile Expert' },
    requirements: ['Reach level 3 in 5 different skills']
  },
  {
    id: 'skill-legend',
    title: 'Skill Legend',
    description: 'Reach level 10 in any skill',
    category: 'skills',
    rarity: 'legendary',
    icon: 'code',
    progress: { current: 3, target: 10, unit: 'skill level' },
    completed: false,
    rewards: { xp: 5000, badge: 'Skill Legend', title: 'Grandmaster', bonus: 'Exclusive Projects' },
    requirements: ['Reach level 10 in any skill']
  },

  // Streak achievements
  {
    id: 'week-streak',
    title: 'Week Warrior',
    description: 'Complete tasks for 7 consecutive days',
    category: 'streaks',
    rarity: 'rare',
    icon: 'flame',
    progress: { current: 4, target: 7, unit: 'consecutive days' },
    completed: false,
    rewards: { xp: 400, badge: 'Week Warrior', title: 'Consistent' },
    requirements: ['Complete tasks for 7 consecutive days']
  },
  {
    id: 'month-streak',
    title: 'Month Master',
    description: 'Complete tasks for 30 consecutive days',
    category: 'streaks',
    rarity: 'epic',
    icon: 'flame',
    progress: { current: 12, target: 30, unit: 'consecutive days' },
    completed: false,
    rewards: { xp: 2000, badge: 'Month Master', title: 'Dedicated', bonus: 'Priority Support' },
    requirements: ['Complete tasks for 30 consecutive days']
  },
  {
    id: 'year-streak',
    title: 'Year Legend',
    description: 'Complete tasks for 365 consecutive days',
    category: 'streaks',
    rarity: 'legendary',
    icon: 'flame',
    progress: { current: 45, target: 365, unit: 'consecutive days' },
    completed: false,
    rewards: { xp: 10000, badge: 'Year Legend', title: 'Legendary', bonus: 'VIP Status' },
    requirements: ['Complete tasks for 365 consecutive days']
  },

  // Community achievements
  {
    id: 'first-mentor',
    title: 'Mentor',
    description: 'Help another freelancer for the first time',
    category: 'community',
    rarity: 'common',
    icon: 'heart',
    progress: { current: 1, target: 1, unit: 'mentoring sessions' },
    completed: true,
    completedAt: new Date('2024-01-20'),
    rewards: { xp: 150, badge: 'Mentor' },
    requirements: ['Help 1 freelancer']
  },
  {
    id: 'community-leader',
    title: 'Community Leader',
    description: 'Help 10 different freelancers',
    category: 'community',
    rarity: 'epic',
    icon: 'heart',
    progress: { current: 3, target: 10, unit: 'helped freelancers' },
    completed: false,
    rewards: { xp: 1500, badge: 'Community Leader', title: 'Helper', bonus: 'Community Badge' },
    requirements: ['Help 10 different freelancers']
  },
  {
    id: 'forum-expert',
    title: 'Forum Expert',
    description: 'Get 50 helpful votes on forum posts',
    category: 'community',
    rarity: 'rare',
    icon: 'heart',
    progress: { current: 23, target: 50, unit: 'helpful votes' },
    completed: false,
    rewards: { xp: 600, badge: 'Forum Expert', title: 'Knowledgeable' },
    requirements: ['Get 50 helpful votes']
  },

  // Special achievements
  {
    id: 'early-adopter',
    title: 'Early Adopter',
    description: 'Join the platform in its first month',
    category: 'special',
    rarity: 'legendary',
    icon: 'crown',
    progress: { current: 1, target: 1, unit: 'early adoption' },
    completed: true,
    completedAt: new Date('2024-01-01'),
    rewards: { xp: 1000, badge: 'Early Adopter', title: 'Pioneer', bonus: 'Founder Status' },
    requirements: ['Join platform in first month']
  },
  {
    id: 'referral-master',
    title: 'Referral Master',
    description: 'Refer 5 successful freelancers',
    category: 'special',
    rarity: 'epic',
    icon: 'crown',
    progress: { current: 2, target: 5, unit: 'successful referrals' },
    completed: false,
    rewards: { xp: 2000, badge: 'Referral Master', title: 'Networker', bonus: 'Commission Bonus' },
    requirements: ['Refer 5 successful freelancers']
  },
  {
    id: 'platform-champion',
    title: 'Platform Champion',
    description: 'Complete all common and rare achievements',
    category: 'special',
    rarity: 'legendary',
    icon: 'crown',
    progress: { current: 8, target: 15, unit: 'common/rare achievements' },
    completed: false,
    rewards: { xp: 5000, badge: 'Platform Champion', title: 'Champion', bonus: 'Exclusive Features' },
    requirements: ['Complete all common and rare achievements']
  }
]

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([])
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Получение всех достижений
  const fetchAchievements = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.getAchievements()
      if (response.data && response.data.items) {
        setAchievements(response.data.items)
      } else {
        setAchievements([])
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch achievements')
      setAchievements([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Получение разблокированных достижений
  const fetchUnlockedAchievements = useCallback(async () => {
    try {
      const response = await apiClient.getUnlockedAchievements()
      if (response?.data) {
        setUnlockedAchievements(response.data)
      } else {
        setUnlockedAchievements([])
      }
    } catch (err: any) {
      console.error('Failed to fetch unlocked achievements:', err)
      setUnlockedAchievements([])
    }
  }, [])

  // Получение информации об уровне
  const fetchUserLevel = useCallback(async () => {
    try {
      const response = await apiClient.getUserLevel()
      setUserLevel(response.data)
    } catch (err: any) {
      console.error('Failed to fetch user level:', err)
    }
  }, [])

  // Получение достижений по категории
  const getAchievementsByCategory = useCallback((category: string) => {
    return achievements.filter(achievement => achievement.category === category)
  }, [achievements])

  // Получение прогресса по категории
  const getCategoryProgress = useCallback((category: string) => {
    const categoryAchievements = getAchievementsByCategory(category)
    if (categoryAchievements.length === 0) return 0
    
    const unlocked = categoryAchievements.filter(a => a.is_unlocked).length
    return (unlocked / categoryAchievements.length) * 100
  }, [getAchievementsByCategory])

  // Получение статистики достижений
  const getAchievementStats = useCallback(() => {
    const total = achievements.length
    const unlocked = achievements.filter(a => a.is_unlocked).length
    const inProgress = achievements.filter(a => !a.is_unlocked && a.progress > 0).length
    
    return {
      total,
      unlocked,
      inProgress,
      locked: total - unlocked - inProgress,
      completionRate: total > 0 ? (unlocked / total) * 100 : 0
    }
  }, [achievements])

  // Загрузка начальных данных
  useEffect(() => {
    fetchAchievements()
    fetchUnlockedAchievements()
    fetchUserLevel()
  }, [fetchAchievements, fetchUnlockedAchievements, fetchUserLevel])

  // Save achievements to localStorage
  const saveAchievements = (newAchievements: Achievement[]) => {
    try {
      localStorage.setItem('achievements', JSON.stringify(newAchievements))
      setAchievements(newAchievements)
    } catch (err) {
      console.error('Error saving achievements:', err)
      setError('Failed to save achievements')
    }
  }

  // Update achievement progress
  const updateProgress = (achievementId: string, current: number) => {
    const updatedAchievements = achievements.map(achievement => {
      if (achievement.id === achievementId) {
        const newProgress = { ...achievement.progress, current }
        const completed = newProgress.current >= newProgress.target && !achievement.completed
        
        return {
          ...achievement,
          progress: newProgress,
          completed,
          completedAt: completed ? new Date() : achievement.completedAt
        }
      }
      return achievement
    })
    
    saveAchievements(updatedAchievements)
    
    // Check if any new achievements were unlocked
    const newlyCompleted = updatedAchievements.filter(
      achievement => achievement.id === achievementId && achievement.completed
    )
    
    return newlyCompleted.length > 0 ? newlyCompleted[0] : null
  }

  // Unlock achievement manually (for testing)
  const unlockAchievement = (achievementId: string) => {
    const updatedAchievements = achievements.map(achievement => {
      if (achievement.id === achievementId && !achievement.completed) {
        return {
          ...achievement,
          progress: { ...achievement.progress, current: achievement.progress.target },
          completed: true,
          completedAt: new Date()
        }
      }
      return achievement
    })
    
    saveAchievements(updatedAchievements)
    
    const unlocked = updatedAchievements.find(
      achievement => achievement.id === achievementId && achievement.completed
    )
    
    return unlocked || null
  }

  // Reset all achievements (for testing)
  const resetAchievements = () => {
    const resetAchievements = mockAchievements.map(achievement => ({
      ...achievement,
      progress: { ...achievement.progress, current: 0 },
      completed: false,
      completedAt: undefined
    }))
    saveAchievements(resetAchievements)
  }

  // Get achievement statistics
  const getStats = () => {
    const total = achievements.length
    const completed = achievements.filter(a => a.completed).length
    const completionRate = Math.round((completed / total) * 100)
    
    const byRarity = {
      common: achievements.filter(a => a.rarity === 'common').length,
      rare: achievements.filter(a => a.rarity === 'rare').length,
      epic: achievements.filter(a => a.rarity === 'epic').length,
      legendary: achievements.filter(a => a.rarity === 'legendary').length
    }
    
    const byCategory = {
      earnings: achievements.filter(a => a.category === 'earnings').length,
      tasks: achievements.filter(a => a.category === 'tasks').length,
      interviews: achievements.filter(a => a.category === 'interviews').length,
      clients: achievements.filter(a => a.category === 'clients').length,
      skills: achievements.filter(a => a.category === 'skills').length,
      streaks: achievements.filter(a => a.category === 'streaks').length,
      community: achievements.filter(a => a.category === 'community').length,
      special: achievements.filter(a => a.category === 'special').length
    }
    
    const totalXP = achievements
      .filter(a => a.completed)
      .reduce((sum, a) => sum + a.rewards.xp, 0)
    
    return {
      total,
      completed,
      completionRate,
      byRarity,
      byCategory,
      totalXP
    }
  }

  // Get recent achievements
  const getRecentAchievements = (limit = 5) => {
    return achievements
      .filter(a => a.completed && a.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
      .slice(0, limit)
  }

  // Get next achievable achievements
  const getNextAchievements = (limit = 5) => {
    return achievements
      .filter(a => !a.completed)
      .sort((a, b) => {
        const aProgress = a.progress.current / a.progress.target
        const bProgress = b.progress.current / b.progress.target
        return bProgress - aProgress
      })
      .slice(0, limit)
  }

  return {
    achievements,
    unlockedAchievements,
    userLevel,
    loading,
    error,
    fetchAchievements,
    fetchUnlockedAchievements,
    fetchUserLevel,
    getAchievementsByCategory,
    getCategoryProgress,
    getAchievementStats,
    updateProgress,
    unlockAchievement,
    resetAchievements,
    getStats,
    getRecentAchievements,
    getNextAchievements
  }
} 