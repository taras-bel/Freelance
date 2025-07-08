import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Plus, 
  MapPin, 
  Clock, 
  DollarSign, 
  Star,
  Eye,
  MessageSquare,
  Calendar,
  Tag,
  Users
} from 'lucide-react';
import { useTasks } from '../../hooks/useTasks';

interface Task {
  id: number;
  title: string;
  description: string;
  category: string;
  budget_min: number;
  budget_max: number;
  status: string;
  created_at: string;
  applications_count: number;
  complexity_level: number;
}

const Tasks: React.FC = () => {
  const navigate = useNavigate();
  const { tasks, loading } = useTasks();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = [
    { id: 'all', name: 'All Categories', icon: Tag },
    { id: 'web-development', name: 'Web Development', icon: Tag },
    { id: 'mobile-development', name: 'Mobile Development', icon: Tag },
    { id: 'design', name: 'Design', icon: Tag },
    { id: 'writing', name: 'Writing', icon: Tag },
    { id: 'marketing', name: 'Marketing', icon: Tag },
    { id: 'other', name: 'Other', icon: Tag },
  ];

  const statuses = [
    { id: 'all', name: 'All Status', color: 'bg-gray-500' },
    { id: 'open', name: 'Open', color: 'bg-green-500' },
    { id: 'in-progress', name: 'In Progress', color: 'bg-blue-500' },
    { id: 'completed', name: 'Completed', color: 'bg-purple-500' },
  ];

  const filteredTasks = tasks?.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  }) || [];

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'budget-high':
        return b.budget_max - a.budget_max;
      case 'budget-low':
        return a.budget_max - b.budget_max;
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500/20 text-green-300';
      case 'in-progress': return 'bg-blue-500/20 text-blue-300';
      case 'completed': return 'bg-purple-500/20 text-purple-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'web-development': return 'bg-blue-500/20 text-blue-300';
      case 'mobile-development': return 'bg-green-500/20 text-green-300';
      case 'design': return 'bg-purple-500/20 text-purple-300';
      case 'writing': return 'bg-yellow-500/20 text-yellow-300';
      case 'marketing': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
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
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Tasks</h1>
              <p className="text-gray-300 mt-1">Find your next project</p>
            </div>
            <button
              onClick={() => navigate('/create-task')}
              className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Create Task</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id} className="bg-slate-800">
                  {category.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {statuses.map(status => (
                <option key={status.id} value={status.id} className="bg-slate-800">
                  {status.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="newest" className="bg-slate-800">Newest First</option>
              <option value="oldest" className="bg-slate-800">Oldest First</option>
              <option value="budget-high" className="bg-slate-800">Budget: High to Low</option>
              <option value="budget-low" className="bg-slate-800">Budget: Low to High</option>
            </select>
          </div>
        </div>

        {/* Results Count and View Toggle */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-300">
            {sortedTasks.length} task{sortedTasks.length !== 1 ? 's' : ''} found
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <div className="grid grid-cols-2 gap-1 w-4 h-4">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <div className="space-y-1 w-4 h-4">
                <div className="bg-current rounded-sm h-1"></div>
                <div className="bg-current rounded-sm h-1"></div>
                <div className="bg-current rounded-sm h-1"></div>
              </div>
            </button>
          </div>
        </div>

        {/* Tasks Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/task/${task.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
                    {task.category}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                  {task.title}
                </h3>
                
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                  {task.description}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Budget:</span>
                    <span className="text-white font-medium">
                      ${task.budget_min} - ${task.budget_max}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Applications:</span>
                    <span className="text-white font-medium flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {task.applications_count}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Complexity:</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < task.complexity_level ? 'text-yellow-400 fill-current' : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Posted:</span>
                    <span className="text-white font-medium">
                      {formatDate(task.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/task/${task.id}`);
                    }}
                    className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">View Details</span>
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/task/${task.id}/apply`);
                    }}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/task/${task.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
                        {task.category}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                      {task.title}
                    </h3>
                    
                    <p className="text-gray-300 mb-4">
                      {task.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-white">${task.budget_min} - ${task.budget_max}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-white">{task.applications_count} applications</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-gray-400" />
                        <span className="text-white">Level {task.complexity_level}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-white">{formatDate(task.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-3 ml-6">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/task/${task.id}`);
                      }}
                      className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="text-sm">View</span>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/task/${task.id}/apply`);
                      }}
                      className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {sortedTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No tasks found</h3>
            <p className="text-gray-300 mb-6">
              Try adjusting your search criteria or create a new task
            </p>
            <button
              onClick={() => navigate('/create-task')}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
            >
              Create Task
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks; 
