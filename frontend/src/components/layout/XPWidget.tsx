import { Trophy, Star, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'

interface XPWidgetProps {
  currentXP: number
  totalXP: number
  level: number
  nextLevel: number
}

export default function XPWidget({ currentXP, totalXP, level, nextLevel }: XPWidgetProps) {
  const progress = (currentXP / totalXP) * 100

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-primary" />
          Level {level}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* XP Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">XP Progress</span>
            <span className="font-medium">{currentXP} / {totalXP}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Level Info */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">Current Level</span>
          </div>
          <span className="text-lg font-bold text-primary">{level}</span>
        </div>

        {/* Next Level */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Next Level</span>
          </div>
          <span className="text-lg font-bold text-green-600">{nextLevel}</span>
        </div>

        {/* XP to Next Level */}
        <div className="text-center p-3 bg-primary/5 rounded-lg">
          <p className="text-sm text-muted-foreground">XP to Next Level</p>
          <p className="text-lg font-bold text-primary">{totalXP - currentXP}</p>
        </div>
      </CardContent>
    </Card>
  )
} 
