import { useState, useRef, useEffect } from 'react'
import { 
  Bot, 
  Send, 
  MessageSquare, 
  Lightbulb, 
  Target, 
  BookOpen, 
  TrendingUp,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react'
import { aiApi } from '../../api/ai'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

interface AIAssistantProps {
  isOpen: boolean
  onToggle: () => void
}

const quickPrompts = [
  {
    icon: <Target size={16} />,
    text: "Help me improve my profile",
    prompt: "I want to improve my freelance profile. Can you give me some tips?"
  },
  {
    icon: <BookOpen size={16} />,
    text: "Interview preparation",
    prompt: "I have a technical interview tomorrow. Any advice?"
  },
  {
    icon: <TrendingUp size={16} />,
    text: "Career advice",
    prompt: "I want to advance my freelance career. What should I focus on?"
  },
  {
    icon: <Lightbulb size={16} />,
    text: "Task pricing",
    prompt: "How should I price my services for different types of projects?"
  }
]

export default function AIAssistant({ isOpen, onToggle }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm your AI assistant. I can help you with interviews, career advice, task pricing, and more. What would you like to know?",
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await aiApi.chatWithAssistant({
        message: content.trim(),
        context: 'Freelance platform assistant - helping with interviews, tasks, career advice, and profile optimization'
      })

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.reply,
        isUser: false,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Failed to send message to AI:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(inputMessage)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all duration-200 flex items-center justify-center z-50"
      >
        <Bot size={20} />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-background border border-border rounded-lg shadow-xl flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot size={16} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Your freelance helper</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </button>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!message.isUser && (
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot size={12} className="text-primary" />
                  </div>
                )}
                <div className={`max-w-[80%] ${message.isUser ? 'order-first' : ''}`}>
                  <div className={`p-2 rounded-lg text-xs ${
                    message.isUser 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted/50 text-foreground'
                  }`}>
                    <p>{message.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot size={12} className="text-primary" />
                </div>
                <div className="flex items-center gap-1">
                  <div className="animate-bounce text-xs">●</div>
                  <div className="animate-bounce text-xs" style={{ animationDelay: '0.1s' }}>●</div>
                  <div className="animate-bounce text-xs" style={{ animationDelay: '0.2s' }}>●</div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 1 && (
            <div className="p-4 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">Quick help:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickPrompt(prompt.prompt)}
                    className="p-2 text-xs bg-muted/50 hover:bg-muted rounded-lg transition-colors flex items-center gap-1"
                  >
                    {prompt.icon}
                    <span className="truncate">{prompt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-2 py-1 bg-background border border-input rounded text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage(inputMessage)}
                disabled={!inputMessage.trim() || isLoading}
                className="px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={12} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
} 
