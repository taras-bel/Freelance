import { useState, useRef, useEffect } from 'react'
import { Search as SearchIcon, X, Filter, Target, User, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchResult {
  id: string
  type: 'task' | 'user' | 'skill'
  title: string
  description: string
  icon: React.ComponentType<any>
  href: string
}

const mockResults: SearchResult[] = [
  {
    id: '1',
    type: 'task',
    title: 'React Component Library',
    description: 'Create a reusable component library',
    icon: Target,
    href: '/tasks/1'
  },
  {
    id: '2',
    type: 'task',
    title: 'Mobile App UI Design',
    description: 'Design modern mobile app interface',
    icon: Target,
    href: '/tasks/2'
  },
  {
    id: '3',
    type: 'user',
    title: 'John Developer',
    description: 'Full-stack developer with 5 years experience',
    icon: User,
    href: '/profile/john'
  },
  {
    id: '4',
    type: 'skill',
    title: 'React.js',
    description: 'JavaScript library for building user interfaces',
    icon: Target,
    href: '/skills/react'
  }
]

export default function Search() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setQuery('')
        setResults([])
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.trim()) {
      const filtered = mockResults.filter(result =>
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.description.toLowerCase().includes(query.toLowerCase())
      )
      setResults(filtered)
      setSelectedIndex(-1)
    } else {
      setResults([])
    }
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => 
        prev < results.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleResultClick(results[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setQuery('')
      setResults([])
    }
  }

  const handleResultClick = (result: SearchResult) => {
    // In a real app, you would navigate to the result
    console.log('Navigating to:', result.href)
    setIsOpen(false)
    setQuery('')
    setResults([])
  }

  const handleFocus = () => {
    setIsOpen(true)
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder="Search tasks, skills, or users..."
          className="w-full pl-10 pr-10 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && (query.trim() || results.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 max-h-96 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-border">
              <span className="text-sm font-medium">Search Results</span>
              <button className="p-1 rounded-lg hover:bg-muted/50 transition-colors">
                <Filter size={16} />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto">
              {results.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <SearchIcon size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No results found</p>
                  <p className="text-xs mt-1">Try different keywords</p>
                </div>
              ) : (
                <div className="p-2">
                  {results.map((result, index) => {
                    const Icon = result.icon
                    return (
                      <motion.button
                        key={result.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleResultClick(result)}
                        className={`w-full flex items-center gap-3 p-3 text-left rounded-lg transition-all duration-200 ${
                          selectedIndex === index
                            ? 'bg-primary/10 border border-primary/20'
                            : 'hover:bg-muted/50 border border-transparent'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          result.type === 'task' ? 'bg-blue-500/10 text-blue-500' :
                          result.type === 'user' ? 'bg-green-500/10 text-green-500' :
                          'bg-purple-500/10 text-purple-500'
                        }`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm mb-1">{result.title}</h4>
                          <p className="text-xs text-muted-foreground">{result.description}</p>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          result.type === 'task' ? 'bg-blue-500/10 text-blue-500' :
                          result.type === 'user' ? 'bg-green-500/10 text-green-500' :
                          'bg-purple-500/10 text-purple-500'
                        }`}>
                          {result.type}
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {results.length > 0 && (
              <div className="p-3 border-t border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{results.length} results</span>
                  <div className="flex items-center gap-4">
                    <span>↑↓ to navigate</span>
                    <span>Enter to select</span>
                    <span>Esc to close</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 
