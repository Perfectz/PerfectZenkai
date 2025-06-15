import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useWeightStore } from '../store'
import { WeightEntry, kgToLbs } from '../types'
import { WeightRow } from './WeightRow'

interface WeightPeriodViewProps {
  period: 7 | 30
  onClose?: () => void
}

export function WeightPeriodView({ period, onClose }: WeightPeriodViewProps) {
  const { weights } = useWeightStore()

  // Filter weights for the specified period
  const getPeriodWeights = () => {
    const daysAgo = new Date()
    daysAgo.setDate(daysAgo.getDate() - period)
    
    return weights
      .filter(w => new Date(w.dateISO) >= daysAgo)
      .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime())
  }

  const periodWeights = getPeriodWeights()

  // Calculate period analytics
  const getPeriodAnalytics = () => {
    if (periodWeights.length === 0) return null

    const sortedByDate = [...periodWeights].sort((a, b) => 
      new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
    )

    const firstWeight = sortedByDate[0]
    const lastWeight = sortedByDate[sortedByDate.length - 1]
    const change = lastWeight.kg - firstWeight.kg
    const averageWeight = periodWeights.reduce((sum, w) => sum + w.kg, 0) / periodWeights.length

    return {
      firstWeight: firstWeight.kg,
      lastWeight: lastWeight.kg,
      change,
      averageWeight,
      entryCount: periodWeights.length,
      firstDate: firstWeight.dateISO,
      lastDate: lastWeight.dateISO
    }
  }

  const analytics = getPeriodAnalytics()

  const getTrendIcon = (change: number) => {
    if (Math.abs(change) < 0.1) return <Minus className="h-4 w-4 text-plasma-cyan" />
    return change > 0 
      ? <TrendingUp className="h-4 w-4 text-red-400" />
      : <TrendingDown className="h-4 w-4 text-ki-green" />
  }

  const getTrendColor = (change: number) => {
    if (Math.abs(change) < 0.1) return 'text-plasma-cyan'
    return change > 0 ? 'text-red-400' : 'text-ki-green'
  }

  const formatDate = (dateISO: string) => {
    return new Date(dateISO).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Card className="cyber-card border-ki-green/30 mobile-card mobile-responsive" data-testid="period-view-container">
      <CardHeader className="pb-3 mobile-layout">
        <div className="flex items-center justify-between">
          <CardTitle className="cyber-subtitle flex items-center gap-2 text-ki-green mobile-heading">
            <Calendar className="cyber-icon h-5 w-5" />
            Last {period} Days
          </CardTitle>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 text-lg font-bold touch-target"
              aria-label="Close period view"
            >
              ✕
            </button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 mobile-form">
        {/* Period Summary */}
        {analytics && (
          <div className="cyber-card bg-gray-900/50 p-3 rounded-lg mobile-card">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mobile-grid">
              <div className="mobile-card">
                <div className="gradient-text-ki metric-display text-lg font-bold mobile-large">
                  {analytics.entryCount}
                </div>
                <div className="font-mono text-xs text-gray-400 mobile-caption">Entries</div>
              </div>
              <div className="mobile-card">
                <div className="gradient-text-cyan metric-display text-lg font-bold mobile-large">
                  {kgToLbs(analytics.averageWeight).toFixed(1)}lbs
                </div>
                <div className="font-mono text-xs text-gray-400 mobile-caption">Average</div>
              </div>
              <div className="mobile-card">
                <div className={`metric-display text-lg font-bold mobile-large ${getTrendColor(analytics.change)}`}>
                  {analytics.change >= 0 ? '+' : ''}{kgToLbs(analytics.change).toFixed(1)}lbs
                </div>
                <div className="font-mono text-xs text-gray-400 mobile-caption">Change</div>
              </div>
              <div className="mobile-card">
                <div className="flex items-center justify-center">
                  {getTrendIcon(analytics.change)}
                </div>
                <div className="font-mono text-xs text-gray-400 mobile-caption">Trend</div>
              </div>
            </div>

            {/* Date range */}
            <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-center gap-2">
              <Badge variant="outline" className="text-xs">
                {formatDate(analytics.firstDate)}
              </Badge>
              <span className="text-gray-500">→</span>
              <Badge variant="outline" className="text-xs">
                {formatDate(analytics.lastDate)}
              </Badge>
            </div>
          </div>
        )}

        {/* Weight Entries */}
        {periodWeights.length > 0 ? (
          <div className="space-y-3 mobile-layout">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-300 mobile-body">
                Weight Entries ({periodWeights.length})
              </h4>
              <Badge variant="outline" className="text-xs mobile-caption">
                Tap to edit
              </Badge>
            </div>
            
            <div className="space-y-2 max-h-80 overflow-y-auto mobile-scroll" data-testid="entries-scroll-container">
              {periodWeights.map((weight) => (
                <div key={weight.id} data-testid={`weight-entry-${weight.id}`} className="mobile-card">
                  <WeightRow entry={weight} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              No weight entries in the last {period} days
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Add some entries to see them here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 