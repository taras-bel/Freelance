import { useState, useRef, useEffect } from 'react'
import { 
  Search, 
  Bookmark, 
  Clock, 
  Star,
  Play,
  CheckCircle,
  Calendar,
  MessageSquare,
  Send,
  Mic,
  Target,
  Users,
  Zap,
  Trophy,
  DollarSign,
  BarChart3,
  BookOpen,
  ArrowUp,
  ArrowDown,
  Activity,
  Eye,
  Bell,
  Pause,
  RotateCcw,
  Settings,
  MicOff,
  Bot,
  User,
  Timer,
  Share2,
  Download,
  Heart,
  MoreHorizontal
} from 'lucide-react'
import { useAuthStore } from '../../store/auth'
import { useInterviews, InterviewTest, InterviewMessage } from '../../hooks/useInterviews'
import { useAIInterview, InterviewSession } from '../../hooks/useAIInterview'
import { aiApi, InterviewStartRequest, InterviewAnswerRequest, AssistantChatRequest } from '../../api/ai'
import ActiveInterview from '../../components/interview/ActiveInterview'
import InterviewResults from '../../components/interview/InterviewResults'
import InterviewHistory from '../../components/interview/InterviewHistory'

const InterviewCard = ({ test, onBookmark, onStart }: { 
  test: InterviewTest; 
  onBookmark: (id: string) => void;
  onStart: (id: string) => void;
}) => {
  const getTypeIcon = (type: string) => {
    const icons = {
      technical: <Target size={16} />,
      behavioral: <Users size={16} />,
      mixed: <Zap size={16} />,
      voice: <Mic size={16} />
    }
    return icons[type as keyof typeof icons] || <Target size={16} />
  }

  const getTypeColor = (type: string) => {
    const colors = {
      technical: 'text-blue-500',
      behavioral: 'text-green-500',
      mixed: 'text-purple-500',
      voice: 'text-orange-500'
    }
    return colors[type as keyof typeof colors] || 'text-gray-500'
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return null
    
    const badges = {
      completed: { label: 'Completed', color: 'bg-green-500/10 text-green-500' },
      scheduled: { label: 'Scheduled', color: 'bg-blue-500/10 text-blue-500' },
      available: { label: 'Available', color: 'bg-gray-500/10 text-gray-500' }
    }
    return badges[status as keyof typeof badges]
  }

  const badge = getStatusBadge(test.status)

  return (
    <div className="card p-6 hover:shadow-lg transition-all duration-200 hover-glow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 rounded-lg bg-muted/50 ${getTypeColor(test.type)}`}>
              {getTypeIcon(test.type)}
            </div>
            <h3 className="text-lg font-semibold">{test.title}</h3>
            {badge && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                {badge.label}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm mb-3">{test.description}</p>
        </div>
        <button
          onClick={() => onBookmark(test.id)}
          className={`p-2 rounded-lg transition-colors ${
            test.isBookmarked 
              ? 'text-primary bg-primary/10' 
              : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
          }`}
        >
          <Bookmark size={16} className={test.isBookmarked ? 'fill-current' : ''} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {test.skills.map((skill) => (
          <span
            key={skill}
            className="px-2 py-1 bg-muted/50 text-xs rounded-full text-muted-foreground"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{test.duration} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Target size={14} />
            <span>{test.questions} questions</span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={14} />
            <span>Level {test.difficulty}</span>
          </div>
        </div>
        {test.company && (
          <div className="text-right">
            <p className="text-sm font-medium">{test.company}</p>
          </div>
        )}
      </div>

      {test.score && (
        <div className="mb-4 p-3 bg-green-500/10 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-600">Score</span>
            <span className="text-lg font-bold text-green-600">{test.score}%</span>
          </div>
          <div className="w-full bg-green-200 rounded-full h-2 mt-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${test.score}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {test.completedAt && (
            <>
              <Calendar size={12} />
              <span>Completed {new Date(test.completedAt).toLocaleDateString()}</span>
            </>
          )}
        </div>
        <div className="flex gap-2">
          {test.status === 'available' && (
            <button 
              onClick={() => onStart(test.id)}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <Play size={14} />
              Start Test
            </button>
          )}
          {test.status === 'scheduled' && (
            <button className="btn-secondary text-sm flex items-center gap-2">
              <Calendar size={14} />
              Reschedule
            </button>
          )}
          {test.status === 'completed' && (
            <button className="btn-secondary text-sm flex items-center gap-2">
              <CheckCircle size={14} />
              Review
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const ChatMessage = ({ message }: { message: InterviewMessage }) => {
  const isUser = message.type === 'user'
  
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <MessageSquare size={16} className="text-primary" />
        </div>
      )}
      <div className={`max-w-[70%] ${isUser ? 'order-first' : ''}`}>
        <div className={`p-3 rounded-lg ${
          isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted/50 text-foreground'
        }`}>
          <p className="text-sm">{message.content}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}

const AIAssistant = ({ messages, onSendMessage }: { 
  messages: InterviewMessage[];
  onSendMessage: (message: string) => void;
}) => {
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return

    const message = inputMessage.trim()
    setInputMessage('')
    setIsLoading(true)

    try {
      // Отправляем сообщение в AI API
      const response = await aiApi.chatWithAssistant({
        message,
        context: 'Freelance platform assistant - helping with interviews, tasks, and career advice'
      })

      // Добавляем сообщение пользователя и ответ AI
      onSendMessage(message)
      onSendMessage(response.reply)
    } catch (error) {
      console.error('Failed to send message to AI:', error)
      onSendMessage('Sorry, I encountered an error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot size={16} className="text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">AI Assistant</h3>
          <p className="text-xs text-muted-foreground">Ask me anything about freelancing</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Bot size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Start a conversation with your AI assistant</p>
            <p className="text-xs mt-1">Ask about interviews, tasks, or career advice</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))
        )}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot size={16} className="text-primary" />
            </div>
            <div className="flex items-center gap-1">
              <div className="animate-bounce">●</div>
              <div className="animate-bounce" style={{ animationDelay: '0.1s' }}>●</div>
              <div className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-1 px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim() || isLoading}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

const StatsPanel = ({ stats }: { stats: any }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="card p-4 text-center">
        <div className="text-2xl font-bold text-primary mb-1">{stats.total}</div>
        <div className="text-xs text-muted-foreground">Total Tests</div>
      </div>
      <div className="card p-4 text-center">
        <div className="text-2xl font-bold text-green-500 mb-1">{stats.completed}</div>
        <div className="text-xs text-muted-foreground">Completed</div>
      </div>
      <div className="card p-4 text-center">
        <div className="text-2xl font-bold text-blue-500 mb-1">{stats.scheduled}</div>
        <div className="text-xs text-muted-foreground">Scheduled</div>
      </div>
      <div className="card p-4 text-center">
        <div className="text-2xl font-bold text-yellow-500 mb-1">{Math.round(stats.averageScore)}%</div>
        <div className="text-xs text-muted-foreground">Avg. Score</div>
      </div>
    </div>
  )
}

export default function Interview() {
  const { user } = useAuthStore()
  const {
    tests,
    messages,
    filters,
    setFilters,
    toggleBookmark,
    startTest,
    addMessage,
    sendAIResponse,
    stats
  } = useInterviews()

  const {
    sessions,
    currentSession,
    isLoading: aiLoading,
    error: aiError,
    startInterview,
    submitAnswer,
    finishInterview,
    showResults,
    hideResults,
    getCompletedSessions
  } = useAIInterview()

  const [activeTab, setActiveTab] = useState<'tests' | 'history' | 'assistant'>('tests')
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null)
  const [selectedTest, setSelectedTest] = useState<InterviewTest | null>(null)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [resultsSession, setResultsSession] = useState<InterviewSession | null>(null)

  const handleStartTest = async (testId: string) => {
    const test = tests.find(t => t.id === testId)
    if (!test) return

    setSelectedTest(test)

    try {
      // Запускаем AI-интервью через хук
      await startInterview({
        role: test.skills.join(', '),
        level: test.difficulty === 'Beginner' ? 'junior' : test.difficulty === 'Advanced' ? 'senior' : 'middle',
        language: 'en'
      })
    } catch (error) {
      console.error('Failed to start interview:', error)
      setShowSuccessMessage('Failed to start interview. Please try again.')
    }
  }

  const handleSendMessage = async (content: string) => {
    addMessage({ type: 'user', content })
    sendAIResponse()
  }

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() || !currentSession) return

    const answer = currentAnswer.trim()
    setCurrentAnswer('')

    try {
      await submitAnswer(answer)
    } catch (error) {
      console.error('Failed to submit answer:', error)
      setShowSuccessMessage('Failed to submit answer. Please try again.')
    }
  }

  const handleFinishInterview = () => {
    finishInterview()
    setSelectedTest(null)
    setCurrentAnswer('')
  }

  const handleViewResults = (session: InterviewSession) => {
    setResultsSession(session)
  }

  const handleHideResults = () => {
    setResultsSession(null)
  }

  const handleRetakeInterview = (session: InterviewSession) => {
    setSelectedTest({
      id: 'retake',
      title: `Retake: ${session.role}`,
      description: 'Retaking previous interview',
      type: 'technical',
      skills: session.role.split(', '),
      difficulty: session.level === 'junior' ? 'Beginner' : session.level === 'senior' ? 'Advanced' : 'Intermediate',
      duration: 30,
      questions: session.questions.length,
      company: '',
      status: 'available',
      isBookmarked: false,
      score: undefined,
      completedAt: undefined
    })
    
    startInterview({
      role: session.role,
      level: session.level,
      language: 'en'
    })
  }

  const handleDeleteSession = (sessionId: string) => {
    // В реальном приложении здесь был бы API-запрос для удаления
    console.log('Delete session:', sessionId)
  }

  const filteredTests = tests.filter(test => {
    if (filters.type === 'all') return true
    return test.type === filters.type
  })

  const testTypes = [
    { id: 'all', label: 'All Tests', count: tests.length },
    { id: 'technical', label: 'Technical', count: tests.filter(t => t.type === 'technical').length },
    { id: 'behavioral', label: 'Behavioral', count: tests.filter(t => t.type === 'behavioral').length },
    { id: 'mixed', label: 'Mixed', count: tests.filter(t => t.type === 'mixed').length },
    { id: 'voice', label: 'Voice', count: tests.filter(t => t.type === 'voice').length }
  ]

  const completedSessions = getCompletedSessions()

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold">Interview Preparation</h1>
        <p className="text-muted-foreground">
          Practice and prepare for your next interview, {user?.first_name || user?.username}
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

      {/* Stats */}
      <StatsPanel stats={stats} />

      {/* Main tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('tests')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'tests'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Available Tests ({tests.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'history'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          History ({completedSessions.length})
        </button>
        <button
          onClick={() => setActiveTab('assistant')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'assistant'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          AI Assistant
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'tests' && (
        <>
          {/* Search and filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search tests, skills, or companies..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex gap-2">
              {testTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setFilters({ ...filters, type: type.id })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.type === type.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {type.label} ({type.count})
                </button>
              ))}
            </div>
          </div>

          {/* Tests list */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {filteredTests.length > 0 ? (
                <div className="space-y-4">
                  {filteredTests.map((test) => (
                    <InterviewCard
                      key={test.id}
                      test={test}
                      onBookmark={toggleBookmark}
                      onStart={handleStartTest}
                    />
                  ))}
                </div>
              ) : (
                <div className="card p-8 text-center">
                  <div className="text-4xl mb-4">🎯</div>
                  <h3 className="text-lg font-semibold mb-2">No tests found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or search terms
                  </p>
                </div>
              )}
            </div>

            {/* AI Assistant */}
            <div className="lg:col-span-1">
              <AIAssistant messages={messages} onSendMessage={handleSendMessage} />
            </div>
          </div>
        </>
      )}

      {activeTab === 'history' && (
        <InterviewHistory
          sessions={completedSessions}
          onViewResults={handleViewResults}
          onRetake={handleRetakeInterview}
          onDelete={handleDeleteSession}
        />
      )}

      {activeTab === 'assistant' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">AI Interview Assistant</h3>
              <p className="text-muted-foreground mb-6">
                Get personalized help with your interview preparation. Ask questions about specific topics, 
                request practice questions, or get feedback on your answers.
              </p>
              <AIAssistant messages={messages} onSendMessage={handleSendMessage} />
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Tips</h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="font-medium text-blue-600 mb-1">Research the Company</div>
                  <div className="text-blue-600/80">Always research the company and role before interviews</div>
                </div>
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="font-medium text-green-600 mb-1">Practice Common Questions</div>
                  <div className="text-green-600/80">Prepare answers for common behavioral questions</div>
                </div>
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <div className="font-medium text-purple-600 mb-1">Technical Preparation</div>
                  <div className="text-purple-600/80">Review technical concepts and practice coding problems</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Interview Modal */}
      {currentSession && currentSession.isActive && (
        <ActiveInterview
          session={currentSession}
          currentAnswer={currentAnswer}
          onAnswerChange={setCurrentAnswer}
          onSubmitAnswer={handleSubmitAnswer}
          onFinish={handleFinishInterview}
          isLoading={aiLoading}
        />
      )}

      {/* Results Modal */}
      {resultsSession && (
        <InterviewResults
          session={resultsSession}
          onClose={handleHideResults}
          onRetake={() => {
            handleHideResults()
            handleRetakeInterview(resultsSession)
          }}
        />
      )}
    </div>
  )
} 
