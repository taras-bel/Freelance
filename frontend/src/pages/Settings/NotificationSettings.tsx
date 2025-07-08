import React, { useState } from 'react';
import { useNotificationSettings } from '../../hooks/useNotificationSettings';
import { Bell, Mail, Smartphone, Clock, Zap, Shield, Volume2, VolumeX } from 'lucide-react';

const NotificationSettings: React.FC = () => {
  const {
    settings,
    summary,
    availableCategories,
    loading,
    error,
    updateSettings,
    updateCategories,
    testEmailNotification,
    resetToDefaults
  } = useNotificationSettings();

  const [activeTab, setActiveTab] = useState('general');
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleTestEmail = async () => {
    try {
      setTestEmailLoading(true);
      await testEmailNotification();
      alert('Test email sent successfully!');
    } catch (err) {
      alert('Failed to send test email. Please check your settings.');
    } finally {
      setTestEmailLoading(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all notification settings to defaults?')) {
      try {
        setResetLoading(true);
        await resetToDefaults();
        alert('Settings reset to defaults successfully!');
      } catch (err) {
        alert('Failed to reset settings.');
      } finally {
        setResetLoading(false);
      }
    }
  };

  const handleCategoryToggle = async (category: string, enabled: boolean) => {
    if (!settings) return;
    
    const updates: any = {};
    updates[`${category}_notifications`] = enabled;
    
    try {
      await updateSettings(updates);
    } catch (err) {
      console.error('Failed to update category setting:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
                  <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <h2 className="text-red-800 dark:text-red-200 font-semibold mb-2">Error</h2>
            <p className="text-red-600 dark:text-red-300">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!settings || !summary || !availableCategories) {
    return null;
  }

  const tabs = [
    { id: 'general', name: 'General', icon: Bell },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'push', name: 'Push', icon: Smartphone },
    { id: 'categories', name: 'Categories', icon: Zap },
    { id: 'quiet-hours', name: 'Quiet Hours', icon: Clock }
  ];

  const categories = [
    { id: 'task', name: 'Task Notifications', icon: '📋', description: 'Task creation, updates, and completion' },
    { id: 'application', name: 'Application Notifications', icon: '📝', description: 'Job applications and status updates' },
    { id: 'message', name: 'Message Notifications', icon: '💬', description: 'New messages and chat updates' },
    { id: 'payment', name: 'Payment Notifications', icon: '💰', description: 'Payments, invoices, and financial updates' },
    { id: 'achievement', name: 'Achievement Notifications', icon: '🏆', description: 'Unlocked achievements and level ups' },
    { id: 'system', name: 'System Notifications', icon: '⚙️', description: 'Important system updates and maintenance' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Notification Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Customize how and when you receive notifications
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              {/* Tabs */}
              <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                        }`}
                      >
                        <Icon size={16} />
                        <span>{tab.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        General Settings
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Bell size={20} className="text-slate-600 dark:text-slate-400" />
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">In-App Notifications</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">Receive notifications within the app</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.in_app_enabled}
                              onChange={(e) => updateSettings({ in_app_enabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-cyan-600"></div>
                          </label>
                        </div>

                        {settings.in_app_enabled && (
                          <>
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <Volume2 size={20} className="text-slate-600 dark:text-slate-400" />
                                <div>
                                  <p className="font-medium text-slate-900 dark:text-white">Sound</p>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">Play sound for notifications</p>
                                </div>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={settings.in_app_sound}
                                  onChange={(e) => updateSettings({ in_app_sound: e.target.checked })}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-cyan-600"></div>
                              </label>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <Zap size={20} className="text-slate-600 dark:text-slate-400" />
                                <div>
                                  <p className="font-medium text-slate-900 dark:text-white">Vibration</p>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">Vibrate for notifications</p>
                                </div>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={settings.in_app_vibration}
                                  onChange={(e) => updateSettings({ in_app_vibration: e.target.checked })}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-cyan-600"></div>
                              </label>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'email' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        Email Notifications
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Mail size={20} className="text-slate-600 dark:text-slate-400" />
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">Email Notifications</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">Receive notifications via email</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.email_enabled}
                              onChange={(e) => updateSettings({ email_enabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-cyan-600"></div>
                          </label>
                        </div>

                        {settings.email_enabled && (
                          <>
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                                Email Frequency
                              </label>
                              <select
                                value={settings.email_frequency}
                                onChange={(e) => updateSettings({ email_frequency: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                              >
                                <option value="immediate">Immediate</option>
                                <option value="daily">Daily Digest</option>
                                <option value="weekly">Weekly Digest</option>
                              </select>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <p className="font-medium text-slate-900 dark:text-white">Test Email</p>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">Send a test email to verify your settings</p>
                                </div>
                                <button
                                  onClick={handleTestEmail}
                                  disabled={testEmailLoading}
                                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  {testEmailLoading ? 'Sending...' : 'Send Test'}
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'push' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        Push Notifications
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Smartphone size={20} className="text-slate-600 dark:text-slate-400" />
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">Push Notifications</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">Receive desktop push notifications</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.push_enabled}
                              onChange={(e) => updateSettings({ push_enabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-cyan-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'categories' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        Notification Categories
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Choose which types of notifications you want to receive
                      </p>
                      <div className="grid gap-4">
                        {categories.map((category) => (
                          <div key={category.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{category.icon}</span>
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white">{category.name}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{category.description}</p>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings[`${category.id}_notifications` as keyof typeof settings] as boolean}
                                onChange={(e) => handleCategoryToggle(category.id, e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-cyan-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'quiet-hours' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        Quiet Hours
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Clock size={20} className="text-slate-600 dark:text-slate-400" />
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">Enable Quiet Hours</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">Pause notifications during specific hours</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.quiet_hours_enabled}
                              onChange={(e) => updateSettings({ quiet_hours_enabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-cyan-600"></div>
                          </label>
                        </div>

                        {settings.quiet_hours_enabled && (
                          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <div>
                              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                                Start Time
                              </label>
                              <input
                                type="time"
                                value={settings.quiet_hours_start}
                                onChange={(e) => updateSettings({ quiet_hours_start: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                                End Time
                              </label>
                              <input
                                type="time"
                                value={settings.quiet_hours_end}
                                onChange={(e) => updateSettings({ quiet_hours_end: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Settings Summary
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Email</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    summary.email_enabled 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {summary.email_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Push</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    summary.push_enabled 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {summary.push_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">In-App</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    summary.in_app_enabled 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {summary.in_app_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Quiet Hours</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    summary.quiet_hours_enabled 
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400'
                  }`}>
                    {summary.quiet_hours_enabled ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={handleReset}
                  disabled={resetLoading}
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {resetLoading ? 'Resetting...' : 'Reset to Defaults'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings; 
