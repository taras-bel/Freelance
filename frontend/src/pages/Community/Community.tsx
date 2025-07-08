import { useState } from 'react'
import { 
  Search, 
  Users,
  MessageSquare,
  Calendar,
  MapPin,
  Star,
  Heart,
  Share2,
  MoreHorizontal,
  Plus,
  CheckCircle,
  Video,
  Wrench,
  Globe,
  BookOpen,
  TrendingUp,
  Eye,
  Clock,
  Bookmark,
  DollarSign,
  Headphones,
  Send
} from 'lucide-react'
import { useAuthStore } from '../../store/auth'
import { useCommunity, ForumTopic, Group, Mentor, Event, Resource, ChatMessage as CommunityChatMessage } from '../../hooks/useCommunity'

const ForumCard = ({ topic, onLike }: { topic: ForumTopic; onLike: (id: string) => void }) => {
  return (
    <div className="card p-6 hover:shadow-lg transition-all duration-200 hover-glow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {topic.isPinned && (
              <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs rounded-full">
                Pinned
              </span>
            )}
            <h3 className="text-lg font-semibold hover:text-primary cursor-pointer">
              {topic.title}
            </h3>
          </div>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {topic.content}
          </p>
        </div>
        <button className="p-2 text-muted-foreground hover:text-foreground">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {topic.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-muted/50 text-xs rounded-full text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>{topic.replies} replies</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye size={14} />
            <span>{topic.views} views</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{new Date(topic.lastReply).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{topic.author}</span>
          <span className="text-sm text-muted-foreground">{topic.category}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => onLike(topic.id)}
          className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
            topic.isLiked 
              ? 'text-red-500 bg-red-500/10' 
              : 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10'
          }`}
        >
          <Heart size={14} className={topic.isLiked ? 'fill-current' : ''} />
          <span className="text-sm">{topic.likes}</span>
        </button>
        <div className="flex gap-2">
          <button className="p-2 text-muted-foreground hover:text-foreground">
            <Share2 size={14} />
          </button>
          <button className="p-2 text-muted-foreground hover:text-foreground">
            <MessageSquare size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

const GroupCard = ({ group, onJoin }: { group: Group; onJoin: (id: string) => void }) => {
  return (
    <div className="card p-6 hover:shadow-lg transition-all duration-200 hover-glow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{group.avatar}</div>
          <div>
            <h3 className="text-lg font-semibold">{group.name}</h3>
            <p className="text-sm text-muted-foreground">{group.category}</p>
          </div>
        </div>
        <button
          onClick={() => onJoin(group.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            group.isJoined
              ? 'bg-muted/50 text-muted-foreground'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {group.isJoined ? 'Joined' : 'Join'}
        </button>
      </div>

      <p className="text-muted-foreground text-sm mb-4">{group.description}</p>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>{group.memberCount} members</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{group.recentActivity}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Rules:</p>
        <div className="flex flex-wrap gap-1">
          {group.rules.map((rule, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-muted/30 text-xs rounded text-muted-foreground"
            >
              {rule}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

const MentorCard = ({ mentor, onBookmark, onBook }: { 
  mentor: Mentor; 
  onBookmark: (id: string) => void;
  onBook: (id: string) => void;
}) => {
  return (
    <div className="card p-6 hover:shadow-lg transition-all duration-200 hover-glow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{mentor.avatar}</div>
          <div>
            <h3 className="text-lg font-semibold">{mentor.name}</h3>
            <div className="flex items-center gap-1">
              <Star size={14} className="text-yellow-500 fill-current" />
              <span className="text-sm text-muted-foreground">{mentor.rating}</span>
              <span className="text-sm text-muted-foreground">({mentor.sessionsCompleted} sessions)</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => onBookmark(mentor.id)}
          className={`p-2 rounded-lg transition-colors ${
            mentor.isBookmarked 
              ? 'text-primary bg-primary/10' 
              : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
          }`}
        >
          <Bookmark size={16} className={mentor.isBookmarked ? 'fill-current' : ''} />
        </button>
      </div>

      <p className="text-muted-foreground text-sm mb-4">{mentor.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {mentor.specialties.map((specialty) => (
          <span
            key={specialty}
            className="px-2 py-1 bg-muted/50 text-xs rounded-full text-muted-foreground"
          >
            {specialty}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{mentor.availability}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign size={14} />
            <span>${mentor.hourlyRate}/hr</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp size={14} />
            <span>{mentor.experience} years</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${mentor.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-muted-foreground">
            {mentor.isAvailable ? 'Available' : 'Busy'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {mentor.languages.map((language) => (
            <span
              key={language}
              className="px-2 py-1 bg-muted/30 text-xs rounded text-muted-foreground"
            >
              {language}
            </span>
          ))}
        </div>
        <button
          onClick={() => onBook(mentor.id)}
          disabled={!mentor.isAvailable}
          className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Book Session
        </button>
      </div>
    </div>
  )
}

const EventCard = ({ event, onRegister }: { event: Event; onRegister: (id: string) => void }) => {
  const getTypeIcon = (type: string) => {
    const icons = {
      webinar: <Video size={16} />,
      workshop: <Wrench size={16} />,
      meetup: <Users size={16} />,
      conference: <Globe size={16} />
    }
    return icons[type as keyof typeof icons] || <Calendar size={16} />
  }

  const getTypeColor = (type: string) => {
    const colors = {
      webinar: 'text-blue-500',
      workshop: 'text-green-500',
      meetup: 'text-purple-500',
      conference: 'text-orange-500'
    }
    return colors[type as keyof typeof colors] || 'text-gray-500'
  }

  return (
    <div className="card p-6 hover:shadow-lg transition-all duration-200 hover-glow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 rounded-lg bg-muted/50 ${getTypeColor(event.type)}`}>
              {getTypeIcon(event.type)}
            </div>
            <h3 className="text-lg font-semibold">{event.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(event.type)} bg-muted/50`}>
              {event.type.toUpperCase()}
            </span>
          </div>
          <p className="text-muted-foreground text-sm mb-3">{event.description}</p>
        </div>
        <button
          onClick={() => onRegister(event.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            event.isRegistered
              ? 'bg-green-500/10 text-green-500'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {event.isRegistered ? 'Registered' : 'Register'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {event.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-muted/50 text-xs rounded-full text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{event.date} at {event.time}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin size={14} />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>{event.attendees}/{event.maxAttendees} attendees</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{event.organizer}</p>
        </div>
      </div>
    </div>
  )
}

const ResourceCard = ({ resource, onBookmark }: { resource: Resource; onBookmark: (id: string) => void }) => {
  const getTypeIcon = (type: string) => {
    const icons = {
      article: <BookOpen size={16} />,
      video: <Video size={16} />,
      course: <Headphones size={16} />,
      tool: <Wrench size={16} />
    }
    return icons[type as keyof typeof icons] || <BookOpen size={16} />
  }

  const getTypeColor = (type: string) => {
    const colors = {
      article: 'text-blue-500',
      video: 'text-red-500',
      course: 'text-green-500',
      tool: 'text-purple-500'
    }
    return colors[type as keyof typeof colors] || 'text-gray-500'
  }

  return (
    <div className="card p-6 hover:shadow-lg transition-all duration-200 hover-glow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 rounded-lg bg-muted/50 ${getTypeColor(resource.type)}`}>
              {getTypeIcon(resource.type)}
            </div>
            <h3 className="text-lg font-semibold hover:text-primary cursor-pointer">
              {resource.title}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(resource.type)} bg-muted/50`}>
              {resource.type.toUpperCase()}
            </span>
          </div>
          <p className="text-muted-foreground text-sm mb-3">{resource.description}</p>
        </div>
        <button
          onClick={() => onBookmark(resource.id)}
          className={`p-2 rounded-lg transition-colors ${
            resource.isBookmarked 
              ? 'text-primary bg-primary/10' 
              : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
          }`}
        >
          <Bookmark size={16} className={resource.isBookmarked ? 'fill-current' : ''} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {resource.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-muted/50 text-xs rounded-full text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star size={14} className="text-yellow-500 fill-current" />
            <span>{resource.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye size={14} />
            <span>{resource.views} views</span>
          </div>
          <div className="flex items-center gap-1">
            <span>by {resource.author}</span>
          </div>
        </div>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary text-sm"
        >
          View Resource
        </a>
      </div>
    </div>
  )
}

const ChatMessage = ({ message }: { message: CommunityChatMessage }) => {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-sm">
        {message.avatar}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">{message.user}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
          {message.isOnline && (
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          )}
        </div>
        <p className="text-sm">{message.message}</p>
      </div>
    </div>
  )
}

const LiveChat = ({ messages, onSendMessage }: { 
  messages: CommunityChatMessage[];
  onSendMessage: (message: string) => void;
}) => {
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input)
      setInput('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="card h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquare size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Live Chat</h3>
            <p className="text-sm text-muted-foreground">Connect with other freelancers</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Community() {
  const { user } = useAuthStore()
  const {
    topics,
    groups,
    mentors,
    events,
    resources,
    chatMessages,
    filters,
    setFilters,
    likeTopic,
    joinGroup,
    bookmarkMentor,
    bookSession,
    registerForEvent,
    bookmarkResource,
    sendMessage
  } = useCommunity()

  const [activeTab, setActiveTab] = useState<'forums' | 'groups' | 'mentors' | 'events' | 'resources' | 'chat'>('forums')
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null)

  const handleBookSession = (mentorId: string) => {
    bookSession(mentorId)
    setShowSuccessMessage('Session booking request sent!')
    setTimeout(() => setShowSuccessMessage(null), 3000)
  }

  const handleSendMessage = (content: string) => {
    sendMessage({
      user: user?.firstName || user?.username || 'Anonymous',
      avatar: '👤',
      message: content,
      isOnline: true
    })
  }

  const tabs = [
    { id: 'forums', label: 'Forums', count: topics.length },
    { id: 'groups', label: 'Groups', count: groups.length },
    { id: 'mentors', label: 'Mentors', count: mentors.length },
    { id: 'events', label: 'Events', count: events.length },
    { id: 'resources', label: 'Resources', count: resources.length },
    { id: 'chat', label: 'Live Chat', count: chatMessages.length }
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold">Community</h1>
        <p className="text-muted-foreground">
          Connect, learn, and grow with fellow freelancers, {user?.firstName || user?.username}
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

      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Search community content..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content area */}
        <div className="lg:col-span-2">
          {activeTab === 'forums' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Discussion Forums</h2>
                <button className="btn-primary text-sm flex items-center gap-2">
                  <Plus size={14} />
                  New Topic
                </button>
              </div>
              {topics.length > 0 ? (
                <div className="space-y-4">
                  {topics.map((topic) => (
                    <ForumCard key={topic.id} topic={topic} onLike={likeTopic} />
                  ))}
                </div>
              ) : (
                <div className="card p-8 text-center">
                  <div className="text-4xl mb-4">💬</div>
                  <h3 className="text-lg font-semibold mb-2">No topics found</h3>
                  <p className="text-muted-foreground">Try adjusting your search terms</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'groups' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Groups</h2>
                <button className="btn-primary text-sm flex items-center gap-2">
                  <Plus size={14} />
                  Create Group
                </button>
              </div>
              {groups.length > 0 ? (
                <div className="space-y-4">
                  {groups.map((group) => (
                    <GroupCard key={group.id} group={group} onJoin={joinGroup} />
                  ))}
                </div>
              ) : (
                <div className="card p-8 text-center">
                  <div className="text-4xl mb-4">👥</div>
                  <h3 className="text-lg font-semibold mb-2">No groups found</h3>
                  <p className="text-muted-foreground">Try adjusting your search terms</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'mentors' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Mentors</h2>
                <button className="btn-primary text-sm flex items-center gap-2">
                  <Plus size={14} />
                  Become Mentor
                </button>
              </div>
              {mentors.length > 0 ? (
                <div className="space-y-4">
                  {mentors.map((mentor) => (
                    <MentorCard 
                      key={mentor.id} 
                      mentor={mentor} 
                      onBookmark={bookmarkMentor}
                      onBook={handleBookSession}
                    />
                  ))}
                </div>
              ) : (
                <div className="card p-8 text-center">
                  <div className="text-4xl mb-4">👨‍🏫</div>
                  <h3 className="text-lg font-semibold mb-2">No mentors found</h3>
                  <p className="text-muted-foreground">Try adjusting your search terms</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Events</h2>
                <button className="btn-primary text-sm flex items-center gap-2">
                  <Plus size={14} />
                  Create Event
                </button>
              </div>
              {events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} onRegister={registerForEvent} />
                  ))}
                </div>
              ) : (
                <div className="card p-8 text-center">
                  <div className="text-4xl mb-4">📅</div>
                  <h3 className="text-lg font-semibold mb-2">No events found</h3>
                  <p className="text-muted-foreground">Try adjusting your search terms</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Knowledge Base</h2>
                <button className="btn-primary text-sm flex items-center gap-2">
                  <Plus size={14} />
                  Share Resource
                </button>
              </div>
              {resources.length > 0 ? (
                <div className="space-y-4">
                  {resources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} onBookmark={bookmarkResource} />
                  ))}
                </div>
              ) : (
                <div className="card p-8 text-center">
                  <div className="text-4xl mb-4">📚</div>
                  <h3 className="text-lg font-semibold mb-2">No resources found</h3>
                  <p className="text-muted-foreground">Try adjusting your search terms</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live Chat */}
        <div className="lg:col-span-1">
          <LiveChat messages={chatMessages} onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  )
} 
