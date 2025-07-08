import React from 'react';
import { Star, TrendingUp, Target, Zap } from 'lucide-react';
import { UserLevel } from '../../hooks/useAchievements';
import { cn } from '../../utils/cn';

interface LevelProgressProps {
  userLevel: UserLevel;
  className?: string;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({ 
  userLevel, 
  className 
}) => {
  const progressPercentage = (userLevel.current_xp / (userLevel.xp_to_next_level + userLevel.current_xp)) * 100;

  const stats = [
    {
      icon: Target,
      label: 'Tasks Completed',
      value: userLevel.tasks_completed,
      color: 'text-blue-500'
    },
    {
      icon: TrendingUp,
      label: 'Tasks Created',
      value: userLevel.tasks_created,
      color: 'text-green-500'
    },
    {
      icon: Zap,
      label: 'Applications',
      value: userLevel.applications_submitted,
      color: 'text-purple-500'
    },
    {
      icon: Star,
      label: 'Accepted',
      value: userLevel.applications_accepted,
      color: 'text-yellow-500'
    }
  ];

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6', className)}>
      {/* Уровень и XP */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {userLevel.level}
            </span>
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Level {userLevel.level}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {userLevel.total_xp} total XP
            </p>
          </div>
        </div>
        
        {/* Прогресс до следующего уровня */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Progress to Level {userLevel.level + 1}
            </span>
            <span className="font-medium">
              {userLevel.current_xp} / {userLevel.current_xp + userLevel.xp_to_next_level} XP
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {userLevel.xp_to_next_level} XP needed for next level
          </p>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Icon className={cn('w-5 h-5', stat.color)} />
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Дополнительная статистика */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">$</span>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Total Earnings
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                ${userLevel.total_earnings.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">🔥</span>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Activity Streak
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {userLevel.streak_days} days
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 
