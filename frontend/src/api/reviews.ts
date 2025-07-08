import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

export interface Review {
  id: number
  reviewer_id: number
  reviewed_user_id: number
  task_id?: number
  rating: number
  title: string
  comment: string
  communication_rating?: number
  quality_rating?: number
  timeliness_rating?: number
  professionalism_rating?: number
  status: string
  created_at: string
  updated_at: string
  reviewer_name: string
  reviewer_avatar?: string
}

export interface ReviewCreate {
  reviewed_user_id: number
  task_id?: number
  rating: number
  title: string
  comment: string
  communication_rating?: number
  quality_rating?: number
  timeliness_rating?: number
  professionalism_rating?: number
}

export interface ReviewUpdate {
  rating?: number
  title?: string
  comment?: string
  communication_rating?: number
  quality_rating?: number
  timeliness_rating?: number
  professionalism_rating?: number
}

export interface Rating {
  user_id: number
  overall_rating: number
  total_reviews: number
  communication_avg: number
  quality_avg: number
  timeliness_avg: number
  professionalism_avg: number
  five_star_count: number
  four_star_count: number
  three_star_count: number
  two_star_count: number
  one_star_count: number
  updated_at: string
}

export interface ReviewFilters {
  rating?: number
  category?: 'communication' | 'quality' | 'timeliness' | 'professionalism'
  date_from?: string
  date_to?: string
}

class ReviewsAPI {
  // Создать отзыв
  async createReview(reviewData: ReviewCreate): Promise<Review> {
    const response = await axios.post(`${API_BASE_URL}/reviews/`, reviewData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    })
    return response.data
  }

  // Получить отзывы пользователя
  async getUserReviews(
    userId: number, 
    skip: number = 0, 
    limit: number = 20,
    filters?: ReviewFilters
  ): Promise<Review[]> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString()
    })

    if (filters?.rating) params.append('rating', filters.rating.toString())
    if (filters?.category) params.append('category', filters.category)
    if (filters?.date_from) params.append('date_from', filters.date_from)
    if (filters?.date_to) params.append('date_to', filters.date_to)

    const response = await axios.get(`${API_BASE_URL}/reviews/user/${userId}?${params}`)
    return response.data
  }

  // Получить отзывы, оставленные пользователем
  async getReviewsGiven(skip: number = 0, limit: number = 20): Promise<Review[]> {
    const response = await axios.get(`${API_BASE_URL}/reviews/given/?skip=${skip}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    })
    return response.data
  }

  // Обновить отзыв
  async updateReview(reviewId: number, reviewData: ReviewUpdate): Promise<Review> {
    const response = await axios.put(`${API_BASE_URL}/reviews/${reviewId}`, reviewData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    })
    return response.data
  }

  // Удалить отзыв
  async deleteReview(reviewId: number): Promise<void> {
    await axios.delete(`${API_BASE_URL}/reviews/${reviewId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    })
  }

  // Пожаловаться на отзыв
  async reportReview(reviewId: number): Promise<void> {
    await axios.post(`${API_BASE_URL}/reviews/${reviewId}/report`, {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    })
  }

  // Получить рейтинг пользователя
  async getUserRating(userId: number): Promise<Rating> {
    const response = await axios.get(`${API_BASE_URL}/ratings/user/${userId}`)
    return response.data
  }

  // Получить топ пользователей по рейтингу
  async getTopRatedUsers(limit: number = 10): Promise<Rating[]> {
    const response = await axios.get(`${API_BASE_URL}/ratings/top/?limit=${limit}`)
    return response.data
  }
}

export const reviewsApi = new ReviewsAPI() 