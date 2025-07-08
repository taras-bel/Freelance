import { useState } from 'react'
import { 
  Lightbulb, 
  Target, 
  TrendingUp, 
  Star, 
  Clock, 
  Users,
  BookOpen,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Brain,
  DollarSign
} from 'lucide-react'

interface Recommendation {
  id: string
  type: 'improvement' | 'opportunity' | 'warning' | 'tip'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: 'profile' | 'skills' | 'earnings' | 'clients' | 'interviews'
  action?: {
    label: string
    onClick: () => void
  }
  impact: {
    score: number
    description: string
  }
}

interface RecommendationsPanelProps {
  recommendations: Recommendation[]
  onActionClick: (recommendation: Recommendation) => void
}

export default function RecommendationsPanel({ 
  recommendations, 
  onActionClick 
}: RecommendationsPanelProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [activeCategory, setActiveCategory] = useState<'all' | Recommendation['category']>('all')

  const getTypeIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'improvement':
        return <TrendingUp size={16} className="text-blue-500" />
      case 'opportunity':
        return <Star size={16} className="text-yellow-500" />
      case 'warning':
        return <AlertCircle size={16} className="text-red-500" />
      case 'tip':
        return <Lightbulb size={16} className="text-green-500" />
      default:
        return <Info size={16} className="text-gray-500" />
    }
  }

  const getTypeColor = (type: Recommendation['type']) => {
    switch (type) {
      case 'improvement':
        return 'border-blue-500/20 bg-blue-500/10'
      case 'opportunity':
        return 'border-yellow-500/20 bg-yellow-500/10'
      case 'warning':
        return 'border-red-500/20 bg-red-500/10'
      case 'tip':
        return 'border-green-500/20 bg-green-500/10'
      default:
        return 'border-gray-500/20 bg-gray-500/10'
    }
  }

  const getPriorityColor = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-500'
      case 'medium':
        return 'text-yellow-500'
      case 'low':
        return 'text-green-500'
      default:
        return 'text-gray-500'
    }
  }

  const getCategoryIcon = (category: Recommendation['category']) => {
    switch (category) {
      case 'profile':
        return <Users size={16} />
      case 'skills':
        return <Brain size={16} />
      case 'earnings':
        return <DollarSign size={16} />
      case 'clients':
        return <MessageSquare size={16} />
      case 'interviews':
        return <Target size={16} />
      default:
        return <Info size={16} />
    }
  }

  const filteredRecommendations = recommendations.filter(rec => {
    const matchesPriority = activeFilter === 'all' || rec.priority === activeFilter
    const matchesCategory = activeCategory === 'all' || rec.category === activeCategory
    return matchesPriority && matchesCategory
  })

  const categories = [
    { id: 'all', label: 'All', count: recommendations.length },
    { id: 'profile', label: 'Profile', count: recommendations.filter(r => r.category === 'profile').length },
    { id: 'skills', label: 'Skills', count: recommendations.filter(r => r.category === 'skills').length },
    { id: 'earnings', label: 'Earnings', count: recommendations.filter(r => r.category === 'earnings').length },
    { id: 'clients', label: 'Clients', count: recommendations.filter(r => r.category === 'clients').length },
    { id: 'interviews', label: 'Interviews', count: recommendations.filter(r => r.category === 'interviews').length }
  ]

  const priorities = [
    { id: 'all', label: 'All', count: recommendations.length },
    { id: 'high', label: 'High', count: recommendations.filter(r => r.priority === 'high').length },
    { id: 'medium', label: 'Medium', count: recommendations.filter(r => r.priority === 'medium').length },
    { id: 'low', label: 'Low', count: recommendations.filter(r => r.priority === 'low').length }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Lightbulb size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">AI Recommendations</h2>
            <p className="text-sm text-muted-foreground">
              Personalized suggestions to improve your freelance career
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Zap size={16} />
          <span>Powered by AI</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        {/* Priority Filter */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">Priority</label>
          <div className="flex gap-2">
            {priorities.map((priority) => (
              <button
                key={priority.id}
                onClick={() => setActiveFilter(priority.id as any)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === priority.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                {priority.label} ({priority.count})
              </button>
            ))}
          </div>
        </div>

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
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecommendations.length > 0 ? (
          filteredRecommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className={`card p-4 border-l-4 ${getTypeColor(recommendation.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getTypeIcon(recommendation.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{recommendation.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {recommendation.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(recommendation.priority)} bg-muted/50`}>
                        {recommendation.priority}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {getCategoryIcon(recommendation.category)}
                        <span>{recommendation.category}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Impact Score */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Impact:</span>
                      <div className="flex items-center gap-1">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300 bg-primary"
                            style={{ width: `${recommendation.impact.score}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{recommendation.impact.score}%</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {recommendation.impact.description}
                    </span>
                  </div>
                  
                  {/* Action Button */}
                  {recommendation.action && (
                    <button
                      onClick={() => onActionClick(recommendation)}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                    >
                      {recommendation.action.label}
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card p-8 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
            <p className="text-muted-foreground">
              {activeFilter !== 'all' || activeCategory !== 'all'
                ? 'No recommendations match your current filters'
                : 'You\'re doing great! Check back later for new suggestions.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      {filteredRecommendations.length > 0 && (
        <div className="card p-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-sm font-medium">
                  {filteredRecommendations.filter(r => r.priority === 'high').length} high priority
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-500" />
                <span className="text-sm text-muted-foreground">
                  Estimated time: {Math.ceil(filteredRecommendations.length * 0.5)}h
                </span>
              </div>
            </div>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm">
              Apply All
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 
