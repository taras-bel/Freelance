import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { 
  Brain, 
  Search, 
  DollarSign, 
  TrendingUp, 
  Users, 
  FileText, 
  MessageSquare,
  Zap,
  Target,
  BarChart3,
  Lightbulb,
  Shield
} from 'lucide-react';
import { useAuthStore } from '../../store/auth';

interface SmartMatch {
  freelancer_id: number;
  match_score: number;
  skills_match: string[];
  experience_level: string;
  hourly_rate?: number;
  availability: string;
  recommendations: string[];
}

interface PricingRecommendation {
  task_id: number;
  recommended_min: number;
  recommended_max: number;
  market_average: number;
  complexity_factor: number;
  demand_factor: number;
  skill_rarity_factor: number;
  justification: string;
  confidence_score: number;
}

interface SkillAnalysis {
  user_id: number;
  skill_gaps: string[];
  skill_strengths: string[];
  market_demand: Record<string, number>;
  learning_recommendations: string[];
  career_path_suggestions: string[];
  skill_score: number;
}

const AI: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [taskId, setTaskId] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [smartMatches, setSmartMatches] = useState<SmartMatch[]>([]);
  const [pricingRecommendation, setPricingRecommendation] = useState<PricingRecommendation | null>(null);
  const [skillAnalysis, setSkillAnalysis] = useState<SkillAnalysis | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const mockApplication = {
    applicationId: 1,
    applicationText: "Я опытный разработчик с 5 годами опыта в React и Node.js. Выполнил более 50 проектов различной сложности. Готов взяться за ваш проект и выполнить его качественно и в срок.",
    taskTitle: "Разработка веб-приложения",
    applicantName: "Иван Петров"
  };

  const handleAnalyzeTask = async () => {
    if (!taskId) return;
    setIsLoading(true);
    try {
      // Mock API call - replace with actual API
      const response = await fetch(`/api/ai/analyze-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: parseInt(taskId) })
      });
      const data = await response.json();
      console.log('Task analysis:', data);
    } catch (error) {
      console.error('Error analyzing task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSmartMatching = async () => {
    if (!taskId) return;
    setIsLoading(true);
    try {
      // Mock data - replace with actual API
      const mockMatches: SmartMatch[] = [
        {
          freelancer_id: 1,
          match_score: 0.95,
          skills_match: ['React', 'TypeScript', 'Node.js'],
          experience_level: 'Level 4',
          hourly_rate: 75,
          availability: 'Available',
          recommendations: ['Strong skill match', 'Excellent track record']
        },
        {
          freelancer_id: 2,
          match_score: 0.88,
          skills_match: ['React', 'JavaScript'],
          experience_level: 'Level 3',
          hourly_rate: 60,
          availability: 'Available',
          recommendations: ['Good skill match', 'Fast response time']
        }
      ];
      setSmartMatches(mockMatches);
    } catch (error) {
      console.error('Error getting smart matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePricingRecommendation = async () => {
    if (!taskId) return;
    setIsLoading(true);
    try {
      // Mock data - replace with actual API
      const mockRecommendation: PricingRecommendation = {
        task_id: parseInt(taskId),
        recommended_min: 500,
        recommended_max: 1200,
        market_average: 850,
        complexity_factor: 0.3,
        demand_factor: 1.2,
        skill_rarity_factor: 1.1,
        justification: 'Based on complexity level and required skills',
        confidence_score: 0.85
      };
      setPricingRecommendation(mockRecommendation);
    } catch (error) {
      console.error('Error getting pricing recommendation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeProfile = async () => {
    setIsLoading(true);
    try {
      // Mock data - replace with actual API
      const mockAnalysis: SkillAnalysis = {
        user_id: 1,
        skill_gaps: ['Machine Learning', 'AWS', 'Docker'],
        skill_strengths: ['React', 'Node.js', 'TypeScript'],
        market_demand: {
          'React': 0.9,
          'Node.js': 0.8,
          'TypeScript': 0.85
        },
        learning_recommendations: [
          'Take advanced courses in your strongest skills',
          'Learn complementary technologies',
          'Build a portfolio showcasing your expertise'
        ],
        career_path_suggestions: [
          'Senior Developer',
          'Technical Lead',
          'Full Stack Architect'
        ],
        skill_score: 0.75
      };
      setSkillAnalysis(mockAnalysis);
    } catch (error) {
      console.error('Error analyzing profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatMessage = async () => {
    if (!chatMessage.trim()) return;
    
    const userMessage = { role: 'user' as const, content: chatMessage };
    setChatHistory(prev => [...prev, userMessage]);
    
    try {
      // Mock AI response - replace with actual API
      const aiResponse = { role: 'assistant' as const, content: `I understand you're asking about: "${chatMessage}". How can I help you with that?` };
      setChatHistory(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error sending chat message:', error);
    }
    
    setChatMessage('');
  };

  const handleGenerateKeywords = async () => {
    if (!taskDescription) return;
    setIsLoading(true);
    try {
      // Mock API call - replace with actual API
      const keywords = ['development', 'web', 'frontend', 'backend', 'database'];
      console.log('Generated keywords:', keywords);
    } catch (error) {
      console.error('Error generating keywords:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-8">
        <Brain className="h-8 w-8 text-teal-500" />
        <div>
          <h1 className="text-3xl font-bold">AI-Powered Features</h1>
          <p className="text-muted-foreground">Leverage artificial intelligence to optimize your freelance experience</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="matching">Smart Matching</TabsTrigger>
          <TabsTrigger value="pricing">Pricing AI</TabsTrigger>
          <TabsTrigger value="analysis">Profile Analysis</TabsTrigger>
          <TabsTrigger value="chatbot">AI Chatbot</TabsTrigger>
          <TabsTrigger value="tools">AI Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Smart Matching</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">95%</div>
                <p className="text-xs text-muted-foreground">Match accuracy</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pricing Optimization</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+25%</div>
                <p className="text-xs text-muted-foreground">Average earnings increase</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">Project completion rate</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>AI Features Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Smart Task Matching</h4>
                  <p className="text-sm text-muted-foreground">
                    AI analyzes your skills and preferences to find the perfect tasks and clients.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Intelligent Pricing</h4>
                  <p className="text-sm text-muted-foreground">
                    Get data-driven pricing recommendations based on market trends and project complexity.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Profile Optimization</h4>
                  <p className="text-sm text-muted-foreground">
                    AI suggests improvements to make your profile more attractive to clients.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleAnalyzeProfile} className="w-full" disabled={isLoading}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analyze My Profile
                </Button>
                <Button onClick={handleSmartMatching} className="w-full" disabled={isLoading}>
                  <Search className="h-4 w-4 mr-2" />
                  Find Smart Matches
                </Button>
                <Button onClick={handlePricingRecommendation} className="w-full" disabled={isLoading}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Get Pricing Advice
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="matching" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Smart Task Matching</CardTitle>
              <p className="text-muted-foreground">
                Enter a task ID to find the best matching freelancers using AI
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter task ID"
                  value={taskId}
                  onChange={(e) => setTaskId(e.target.value)}
                />
                <Button onClick={handleSmartMatching} disabled={isLoading}>
                  <Search className="h-4 w-4 mr-2" />
                  Find Matches
                </Button>
              </div>

              {smartMatches.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Top Matches</h3>
                  {smartMatches.map((match, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">Freelancer #{match.freelancer_id}</span>
                            <Badge variant="secondary">{match.experience_level}</Badge>
                            <Badge variant={match.availability === 'Available' ? 'default' : 'destructive'}>
                              {match.availability}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">Match Score:</span>
                            <Progress value={match.match_score * 100} className="w-32" />
                            <span className="text-sm font-medium">{Math.round(match.match_score * 100)}%</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {match.skills_match.map((skill, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ${match.hourly_rate}/hr • {match.recommendations.join(', ')}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Pricing Recommendations</CardTitle>
              <p className="text-muted-foreground">
                Get intelligent pricing suggestions based on market data and project complexity
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter task ID"
                  value={taskId}
                  onChange={(e) => setTaskId(e.target.value)}
                />
                <Button onClick={handlePricingRecommendation} disabled={isLoading}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Get Recommendation
                </Button>
              </div>

              {pricingRecommendation && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          ${pricingRecommendation.recommended_min}
                        </div>
                        <div className="text-sm text-muted-foreground">Recommended Min</div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          ${pricingRecommendation.market_average}
                        </div>
                        <div className="text-sm text-muted-foreground">Market Average</div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          ${pricingRecommendation.recommended_max}
                        </div>
                        <div className="text-sm text-muted-foreground">Recommended Max</div>
                      </div>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Analysis Factors</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Complexity Factor</span>
                          <span>{(pricingRecommendation.complexity_factor * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={pricingRecommendation.complexity_factor * 100} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Demand Factor</span>
                          <span>{(pricingRecommendation.demand_factor * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={pricingRecommendation.demand_factor * 100} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Skill Rarity</span>
                          <span>{(pricingRecommendation.skill_rarity_factor * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={pricingRecommendation.skill_rarity_factor * 100} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Justification</h4>
                    <p className="text-sm text-muted-foreground">{pricingRecommendation.justification}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Confidence Score:</span>
                    <Progress value={pricingRecommendation.confidence_score * 100} className="w-32" />
                    <span className="text-sm">{(pricingRecommendation.confidence_score * 100).toFixed(0)}%</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Profile Analysis</CardTitle>
              <p className="text-muted-foreground">
                Get insights about your skills, market position, and growth opportunities
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleAnalyzeProfile} disabled={isLoading}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Analyze My Profile
              </Button>

              {skillAnalysis && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Skill Analysis</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Overall Skill Score</span>
                          <span className="font-medium">{(skillAnalysis.skill_score * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={skillAnalysis.skill_score * 100} />
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">Skill Strengths</h5>
                        <div className="flex flex-wrap gap-1">
                          {skillAnalysis.skill_strengths.map((skill, idx) => (
                            <Badge key={idx} variant="default" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">Skill Gaps</h5>
                        <div className="flex flex-wrap gap-1">
                          {skillAnalysis.skill_gaps.map((skill, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Market Demand</h4>
                      <div className="space-y-2">
                        {Object.entries(skillAnalysis.market_demand).map(([skill, demand]) => (
                          <div key={skill} className="flex items-center justify-between">
                            <span className="text-sm">{skill}</span>
                            <div className="flex items-center space-x-2">
                              <Progress value={demand * 100} className="w-20" />
                              <span className="text-xs">{(demand * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Learning Recommendations</h4>
                    <ul className="space-y-2">
                      {skillAnalysis.learning_recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Career Path Suggestions</h4>
                    <div className="flex flex-wrap gap-2">
                      {skillAnalysis.career_path_suggestions.map((path, idx) => (
                        <Badge key={idx} variant="secondary">
                          {path}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chatbot" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Assistant Chatbot</CardTitle>
              <p className="text-muted-foreground">
                Get instant help and guidance from our AI assistant
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-96 border rounded-lg p-4 space-y-4 overflow-y-auto">
                {chatHistory.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Start a conversation with our AI assistant</p>
                  </div>
                ) : (
                  chatHistory.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-teal-500 text-white'
                            : 'bg-muted'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex space-x-2">
                <Input
                  placeholder="Ask me anything about the platform..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleChatMessage()}
                />
                <Button onClick={handleChatMessage} disabled={!chatMessage.trim()}>
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                Try asking: "How do I create a task?", "What are the payment methods?", "How does escrow work?"
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Keyword Generator</CardTitle>
                <p className="text-muted-foreground">
                  Generate relevant keywords for your task descriptions
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Describe your task..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  rows={4}
                />
                <Button onClick={handleGenerateKeywords} disabled={!taskDescription.trim() || isLoading}>
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Keywords
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Proposal Optimizer</CardTitle>
                <p className="text-muted-foreground">
                  Improve your proposals with AI suggestions
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste your proposal here..."
                  rows={4}
                />
                <Button disabled={isLoading}>
                  <FileText className="h-4 w-4 mr-2" />
                  Optimize Proposal
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Analysis</CardTitle>
                <p className="text-muted-foreground">
                  Get insights about market trends and opportunities
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Enter category or skills..." />
                <Button disabled={isLoading}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analyze Market
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contract Generator</CardTitle>
                <p className="text-muted-foreground">
                  Generate professional contracts with AI assistance
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Task ID" />
                <Input placeholder="Freelancer ID" />
                <Button disabled={isLoading}>
                  <Shield className="h-4 w-4 mr-2" />
                  Generate Contract
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AI; 
