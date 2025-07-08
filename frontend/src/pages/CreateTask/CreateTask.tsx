import { useState } from 'react'
import { 
  Plus,
  Save,
  X,
  DollarSign,
  Calendar,
  Target,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { useAuthStore } from '../../store/auth'
import { useNavigate } from 'react-router-dom'

interface TaskForm {
  title: string
  description: string
  category: string
  skills_required: string[]
  budget_min: number
  budget_max: number
  difficulty: string
  duration: string
  deadline: string
}

const categories = [
  'Frontend Development',
  'Backend Development',
  'Full Stack Development',
  'Mobile Development',
  'UI/UX Design',
  'Graphic Design',
  'Content Writing',
  'Digital Marketing',
  'Data Science',
  'DevOps',
  'QA Testing',
  'Other'
]

const difficulties = [
  { value: 'beginner', label: 'Beginner', color: 'text-green-500' },
  { value: 'intermediate', label: 'Intermediate', color: 'text-yellow-500' },
  { value: 'advanced', label: 'Advanced', color: 'text-red-500' }
]

const durations = [
  '1-3 days',
  '1 week',
  '2-3 weeks',
  '1 month',
  '2-3 months',
  'Ongoing'
]

export default function CreateTask() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState<TaskForm>({
    title: '',
    description: '',
    category: '',
    skills_required: [],
    budget_min: 0,
    budget_max: 0,
    difficulty: '',
    duration: '',
    deadline: ''
  })

  const [newSkill, setNewSkill] = useState('')

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!form.title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!form.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (!form.category) {
      newErrors.category = 'Category is required'
    }
    if (form.skills_required.length === 0) {
      newErrors.skills_required = 'At least one skill is required'
    }
    if (form.budget_min <= 0) {
      newErrors.budget_min = 'Minimum budget must be greater than 0'
    }
    if (form.budget_max <= form.budget_min) {
      newErrors.budget_max = 'Maximum budget must be greater than minimum budget'
    }
    if (!form.difficulty) {
      newErrors.difficulty = 'Difficulty level is required'
    }
    if (!form.duration) {
      newErrors.duration = 'Duration is required'
    }
    if (!form.deadline) {
      newErrors.deadline = 'Deadline is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setShowSuccess(true)
      setTimeout(() => {
        navigate('/tasks')
      }, 2000)
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !form.skills_required.includes(newSkill.trim())) {
      setForm(prev => ({
        ...prev,
        skills_required: [...prev.skills_required, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skill: string) => {
    setForm(prev => ({
      ...prev,
      skills_required: prev.skills_required.filter(s => s !== skill)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSkill()
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Create New Task</h1>
        <p className="text-muted-foreground">
          Post a new freelance opportunity and find the perfect freelancer
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="card p-4 bg-green-500/10 border-green-500/20">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle size={16} />
            <span>Task created successfully! Redirecting to tasks page...</span>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target size={20} />
                Basic Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Task Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring ${
                      errors.title ? 'border-red-500' : 'border-input'
                    }`}
                    placeholder="e.g., Build a React E-commerce Dashboard"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                    className={`w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring ${
                      errors.category ? 'border-red-500' : 'border-input'
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.category}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty Level *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {difficulties.map(difficulty => (
                      <button
                        key={difficulty.value}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, difficulty: difficulty.value }))}
                        className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                          form.difficulty === difficulty.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-input hover:border-primary/50'
                        }`}
                      >
                        <span className={difficulty.color}>{difficulty.label}</span>
                      </button>
                    ))}
                  </div>
                  {errors.difficulty && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.difficulty}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Budget */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign size={20} />
                Budget
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Minimum Budget *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                    <input
                      type="number"
                      value={form.budget_min}
                      onChange={(e) => setForm(prev => ({ ...prev, budget_min: parseFloat(e.target.value) || 0 }))}
                      className={`w-full pl-8 pr-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring ${
                        errors.budget_min ? 'border-red-500' : 'border-input'
                      }`}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  {errors.budget_min && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.budget_min}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Maximum Budget *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                    <input
                      type="number"
                      value={form.budget_max}
                      onChange={(e) => setForm(prev => ({ ...prev, budget_max: parseFloat(e.target.value) || 0 }))}
                      className={`w-full pl-8 pr-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring ${
                        errors.budget_max ? 'border-red-500' : 'border-input'
                      }`}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  {errors.budget_max && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.budget_max}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock size={20} />
                Timeline & Requirements
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Estimated Duration *</label>
                  <select
                    value={form.duration}
                    onChange={(e) => setForm(prev => ({ ...prev, duration: e.target.value }))}
                    className={`w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring ${
                      errors.duration ? 'border-red-500' : 'border-input'
                    }`}
                  >
                    <option value="">Select duration</option>
                    {durations.map(duration => (
                      <option key={duration} value={duration}>{duration}</option>
                    ))}
                  </select>
                  {errors.duration && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.duration}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Deadline *</label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm(prev => ({ ...prev, deadline: e.target.value }))}
                    className={`w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring ${
                      errors.deadline ? 'border-red-500' : 'border-input'
                    }`}
                  />
                  {errors.deadline && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.deadline}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Required Skills *</label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="e.g., React, TypeScript"
                      />
                      <button
                        type="button"
                        onClick={addSkill}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    {form.skills_required.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {form.skills_required.map(skill => (
                          <span
                            key={skill}
                            className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="hover:text-primary/70"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.skills_required && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.skills_required}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Task Description *</h3>
              <textarea
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                rows={8}
                className={`w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none ${
                  errors.description ? 'border-red-500' : 'border-input'
                }`}
                placeholder="Describe your project in detail. Include requirements, deliverables, and any specific instructions..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/tasks')}
            className="px-6 py-2 border border-input rounded-lg hover:bg-muted/50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save size={16} />
                Create Task
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
} 
