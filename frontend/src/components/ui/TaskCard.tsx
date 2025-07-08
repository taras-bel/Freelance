import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Bookmark,
  BookmarkCheck,
  Clock,
  DollarSign,
  MapPin,
  Star,
  Users,
  ArrowRight,
  Eye,
  MessageSquare,
  Calendar,
  Info,
  Target
} from 'lucide-react'
import { motion } from 'framer-motion'

interface TaskCardProps {
  task: {
    id: string
    title: string
    description: string
    budget_min: number
    budget_max: number
    ai_suggested_min_price?: number
    ai_suggested_max_price?: number
    ai_analysis_data?: any
    complexity_level?: number // 1-5
    skills_required: string[]
    location?: string
    deadline?: string
    applications_count?: number
    views?: number
    isBookmarked?: boolean
    status?: string
    creator?: {
      name: string
      avatar?: string
      rating?: number
    }
  }
  onBookmark: (id: string) => void
  onView: (id: string) => void
  onApply: (id: string) => void
}

const complexityColors = [
  'bg-green-500/10 text-green-400',
  'bg-teal-500/10 text-teal-400',
  'bg-cyan-500/10 text-cyan-400',
  'bg-violet-500/10 text-violet-400',
  'bg-red-500/10 text-red-400',
]
const complexityLabels = [
  'Very Easy',
  'Easy',
  'Medium',
  'Hard',
  'Expert',
]

export default function TaskCard({ task, onBookmark, onView, onApply }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { i18n } = useTranslation()
  const userLang = i18n.language || 'en'
  const [translated, setTranslated] = useState<{ title: string, description: string, detectedLang: string } | null>(null)
  const [loadingTranslation, setLoadingTranslation] = useState(false)

  useEffect(() => {
    let ignore = false
    async function translateIfNeeded() {
      setLoadingTranslation(true)
      try {
        // Пример: если язык пользователя не английский, переводим
        // (В реальном проекте определяйте язык вакансии через метаданные или AI)
        const detectedLang = 'en' // TODO: заменить на реальное определение языка task.title/task.description
        if (userLang !== detectedLang) {
          const resp = await fetch('/api/v1/ai/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: `${task.title}\n\n${task.description}`,
              source_lang: detectedLang,
              target_lang: userLang
            })
          })
          const data = await resp.json()
          if (!ignore) {
            const [title, ...descArr] = data.translated_text.split('\n\n')
            setTranslated({
              title: title.trim(),
              description: descArr.join('\n\n').trim(),
              detectedLang: data.detected_source_lang || detectedLang
            })
          }
        } else {
          setTranslated(null)
        }
      } catch (e) {
        setTranslated(null)
      } finally {
        setLoadingTranslation(false)
      }
    }
    translateIfNeeded()
    return () => { ignore = true }
  }, [task.title, task.description, userLang])

  const complexity = typeof task.complexity_level === 'number' ? task.complexity_level : 2
  const complexityColor = complexityColors[complexity - 1] || complexityColors[2]
  const complexityLabel = complexityLabels[complexity - 1] || 'Medium'

  const formatBudget = () => {
    if (task.budget_min && task.budget_max && task.budget_min !== task.budget_max) {
      return `$${task.budget_min} - $${task.budget_max}`
    }
    if (task.budget_min) return `$${task.budget_min}`
    return '—'
  }
  const formatAIBudget = () => {
    if (task.ai_suggested_min_price && task.ai_suggested_max_price && task.ai_suggested_min_price !== task.ai_suggested_max_price) {
      return `$${task.ai_suggested_min_price} - $${task.ai_suggested_max_price}`
    }
    if (task.ai_suggested_min_price) return `$${task.ai_suggested_min_price}`
    return null
  }
  const formatDeadline = (deadline?: string) => {
    if (!deadline) return '—'
    const date = new Date(deadline)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return 'Expired'
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 7) return `${diffDays} days`
    return date.toLocaleDateString()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative card glass border border-white/10 rounded-2xl p-6 hover:shadow-neon transition-all duration-300 cursor-pointer fade-in"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-grotesk font-semibold mb-2 group-hover:text-neon-teal transition-colors line-clamp-2">
            {translated ? translated.title : task.title}
            {loadingTranslation && (
              <span className="ml-2 text-xs text-muted-foreground animate-pulse">Translating...</span>
            )}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 font-inter">
            {translated ? translated.description : task.description}
          </p>
          {translated && (
            <div className="text-xs text-gray-400 mt-1">
              <span className="font-semibold">Original:</span> {task.title} — {task.description}
            </div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onBookmark(task.id)
          }}
          className="p-2 rounded-xl hover:bg-neon-teal/10 transition-colors ml-2 icon"
        >
          {task.isBookmarked ? (
            <BookmarkCheck size={20} className="text-neon-teal icon" />
          ) : (
            <Bookmark size={20} className="text-muted-foreground group-hover:text-neon-teal icon transition-colors" />
          )}
        </button>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {task.skills_required?.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className="px-2 py-1 text-xs bg-neon-teal/10 text-neon-teal rounded-lg font-inter"
          >
            {skill}
          </span>
        ))}
        {task.skills_required && task.skills_required.length > 3 && (
          <span className="px-2 py-1 text-xs bg-matte-light text-muted-foreground rounded-lg font-inter">
            +{task.skills_required.length - 3} more
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-neon-teal font-inter">
          <DollarSign size={16} className="icon" />
          <span className="font-medium">
            {formatBudget()}
            {formatAIBudget() && (
              <span className="ml-2 px-2 py-0.5 rounded bg-neon-violet/10 text-neon-violet text-xs font-grotesk animate-pulse">
                AI: {formatAIBudget()}
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-inter">
          <Clock size={16} className="icon" />
          <span>{formatDeadline(task.deadline)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-inter">
          <Users size={16} className="icon" />
          <span>{task.applications_count ?? 0} applications</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-inter">
          <Eye size={16} className="icon" />
          <span>{task.views ?? 0} views</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          {/* Posted by */}
          {task.creator && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-teal to-neon-violet flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {task.creator.name[0]}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-neon-teal font-inter">{task.creator.name}</p>
                {typeof task.creator.rating === 'number' && (
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-yellow-400 fill-current" />
                    <span className="text-xs text-muted-foreground">{task.creator.rating}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Complexity */}
          <span className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full font-grotesk font-semibold ${complexityColor} shadow-glass`}
            title={`AI complexity: ${complexityLabel}`}
          >
            <Target size={14} className="icon" />
            {complexityLabel}
            <span className="ml-1">
              <Info size={12} className="icon" />
            </span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onView(task.id)
            }}
            className="px-3 py-1.5 text-sm border border-white/10 rounded-xl hover:bg-neon-teal/10 hover:text-neon-teal font-inter transition-colors"
          >
            View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onApply(task.id)
            }}
            className="px-4 py-1.5 text-sm bg-neon-teal text-matte rounded-xl hover:bg-neon-cyan hover:text-matte font-grotesk transition-colors flex items-center gap-1 neon"
          >
            Apply
            <ArrowRight size={14} className="icon" />
          </button>
        </div>
      </div>
    </motion.div>
  )
} 
