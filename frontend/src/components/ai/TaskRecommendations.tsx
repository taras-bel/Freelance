import React from 'react';
import { useTaskRecommendations } from '../../hooks/useAI';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Target,
  ArrowRight,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface TaskRecommendationsProps {
  userId: number;
  limit?: number;
  className?: string;
  onTaskSelect?: (taskId: number) => void;
}

export const TaskRecommendations: React.FC<TaskRecommendationsProps> = ({
  userId,
  limit = 5,
  className,
  onTaskSelect
}) => {
  const { 
    data: recommendationsData, 
    isLoading, 
    error, 
    refetch 
  } = useTaskRecommendations(userId, limit);

  const recommendations = recommendationsData?.recommendations || [];

  if (isLoading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto" />
          <div>
            <h3 className="font-semibold">Анализируем ваши предпочтения</h3>
            <p className="text-sm text-muted-foreground">
              AI подбирает лучшие задачи для вас
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="text-center space-y-4">
          <div className="p-3 bg-red-100 rounded-lg inline-block">
            <Target className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-red-600">Ошибка загрузки</h3>
            <p className="text-sm text-muted-foreground">
              Не удалось загрузить рекомендации
            </p>
          </div>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Попробовать снова
          </Button>
        </div>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="text-center space-y-4">
          <div className="p-3 bg-muted rounded-lg inline-block">
            <Lightbulb className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">Нет рекомендаций</h3>
            <p className="text-sm text-muted-foreground">
              Заполните профиль для получения персональных рекомендаций
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("space-y-4", className)}>
      {/* Заголовок */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">AI Рекомендации</h3>
            <p className="text-sm text-muted-foreground">
              Персонально подобранные задачи
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
        </Button>
      </div>

      {/* Рекомендации */}
      <div className="p-4 space-y-4">
        {recommendations.map((recommendation, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg hover:border-cyan-300 transition-colors cursor-pointer"
            onClick={() => onTaskSelect?.(index)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-cyan-100 text-cyan-800">
                  #{index + 1}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    recommendation.confidence >= 0.8 ? "border-green-200 text-green-700" :
                    recommendation.confidence >= 0.6 ? "border-yellow-200 text-yellow-700" :
                    "border-red-200 text-red-700"
                  )}
                >
                  {Math.round(recommendation.confidence * 100)}% совпадение
                </Badge>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-lg">
                {recommendation.content}
              </h4>
              
              <p className="text-sm text-muted-foreground">
                {recommendation.reasoning}
              </p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Высокий спрос</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  <span>Хорошая оплата</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Гибкие сроки</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Футер */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Рекомендации обновляются на основе вашей активности
          </span>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            Обновить
          </Button>
        </div>
      </div>
    </Card>
  );
}; 
