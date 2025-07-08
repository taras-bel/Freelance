import { useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Clock, 
  Star,
  Users,
  Calendar,
  BarChart3,
  LineChart,
  PieChart,
  Activity
} from 'lucide-react'

interface AnalyticsData {
  earnings: {
    current: number
    previous: number
    trend: number
  }
  tasks: {
    completed: number
    total: number
    trend: number
  }
  interviews: {
    completed: number
    averageScore: number
    trend: number
  }
  clients: {
    active: number
    total: number
    trend: number
  }
  weeklyData: {
    date: string
    earnings: number
    tasks: number
    interviews: number
  }[]
  skillDistribution: {
    skill: string
    percentage: number
    color: string
  }[]
}

interface AnalyticsPanelProps {
  data: AnalyticsData
}

export default function AnalyticsPanel({ data }: AnalyticsPanelProps) {
  const [activeChart, setActiveChart] = useState<'earnings' | 'tasks' | 'interviews'>('earnings')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <TrendingUp size={16} className="text-green-500" />
    } else if (trend < 0) {
      return <TrendingDown size={16} className="text-red-500" />
    }
    return <Activity size={16} className="text-gray-500" />
  }

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-500'
    if (trend < 0) return 'text-red-500'
    return 'text-gray-500'
  }

  const metrics = [
    {
      title: 'Total Earnings',
      value: formatCurrency(data.earnings.current),
      trend: data.earnings.trend,
      icon: <DollarSign size={20} className="text-green-500" />,
      description: 'This month'
    },
    {
      title: 'Tasks Completed',
      value: `${data.tasks.completed}/${data.tasks.total}`,
      trend: data.tasks.trend,
      icon: <Target size={20} className="text-blue-500" />,
      description: 'Completion rate'
    },
    {
      title: 'Interview Score',
      value: `${data.interviews.averageScore}%`,
      trend: data.interviews.trend,
      icon: <Star size={20} className="text-yellow-500" />,
      description: 'Average score'
    },
    {
      title: 'Active Clients',
      value: `${data.clients.active}/${data.clients.total}`,
      trend: data.clients.trend,
      icon: <Users size={20} className="text-purple-500" />,
      description: 'Client retention'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-muted/50 rounded-lg">
                {metric.icon}
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(metric.trend)}
                <span className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                  {Math.abs(metric.trend)}%
                </span>
              </div>
            </div>
            <div className="mb-1">
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="text-sm font-medium text-foreground">{metric.title}</div>
            </div>
            <div className="text-xs text-muted-foreground">{metric.description}</div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend Chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Weekly Trends</h3>
            <div className="flex gap-2">
              {(['earnings', 'tasks', 'interviews'] as const).map((chart) => (
                <button
                  key={chart}
                  onClick={() => setActiveChart(chart)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    activeChart === chart
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {chart.charAt(0).toUpperCase() + chart.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-2">
            {data.weeklyData.map((week, index) => {
              const value = week[activeChart as keyof typeof week] as number
              const maxValue = Math.max(...data.weeklyData.map(w => w[activeChart as keyof typeof w] as number))
              const height = maxValue > 0 ? (value / maxValue) * 100 : 0
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-muted/50 rounded-t-lg transition-all duration-300 hover:bg-primary/20"
                       style={{ height: `${height}%` }}>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 text-center">
                    {new Date(week.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="mt-4 text-center">
            <div className="text-sm font-medium text-muted-foreground">
              {activeChart === 'earnings' && 'Weekly Earnings'}
              {activeChart === 'tasks' && 'Tasks Completed'}
              {activeChart === 'interviews' && 'Interviews Taken'}
            </div>
          </div>
        </div>

        {/* Skill Distribution */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Skill Distribution</h3>
            <PieChart size={20} className="text-muted-foreground" />
          </div>
          
          <div className="space-y-3">
            {data.skillDistribution.map((skill, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: skill.color }}
                  />
                  <span className="text-sm font-medium">{skill.skill}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${skill.percentage}%`,
                        backgroundColor: skill.color
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8 text-right">
                    {skill.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium mb-1">Top Skill</div>
            <div className="text-xs text-muted-foreground">
              {data.skillDistribution[0]?.skill} - {data.skillDistribution[0]?.percentage}% proficiency
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Clock size={16} className="text-green-500" />
            </div>
            <div>
              <div className="text-sm font-medium">Best Time</div>
              <div className="text-lg font-bold">9:00 AM</div>
              <div className="text-xs text-muted-foreground">Peak productivity</div>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Calendar size={16} className="text-blue-500" />
            </div>
            <div>
              <div className="text-sm font-medium">Streak</div>
              <div className="text-lg font-bold">12 days</div>
              <div className="text-xs text-muted-foreground">Active streak</div>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <BarChart3 size={16} className="text-purple-500" />
            </div>
            <div>
              <div className="text-sm font-medium">Rating</div>
              <div className="text-lg font-bold">4.8/5</div>
              <div className="text-xs text-muted-foreground">Client satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
