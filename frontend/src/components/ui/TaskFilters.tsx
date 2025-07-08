import { useState } from 'react'
import { 
  Filter, 
  X, 
  DollarSign, 
  Clock, 
  Target, 
  MapPin,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/auth'

interface FilterOption {
  value: string
  label: string
  count?: number
  disabled?: boolean
}

interface TaskFiltersProps {
  filters: {
    category: string
    difficulty: string
    budget: string
    location: string
    skills: string[]
  }
  onFilterChange: (key: string, value: any) => void
  onClearFilters: () => void
}

const categories: FilterOption[] = [
  { value: 'all', label: 'All Categories', count: 156 },
  { value: 'web-development', label: 'Web Development', count: 45 },
  { value: 'mobile-development', label: 'Mobile Development', count: 32 },
  { value: 'ui-ux-design', label: 'UI/UX Design', count: 28 },
  { value: 'data-science', label: 'Data Science', count: 19 },
  { value: 'marketing', label: 'Marketing', count: 22 },
  { value: 'writing', label: 'Content Writing', count: 10 }
]

const { user } = useAuthStore()
const userLevel = user?.level ?? 3 // по умолчанию 3, если нет

const complexityLevels: FilterOption[] = [
  { value: 'all', label: 'All Levels' },
  ...[1, 2, 3, 4, 5].map((lvl) => ({
    value: lvl.toString(),
    label: ['Very Easy', 'Easy', 'Medium', 'Hard', 'Expert'][lvl - 1],
    disabled: lvl > userLevel
  }))
]

const budgetRanges: FilterOption[] = [
  { value: 'all', label: 'All Budgets', count: 156 },
  { value: '0-100', label: '$0 - $100', count: 23 },
  { value: '100-500', label: '$100 - $500', count: 45 },
  { value: '500-1000', label: '$500 - $1,000', count: 38 },
  { value: '1000-5000', label: '$1,000 - $5,000', count: 32 },
  { value: '5000+', label: '$5,000+', count: 18 }
]

const locations: FilterOption[] = [
  { value: 'all', label: 'All Locations', count: 156 },
  { value: 'remote', label: 'Remote', count: 89 },
  { value: 'us', label: 'United States', count: 34 },
  { value: 'eu', label: 'Europe', count: 21 },
  { value: 'asia', label: 'Asia', count: 12 }
]

const popularSkills: FilterOption[] = [
  { value: 'react', label: 'React', count: 45 },
  { value: 'javascript', label: 'JavaScript', count: 67 },
  { value: 'python', label: 'Python', count: 38 },
  { value: 'nodejs', label: 'Node.js', count: 29 },
  { value: 'figma', label: 'Figma', count: 23 },
  { value: 'aws', label: 'AWS', count: 19 }
]

export default function TaskFilters({ filters, onFilterChange, onClearFilters }: TaskFiltersProps) {
  const [expandedFilters, setExpandedFilters] = useState<Set<string>>(new Set(['category']))
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const toggleFilter = (filterName: string) => {
    const newExpanded = new Set(expandedFilters)
    if (newExpanded.has(filterName)) {
      newExpanded.delete(filterName)
    } else {
      newExpanded.add(filterName)
    }
    setExpandedFilters(newExpanded)
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== 'all'
  )

  const FilterSection = ({ 
    title, 
    options, 
    filterKey, 
    multiSelect = false 
  }: {
    title: string
    options: FilterOption[]
    filterKey: string
    multiSelect?: boolean
  }) => {
    const isExpanded = expandedFilters.has(filterKey)
    const currentValue = filters[filterKey as keyof typeof filters]

    const handleOptionClick = (optionValue: string) => {
      if (multiSelect) {
        const currentArray = Array.isArray(currentValue) ? currentValue : []
        const newValue = currentArray.includes(optionValue)
          ? currentArray.filter(v => v !== optionValue)
          : [...currentArray, optionValue]
        onFilterChange(filterKey, newValue)
      } else {
        onFilterChange(filterKey, optionValue)
      }
    }

    const isSelected = (optionValue: string) => {
      if (multiSelect) {
        return Array.isArray(currentValue) && currentValue.includes(optionValue)
      }
      return currentValue === optionValue
    }

    return (
      <div className="border-b border-border last:border-b-0">
        <button
          onClick={() => toggleFilter(filterKey)}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium">{title}</span>
            {hasActiveFilters && isSelected('all') === false && (
              <span className="w-2 h-2 bg-primary rounded-full"></span>
            )}
          </div>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 space-y-2">
                {options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleOptionClick(option.value)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                      isSelected(option.value)
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'hover:bg-muted/50'
                    }`}
                    disabled={option.disabled}
                  >
                    <span className="text-sm">{option.label}</span>
                    {option.count && (
                      <span className="text-xs text-muted-foreground">
                        {option.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-lg"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} />
            <span className="font-medium">Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-primary rounded-full"></span>
            )}
          </div>
          {showMobileFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Mobile Filters */}
      <AnimatePresence>
        {showMobileFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden mb-6 bg-card border border-border rounded-lg overflow-hidden"
          >
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Filters</h3>
                {hasActiveFilters && (
                  <button
                    onClick={onClearFilters}
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              <FilterSection title="Category" options={categories} filterKey="category" />
              <FilterSection title="Difficulty" options={complexityLevels} filterKey="difficulty" />
              <FilterSection title="Budget" options={budgetRanges} filterKey="budget" />
              <FilterSection title="Location" options={locations} filterKey="location" />
              <FilterSection title="Skills" options={popularSkills} filterKey="skills" multiSelect />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Filters */}
      <div className="hidden lg:block card glass p-4 mb-6 border border-neon-teal/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="icon text-neon-teal" />
            <span className="font-grotesk text-neon-teal font-semibold">Фильтры</span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-xs text-neon-violet hover:underline"
            >
              Сбросить все
            </button>
          )}
        </div>
        <div className="space-y-2">
          <FilterSection
            title="Категория"
            options={categories}
            filterKey="category"
          />
          <FilterSection
            title="Сложность"
            options={complexityLevels}
            filterKey="difficulty"
          />
          <FilterSection
            title="Бюджет"
            options={budgetRanges}
            filterKey="budget"
          />
          <FilterSection
            title="Локация"
            options={locations}
            filterKey="location"
          />
          <FilterSection
            title="Навыки"
            options={popularSkills}
            filterKey="skills"
            multiSelect
          />
        </div>
      </div>
    </>
  )
} 
