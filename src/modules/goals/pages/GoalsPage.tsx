import React, { useState, useEffect } from 'react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Plus, Target, TrendingUp, CheckCircle } from 'lucide-react'
import { useGoalsStore } from '../store'
import { useTasksStore } from '@/modules/tasks/store'
import { GoalForm } from '../components/GoalForm'
import { GoalCard } from '../components/GoalCard'
import { GoalWithProgress } from '../types'

export const GoalsPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false)
  
  const { goals, loadGoals, getGoalsWithProgress, getActiveGoals } = useGoalsStore()
  const { todos, loadTodos } = useTasksStore()

  useEffect(() => {
    loadGoals()
    loadTodos()
  }, [loadGoals, loadTodos])

  const goalsWithProgress = getGoalsWithProgress(todos)
  const activeGoals = getActiveGoals()
  
  // Calculate summary stats
  const totalGoals = goals.length
  const activeGoalsCount = activeGoals.length
  const completedGoals = goalsWithProgress.filter(g => g.progress.progressPercentage === 100).length
  const totalProgress = goalsWithProgress.length > 0 
    ? Math.round(goalsWithProgress.reduce((sum, g) => sum + g.progress.progressPercentage, 0) / goalsWithProgress.length)
    : 0

  const handleFormSuccess = () => {
    setShowForm(false)
  }

  const handleEditGoal = (goal: GoalWithProgress) => {
    // TODO: Implement goal editing in future iteration
    console.log('Edit goal:', goal)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setShowForm(false)
  }

  if (showForm) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={handleCancelForm}
            className="mb-4"
          >
            ← Back to Goals
          </Button>
        </div>
        <GoalForm 
          onSuccess={handleFormSuccess}
          onCancel={handleCancelForm}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            Goals
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your objectives and link them to daily tasks
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Goal
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Goals</p>
                <p className="text-2xl font-bold">{totalGoals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{activeGoalsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedGoals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold">{totalProgress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Grid */}
      {goalsWithProgress.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first goal to start organizing your todos around meaningful objectives.
            </p>
            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goalsWithProgress.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEditGoal}
            />
          ))}
        </div>
      )}

      {/* Quick Tips */}
      {goalsWithProgress.length > 0 && goalsWithProgress.some(g => g.progress.totalTodos === 0) && (
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">💡</span>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Link your todos to goals</h4>
                <p className="text-sm text-blue-700">
                  Some of your goals don't have any linked tasks yet. When creating or editing todos, 
                  select a goal to track your progress automatically.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 