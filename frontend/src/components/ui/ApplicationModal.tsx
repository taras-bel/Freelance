import { useState } from 'react'
import { X, Send, DollarSign, Clock, FileText } from 'lucide-react'
import { Task } from '../../hooks/useTasks'

interface ApplicationModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (applicationData: {
    cover_letter: string
    proposed_budget?: number
    estimated_duration?: string
  }) => Promise<{ success: boolean; error?: string }>
}

export default function ApplicationModal({ 
  task, 
  isOpen, 
  onClose, 
  onSubmit 
}: ApplicationModalProps) {
  const [formData, setFormData] = useState({
    cover_letter: '',
    proposed_budget: '',
    estimated_duration: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await onSubmit({
        cover_letter: formData.cover_letter,
        proposed_budget: formData.proposed_budget ? parseInt(formData.proposed_budget) : undefined,
        estimated_duration: formData.estimated_duration || undefined
      })

      if (result.success) {
        onClose()
        // Reset form
        setFormData({
          cover_letter: '',
          proposed_budget: '',
          estimated_duration: ''
        })
      } else {
        setError(result.error || 'Failed to submit application')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      setFormData({
        cover_letter: '',
        proposed_budget: '',
        estimated_duration: ''
      })
      setError(null)
    }
  }

  if (!isOpen || !task) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold">Apply for Task</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Submit your application for "{task.title}"
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Task Preview */}
        <div className="p-6 border-b border-border bg-muted/30">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-semibold">
              {task.client.avatar}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{task.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <DollarSign size={14} />
                  <span>${task.budget.min.toLocaleString()} - ${task.budget.max.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{task.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>•</span>
                  <span>{task.difficulty}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-red-600">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Cover Letter */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Cover Letter *
            </label>
            <textarea
              value={formData.cover_letter}
              onChange={(e) => setFormData(prev => ({ ...prev, cover_letter: e.target.value }))}
              placeholder="Introduce yourself and explain why you're the best fit for this task. Include your relevant experience, approach to the project, and any questions you have..."
              rows={6}
              className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Minimum 50 characters. Be specific about your experience and approach.
            </p>
          </div>

          {/* Budget and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Proposed Budget (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  type="number"
                  value={formData.proposed_budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, proposed_budget: e.target.value }))}
                  placeholder="e.g., 1500"
                  min={task.budget.min}
                  max={task.budget.max}
                  className="w-full pl-10 pr-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Between ${task.budget.min.toLocaleString()} - ${task.budget.max.toLocaleString()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Estimated Duration
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  type="text"
                  value={formData.estimated_duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: e.target.value }))}
                  placeholder="e.g., 2-3 weeks"
                  className="w-full pl-10 pr-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                How long will it take you to complete?
              </p>
            </div>
          </div>

          {/* Skills Match */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Your Skills Match
            </label>
            <div className="flex flex-wrap gap-2">
              {task.skills.map(skill => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Make sure to mention your experience with these skills in your cover letter.
            </p>
          </div>

          {/* Tips */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="font-medium text-blue-600 mb-2">💡 Tips for a successful application:</h4>
            <ul className="text-sm text-blue-600/80 space-y-1">
              <li>• Be specific about your experience with the required skills</li>
              <li>• Explain your approach to solving the problem</li>
              <li>• Ask relevant questions to show your understanding</li>
              <li>• Provide examples of similar work you've done</li>
              <li>• Be professional but friendly in your tone</li>
            </ul>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 border border-input rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !formData.cover_letter.trim()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send size={16} />
                Submit Application
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
} 
