import { useState, useEffect } from 'react'
import { X, Star, Send } from 'lucide-react'
import { Review, ReviewCreate, ReviewUpdate } from '../../api/reviews'
import StarRating from './StarRating'

interface ReviewFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ReviewCreate | ReviewUpdate) => void
  review?: Review | null
  targetUserName?: string
  loading?: boolean
}

export default function ReviewForm({
  isOpen,
  onClose,
  onSubmit,
  review,
  targetUserName,
  loading = false
}: ReviewFormProps) {
  const [formData, setFormData] = useState({
    rating: review?.rating || 0,
    title: review?.title || '',
    comment: review?.comment || '',
    communication_rating: review?.communication_rating || 0,
    quality_rating: review?.quality_rating || 0,
    timeliness_rating: review?.timeliness_rating || 0,
    professionalism_rating: review?.professionalism_rating || 0
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (review) {
      setFormData({
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        communication_rating: review.communication_rating || 0,
        quality_rating: review.quality_rating || 0,
        timeliness_rating: review.timeliness_rating || 0,
        professionalism_rating: review.professionalism_rating || 0
      })
    } else {
      setFormData({
        rating: 0,
        title: '',
        comment: '',
        communication_rating: 0,
        quality_rating: 0,
        timeliness_rating: 0,
        professionalism_rating: 0
      })
    }
    setErrors({})
  }, [review, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (formData.rating === 0) {
      newErrors.rating = 'Please select a rating'
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    }

    if (!formData.comment.trim()) {
      newErrors.comment = 'Comment is required'
    } else if (formData.comment.length < 10) {
      newErrors.comment = 'Comment must be at least 10 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const submitData = {
      rating: formData.rating,
      title: formData.title.trim(),
      comment: formData.comment.trim(),
      communication_rating: formData.communication_rating || undefined,
      quality_rating: formData.quality_rating || undefined,
      timeliness_rating: formData.timeliness_rating || undefined,
      professionalism_rating: formData.professionalism_rating || undefined
    }

    onSubmit(submitData)
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">
            {review ? 'Edit Review' : 'Write a Review'}
            {targetUserName && (
              <span className="text-sm font-normal text-muted-foreground block">
                for {targetUserName}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted/50 transition-colors"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Overall Rating *
            </label>
            <StarRating
              rating={formData.rating}
              interactive
              onRatingChange={(rating) => handleInputChange('rating', rating)}
              size="lg"
            />
            {errors.rating && (
              <p className="text-red-500 text-xs mt-1">{errors.rating}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Review Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Brief summary of your experience"
              disabled={loading}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Detailed Review *
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => handleInputChange('comment', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Share your detailed experience..."
              disabled={loading}
            />
            {errors.comment && (
              <p className="text-red-500 text-xs mt-1">{errors.comment}</p>
            )}
          </div>

          {/* Category Ratings */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Detailed Ratings (Optional)
            </label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Communication</span>
                <StarRating
                  rating={formData.communication_rating}
                  interactive
                  onRatingChange={(rating) => handleInputChange('communication_rating', rating)}
                  size="sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Quality of Work</span>
                <StarRating
                  rating={formData.quality_rating}
                  interactive
                  onRatingChange={(rating) => handleInputChange('quality_rating', rating)}
                  size="sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Timeliness</span>
                <StarRating
                  rating={formData.timeliness_rating}
                  interactive
                  onRatingChange={(rating) => handleInputChange('timeliness_rating', rating)}
                  size="sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Professionalism</span>
                <StarRating
                  rating={formData.professionalism_rating}
                  interactive
                  onRatingChange={(rating) => handleInputChange('professionalism_rating', rating)}
                  size="sm"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-input rounded-lg hover:bg-muted/50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || formData.rating === 0}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send size={16} />
              )}
              {review ? 'Update Review' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 
