import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Plus, 
  X, 
  Save, 
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  Target,
  FileText,
  Info
} from 'lucide-react'
import { useTasks } from '../../hooks/useTasks'
import { useAuthStore } from '../../store/auth'
import { aiApi, AnalyzeTaskComplexityResponse } from '../../api/ai'

const categories = [
  'Frontend Development',
  'Backend Development',
  'Full Stack Development',
  'Mobile Development',
  'UI/UX Design',
  'Graphic Design',
  'Content Writing',
  'Digital Marketing',
  'SEO',
  'Data Analysis',
  'AI/ML',
  'DevOps',
  'WordPress',
  'E-commerce',
  'Other'
]

const skills = [
  'React', 'Vue', 'Angular', 'TypeScript', 'JavaScript', 'HTML', 'CSS',
  'Node.js', 'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'MongoDB', 'PostgreSQL',
  'MySQL', 'Redis', 'GraphQL', 'REST API', 'Figma', 'Adobe XD', 'Sketch',
  'Photoshop', 'Illustrator', 'InDesign', 'WordPress', 'Shopify', 'WooCommerce',
  'SEO', 'Google Analytics', 'Facebook Ads', 'Google Ads', 'Content Writing',
  'Copywriting', 'Translation', 'Data Analysis', 'Machine Learning', 'TensorFlow',
  'PyTorch', 'OpenAI', 'ChatGPT', 'Flutter', 'React Native', 'Swift', 'Kotlin'
]

export default function CreateTask() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { createTask } = useTasks()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    skills_required: [] as string[],
    budget_min: '',
    budget_max: '',
    difficulty: 'intermediate',
    duration: '',
    deadline: '',
    location: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState<AnalyzeTaskComplexityResponse | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills_required: prev.skills_required.includes(skill)
        ? prev.skills_required.filter(s => s !== skill)
        : [...prev.skills_required, skill]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await createTask({
        ...formData,
        budget_min: parseInt(formData.budget_min),
        budget_max: parseInt(formData.budget_max)
      })

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/tasks')
        }, 2000)
      } else {
        setError(result.error || 'Failed to create task')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleAIAnalyze = async () => {
    setAiLoading(true)
    setAiError(null)
    setAiResult(null)
    try {
      const result = await aiApi.analyzeTaskComplexity({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        skills_required: formData.skills_required,
        deadline: formData.deadline,
        budget_min: formData.budget_min ? parseInt(formData.budget_min) : undefined,
        budget_max: formData.budget_max ? parseInt(formData.budget_max) : undefined
      })
      setAiResult(result)
    } catch (e: any) {
      setAiError(e?.response?.data?.detail || 'AI analysis failed')
    } finally {
      setAiLoading(false)
    }
  }

  const handleAIApply = () => {
    if (!aiResult) return
    setFormData(prev => ({
      ...prev,
      budget_min: aiResult.suggested_min_price.toString(),
      budget_max: aiResult.suggested_max_price.toString(),
      // complexity_level: aiResult.complexity_level // если есть поле сложности в форме
    }))
  }

  const isValid = formData.title && 
                 formData.description && 
                 formData.category && 
                 formData.budget_min && 
                 formData.budget_max &&
                 parseInt(formData.budget_min) <= parseInt(formData.budget_max)

  if (success) {
    return (
      <div className="card p-8 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h2 className="text-2xl font-bold mb-2">Task Created Successfully!</h2>
        <p className="text-muted-foreground">Redirecting to tasks page...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/tasks')}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold">Create New Task</h1>
          <p className="text-muted-foreground">
            Post a new freelance opportunity
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="card p-4 bg-red-500/10 border-red-500/20">
          <div className="flex items-center gap-2 text-red-600">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText size={20} />
                Basic Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., React E-commerce Dashboard"
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the task requirements, deliverables, and expectations..."
                    rows={6}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>

            {/* AI Recommendation Widget */}
            <div className="card p-6 glass border border-neon-teal/30">
              <div className="flex items-center gap-2 mb-2">
                <Info size={18} className="icon text-neon-teal" />
                <span className="font-grotesk text-neon-teal font-semibold">AI Recommendation</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Получите автоматическую рекомендацию по сложности и стоимости задачи на основе описания, категории и навыков.
              </p>
              <button
                type="button"
                className="button neon px-4 py-2 rounded-xl font-grotesk text-base mb-4"
                onClick={handleAIAnalyze}
                disabled={aiLoading || !formData.title || !formData.description || !formData.category}
              >
                {aiLoading ? 'Анализируем...' : 'Получить AI-рекомендацию'}
              </button>
              {aiError && (
                <div className="text-red-500 text-sm mb-2">{aiError}</div>
              )}
              {aiResult && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="font-grotesk text-neon-violet">Сложность:</span>
                    <span className="px-2 py-1 rounded-full bg-neon-teal/10 text-neon-teal font-semibold">
                      {aiResult.complexity_level} / 5
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-grotesk text-neon-violet">Рекомендованный бюджет:</span>
                    <span className="px-2 py-1 rounded-full bg-neon-violet/10 text-neon-violet font-semibold">
                      ${aiResult.suggested_min_price} - ${aiResult.suggested_max_price}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-grotesk text-neon-violet">Навыки:</span>
                    <span className="text-neon-teal text-sm">
                      {aiResult.required_skills.join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-grotesk text-neon-violet">Confidence:</span>
                    <span className="text-neon-teal text-sm">
                      {Math.round(aiResult.confidence_score * 100)}%
                    </span>
                  </div>
                  <button
                    type="button"
                    className="button glass px-4 py-2 rounded-xl font-grotesk text-base mt-2"
                    onClick={handleAIApply}
                  >
                    Применить рекомендацию
                  </button>
                </div>
              )}
            </div>

            {/* Budget */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign size={20} />
                Budget & Payment
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Minimum Budget (USD)
                  </label>
                  <input
                    type="number"
                    value={formData.budget_min}
                    onChange={(e) => handleInputChange('budget_min', e.target.value)}
                    placeholder="100"
                    min="1"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Maximum Budget (USD)
                  </label>
                  <input
                    type="number"
                    value={formData.budget_max}
                    onChange={(e) => handleInputChange('budget_max', e.target.value)}
                    placeholder="500"
                    min="1"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Commission Information */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Service Commission
                    </p>
                    <p className="text-blue-800 dark:text-blue-200">
                      A 3% service commission will be applied to all payments made through the platform. 
                      This helps us maintain and improve our services.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Required Skills */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target size={20} />
                Required Skills
              </h3>
              
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select the skills required for this task
                </p>
                
                <div className="max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {skills.map(skill => (
                      <label
                        key={skill}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                          formData.skills_required.includes(skill)
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'bg-muted/50 hover:bg-muted'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.skills_required.includes(skill)}
                          onChange={() => handleSkillToggle(skill)}
                          className="rounded border-input"
                        />
                        <span className="text-sm">{skill}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {formData.skills_required.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Selected Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills_required.map(skill => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs flex items-center gap-1"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleSkillToggle(skill)}
                            className="hover:text-primary/70"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Preview */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Task Preview</h3>
              
              {formData.title ? (
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">{formData.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formData.description.substring(0, 100)}
                      {formData.description.length > 100 && '...'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {formData.budget_min && formData.budget_max && (
                      <span>${formData.budget_min} - ${formData.budget_max}</span>
                    )}
                    {formData.duration && <span>{formData.duration}</span>}
                    {formData.category && <span>{formData.category}</span>}
                  </div>
                  
                  {formData.skills_required.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {formData.skills_required.slice(0, 3).map(skill => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-muted rounded-full text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                      {formData.skills_required.length > 3 && (
                        <span className="px-2 py-1 bg-muted rounded-full text-xs">
                          +{formData.skills_required.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Start filling out the form to see a preview
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/tasks')}
            className="px-6 py-2 border border-input rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid || loading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
