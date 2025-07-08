import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Paperclip,
  Smile,
  ArrowLeft,
  User,
  Clock
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { chatsApi } from '../../api/chats';

interface ChatFile {
  id: number;
  message_id: number;
  chat_id: number;
  user_id: number;
  filename: string;
  file_url: string;
  file_type: string;
  file_size: number;
  is_safe: boolean;
  uploaded_at: string;
}

interface Message {
  id: number;
  content: string;
  sender_id: number;
  created_at: string;
  is_read: boolean;
  files?: ChatFile[];
}

interface Chat {
  id: number;
  user1_id: number;
  user2_id: number;
  task_id?: number;
  created_at: string;
  last_message?: Message;
  other_user: {
    id: number;
    username: string;
    avatar?: string;
  };
}

const Chats: React.FC = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const { i18n } = useTranslation();
  const userLang = i18n.language || 'en';
  const [translatedMessages, setTranslatedMessages] = useState<Record<number, { text: string, loading: boolean, original: string }>>({});
  const [fileUploading, setFileUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data for demonstration
  useEffect(() => {
    const mockChats: Chat[] = [
      {
        id: 1,
        user1_id: 1,
        user2_id: 2,
        task_id: 1,
        created_at: '2024-01-15T10:00:00Z',
        other_user: {
          id: 2,
          username: 'John Developer',
          avatar: 'https://via.placeholder.com/40'
        },
        last_message: {
          id: 1,
          content: 'Hi! I\'m interested in your React project.',
          sender_id: 2,
          created_at: '2024-01-15T14:30:00Z',
          is_read: false
        }
      },
      {
        id: 2,
        user1_id: 1,
        user2_id: 3,
        task_id: 2,
        created_at: '2024-01-14T09:00:00Z',
        other_user: {
          id: 3,
          username: 'Sarah Designer',
          avatar: 'https://via.placeholder.com/40'
        },
        last_message: {
          id: 2,
          content: 'The design is ready for review.',
          sender_id: 3,
          created_at: '2024-01-15T16:45:00Z',
          is_read: true
        }
      }
    ];

    setChats(mockChats);
  }, []);

  useEffect(() => {
    if (selectedChat) {
      // Mock messages for selected chat
      const mockMessages: Message[] = [
        {
          id: 1,
          content: 'Hi! I\'m interested in your React project.',
          sender_id: 2,
          created_at: '2024-01-15T14:30:00Z',
          is_read: true
        },
        {
          id: 2,
          content: 'Great! Can you tell me more about your experience?',
          sender_id: 1,
          created_at: '2024-01-15T14:32:00Z',
          is_read: true
        },
        {
          id: 3,
          content: 'I have 5 years of experience with React, TypeScript, and Node.js. I\'ve built several large-scale applications.',
          sender_id: 2,
          created_at: '2024-01-15T14:35:00Z',
          is_read: true
        },
        {
          id: 4,
          content: 'That sounds perfect! When can you start?',
          sender_id: 1,
          created_at: '2024-01-15T14:40:00Z',
          is_read: false
        }
      ];
      setMessages(mockMessages);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!messages.length) return;
    const newTranslations: Record<number, { text: string, loading: boolean, original: string }> = {};
    messages.forEach(msg => {
      newTranslations[msg.id] = { text: '', loading: true, original: msg.content };
    });
    setTranslatedMessages(newTranslations);
    messages.forEach(async (msg) => {
      const detectedLang = 'en'; // TODO: заменить на определение языка msg.content
      if (userLang !== detectedLang) {
        try {
          const resp = await fetch('/api/v1/ai/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: msg.content,
              source_lang: detectedLang,
              target_lang: userLang
            })
          });
          const data = await resp.json();
          setTranslatedMessages(prev => ({
            ...prev,
            [msg.id]: { text: data.translated_text, loading: false, original: msg.content }
          }));
        } catch {
          setTranslatedMessages(prev => ({
            ...prev,
            [msg.id]: { text: '', loading: false, original: msg.content }
          }));
        }
      } else {
        setTranslatedMessages(prev => ({
          ...prev,
          [msg.id]: { text: '', loading: false, original: msg.content }
        }));
      }
    });
  }, [messages, userLang]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    const message: Message = {
      id: Date.now(),
      content: newMessage,
      sender_id: 1, // Current user
      created_at: new Date().toISOString(),
      is_read: false
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Update last message in chat list
    setChats(chats.map(chat => 
      chat.id === selectedChat.id 
        ? { ...chat, last_message: message }
        : chat
    ));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedChat || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setFileUploading(true);
    try {
      const uploaded = await chatsApi.uploadChatFile(selectedChat.id.toString(), file);
      setMessages((prev) => [...prev, uploaded]);
    } catch (err) {
      alert('File upload failed');
    } finally {
      setFileUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.other_user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              {selectedChat && (
                <button
                  onClick={() => setSelectedChat(null)}
                  className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <h1 className="text-2xl font-bold text-white">Messages</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto h-[calc(100vh-80px)] flex">
        {/* Chat List */}
        {!selectedChat && (
          <div className="w-full md:w-1/3 bg-white/10 backdrop-blur-md border-r border-white/20">
            {/* Search */}
            <div className="p-4 border-b border-white/20">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Chat List */}
            <div className="overflow-y-auto h-[calc(100vh-160px)]">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className="p-4 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/10"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={chat.other_user.avatar || 'https://via.placeholder.com/40'}
                      alt="Avatar"
                      className="h-12 w-12 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-medium truncate">
                          {chat.other_user.username}
                        </h3>
                        {chat.last_message && (
                          <span className="text-xs text-gray-400">
                            {formatTime(chat.last_message.created_at)}
                          </span>
                        )}
                      </div>
                      {chat.last_message && (
                        <p className="text-sm text-gray-300 truncate">
                          {chat.last_message.content}
                        </p>
                      )}
                    </div>
                    {chat.last_message && !chat.last_message.is_read && chat.last_message.sender_id !== 1 && (
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {selectedChat ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="bg-white/10 backdrop-blur-md border-b border-white/20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedChat.other_user.avatar || 'https://via.placeholder.com/40'}
                    alt="Avatar"
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <h3 className="text-white font-medium">
                      {selectedChat.other_user.username}
                    </h3>
                    <p className="text-sm text-gray-300">Online</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
                    <Phone className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
                    <Video className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === 1 ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender_id === 1
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/10 text-white'
                    }`}
                  >
                    <p className="text-sm">
                      {translatedMessages[message.id]?.loading ? (
                        <span className="animate-pulse text-xs text-muted-foreground">Translating...</span>
                      ) : translatedMessages[message.id]?.text ? (
                        <>
                          {translatedMessages[message.id].text}
                          <div className="text-xs text-gray-400 mt-1">
                            <span className="font-semibold">Original:</span> {message.content}
                          </div>
                        </>
                      ) : message.content}
                    </p>
                    <div className={`flex items-center justify-end mt-1 ${
                      message.sender_id === 1 ? 'text-purple-200' : 'text-gray-400'
                    }`}>
                      <span className="text-xs">
                        {formatTime(message.created_at)}
                      </span>
                      {message.sender_id === 1 && (
                        <span className="ml-1 text-xs">
                          {message.is_read ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                    {message.files && message.files.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.files.map(file => (
                          <a key={file.id} href={file.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex items-center gap-1">
                            <Paperclip size={14} />
                            {file.filename} ({(file.file_size / 1024 / 1024).toFixed(2)} MB)
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white/10 backdrop-blur-md border-t border-white/20 p-4">
              <div className="flex items-center space-x-2">
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={fileUploading} className="p-2 rounded hover:bg-muted transition-colors">
                  <Paperclip size={20} />
                </button>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg,.zip,.txt,.csv,.gif" />
                {fileUploading && <span className="text-xs text-blue-500 ml-2">Uploading...</span>}
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                  <Smile className="h-5 w-5" />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Select a conversation</h3>
              <p className="text-gray-300">
                Choose a chat from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chats; 
