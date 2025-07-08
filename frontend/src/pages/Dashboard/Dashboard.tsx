import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  MessageSquare, 
  Bell, 
  TrendingUp, 
  DollarSign, 
  Award,
  Plus,
  Search,
  Filter,
  Star,
  Clock,
  Users,
  FileText,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTasks } from '../../hooks/useTasks';
import { useNotifications } from '../../hooks/useNotifications';
import { useAchievements } from '../../hooks/useAchievements';

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  totalEarnings: number;
  unreadNotifications: number;
  achievements: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { tasks, loading: tasksLoading } = useTasks();
  const { notifications } = useNotifications();
  const { achievements } = useAchievements();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    completedTasks: 0,
    activeTasks: 0,
    totalEarnings: 0,
    unreadNotifications: 0,
    achievements: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (tasks && notifications && achievements) {
      const completedTasks = tasks.filter(task => task.status === 'completed').length;
      const activeTasks = tasks.filter(task => task.status === 'in_progress').length;
      const totalEarnings = tasks
        .filter(task => task.status === 'completed')
        .reduce((sum, task) => sum + (task.budget_max || 0), 0);
      const unreadNotifications = notifications.filter(n => !n.is_read).length;

      setStats({
        totalTasks: tasks.length,
        completedTasks,
        activeTasks,
        totalEarnings,
        unreadNotifications,
        achievements: achievements.length
      });
    }
  }, [tasks, notifications, achievements]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredTasks = tasks?.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const categories = ['all', 'web-development', 'mobile-development', 'design', 'writing', 'marketing', 'other'];

  const quickActions = [
    { icon: Plus, label: 'Create Task', action: () => navigate('/create-task'), color: 'bg-blue-500' },
    { icon: Search, label: 'Find Work', action: () => navigate('/tasks'), color: 'bg-green-500' },
    { icon: MessageSquare, label: 'Messages', action: () => navigate('/chats'), color: 'bg-purple-500' },
    { icon: DollarSign, label: 'Payments', action: () => navigate('/payments'), color: 'bg-yellow-500' },
  ];

  if (tasksLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">Freelance Platform</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/notifications')}
                className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <Bell className="h-6 w-6" />
                {stats.unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {stats.unreadNotifications}
                  </span>
                )}
              </button>
              
              <div className="flex items-center space-x-2">
                <img
                  src={user?.avatar || 'https://via.placeholder.com/40'}
                  alt="Avatar"
                  className="h-8 w-8 rounded-full"
                />
                <span className="text-white font-medium">{user?.username}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.username}! 👋
          </h2>
          <p className="text-gray-300">
            Ready to tackle some amazing projects today?
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Tasks</p>
                <p className="text-2xl font-bold text-white">{stats.totalTasks}</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Completed</p>
                <p className="text-2xl font-bold text-white">{stats.completedTasks}</p>
              </div>
              <Award className="h-8 w-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Earnings</p>
                <p className="text-2xl font-bold text-white">${stats.totalEarnings}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Achievements</p>
                <p className="text-2xl font-bold text-white">{stats.achievements}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`${action.color} p-4 rounded-xl text-white hover:opacity-90 transition-opacity`}
              >
                <action.icon className="h-6 w-6 mb-2" />
                <p className="text-sm font-medium">{action.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-white">Recent Tasks</h3>
            <button
              onClick={() => navigate('/tasks')}
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              View All
            </button>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
            {filteredTasks.length > 0 ? (
              <div className="divide-y divide-white/10">
                {filteredTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="p-4 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate(`/task/${task.id}`)}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-white font-medium mb-1">{task.title}</h4>
                        <p className="text-gray-300 text-sm mb-2">{task.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {task.deadline}
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            ${task.budget_max}
                          </span>
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                            {task.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          task.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                          task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300">No tasks found</p>
                <button
                  onClick={() => navigate('/create-task')}
                  className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Create Your First Task
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Filter by Category</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
