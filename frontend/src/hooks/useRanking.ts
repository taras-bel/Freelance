import { useState, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

export interface LeaderboardUser {
  id: string
  name: string
  username: string
  level: number
  xp: number
  tasksCompleted: number
  rating: number
  skills: string[]
  category: string
  isVerified: boolean
  trend: 'up' | 'down' | 'stable'
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: any
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedCount: number
}

export interface Competition {
  id: string
  title: string
  description: string
  status: 'active' | 'upcoming' | 'ended'
  startDate: string
  endDate: string
  duration: string
  participants: number
  prize: number
  organizer: string
  isSponsored: boolean
  tags: string[]
}

const initialLeaderboard: LeaderboardUser[] = [
  {
    id: '1',
    name: 'Alex Chen',
    username: 'alexchen',
    level: 25,
    xp: 15420,
    tasksCompleted: 89,
    rating: 4.9,
    skills: ['React', 'TypeScript', 'Node.js'],
    category: 'frontend',
    isVerified: true,
    trend: 'up'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    username: 'sarahj',
    level: 23,
    xp: 14250,
    tasksCompleted: 76,
    rating: 4.8,
    skills: ['Python', 'Django', 'Machine Learning'],
    category: 'backend',
    isVerified: true,
    trend: 'stable'
  },
  {
    id: '3',
    name: 'Mike Rodriguez',
    username: 'mikerod',
    level: 21,
    xp: 13890,
    tasksCompleted: 92,
    rating: 4.7,
    skills: ['UI/UX', 'Figma', 'React'],
    category: 'design',
    isVerified: false,
    trend: 'up'
  },
  {
    id: '4',
    name: 'Emma Wilson',
    username: 'emmaw',
    level: 20,
    xp: 12560,
    tasksCompleted: 67,
    rating: 4.9,
    skills: ['Full Stack', 'React', 'Node.js'],
    category: 'fullstack',
    isVerified: true,
    trend: 'down'
  },
  {
    id: '5',
    name: 'David Kim',
    username: 'davidkim',
    level: 19,
    xp: 11890,
    tasksCompleted: 58,
    rating: 4.6,
    skills: ['Mobile', 'React Native', 'iOS'],
    category: 'mobile',
    isVerified: false,
    trend: 'up'
  },
  {
    id: '6',
    name: 'Lisa Park',
    username: 'lisapark',
    level: 18,
    xp: 11230,
    tasksCompleted: 45,
    rating: 4.8,
    skills: ['DevOps', 'Docker', 'AWS'],
    category: 'backend',
    isVerified: true,
    trend: 'stable'
  },
  {
    id: '7',
    name: 'James Thompson',
    username: 'jamest',
    level: 17,
    xp: 10890,
    tasksCompleted: 52,
    rating: 4.7,
    skills: ['Python', 'Data Science', 'SQL'],
    category: 'backend',
    isVerified: false,
    trend: 'up'
  },
  {
    id: '8',
    name: 'Maria Garcia',
    username: 'mariag',
    level: 16,
    xp: 10240,
    tasksCompleted: 38,
    rating: 4.9,
    skills: ['UI/UX', 'Adobe XD', 'Prototyping'],
    category: 'design',
    isVerified: true,
    trend: 'down'
  },
  {
    id: '9',
    name: 'Tom Anderson',
    username: 'tomand',
    level: 15,
    xp: 9850,
    tasksCompleted: 41,
    rating: 4.6,
    skills: ['Vue.js', 'JavaScript', 'CSS'],
    category: 'frontend',
    isVerified: false,
    trend: 'stable'
  },
  {
    id: '10',
    name: 'Anna Lee',
    username: 'annalee',
    level: 14,
    xp: 9230,
    tasksCompleted: 35,
    rating: 4.8,
    skills: ['Flutter', 'Dart', 'Mobile'],
    category: 'mobile',
    isVerified: true,
    trend: 'up'
  }
]

const initialAchievements: Achievement[] = [
  { id: '1', title: 'First Task', description: 'Complete your first freelance task', icon: '🎯', rarity: 'common', unlockedCount: 1247 },
  { id: '2', title: 'Skill Master', description: 'Reach level 5 in any skill', icon: '⭐', rarity: 'rare', unlockedCount: 892 },
  { id: '3', title: 'Interview Pro', description: 'Pass 5 interviews', icon: '🏆', rarity: 'epic', unlockedCount: 567 },
  { id: '4', title: 'Earnings Milestone', description: 'Earn $1000 total', icon: '💰', rarity: 'legendary', unlockedCount: 234 },
  { id: '5', title: 'Community Builder', description: 'Help 10 other freelancers', icon: '🤝', rarity: 'epic', unlockedCount: 345 },
  { id: '6', title: 'Learning Streak', description: 'Learn for 7 days in a row', icon: '🔥', rarity: 'legendary', unlockedCount: 123 },
  { id: '7', title: 'Code Reviewer', description: 'Review 50 code submissions', icon: '👀', rarity: 'rare', unlockedCount: 456 },
  { id: '8', title: 'Mentor', description: 'Become a verified mentor', icon: '👨‍🏫', rarity: 'epic', unlockedCount: 89 },
  { id: '9', title: 'Competition Winner', description: 'Win a platform competition', icon: '🏅', rarity: 'legendary', unlockedCount: 45 },
  { id: '10', title: 'Perfect Score', description: 'Get 5.0 rating on 10 tasks', icon: '💎', rarity: 'legendary', unlockedCount: 67 }
]

const initialCompetitions: Competition[] = [
  {
    id: '1',
    title: 'React Performance Challenge',
    description: 'Build the fastest React application with the best performance metrics',
    status: 'active',
    startDate: '2024-01-15',
    endDate: '2024-01-30',
    duration: '15 days',
    participants: 156,
    prize: 5000,
    organizer: 'React Community',
    isSponsored: true,
    tags: ['React', 'Performance', 'Frontend']
  },
  {
    id: '2',
    title: 'AI-Powered App Contest',
    description: 'Create innovative applications using AI and machine learning',
    status: 'upcoming',
    startDate: '2024-02-01',
    endDate: '2024-02-28',
    duration: '28 days',
    participants: 89,
    prize: 10000,
    organizer: 'AI Innovation Hub',
    isSponsored: true,
    tags: ['AI', 'Machine Learning', 'Innovation']
  },
  {
    id: '3',
    title: 'Design System Challenge',
    description: 'Design and implement a comprehensive design system',
    status: 'active',
    startDate: '2024-01-10',
    endDate: '2024-01-25',
    duration: '15 days',
    participants: 78,
    prize: 3000,
    organizer: 'Design Collective',
    isSponsored: false,
    tags: ['Design', 'UI/UX', 'Systems']
  },
  {
    id: '4',
    title: 'Full Stack Hackathon',
    description: 'Build a complete full-stack application in 48 hours',
    status: 'upcoming',
    startDate: '2024-02-15',
    endDate: '2024-02-17',
    duration: '48 hours',
    participants: 234,
    prize: 7500,
    organizer: 'Tech Startup Inc',
    isSponsored: true,
    tags: ['Full Stack', 'Hackathon', 'Innovation']
  },
  {
    id: '5',
    title: 'Mobile App Showcase',
    description: 'Create the best mobile application for productivity',
    status: 'ended',
    startDate: '2023-12-01',
    endDate: '2023-12-31',
    duration: '30 days',
    participants: 145,
    prize: 4000,
    organizer: 'Mobile Developers Guild',
    isSponsored: false,
    tags: ['Mobile', 'Productivity', 'Apps']
  }
]

export function useRanking() {
  const [leaderboard, setLeaderboard] = useLocalStorage<LeaderboardUser[]>('leaderboard', initialLeaderboard)
  const [achievements] = useLocalStorage<Achievement[]>('achievements', initialAchievements)
  const [competitions, setCompetitions] = useLocalStorage<Competition[]>('competitions', initialCompetitions)
  
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    level: 'all',
    rarity: 'all',
    status: 'all'
  })

  // Get user rank
  const userRank = {
    rank: 156,
    totalUsers: 1247,
    xp: 2450
  }

  // Get statistics
  const stats = {
    totalUsers: 1247,
    activeUsers: 892,
    competitions: 3,
    totalPrizes: 29500
  }

  // Update user XP and recalculate rankings
  const updateUserXP = useCallback((userId: string, newXP: number) => {
    setLeaderboard(prev => {
      const updated = prev.map(user => 
        user.id === userId ? { ...user, xp: newXP } : user
      )
      return updated.sort((a, b) => b.xp - a.xp)
    })
  }, [setLeaderboard])

  // Join competition
  const joinCompetition = useCallback((competitionId: string) => {
    setCompetitions(prev => 
      prev.map(comp => 
        comp.id === competitionId 
          ? { ...comp, participants: comp.participants + 1 }
          : comp
      )
    )
  }, [setCompetitions])

  // Create new competition
  const createCompetition = useCallback((competition: Omit<Competition, 'id'>) => {
    const newCompetition: Competition = {
      ...competition,
      id: Date.now().toString()
    }
    setCompetitions(prev => [...prev, newCompetition])
  }, [setCompetitions])

  return {
    leaderboard,
    achievements,
    competitions,
    userRank,
    stats,
    filters,
    setFilters,
    updateUserXP,
    joinCompetition,
    createCompetition
  }
} 