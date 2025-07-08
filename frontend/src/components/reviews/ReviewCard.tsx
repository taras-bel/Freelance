import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Star, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Flag, 
  Calendar,
  User,
  MessageSquare
} from 'lucide-react'
import { Review } from '../../api/reviews'
import StarRating from './StarRating'

interface ReviewCardProps {
  review: Review
  isOwner?: boolean
  onEdit?: (review: Review) => void
  onDelete?: (reviewId: number) => void
  onReport?: (reviewId: number) => void
  showTaskInfo?: boolean
  className?: string
}

export default function ReviewCard({
  review,
  isOwner = false,
  onEdit,
  onDelete,
  onReport,
  showTaskInfo = false,
  className = ''
}: ReviewCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const { i18n } = useTranslation()
  const userLang = i18n.language || 'en'
  const [translated, setTranslated] = useState<{ text: string, detectedLang: string } | null>(null)
  const [loadingTranslation, setLoadingTranslation] = useState(false)

  useEffect(() => {
    let ignore = false
    async function translateIfNeeded() {
      setLoadingTranslation(true)
      try {
        const detectedLang = 'en' // TODO: заменить на определение языка review.comment
        if (userLang !== detectedLang) {
          const resp = await fetch('/api/v1/ai/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: review.comment,
              source_lang: detectedLang,
              target_lang: userLang
            })
          })
          const data = await resp.json()
          if (!ignore) {
            setTranslated({
              text: data.translated_text,
              detectedLang: data.detected_source_lang || detectedLang
            })
          }
        } else {
          setTranslated(null)
        }
      } catch (e) {
        setTranslated(null)
      } finally {
        setLoadingTranslation(false)
      }
    }
    translateIfNeeded()
    return () => { ignore = true }
  }, [review.comment, userLang])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCategoryRatings = () => {
    const categories = []
    if (review.communication_rating) {
      categories.push({ name: 'Communication', rating: review.communication_rating })
    }
    if (review.quality_rating) {
      categories.push({ name: 'Quality', rating: review.quality_rating })
    }
    if (review.timeliness_rating) {
      categories.push({ name: 'Timeliness', rating: review.timeliness_rating })
    }
    if (review.professionalism_rating) {
      categories.push({ name: 'Professionalism', rating: review.professionalism_rating })
    }
    return categories
  }

  return (
    <div className={`card p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            {review.reviewer_avatar ? (
              <img 
                src={review.reviewer_avatar} 
                alt={review.reviewer_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <User size={20} className="text-primary" />
            )}
          </div>
          <div>
            <h4 className="font-medium text-sm">{review.reviewer_name}</h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar size={12} />
              <span>{formatDate(review.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <MoreHorizontal size={16} className="text-muted-foreground" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-8 bg-card border border-border rounded-lg shadow-lg z-10 min-w-[120px]">
              {isOwner && onEdit && (
                <button
                  onClick={() => {
                    onEdit(review)
                    setShowMenu(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 flex items-center gap-2"
                >
                  <Edit size={14} />
                  Edit
                </button>
              )}
              {isOwner && onDelete && (
                <button
                  onClick={() => {
                    onDelete(review.id)
                    setShowMenu(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 flex items-center gap-2 text-red-500"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              )}
              {!isOwner && onReport && (
                <button
                  onClick={() => {
                    onReport(review.id)
                    setShowMenu(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 flex items-center gap-2 text-orange-500"
                >
                  <Flag size={14} />
                  Report
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Rating */}
      <div className="mb-3">
        <StarRating rating={review.rating} size="sm" showValue />
      </div>

      {/* Title */}
      <h3 className="font-semibold text-sm mb-2">{review.title}</h3>

      {/* Comment */}
      {translated ? (
        <>
          <p className="text-sm text-muted-foreground mb-1 leading-relaxed">
            {loadingTranslation ? <span className="animate-pulse text-xs text-muted-foreground">Translating...</span> : translated.text}
          </p>
          <div className="text-xs text-gray-400 mb-2">
            <span className="font-semibold">Original:</span> {review.comment}
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{review.comment}</p>
      )}

      {/* Category Ratings */}
      {getCategoryRatings().length > 0 && (
        <div className="mb-3 p-3 bg-muted/30 rounded-lg">
          <h5 className="text-xs font-medium text-muted-foreground mb-2">Detailed Ratings</h5>
          <div className="space-y-1">
            {getCategoryRatings().map((category) => (
              <div key={category.name} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{category.name}</span>
                <StarRating rating={category.rating} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Info */}
      {showTaskInfo && review.task_id && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
          <MessageSquare size={12} />
          <span>Review for task #{review.task_id}</span>
        </div>
      )}

      {/* Status Badge */}
      {review.status !== 'active' && (
        <div className="mt-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            review.status === 'reported' 
              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
          }`}>
            {review.status === 'reported' ? 'Reported' : 'Hidden'}
          </span>
        </div>
      )}
    </div>
  )
}

// Компонент для списка отзывов
interface ReviewListProps {
  reviews: Review[]
  isOwner?: boolean
  onEdit?: (review: Review) => void
  onDelete?: (reviewId: number) => void
  onReport?: (reviewId: number) => void
  showTaskInfo?: boolean
  className?: string
}

export function ReviewList({
  reviews,
  isOwner = false,
  onEdit,
  onDelete,
  onReport,
  showTaskInfo = false,
  className = ''
}: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <MessageSquare size={32} className="mx-auto mb-2 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
        <p className="text-muted-foreground">Be the first to leave a review!</p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          isOwner={isOwner}
          onEdit={onEdit}
          onDelete={onDelete}
          onReport={onReport}
          showTaskInfo={showTaskInfo}
        />
      ))}
    </div>
  )
} 
