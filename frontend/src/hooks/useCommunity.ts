import { useState, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

export interface ForumTopic {
  id: string
  title: string
  author: string
  category: string
  replies: number
  views: number
  lastReply: string
  isPinned?: boolean
  likes: number
  tags: string[]
  content: string
  isLiked?: boolean
}

export interface Group {
  id: string
  name: string
  description: string
  memberCount: number
  category: string
  isJoined: boolean
  avatar: string
  recentActivity: string
  rules: string[]
  posts: ForumTopic[]
}

export interface Mentor {
  id: string
  name: string
  avatar: string
  specialties: string[]
  rating: number
  hourlyRate: number
  availability: string
  description: string
  experience: number
  sessionsCompleted: number
  languages: string[]
  isAvailable: boolean
  isBookmarked?: boolean
}

export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  type: 'webinar' | 'workshop' | 'meetup' | 'conference'
  attendees: number
  maxAttendees: number
  isRegistered: boolean
  location: string
  organizer: string
  tags: string[]
}

export interface Resource {
  id: string
  title: string
  description: string
  type: 'article' | 'video' | 'course' | 'tool'
  author: string
  rating: number
  views: number
  tags: string[]
  url: string
  isBookmarked: boolean
}

export interface ChatMessage {
  id: string
  user: string
  avatar: string
  message: string
  timestamp: Date
  isOnline: boolean
}

const initialTopics: ForumTopic[] = [
  {
    id: '1',
    title: 'Best practices for React performance optimization',
    author: 'Alex Chen',
    category: 'Frontend Development',
    replies: 23,
    views: 156,
    lastReply: '2024-01-15T10:30:00Z',
    isPinned: true,
    likes: 45,
    tags: ['React', 'Performance', 'Optimization'],
    content: 'I\'ve been working on optimizing React applications and wanted to share some best practices...',
    isLiked: false
  },
  {
    id: '2',
    title: 'How to transition from freelancer to agency owner',
    author: 'Sarah Johnson',
    category: 'Business & Career',
    replies: 18,
    views: 89,
    lastReply: '2024-01-14T15:45:00Z',
    likes: 32,
    tags: ['Business', 'Career', 'Agency'],
    content: 'After 5 years of freelancing, I\'m considering starting my own agency...',
    isLiked: true
  },
  {
    id: '3',
    title: 'AI tools that actually help with development',
    author: 'Mike Rodriguez',
    category: 'Tools & Technology',
    replies: 31,
    views: 234,
    lastReply: '2024-01-15T09:15:00Z',
    likes: 67,
    tags: ['AI', 'Tools', 'Development'],
    content: 'I\'ve been experimenting with various AI tools for development...',
    isLiked: false
  }
]

const initialGroups: Group[] = [
  {
    id: '1',
    name: 'React Developers',
    description: 'Share knowledge, ask questions, and collaborate on React projects',
    memberCount: 1247,
    category: 'Frontend',
    isJoined: true,
    avatar: '⚛️',
    recentActivity: 'New discussion about React 19 features',
    rules: ['Be respectful', 'No spam', 'Stay on topic'],
    posts: []
  },
  {
    id: '2',
    name: 'AI/ML Enthusiasts',
    description: 'Discuss AI trends, share projects, and learn together',
    memberCount: 892,
    category: 'AI/ML',
    isJoined: false,
    avatar: '🤖',
    recentActivity: 'Workshop on building LLM applications',
    rules: ['Share code responsibly', 'Cite sources', 'Help beginners'],
    posts: []
  }
]

const initialMentors: Mentor[] = [
  {
    id: '1',
    name: 'Dr. Emily Watson',
    avatar: '👩‍🏫',
    specialties: ['React', 'TypeScript', 'System Design'],
    rating: 4.9,
    hourlyRate: 150,
    availability: 'Mon-Fri, 9AM-5PM EST',
    description: 'Senior Frontend Architect with 8+ years of experience building scalable applications.',
    experience: 8,
    sessionsCompleted: 156,
    languages: ['English', 'Spanish'],
    isAvailable: true,
    isBookmarked: false
  },
  {
    id: '2',
    name: 'Marcus Chen',
    avatar: '👨‍💻',
    specialties: ['Python', 'Machine Learning', 'Data Science'],
    rating: 4.8,
    hourlyRate: 120,
    availability: 'Weekends, Flexible',
    description: 'ML Engineer helping developers transition into AI/ML roles.',
    experience: 6,
    sessionsCompleted: 89,
    languages: ['English', 'Mandarin'],
    isAvailable: true,
    isBookmarked: true
  }
]

const initialEvents: Event[] = [
  {
    id: '1',
    title: 'Advanced React Patterns Workshop',
    description: 'Learn advanced React patterns and best practices from industry experts',
    date: '2024-01-25',
    time: '2:00 PM EST',
    type: 'workshop',
    attendees: 45,
    maxAttendees: 50,
    isRegistered: true,
    location: 'Virtual',
    organizer: 'React Community',
    tags: ['React', 'Workshop', 'Advanced']
  },
  {
    id: '2',
    title: 'Freelancer Tax Strategies',
    description: 'Essential tax tips and strategies for freelancers',
    date: '2024-01-28',
    time: '7:00 PM EST',
    type: 'webinar',
    attendees: 89,
    maxAttendees: 100,
    isRegistered: false,
    location: 'Virtual',
    organizer: 'Freelance Finance',
    tags: ['Tax', 'Finance', 'Business']
  }
]

const initialResources: Resource[] = [
  {
    id: '1',
    title: 'Complete React Performance Guide',
    description: 'Comprehensive guide to optimizing React applications',
    type: 'article',
    author: 'Alex Chen',
    rating: 4.8,
    views: 1245,
    tags: ['React', 'Performance', 'Guide'],
    url: 'https://example.com/react-performance',
    isBookmarked: true
  },
  {
    id: '2',
    title: 'Freelancer Tax Masterclass',
    description: 'Video course covering all aspects of freelancer taxation',
    type: 'course',
    author: 'Sarah Johnson',
    rating: 4.9,
    views: 892,
    tags: ['Tax', 'Course', 'Business'],
    url: 'https://example.com/tax-course',
    isBookmarked: false
  }
]

const initialChatMessages: ChatMessage[] = [
  {
    id: '1',
    user: 'Alex Chen',
    avatar: '👨‍💻',
    message: 'Has anyone tried the new React 19 features?',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    isOnline: true
  },
  {
    id: '2',
    user: 'Sarah Johnson',
    avatar: '👩‍🎨',
    message: 'Yes! The new compiler is amazing for performance',
    timestamp: new Date(Date.now() - 3 * 60 * 1000),
    isOnline: true
  }
]

export function useCommunity() {
  const [topics, setTopics] = useLocalStorage<ForumTopic[]>('forum-topics', initialTopics)
  const [groups, setGroups] = useLocalStorage<Group[]>('groups', initialGroups)
  const [mentors, setMentors] = useLocalStorage<Mentor[]>('mentors', initialMentors)
  const [events, setEvents] = useLocalStorage<Event[]>('events', initialEvents)
  const [resources, setResources] = useLocalStorage<Resource[]>('resources', initialResources)
  const [chatMessages, setChatMessages] = useLocalStorage<ChatMessage[]>('chat-messages', initialChatMessages)

  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    type: 'all'
  })

  // Forum functions
  const createTopic = useCallback((topic: Omit<ForumTopic, 'id' | 'replies' | 'views' | 'likes' | 'lastReply'>) => {
    const newTopic: ForumTopic = {
      ...topic,
      id: Date.now().toString(),
      replies: 0,
      views: 0,
      likes: 0,
      lastReply: new Date().toISOString()
    }
    setTopics(prev => [newTopic, ...prev])
  }, [setTopics])

  const likeTopic = useCallback((topicId: string) => {
    setTopics(prev => 
      prev.map(topic => 
        topic.id === topicId 
          ? { 
              ...topic, 
              likes: topic.isLiked ? topic.likes - 1 : topic.likes + 1,
              isLiked: !topic.isLiked
            }
          : topic
      )
    )
  }, [setTopics])

  // Group functions
  const joinGroup = useCallback((groupId: string) => {
    setGroups(prev => 
      prev.map(group => 
        group.id === groupId 
          ? { 
              ...group, 
              isJoined: !group.isJoined,
              memberCount: group.isJoined ? group.memberCount - 1 : group.memberCount + 1
            }
          : group
      )
    )
  }, [setGroups])

  // Mentor functions
  const bookmarkMentor = useCallback((mentorId: string) => {
    setMentors(prev => 
      prev.map(mentor => 
        mentor.id === mentorId 
          ? { ...mentor, isBookmarked: !mentor.isBookmarked }
          : mentor
      )
    )
  }, [setMentors])

  const bookSession = useCallback((mentorId: string) => {
    console.log('Booking session with mentor:', mentorId)
    // TODO: Implement booking logic
  }, [])

  // Event functions
  const registerForEvent = useCallback((eventId: string) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === eventId 
          ? { 
              ...event, 
              isRegistered: !event.isRegistered,
              attendees: event.isRegistered ? event.attendees - 1 : event.attendees + 1
            }
          : event
      )
    )
  }, [setEvents])

  // Resource functions
  const bookmarkResource = useCallback((resourceId: string) => {
    setResources(prev => 
      prev.map(resource => 
        resource.id === resourceId 
          ? { ...resource, isBookmarked: !resource.isBookmarked }
          : resource
      )
    )
  }, [setResources])

  // Chat functions
  const sendMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    }
    setChatMessages(prev => [...prev, newMessage])
  }, [setChatMessages])

  // Filter functions
  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         topic.content.toLowerCase().includes(filters.search.toLowerCase()) ||
                         topic.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()))
    const matchesCategory = filters.category === 'all' || topic.category === filters.category
    return matchesSearch && matchesCategory
  })

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         group.description.toLowerCase().includes(filters.search.toLowerCase())
    const matchesCategory = filters.category === 'all' || group.category === filters.category
    return matchesSearch && matchesCategory
  })

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         mentor.specialties.some(skill => skill.toLowerCase().includes(filters.search.toLowerCase()))
    return matchesSearch
  })

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         event.description.toLowerCase().includes(filters.search.toLowerCase())
    const matchesType = filters.type === 'all' || event.type === filters.type
    return matchesSearch && matchesType
  })

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         resource.description.toLowerCase().includes(filters.search.toLowerCase())
    const matchesType = filters.type === 'all' || resource.type === filters.type
    return matchesSearch && matchesType
  })

  return {
    topics: filteredTopics,
    groups: filteredGroups,
    mentors: filteredMentors,
    events: filteredEvents,
    resources: filteredResources,
    chatMessages,
    filters,
    setFilters,
    createTopic,
    likeTopic,
    joinGroup,
    bookmarkMentor,
    bookSession,
    registerForEvent,
    bookmarkResource,
    sendMessage
  }
} 