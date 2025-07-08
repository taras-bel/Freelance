import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';

export interface PortfolioItem {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  url?: string;
  image?: string;
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: number;
  user_id: number;
  name: string;
  issuer?: string;
  issue_date?: string;
  expiration_date?: string;
  credential_id?: string;
  credential_url?: string;
  file?: string;
  created_at: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar?: string;
  location?: string;
  skills?: string;
  social_links?: string;
  hourly_rate?: number;
  is_verified: boolean;
  user_rating_value?: number;
  total_earnings?: number;
  tasks_completed?: number;
  profile_completion_percentage?: number;
  last_active?: string;
  created_at: string;
  updated_at?: string;
  availability_status?: string;
  availability_hours?: string;
  experience_years?: number;
  education?: string;
  languages?: string;
  timezone?: string;
  communication_preferences?: string;
  work_preferences?: string;
  profile_views?: number;
  profile_likes?: number;
  response_time_avg?: number;
  completion_rate?: number;
  on_time_delivery_rate?: number;
}

export interface UserProfileWithDetails extends UserProfile {
  portfolio_items: PortfolioItem[];
  certificates: Certificate[];
  reviews: any[];
  achievements: any[];
  level_info?: {
    level: number;
    current_xp: number;
    total_xp: number;
    tasks_completed: number;
    tasks_created: number;
    applications_submitted: number;
    applications_accepted: number;
    total_earnings: number;
    streak_days: number;
  };
}

export interface ProfileUpdateData {
  bio?: string;
  avatar?: string;
  location?: string;
  skills?: string;
  social_links?: string;
  hourly_rate?: number;
  availability_status?: string;
  availability_hours?: string;
  experience_years?: number;
  education?: string;
  languages?: string;
  timezone?: string;
  communication_preferences?: string;
  work_preferences?: string;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfileWithDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get user profile
  const fetchProfile = useCallback(async (userId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getProfile(userId);
      setProfile(response.data || null);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (data: ProfileUpdateData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.updateProfile(data);
      setProfile(prev => (prev !== null && typeof prev.id === 'number') ? { ...prev, ...response.data } : null);
      return response.data;
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Portfolio operations
  const createPortfolioItem = useCallback(async (data: Omit<PortfolioItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.createPortfolioItem(data);
      const newItem = response.data;
      if (!isPortfolioItem(newItem)) throw new Error('Invalid portfolio item');
      setProfile(prev => (prev !== null && typeof prev.id === 'number') ? {
        ...prev,
        portfolio_items: [...(prev.portfolio_items as PortfolioItem[]), newItem]
      } : null);
      return newItem;
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to create portfolio item');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePortfolioItem = useCallback(async (id: number, data: Partial<PortfolioItem>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.updatePortfolioItem(id, data);
      const updatedItem = response.data;
      if (!isPortfolioItem(updatedItem)) throw new Error('Invalid portfolio item');
      setProfile(prev => (prev !== null && typeof prev.id === 'number') ? {
        ...prev,
        portfolio_items: (prev.portfolio_items as PortfolioItem[]).map(item => 
          item.id === id ? updatedItem : item
        )
      } : null);
      return updatedItem;
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to update portfolio item');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePortfolioItem = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.deletePortfolioItem(id);
      setProfile(prev => (prev !== null && typeof prev.id === 'number') ? {
        ...prev,
        portfolio_items: prev.portfolio_items.filter(item => item.id !== id)
      } : null);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to delete portfolio item');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Certificate operations
  const createCertificate = useCallback(async (data: Omit<Certificate, 'id' | 'user_id' | 'created_at'>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.createCertificate(data);
      const newCert = response.data;
      if (!isCertificate(newCert)) throw new Error('Invalid certificate');
      setProfile(prev => (prev !== null && typeof prev.id === 'number') ? {
        ...prev,
        certificates: [...(prev.certificates as Certificate[]), newCert]
      } : null);
      return newCert;
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to create certificate');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCertificate = useCallback(async (id: number, data: Partial<Certificate>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.updateCertificate(id, data);
      const updatedCert = response.data;
      if (!isCertificate(updatedCert)) throw new Error('Invalid certificate');
      setProfile(prev => (prev !== null && typeof prev.id === 'number') ? {
        ...prev,
        certificates: (prev.certificates as Certificate[]).map(cert => 
          cert.id === id ? updatedCert : cert
        )
      } : null);
      return updatedCert;
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to update certificate');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCertificate = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.deleteCertificate(id);
      setProfile(prev => (prev !== null && typeof prev.id === 'number') ? {
        ...prev,
        certificates: prev.certificates.filter(cert => cert.id !== id)
      } : null);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to delete certificate');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Parse skills string to array
  const parseSkills = useCallback((skillsString?: string): string[] => {
    if (!skillsString) return [];
    try {
      // Try to parse as JSON first
      return JSON.parse(skillsString);
    } catch {
      // If not JSON, split by comma
      return skillsString.split(',').map(skill => skill.trim()).filter(Boolean);
    }
  }, []);

  // Parse social links string to object
  const parseSocialLinks = useCallback((socialLinksString?: string): Record<string, string> => {
    if (!socialLinksString) return {};
    try {
      return JSON.parse(socialLinksString);
    } catch {
      return {};
    }
  }, []);

  // Format skills array to string
  const formatSkills = useCallback((skills: string[]): string => {
    return JSON.stringify(skills);
  }, []);

  // Format social links object to string
  const formatSocialLinks = useCallback((socialLinks: Record<string, string>): string => {
    return JSON.stringify(socialLinks);
  }, []);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    createPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
    createCertificate,
    updateCertificate,
    deleteCertificate,
    parseSkills,
    parseSocialLinks,
    formatSkills,
    formatSocialLinks,
    setProfile,
    setError,
  };
};

function isPortfolioItem(obj: any): obj is PortfolioItem {
  return obj && typeof obj === 'object' && typeof obj.id === 'number' && typeof obj.title === 'string';
}

function isCertificate(obj: any): obj is Certificate {
  return obj && typeof obj === 'object' && typeof obj.id === 'number' && typeof obj.name === 'string';
} 