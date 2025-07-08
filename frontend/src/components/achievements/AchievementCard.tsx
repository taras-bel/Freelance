import React from 'react';
import { Trophy, Lock, CheckCircle } from 'lucide-react';
import { Achievement } from '../../hooks/useAchievements';
import { cn } from '../../utils/cn';

interface AchievementCardProps {
  achievement: Achievement;
  onClick?: () => void;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ 
  achievement, 
  onClick 
}) => {
  const isUnlocked = achievement.is_unlocked;
  const hasProgress = achievement.progress > 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative p-4 rounded-lg border transition-all duration-200 cursor-pointer',
        'hover:shadow-md hover:scale-105',
        isUnlocked 
          ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 dark:from-yellow-900/20 dark:to-orange-900/20 dark:border-yellow-700'
          : hasProgress
            ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 dark:from-blue-900/20 dark:to-cyan-900/20 dark:border-blue-700'
            : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
      )}
    >
      {/* Статус иконка */}
      <div className="absolute top-3 right-3">
        {isUnlocked ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : hasProgress ? (
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {Math.round(achievement.progress_percentage)}%
            </span>
          </div>
        ) : (
          <Lock className="w-5 h-5 text-gray-400" />
        )}
      </div>

      {/* Иконка достижения */}
      <div className="flex items-center gap-3 mb-3">
        <div className={cn(
          'w-12 h-12 rounded-lg flex items-center justify-center text-2xl',
          isUnlocked 
            ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
            : hasProgress
              ? 'bg-gradient-to-br from-blue-400 to-cyan-500'
              : 'bg-gray-300 dark:bg-gray-600'
        )}>
          {achievement.icon}
        </div>
        
        <div className="flex-1">
          <h3 className={cn(
            'font-semibold text-sm',
            isUnlocked 
              ? 'text-gray-900 dark:text-white'
              : hasProgress
                ? 'text-gray-800 dark:text-gray-200'
                : 'text-gray-500 dark:text-gray-400'
          )}>
            {achievement.name}
          </h3>
          
          <p className={cn(
            'text-xs mt-1',
            isUnlocked 
              ? 'text-gray-700 dark:text-gray-300'
              : hasProgress
                ? 'text-gray-600 dark:text-gray-400'
                : 'text-gray-400 dark:text-gray-500'
          )}>
            {achievement.description}
          </p>
        </div>
      </div>

      {/* Прогресс */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 dark:text-gray-400">
            Progress
          </span>
          <span className="font-medium">
            {achievement.progress} / {achievement.requirement_value}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              isUnlocked
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                : hasProgress
                  ? 'bg-gradient-to-r from-blue-400 to-cyan-500'
                  : 'bg-gray-300 dark:bg-gray-600'
            )}
            style={{ width: `${achievement.progress_percentage}%` }}
          />
        </div>
      </div>

      {/* Награда */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            +{achievement.xp_reward} XP
          </span>
        </div>
        
        {isUnlocked && achievement.unlocked_at && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(achievement.unlocked_at).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}; 
