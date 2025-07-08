import { useState } from 'react'
import { 
  Bot, 
  User, 
  Send, 
  Clock, 
  CheckCircle, 
  X, 
  ArrowLeft,
  MessageSquare,
  Star,
  Target
} from 'lucide-react'
import { InterviewSession, InterviewQuestion } from '../../hooks/useAIInterview'

interface ActiveInterviewProps {
  session: InterviewSession
  currentAnswer: string
  onAnswerChange: (answer: string) => void
  onSubmitAnswer: () => void
  onFinish: () => void
  isLoading: boolean
}

export default function ActiveInterview({
  session,
  currentAnswer,
  onAnswerChange,
  onSubmitAnswer,
  onFinish,
  isLoading
}: ActiveInterviewProps) {
  const currentQuestion = session.questions[session.currentQuestionIndex]
  const progress = ((session.currentQuestionIndex + 1) / session.questions.length) * 100

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmitAnswer()
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[80vh] bg-background border border-border rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <button
              onClick={onFinish}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl font-semibold">AI Interview</h2>
              <p className="text-sm text-muted-foreground">{session.scenario}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock size={16} />
              <span>Question {session.currentQuestionIndex + 1} of {session.questions.length}</span>
            </div>
            <button
              onClick={onFinish}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-6 py-2 border-b border-border">
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Questions and answers */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Previous questions and answers */}
              {session.questions.slice(0, session.currentQuestionIndex).map((question, index) => (
                <div key={question.id} className="space-y-3">
                  {/* Question */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot size={16} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="font-medium mb-2">Question {index + 1}:</p>
                        <p>{question.question}</p>
                      </div>
                    </div>
                  </div>

                  {/* Answer */}
                  {question.answer && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                        <User size={16} className="text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <p className="font-medium mb-2 text-green-600">Your Answer:</p>
                          <p>{question.answer}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  {question.feedback && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <MessageSquare size={16} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-medium text-blue-600">AI Feedback:</p>
                            {question.score && (
                              <div className="flex items-center gap-1">
                                <Star size={14} className="text-yellow-500 fill-current" />
                                <span className="text-sm font-medium">{question.score}/10</span>
                              </div>
                            )}
                          </div>
                          <p>{question.feedback}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Current question */}
              {currentQuestion && (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot size={16} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                        <p className="font-medium mb-2">Question {session.currentQuestionIndex + 1}:</p>
                        <p>{currentQuestion.question}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Answer input */}
            <div className="p-6 border-t border-border">
              <div className="space-y-3">
                <label className="text-sm font-medium">Your Answer:</label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <textarea
                      value={currentAnswer}
                      onChange={(e) => onAnswerChange(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your answer here..."
                      className="w-full p-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      rows={4}
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    onClick={onSubmitAnswer}
                    disabled={!currentAnswer.trim() || isLoading}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                    ) : (
                      <Send size={16} />
                    )}
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Interview info sidebar */}
          <div className="w-80 p-6 border-l border-border overflow-y-auto">
            <div className="space-y-6">
              {/* Interview details */}
              <div className="space-y-4">
                <h3 className="font-semibold">Interview Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Target size={16} className="text-muted-foreground" />
                    <span className="text-sm">Role: {session.role}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-muted-foreground" />
                    <span className="text-sm">Level: {session.level}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-muted-foreground" />
                    <span className="text-sm">
                      Started: {session.startedAt.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-3">
                <h3 className="font-semibold">Progress</h3>
                <div className="space-y-2">
                  {session.questions.map((question, index) => (
                    <div
                      key={question.id}
                      className={`flex items-center gap-2 p-2 rounded-lg ${
                        index < session.currentQuestionIndex
                          ? 'bg-green-500/10 text-green-600'
                          : index === session.currentQuestionIndex
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted/50 text-muted-foreground'
                      }`}
                    >
                      {index < session.currentQuestionIndex ? (
                        <CheckCircle size={16} />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-current" />
                      )}
                      <span className="text-sm">Question {index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="space-y-3">
                <h3 className="font-semibold">Tips</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Take your time to think before answering</p>
                  <p>• Provide specific examples from your experience</p>
                  <p>• Be honest about your knowledge level</p>
                  <p>• Ask for clarification if needed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
