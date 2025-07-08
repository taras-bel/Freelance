import React, { useState, useRef, useEffect } from 'react';
import { useSmartAssistant } from '../../hooks/useAI';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles,
  Lightbulb,
  Target,
  TrendingUp
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface SmartAssistantProps {
  className?: string;
  initialContext?: Record<string, any>;
}

export const SmartAssistant: React.FC<SmartAssistantProps> = ({ 
  className, 
  initialContext = {} 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Привет! Я ваш AI помощник для фриланс-платформы. Чем могу помочь?',
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const smartAssistant = useSmartAssistant();

  // Автоскролл к последнему сообщению
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || smartAssistant.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await smartAssistant.mutateAsync({
        message: inputValue,
        context: {
          ...initialContext,
          conversation_history: messages.slice(-5).map(m => ({
            role: m.sender,
            content: m.content
          }))
        }
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Извините, произошла ошибка. Попробуйте еще раз.',
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickSuggestions = [
    'Как создать эффективную заявку?',
    'Какие навыки востребованы?',
    'Как установить правильную цену?',
    'Советы по коммуникации с клиентами'
  ];

  const handleQuickSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
  };

  return (
    <Card className={cn("flex flex-col h-[600px] max-w-2xl mx-auto", className)}>
      {/* Заголовок */}
      <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-cyan-500/10 to-violet-500/10">
        <div className="p-2 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-lg">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">AI Помощник</h3>
          <p className="text-sm text-muted-foreground">
            Powered by Mistral AI
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-500" />
          <span className="text-xs text-muted-foreground">AI</span>
        </div>
      </div>

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.sender === 'assistant' && (
              <div className="p-2 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-lg">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            
            <div
              className={cn(
                "max-w-[80%] p-3 rounded-lg",
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>

            {message.sender === 'user' && (
              <div className="p-2 bg-primary rounded-lg">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}

        {/* Индикатор печати */}
        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="p-2 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-lg">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Быстрые предложения */}
      {messages.length === 1 && (
        <div className="p-4 border-t">
          <p className="text-sm text-muted-foreground mb-3">Популярные вопросы:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-auto p-2 text-left"
                onClick={() => handleQuickSuggestion(suggestion)}
              >
                <Lightbulb className="w-3 h-3 mr-1" />
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Поле ввода */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Задайте вопрос AI помощнику..."
            className="flex-1"
            disabled={smartAssistant.isPending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || smartAssistant.isPending}
            size="icon"
          >
            {smartAssistant.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        {smartAssistant.error && (
          <p className="text-xs text-destructive mt-2">
            Ошибка: {smartAssistant.error.message}
          </p>
        )}
      </div>
    </Card>
  );
}; 
