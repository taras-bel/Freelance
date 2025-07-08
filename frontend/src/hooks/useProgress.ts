import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

export interface Skill {
  name: string
  level: number
  progress: number
  category: string
  xp: number
  tasksCompleted: number
  lastUpdated: string
}

export interface XPData {
  current: number
  total: number
  level: number
  nextLevel: number
  recentGains: { amount: number; source: string; date: string }[]
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: any
  unlocked: boolean
  unlockedAt?: string
  progress?: number
  total?: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

const initialSkills: Skill[] = [
  { name: 'React', level: 85, progress: 85, category: 'Frontend', xp: 1250, tasksCompleted: 12, lastUpdated: '2024-01-15' },
  { name: 'TypeScript', level: 72, progress: 72, category: 'Frontend', xp: 980, tasksCompleted: 8, lastUpdated: '2024-01-14' },
  { name: 'Node.js', level: 68, progress: 68, category: 'Backend', xp: 920, tasksCompleted: 10, lastUpdated: '2024-01-13' },
  { name: 'Python', level: 45, progress: 45, category: 'Backend', xp: 650, tasksCompleted: 5, lastUpdated: '2024-01-10' },
  { name: 'UI/UX Design', level: 60, progress: 60, category: 'Design', xp: 800, tasksCompleted: 6, lastUpdated: '2024-01-12' },
  { name: 'System Design', level: 35, progress: 35, category: 'Architecture', xp: 450, tasksCompleted: 3, lastUpdated: '2024-01-08' },
  { name: 'Docker', level: 55, progress: 55, category: 'DevOps', xp: 720, tasksCompleted: 4, lastUpdated: '2024-01-11' },
  { name: 'AWS', level: 40, progress: 40, category: 'Cloud', xp: 580, tasksCompleted: 2, lastUpdated: '2024-01-09' },
  { name: 'MongoDB', level: 65, progress: 65, category: 'Database', xp: 890, tasksCompleted: 7, lastUpdated: '2024-01-12' },
  { name: 'GraphQL', level: 30, progress: 30, category: 'API', xp: 420, tasksCompleted: 2, lastUpdated: '2024-01-07' }
]

const initialXPData: XPData = {
  current: 2450,
  total: 3000,
  level: 3,
  nextLevel: 4,
  recentGains: [
    { amount: 150, source: 'Task Completion', date: '2024-01-15' },
    { amount: 200, source: 'Interview Passed', date: '2024-01-14' },
    { amount: 100, source: 'Skill Assessment', date: '2024-01-13' },
    { amount: 75, source: 'Code Review', date: '2024-01-12' },
    { amount: 120, source: 'Bug Fix', date: '2024-01-11' }
  ]
}

const initialAchievements: Achievement[] = [
  { id: '1', title: 'First Task', description: 'Complete your first freelance task', icon: '🎯', unlocked: true, unlockedAt: '2024-01-05', rarity: 'common' },
  { id: '2', title: 'Skill Master', description: 'Reach level 5 in any skill', icon: '⭐', unlocked: true, unlockedAt: '2024-01-10', rarity: 'rare' },
  { id: '3', title: 'Interview Pro', description: 'Pass 5 interviews', icon: '🏆', unlocked: false, progress: 3, total: 5, rarity: 'epic' },
  { id: '4', title: 'Earnings Milestone', description: 'Earn $1000 total', icon: '💰', unlocked: false, progress: 650, total: 1000, rarity: 'legendary' },
  { id: '5', title: 'Community Builder', description: 'Help 10 other freelancers', icon: '🤝', unlocked: false, progress: 2, total: 10, rarity: 'epic' },
  { id: '6', title: 'Learning Streak', description: 'Learn for 7 days in a row', icon: '🔥', unlocked: false, progress: 4, total: 7, rarity: 'legendary' }
]

export function useProgress() {
  const [skills, setSkills] = useLocalStorage<Skill[]>('skills', initialSkills)
  const [xpData, setXPData] = useLocalStorage<XPData>('xp-data', initialXPData)
  const [achievements, setAchievements] = useLocalStorage<Achievement[]>('achievements', initialAchievements)

  // Add XP
  const addXP = useCallback((amount: number, source: string) => {
    setXPData(prev => {
      const newCurrent = prev.current + amount
      const newTotal = prev.total
      let newLevel = prev.level
      let newNextLevel = prev.nextLevel
      
      // Check if level up
      if (newCurrent >= newTotal) {
        newLevel += 1
        newNextLevel += 1
        // Increase XP needed for next level (exponential growth)
        const newTotalXP = Math.floor(newTotal * 1.5)
        return {
          current: newCurrent - newTotal,
          total: newTotalXP,
          level: newLevel,
          nextLevel: newNextLevel,
          recentGains: [
            { amount, source, date: new Date().toISOString().split('T')[0] },
            ...prev.recentGains.slice(0, 4)
          ]
        }
      }
      
      return {
        ...prev,
        current: newCurrent,
        recentGains: [
          { amount, source, date: new Date().toISOString().split('T')[0] },
          ...prev.recentGains.slice(0, 4)
        ]
      }
    })
  }, [setXPData])

  // Update skill progress
  const updateSkillProgress = useCallback((skillName: string, xpGained: number, taskCompleted: boolean = false) => {
    setSkills(prev => 
      prev.map(skill => {
        if (skill.name === skillName) {
          const newXP = skill.xp + xpGained
          const newProgress = Math.min(100, (newXP / 1500) * 100) // 1500 XP = 100%
          const newLevel = Math.floor(newProgress / 20) + 1
          
          return {
            ...skill,
            xp: newXP,
            progress: newProgress,
            level: newLevel,
            tasksCompleted: taskCompleted ? skill.tasksCompleted + 1 : skill.tasksCompleted,
            lastUpdated: new Date().toISOString().split('T')[0]
          }
        }
        return skill
      })
    )
  }, [setSkills])

  // Complete task
  const completeTask = useCallback((taskSkills: string[], xpReward: number) => {
    // Add XP to user
    addXP(xpReward, 'Task Completion')
    
    // Update skills
    taskSkills.forEach(skill => {
      updateSkillProgress(skill, Math.floor(xpReward / taskSkills.length), true)
    })
    
    // Check achievements
    checkAchievements()
  }, [addXP, updateSkillProgress])

  // Complete interview
  const completeInterview = useCallback((score: number, skills: string[]) => {
    const xpReward = Math.floor(score * 2) // Score * 2 = XP
    addXP(xpReward, 'Interview Passed')
    
    skills.forEach(skill => {
      updateSkillProgress(skill, Math.floor(xpReward / skills.length))
    })
    
    checkAchievements()
  }, [addXP, updateSkillProgress])

  // Check and unlock achievements
  const checkAchievements = useCallback(() => {
    setAchievements(prev => 
      prev.map(achievement => {
        if (achievement.unlocked) return achievement
        
        let shouldUnlock = false
        let newProgress = achievement.progress || 0
        
        switch (achievement.id) {
          case '3': // Interview Pro
            newProgress = xpData.recentGains.filter(gain => gain.source === 'Interview Passed').length
            shouldUnlock = newProgress >= (achievement.total || 0)
            break
          case '4': // Earnings Milestone
            // This would be updated by earnings system
            break
          case '5': // Community Builder
            // This would be updated by community interactions
            break
          case '6': // Learning Streak
            // This would be updated by daily activity
            break
        }
        
        if (shouldUnlock) {
          return {
            ...achievement,
            unlocked: true,
            unlockedAt: new Date().toISOString().split('T')[0]
          }
        }
        
        return {
          ...achievement,
          progress: newProgress
        }
      })
    )
  }, [setAchievements, xpData.recentGains])

  // Get statistics
  const stats = {
    totalXP: xpData.current,
    level: xpData.level,
    skillsCount: skills.length,
    completedTasks: skills.reduce((acc, skill) => acc + skill.tasksCompleted, 0),
    unlockedAchievements: achievements.filter(a => a.unlocked).length,
    totalAchievements: achievements.length
  }

  // Get top skills
  const topSkills = [...skills].sort((a, b) => b.level - a.level).slice(0, 6)

  // Get skill categories
  const categories = Array.from(new Set(skills.map(skill => skill.category)))

  return {
    skills,
    xpData,
    achievements,
    stats,
    topSkills,
    categories,
    addXP,
    updateSkillProgress,
    completeTask,
    completeInterview,
    checkAchievements
  }
} 