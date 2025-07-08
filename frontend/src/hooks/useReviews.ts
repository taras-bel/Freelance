import { useState, useEffect } from 'react'
import { reviewsApi, Review, ReviewCreate, ReviewUpdate, Rating, ReviewFilters } from '../api/reviews'

export const useReviews = (userId?: number) => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [userRating, setUserRating] = useState<Rating | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Загружаем отзывы пользователя
  const loadUserReviews = async (targetUserId: number, filters?: ReviewFilters) => {
    try {
      setLoading(true)
      const data = await reviewsApi.getUserReviews(targetUserId, 0, 100, filters)
      setReviews(data)
    } catch (err) {
      console.error('Error loading reviews:', err)
      setError('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  // Загружаем рейтинг пользователя
  const loadUserRating = async (targetUserId: number) => {
    try {
      const data = await reviewsApi.getUserRating(targetUserId)
      setUserRating(data)
    } catch (err) {
      console.error('Error loading rating:', err)
      setError('Failed to load rating')
    }
  }

  // Инициализация
  useEffect(() => {
    if (userId) {
      loadUserReviews(userId)
      loadUserRating(userId)
    }
  }, [userId])

  // Создать отзыв
  const createReview = async (reviewData: ReviewCreate) => {
    try {
      setLoading(true)
      const newReview = await reviewsApi.createReview(reviewData)
      
      // Обновляем список отзывов
      setReviews(prev => [newReview, ...prev])
      
      // Обновляем рейтинг
      if (userId) {
        await loadUserRating(userId)
      }
      
      return newReview
    } catch (err) {
      console.error('Error creating review:', err)
      setError('Failed to create review')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Обновить отзыв
  const updateReview = async (reviewId: number, reviewData: ReviewUpdate) => {
    try {
      setLoading(true)
      const updatedReview = await reviewsApi.updateReview(reviewId, reviewData)
      
      // Обновляем список отзывов
      setReviews(prev => prev.map(review => 
        review.id === reviewId ? updatedReview : review
      ))
      
      // Обновляем рейтинг
      if (userId) {
        await loadUserRating(userId)
      }
      
      return updatedReview
    } catch (err) {
      console.error('Error updating review:', err)
      setError('Failed to update review')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Удалить отзыв
  const deleteReview = async (reviewId: number) => {
    try {
      setLoading(true)
      await reviewsApi.deleteReview(reviewId)
      
      // Удаляем из списка
      setReviews(prev => prev.filter(review => review.id !== reviewId))
      
      // Обновляем рейтинг
      if (userId) {
        await loadUserRating(userId)
      }
    } catch (err) {
      console.error('Error deleting review:', err)
      setError('Failed to delete review')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Пожаловаться на отзыв
  const reportReview = async (reviewId: number) => {
    try {
      await reviewsApi.reportReview(reviewId)
      
      // Обновляем статус отзыва
      setReviews(prev => prev.map(review => 
        review.id === reviewId ? { ...review, status: 'reported' } : review
      ))
    } catch (err) {
      console.error('Error reporting review:', err)
      setError('Failed to report review')
      throw err
    }
  }

  // Фильтровать отзывы
  const filterReviews = async (filters: ReviewFilters) => {
    if (userId) {
      await loadUserReviews(userId, filters)
    }
  }

  // Получить статистику отзывов
  const getReviewStats = () => {
    if (!userRating) return null

    const total = userRating.total_reviews
    if (total === 0) return null

    return {
      overall: userRating.overall_rating,
      total,
      communication: userRating.communication_avg,
      quality: userRating.quality_avg,
      timeliness: userRating.timeliness_avg,
      professionalism: userRating.professionalism_avg,
      distribution: {
        five: userRating.five_star_count,
        four: userRating.four_star_count,
        three: userRating.three_star_count,
        two: userRating.two_star_count,
        one: userRating.one_star_count
      }
    }
  }

  // Получить процентное распределение звезд
  const getStarDistribution = () => {
    if (!userRating || userRating.total_reviews === 0) return null

    const total = userRating.total_reviews
    return {
      five: Math.round((userRating.five_star_count / total) * 100),
      four: Math.round((userRating.four_star_count / total) * 100),
      three: Math.round((userRating.three_star_count / total) * 100),
      two: Math.round((userRating.two_star_count / total) * 100),
      one: Math.round((userRating.one_star_count / total) * 100)
    }
  }

  // Проверить, может ли пользователь оставить отзыв
  const canReviewUser = (targetUserId: number) => {
    // Пользователь не может оставить отзыв самому себе
    if (userId === targetUserId) return false
    
    // Проверяем, не оставлял ли уже отзыв
    const existingReview = reviews.find(review => 
      review.reviewer_id === userId && review.reviewed_user_id === targetUserId
    )
    
    return !existingReview
  }

  return {
    reviews,
    userRating,
    loading,
    error,
    createReview,
    updateReview,
    deleteReview,
    reportReview,
    filterReviews,
    getReviewStats,
    getStarDistribution,
    canReviewUser,
    refresh: () => {
      if (userId) {
        loadUserReviews(userId)
        loadUserRating(userId)
      }
    }
  }
}

// Хук для получения топ пользователей
export const useTopRatedUsers = (limit: number = 10) => {
  const [topUsers, setTopUsers] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTopUsers = async () => {
      try {
        setLoading(true)
        const data = await reviewsApi.getTopRatedUsers(limit)
        setTopUsers(data)
      } catch (err) {
        console.error('Error loading top users:', err)
        setError('Failed to load top rated users')
      } finally {
        setLoading(false)
      }
    }

    loadTopUsers()
  }, [limit])

  return {
    topUsers,
    loading,
    error,
    refresh: () => {
      setLoading(true)
      reviewsApi.getTopRatedUsers(limit)
        .then(setTopUsers)
        .catch(err => {
          console.error('Error refreshing top users:', err)
          setError('Failed to refresh top rated users')
        })
        .finally(() => setLoading(false))
    }
  }
} 