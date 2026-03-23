import { useState } from 'react'
import { Card, CardContent } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/utils/cn'
import { AnyTodo, isRecurringTodo } from '../types'

export type TaskTabType = 'recurring' | 'one-time' | 'all'

interface TaskTabsProps {
  todos: AnyTodo[]
  activeTab: TaskTabType
  onTabChange: (tab: TaskTabType) => void
  children: React.ReactNode
}

interface TabConfig {
  id: TaskTabType
  label: string
  icon: string
  getCount: (todos: AnyTodo[]) => number
}

const TAB_CONFIGS: TabConfig[] = [
  {
    id: 'recurring',
    label: 'Recurring',
    icon: '🔄',
    getCount: (todos) => todos.filter(isRecurringTodo).filter(t => t.status === 'active').length
  },
  {
    id: 'one-time',
    label: 'One-time',
    icon: '⚡',
    getCount: (todos) => todos.filter(t => !isRecurringTodo(t)).length
  },
  {
    id: 'all',
    label: 'All Tasks',
    icon: '📋',
    getCount: (todos) => todos.length
  }
]

export function TaskTabs({ todos, activeTab, onTabChange, children }: TaskTabsProps) {
  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <Card className="cyber-card overflow-hidden">
        <CardContent className="p-2 sm:p-3">
          <div className="panel-scroll-x">
            <div className="flex min-w-max gap-2 sm:min-w-0 sm:flex-wrap">
            {TAB_CONFIGS.map((tab) => {
              const count = tab.getCount(todos)
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "flex min-h-[46px] items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
                    "min-w-[8.75rem] sm:min-w-0 sm:flex-1",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`tabpanel-${tab.id}`}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span className="truncate">{tab.label}</span>
                  {count > 0 && (
                    <Badge 
                      variant={isActive ? "secondary" : "outline"}
                      className={cn(
                        "text-xs px-1.5 py-0.5 min-w-[20px] h-5",
                        isActive ? "bg-primary-foreground/20 text-primary-foreground" : ""
                      )}
                    >
                      {count}
                    </Badge>
                  )}
                </button>
              )
            })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      <div 
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
      >
        {children}
      </div>
    </div>
  )
}

export default TaskTabs 