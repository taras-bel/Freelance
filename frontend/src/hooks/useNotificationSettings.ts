import { useState, useEffect } from 'react';
import { api } from '../api';

export interface NotificationSettings {
  id: number;
  user_id: number;
  email_enabled: boolean;
  email_frequency: string;
  email_categories: string;
  push_enabled: boolean;
  push_categories: string;
  in_app_enabled: boolean;
  in_app_sound: boolean;
  in_app_vibration: boolean;
  task_notifications: boolean;
  application_notifications: boolean;
  message_notifications: boolean;
  payment_notifications: boolean;
  achievement_notifications: boolean;
  system_notifications: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  quiet_hours_enabled: boolean;
  timezone: string;
  digest_enabled: boolean;
  digest_frequency: string;
  digest_time: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettingsUpdate {
  email_enabled?: boolean;
  email_frequency?: string;
  email_categories?: string;
  push_enabled?: boolean;
  push_categories?: string;
  in_app_enabled?: boolean;
  in_app_sound?: boolean;
  in_app_vibration?: boolean;
  task_notifications?: boolean;
  application_notifications?: boolean;
  message_notifications?: boolean;
  payment_notifications?: boolean;
  achievement_notifications?: boolean;
  system_notifications?: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  quiet_hours_enabled?: boolean;
  timezone?: string;
  digest_enabled?: boolean;
  digest_frequency?: string;
  digest_time?: string;
}

export interface SettingsSummary {
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  quiet_hours_enabled: boolean;
  digest_enabled: boolean;
  enabled_categories: {
    task: boolean;
    application: boolean;
    message: boolean;
    payment: boolean;
    achievement: boolean;
    system: boolean;
  };
  preferences: {
    email_frequency: string;
    digest_frequency: string;
    timezone: string;
    quiet_hours: {
      start: string;
      end: string;
    };
  };
}

export interface AvailableCategories {
  categories: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
  }>;
  frequencies: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  timezones: Array<{
    id: string;
    name: string;
  }>;
}

export const useNotificationSettings = () => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [summary, setSummary] = useState<SettingsSummary | null>(null);
  const [availableCategories, setAvailableCategories] = useState<AvailableCategories | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notification settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/notification-settings/');
      setSettings(response.data);
    } catch (err) {
      setError('Failed to fetch notification settings');
      console.error('Error fetching notification settings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch settings summary
  const fetchSummary = async () => {
    try {
      const response = await api.get('/notification-settings/summary');
      setSummary(response.data);
    } catch (err) {
      console.error('Error fetching settings summary:', err);
    }
  };

  // Fetch available categories
  const fetchAvailableCategories = async () => {
    try {
      const response = await api.get('/notification-settings/available-categories');
      setAvailableCategories(response.data);
    } catch (err) {
      console.error('Error fetching available categories:', err);
    }
  };

  // Update notification settings
  const updateSettings = async (updates: NotificationSettingsUpdate) => {
    try {
      setError(null);
      const response = await api.put('/notification-settings/', updates);
      setSettings(response.data);
      await fetchSummary(); // Refresh summary
      return response.data;
    } catch (err) {
      setError('Failed to update notification settings');
      console.error('Error updating notification settings:', err);
      throw err;
    }
  };

  // Update categories
  const updateCategories = async (categoryType: 'email' | 'push', categories: string[]) => {
    try {
      setError(null);
      await api.put(`/notification-settings/categories/${categoryType}`, categories);
      await fetchSettings(); // Refresh settings
      await fetchSummary(); // Refresh summary
    } catch (err) {
      setError(`Failed to update ${categoryType} categories`);
      console.error(`Error updating ${categoryType} categories:`, err);
      throw err;
    }
  };

  // Get categories
  const getCategories = async (categoryType: 'email' | 'push') => {
    try {
      const response = await api.get(`/notification-settings/categories/${categoryType}`);
      return response.data.categories;
    } catch (err) {
      console.error(`Error getting ${categoryType} categories:`, err);
      return ['all'];
    }
  };

  // Test email notification
  const testEmailNotification = async () => {
    try {
      setError(null);
      await api.post('/notification-settings/test-email');
      return true;
    } catch (err) {
      setError('Failed to send test email');
      console.error('Error sending test email:', err);
      throw err;
    }
  };

  // Reset to defaults
  const resetToDefaults = async () => {
    try {
      setError(null);
      await api.post('/notification-settings/reset-to-defaults');
      await fetchSettings(); // Refresh settings
      await fetchSummary(); // Refresh summary
    } catch (err) {
      setError('Failed to reset settings to defaults');
      console.error('Error resetting settings:', err);
      throw err;
    }
  };

  // Initialize data
  useEffect(() => {
    const initialize = async () => {
      await Promise.all([
        fetchSettings(),
        fetchSummary(),
        fetchAvailableCategories()
      ]);
    };
    initialize();
  }, []);

  return {
    settings,
    summary,
    availableCategories,
    loading,
    error,
    fetchSettings,
    fetchSummary,
    fetchAvailableCategories,
    updateSettings,
    updateCategories,
    getCategories,
    testEmailNotification,
    resetToDefaults
  };
}; 