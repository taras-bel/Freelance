import React, { useState } from 'react';
import { useApplicationAnalysis } from '../../hooks/useAI';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Star,
  MessageSquare,
  Clock,
  Target,
  Users
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface ApplicationAnalyzerProps {
  applicationId: number;
  applicationText: string;
  taskTitle: string;
  applicantName: string;
  onAnalysisComplete?: (analysis: any) => void;
  className?: string;
}

export const ApplicationAnalyzer: React.FC<ApplicationAnalyzerProps> = ({
  applicationId,
  applicationText,
  taskTitle,
  applicantName,
  onAnalysisComplete,
  className
}) => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const applicationAnalysis = useApplicationAnalysis();

  const handleAnalyze = async () => {
    try {
      const result = await applicationAnalysis.mutateAsync(applicationId);
      setShowAnalysis(true);
      onAnalysisComplete?.(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'strong_recommend':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'consider':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reject':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'strong_recommend':
        return <CheckCircle className="w-4 h-4" />;
      case 'consider':
        return <AlertTriangle className="w-4 h-4" />;
      case 'reject':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const renderScoreBar = (score: number, label: string) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{score}/10</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            score >= 8 ? 'bg-green-500' :
            score >= 6 ? 'bg-yellow-500' : 'bg-red-500'
          )}
          style={{ width: `${(score / 10) * 100}%` }}
        />
      </div>
    </div>
  );

  if (!showAnalysis && !applicationAnalysis.data) {
    return (
      <Card className={cn("p-4", className)}>
        <div className="text-center space-y-3">
          <div className="p-3 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 rounded-lg inline-block">
            <Brain className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <h3 className="font-semibold">AI Анализ заявки</h3>
            <p className="text-sm text-muted-foreground">
              Получите детальную оценку заявки от AI
            </p>
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={applicationAnalysis.isPending}
            className="w-full"
          >
            {applicationAnalysis.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Анализируем...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Анализировать заявку
              </>
            )}
          </Button>
        </div>
      </Card>
    );
  }

  const analysis = applicationAnalysis.data?.analysis;

  if (!analysis) {
    return (
      <Card className={cn("p-4", className)}>
        <div className="text-center text-muted-foreground">
          Ошибка при анализе заявки
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("space-y-4", className)}>
      {/* Заголовок */}
      <div className="flex items-center gap-3 p-4 border-b">
        <div className="p-2 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-lg">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold">AI Анализ заявки</h3>
          <p className="text-sm text-muted-foreground">
            {applicantName} • {taskTitle}
          </p>
        </div>
        <Badge className={cn("ml-auto", getRecommendationColor(analysis.recommendation))}>
          {getRecommendationIcon(analysis.recommendation)}
          <span className="ml-1 capitalize">
            {analysis.recommendation.replace('_', ' ')}
          </span>
        </Badge>
      </div>

      {/* Общий балл */}
      <div className="p-4 bg-gradient-to-r from-cyan-50 to-violet-50 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <TrendingUp className="w-5 h-5 text-cyan-600" />
          <h4 className="font-semibold">Общая оценка</h4>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-cyan-600 mb-2">
            {analysis.overall_score.toFixed(1)}
          </div>
          <div className="flex justify-center gap-1">
            {[...Array(10)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-4 h-4",
                  i < Math.round(analysis.overall_score)
                    ? "text-yellow-500 fill-current"
                    : "text-gray-300"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Детальные оценки */}
      <div className="p-4 space-y-4">
        <h4 className="font-semibold flex items-center gap-2">
          <Target className="w-4 h-4" />
          Детальная оценка
        </h4>
        
        {renderScoreBar(analysis.scores.relevance, 'Релевантность опыта')}
        {renderScoreBar(analysis.scores.proposal_quality, 'Качество предложения')}
        {renderScoreBar(analysis.scores.technical_competence, 'Техническая компетентность')}
        {renderScoreBar(analysis.scores.communication, 'Коммуникативные навыки')}
      </div>

      {/* Фидбек */}
      <div className="p-4 border-t">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          AI Фидбек
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {analysis.feedback}
        </p>
      </div>

      {/* Сильные и слабые стороны */}
      <div className="p-4 border-t space-y-4">
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700">
            <CheckCircle className="w-4 h-4" />
            Сильные стороны
          </h4>
          <ul className="space-y-1">
            {analysis.strengths.map((strength, index) => (
              <li key={index} className="text-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                {strength}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-4 h-4" />
            Области для улучшения
          </h4>
          <ul className="space-y-1">
            {analysis.weaknesses.map((weakness, index) => (
              <li key={index} className="text-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                {weakness}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Рекомендуемые вопросы */}
      {analysis.suggested_questions && analysis.suggested_questions.length > 0 && (
        <div className="p-4 border-t">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Рекомендуемые вопросы для интервью
          </h4>
          <div className="space-y-2">
            {analysis.suggested_questions.map((question, index) => (
              <div key={index} className="p-3 bg-muted rounded-lg">
                <p className="text-sm">{question}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Действия */}
      <div className="p-4 border-t flex gap-2">
        <Button
          variant="outline"
          onClick={() => setShowAnalysis(false)}
          className="flex-1"
        >
          Скрыть анализ
        </Button>
        <Button
          onClick={handleAnalyze}
          disabled={applicationAnalysis.isPending}
          className="flex-1"
        >
          Обновить анализ
        </Button>
      </div>
    </Card>
  );
}; 
