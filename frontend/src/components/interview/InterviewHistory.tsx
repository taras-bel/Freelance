import { useState } from 'react'
import { 
  Calendar, 
  Clock, 
  Star, 
  Target, 
  Eye, 
  RotateCcw,
  Trash2,
  Download,
  Share2
} from 'lucide-react'
import { InterviewSession } from '../../hooks/useAIInterview'

interface InterviewHistoryProps {
  sessions: InterviewSession[]
  onViewResults: (session: InterviewSession) => void
  onRetake: (session: InterviewSession) => void
  onDelete: (sessionId: string) => void
}

export default function InterviewHistory({
  sessions,
  onViewResults,
  onRetake,
  onDelete
}: InterviewHistoryProps) {
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null)

  const getAverageScore = (session: InterviewSession) => {
    if (session.results.length === 0) return 0
    return Math.round(session.results.reduce((sum, r) => sum + (r.score || 0), 0) / session.results.length)
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-500'
    if (score >= 6) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent'
    if (score >= 6) return 'Good'
    if (score >= 4) return 'Fair'
    return 'Needs Improvement'
  }

  const formatDuration = (startTime: Date, endTime: Date) => {
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60)
    return `${duration} minutes`
  }

  if (sessions.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-lg font-semibold mb-2">No Interview History</h3>
        <p className="text-muted-foreground">
          Complete your first interview to see your results here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Interview History</h3>
        <div className="text-sm text-muted-foreground">
          {sessions.length} completed interview{sessions.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => {
          const averageScore = getAverageScore(session)
          const duration = session.completedAt 
            ? formatDuration(session.startedAt, session.completedAt)
            : 'Incomplete'

          return (
            <div key={session.id} className="card p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold">{session.role}</h4>
                    <span className="px-2 py-1 bg-muted/50 text-xs rounded-full">
                      {session.level}
                    </span>
                    {averageScore > 0 && (
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        averageScore >= 8 ? 'bg-green-500/10 text-green-500' :
                        averageScore >= 6 ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        <Star size={12} />
                        {averageScore}/10
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{session.startedAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target size={14} />
                      <span>{session.questions.length} questions</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewResults(session)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    title="View Results"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => onRetake(session)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    title="Retake Interview"
                  >
                    <RotateCcw size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(session.id)}
                    className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {averageScore > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Performance:</span>
                    <span className={`font-medium ${getScoreColor(averageScore)}`}>
                      {getScoreLabel(averageScore)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        averageScore >= 8 ? 'bg-green-500' : 
                        averageScore >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${averageScore * 10}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
} 
