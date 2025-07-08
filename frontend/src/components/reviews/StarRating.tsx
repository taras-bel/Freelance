import { useState } from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onRatingChange?: (rating: number) => void
  showValue?: boolean
  className?: string
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  showValue = false,
  className = ''
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)
  const [selectedRating, setSelectedRating] = useState(rating)

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const handleMouseEnter = (starIndex: number) => {
    if (interactive) {
      setHoverRating(starIndex + 1)
    }
  }

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0)
    }
  }

  const handleClick = (starIndex: number) => {
    if (interactive && onRatingChange) {
      const newRating = starIndex + 1
      setSelectedRating(newRating)
      onRatingChange(newRating)
    }
  }

  const displayRating = interactive ? (hoverRating || selectedRating) : rating

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1
          const isFilled = starValue <= displayRating
          const isHalf = !isFilled && starValue - 0.5 <= displayRating

          return (
            <button
              key={index}
              type="button"
              className={`transition-colors ${
                interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
              }`}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(index)}
              disabled={!interactive}
            >
              <Star
                className={`${sizeClasses[size]} ${
                  isFilled
                    ? 'fill-yellow-400 text-yellow-400'
                    : isHalf
                    ? 'fill-yellow-400/50 text-yellow-400/50'
                    : 'fill-gray-200 text-gray-200 dark:fill-gray-600 dark:text-gray-600'
                }`}
              />
            </button>
          )
        })}
      </div>
      {showValue && (
        <span className="text-sm text-muted-foreground ml-1">
          {displayRating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

// Компонент для отображения рейтинга с текстом
interface RatingDisplayProps {
  rating: number
  totalReviews?: number
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function RatingDisplay({
  rating,
  totalReviews,
  size = 'md',
  showText = true,
  className = ''
}: RatingDisplayProps) {
  const getRatingText = (rating: number) => {
    if (rating >= 4.5) return 'Excellent'
    if (rating >= 4.0) return 'Very Good'
    if (rating >= 3.5) return 'Good'
    if (rating >= 3.0) return 'Average'
    if (rating >= 2.0) return 'Below Average'
    return 'Poor'
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <StarRating rating={rating} size={size} showValue />
      {showText && (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{getRatingText(rating)}</span>
          {totalReviews !== undefined && (
            <span className="text-xs text-muted-foreground">
              {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Компонент для отображения распределения звезд
interface RatingDistributionProps {
  distribution: {
    five: number
    four: number
    three: number
    two: number
    one: number
  }
  total: number
  className?: string
}

export function RatingDistribution({
  distribution,
  total,
  className = ''
}: RatingDistributionProps) {
  const getPercentage = (count: number) => {
    return total > 0 ? Math.round((count / total) * 100) : 0
  }

  const stars = [
    { label: '5 stars', count: distribution.five, percentage: getPercentage(distribution.five) },
    { label: '4 stars', count: distribution.four, percentage: getPercentage(distribution.four) },
    { label: '3 stars', count: distribution.three, percentage: getPercentage(distribution.three) },
    { label: '2 stars', count: distribution.two, percentage: getPercentage(distribution.two) },
    { label: '1 star', count: distribution.one, percentage: getPercentage(distribution.one) }
  ]

  return (
    <div className={`space-y-2 ${className}`}>
      {stars.map((star, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-12">{star.label}</span>
          <div className="flex-1 bg-muted rounded-full h-2">
            <div
              className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${star.percentage}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground w-8 text-right">
            {star.count}
          </span>
        </div>
      ))}
    </div>
  )
} 
