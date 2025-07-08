import { useState } from 'react'
import { 
  CheckCircle, 
  X, 
  Star, 
  Target, 
  TrendingUp, 
  MessageSquare, 
  Download, 
  Share2,
  BarChart3,
  Award,
  Clock,
  Calendar
} from 'lucide-react'
import { InterviewSession } from '../../hooks/useAIInterview'

interface InterviewResultsProps {
  session: InterviewSession
  onClose: () => void
  onRetake: () => void
}

export default function InterviewResults({ 
  session, 
  onClose, 
  onRetake 
}: InterviewResultsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'analysis'>('overview')

  const totalQuestions = session.questions.length
  const answeredQuestions = session.questions.filter(q => q.answer).length
  const averageScore = session.results.length > 0 
    ? Math.round(session.results.reduce((sum, r) => sum + (r.score || 0), 0) / session.results.length)
    : 0

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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
    { id: 'questions', label: 'Questions', icon: <MessageSquare size={16} /> },
    { id: 'analysis', label: 'Analysis', icon: <TrendingUp size={16} /> }
  ]

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[90vh] bg-background border border-border rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold">Interview Results</h2>
            <p className="text-muted-foreground">{session.scenario}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onRetake}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Retake Interview
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'overview' && (
            <div className="p-6 overflow-y-auto">
              {/* Score Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card p-6 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">{averageScore}/10</div>
                  <div className={`text-lg font-medium mb-1 ${getScoreColor(averageScore)}`}>
                    {getScoreLabel(averageScore)}
                  </div>
                  <div className="text-sm text-muted-foreground">Average Score</div>
                </div>
                <div className="card p-6 text-center">
                  <div className="text-4xl font-bold text-blue-500 mb-2">{answeredQuestions}/{totalQuestions}</div>
                  <div className="text-lg font-medium mb-1">Questions Answered</div>
                  <div className="text-sm text-muted-foreground">
                    {Math.round((answeredQuestions / totalQuestions) * 100)}% Completion
                  </div>
                </div>
                <div className="card p-6 text-center">
                  <div className="text-4xl font-bold text-green-500 mb-2">
                    {session.completedAt ? 
                      Math.round((session.completedAt.getTime() - session.startedAt.getTime()) / 1000 / 60)
                      : 0
                    }m
                  </div>
                  <div className="text-lg font-medium mb-1">Duration</div>
                  <div className="text-sm text-muted-foreground">Total Time</div>
                </div>
              </div>

              {/* Interview Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="card p-6">
                  <h3 className="text-lg font-semibold mb-4">Interview Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Target size={16} className="text-muted-foreground" />
                      <div>
                        <div className="font-medium">Role</div>
                        <div className="text-sm text-muted-foreground">{session.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Star size={16} className="text-muted-foreground" />
                      <div>
                        <div className="font-medium">Level</div>
                        <div className="text-sm text-muted-foreground">{session.level}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar size={16} className="text-muted-foreground" />
                      <div>
                        <div className="font-medium">Started</div>
                        <div className="text-sm text-muted-foreground">
                          {session.startedAt.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {session.completedAt && (
                      <div className="flex items-center gap-3">
                        <CheckCircle size={16} className="text-muted-foreground" />
                        <div>
                          <div className="font-medium">Completed</div>
                          <div className="text-sm text-muted-foreground">
                            {session.completedAt.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="text-lg font-semibold mb-4">Performance Insights</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Overall Performance</span>
                        <span className={`text-sm font-bold ${getScoreColor(averageScore)}`}>
                          {getScoreLabel(averageScore)}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            averageScore >= 8 ? 'bg-green-500' : 
                            averageScore >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${averageScore * 10}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Questions Answered</span>
                        <span className="font-medium">{answeredQuestions}/{totalQuestions}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Average Response Time</span>
                        <span className="font-medium">
                          {session.completedAt ? 
                            Math.round((session.completedAt.getTime() - session.startedAt.getTime()) / 1000 / 60 / totalQuestions)
                            : 0
                          }m per question
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                <div className="space-y-3">
                  {averageScore < 6 && (
                    <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <Award size={16} className="text-red-500 mt-0.5" />
                      <div>
                        <div className="font-medium text-red-600">Focus on Fundamentals</div>
                        <div className="text-sm text-red-600/80">
                          Consider reviewing basic concepts and practicing more before your next interview.
                        </div>
                      </div>
                    </div>
                  )}
                  {averageScore >= 6 && averageScore < 8 && (
                    <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <Award size={16} className="text-yellow-500 mt-0.5" />
                      <div>
                        <div className="font-medium text-yellow-600">Good Foundation</div>
                        <div className="text-sm text-yellow-600/80">
                          You have a solid understanding. Focus on advanced topics and practical examples.
                        </div>
                      </div>
                    </div>
                  )}
                  {averageScore >= 8 && (
                    <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <Award size={16} className="text-green-500 mt-0.5" />
                      <div>
                        <div className="font-medium text-green-600">Excellent Performance</div>
                        <div className="text-sm text-green-600/80">
                          Outstanding work! You're well-prepared for real interviews.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="p-6 overflow-y-auto">
              <div className="space-y-6">
                {session.questions.map((question, index) => (
                  <div key={question.id} className="card p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold">Question {index + 1}</h3>
                      {question.score && (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                          question.score >= 8 ? 'bg-green-500/10 text-green-500' :
                          question.score >= 6 ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          <Star size={14} />
                          {question.score}/10
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="font-medium mb-2">Question:</div>
                        <div className="p-3 bg-muted/50 rounded-lg">{question.question}</div>
                      </div>
                      
                      {question.answer && (
                        <div>
                          <div className="font-medium mb-2">Your Answer:</div>
                          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            {question.answer}
                          </div>
                        </div>
                      )}
                      
                      {question.feedback && (
                        <div>
                          <div className="font-medium mb-2">AI Feedback:</div>
                          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            {question.feedback}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="p-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Score Distribution */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold mb-4">Score Distribution</h3>
                  <div className="space-y-3">
                    {session.questions.map((question, index) => (
                      <div key={question.id} className="flex items-center gap-4">
                        <div className="w-8 text-sm font-medium">Q{index + 1}</div>
                        <div className="flex-1">
                          <div className="w-full bg-muted rounded-full h-3">
                            {question.score && (
                              <div 
                                className={`h-3 rounded-full transition-all duration-300 ${
                                  question.score >= 8 ? 'bg-green-500' : 
                                  question.score >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${question.score * 10}%` }}
                              />
                            )}
                          </div>
                        </div>
                        <div className="w-12 text-sm font-medium text-right">
                          {question.score ? `${question.score}/10` : 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detailed Analysis */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold mb-4">Detailed Analysis</h3>
                  <div className="space-y-4">
                    {session.results.map((result, index) => (
                      <div key={index} className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Question {index + 1} Analysis</span>
                          {result.score && (
                            <span className={`text-sm font-bold ${getScoreColor(result.score)}`}>
                              {result.score}/10
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {result.feedback}
                        </div>
                        {result.recommendations && (
                          <div className="mt-2 p-2 bg-primary/10 border border-primary/20 rounded text-sm">
                            <div className="font-medium text-primary mb-1">Recommendations:</div>
                            <div>{result.recommendations}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
