import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Badge } from '@/shared/ui/badge'
import { Layout, Plus, X, Trash2 } from 'lucide-react'
import { useTasksStore } from '../store'
import { Priority, Category, TaskTemplate } from '../types'
import {
  PRIORITIES,
  CATEGORIES,
  getPriorityConfig,
  getCategoryConfig,
} from '../utils'

export default function TemplateManager() {
  const [isCreating, setIsCreating] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [templateText, setTemplateText] = useState('')
  const [templatePriority, setTemplatePriority] = useState<Priority>('medium')
  const [templateCategory, setTemplateCategory] = useState<Category>('other')
  const [subtaskTexts, setSubtaskTexts] = useState<string[]>([''])

  const { templates, addTemplate, deleteTemplate, isLoading } = useTasksStore()

  const handleAddSubtask = () => {
    setSubtaskTexts([...subtaskTexts, ''])
  }

  const handleRemoveSubtask = (index: number) => {
    setSubtaskTexts(subtaskTexts.filter((_, i) => i !== index))
  }

  const handleSubtaskChange = (index: number, value: string) => {
    const newSubtasks = [...subtaskTexts]
    newSubtasks[index] = value
    setSubtaskTexts(newSubtasks)
  }

  const handleCreateTemplate = async () => {
    if (!templateName.trim() || !templateText.trim()) return

    try {
      const subtasks = subtaskTexts
        .filter((text) => text.trim())
        .map((text) => ({ text: text.trim(), done: false }))

      await addTemplate({
        name: templateName.trim(),
        text: templateText.trim(),
        priority: templatePriority,
        category: templateCategory,
        subtasks,
        createdAt: new Date().toISOString(),
      })

      // Reset form
      setTemplateName('')
      setTemplateText('')
      setTemplatePriority('medium')
      setTemplateCategory('other')
      setSubtaskTexts([''])
      setIsCreating(false)
    } catch (error) {
      console.error('Failed to create template:', error)
    }
  }

  const handleDeleteTemplate = async (id: string, name: string) => {
    if (confirm(`Delete template "${name}"?`)) {
      try {
        await deleteTemplate(id)
      } catch (error) {
        console.error('Failed to delete template:', error)
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Create Template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Template Manager
            </div>
            <Button
              onClick={() => setIsCreating(!isCreating)}
              variant={isCreating ? 'secondary' : 'default'}
              size="sm"
            >
              {isCreating ? (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  New Template
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>

        {isCreating && (
          <CardContent className="space-y-4">
            {/* Template Name */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Template Name
              </label>
              <Input
                placeholder="e.g., Daily Workout, Weekly Review..."
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>

            {/* Template Text */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Default Task Text
              </label>
              <Input
                placeholder="e.g., Complete morning workout routine"
                value={templateText}
                onChange={(e) => setTemplateText(e.target.value)}
              />
            </div>

            {/* Priority and Category */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Default Priority
                </label>
                <div className="flex gap-1">
                  {PRIORITIES.map((priority) => (
                    <Button
                      key={priority.value}
                      variant={
                        templatePriority === priority.value
                          ? 'default'
                          : 'outline'
                      }
                      size="sm"
                      onClick={() => setTemplatePriority(priority.value)}
                      className="flex-1 text-xs"
                    >
                      <span className="mr-1">{priority.icon}</span>
                      {priority.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Default Category
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {CATEGORIES.map((category) => (
                    <Button
                      key={category.value}
                      variant={
                        templateCategory === category.value
                          ? 'default'
                          : 'outline'
                      }
                      size="sm"
                      onClick={() => setTemplateCategory(category.value)}
                      className="text-xs"
                    >
                      <span className="mr-1">{category.icon}</span>
                      {category.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Subtasks */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium">Default Subtasks</label>
                <Button onClick={handleAddSubtask} variant="outline" size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  Add Subtask
                </Button>
              </div>
              <div className="space-y-2">
                {subtaskTexts.map((text, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={`Subtask ${index + 1}...`}
                      value={text}
                      onChange={(e) =>
                        handleSubtaskChange(index, e.target.value)
                      }
                      className="flex-1"
                    />
                    {subtaskTexts.length > 1 && (
                      <Button
                        onClick={() => handleRemoveSubtask(index)}
                        variant="outline"
                        size="sm"
                        className="px-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Create Button */}
            <Button
              onClick={handleCreateTemplate}
              disabled={
                isLoading || !templateName.trim() || !templateText.trim()
              }
              className="w-full"
            >
              Create Template
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Existing Templates */}
      {templates.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Existing Templates</h3>
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onDelete={handleDeleteTemplate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface TemplateCardProps {
  template: TaskTemplate
  onDelete: (id: string, name: string) => void
}

function TemplateCard({ template, onDelete }: TemplateCardProps) {
  const priorityConfig = getPriorityConfig(template.priority)
  const categoryConfig = getCategoryConfig(template.category)

  return (
    <Card>
      <CardContent className="py-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-medium">{template.name}</h4>
            <p className="mb-2 text-sm text-muted-foreground">
              {template.text}
            </p>

            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-xs ${priorityConfig.color}`}
              >
                <span className="mr-1">{priorityConfig.icon}</span>
                {priorityConfig.label}
              </Badge>
              <Badge
                variant="outline"
                className={`text-xs ${categoryConfig.color}`}
              >
                <span className="mr-1">{categoryConfig.icon}</span>
                {categoryConfig.label}
              </Badge>
              {template.subtasks.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {template.subtasks.length} subtask
                  {template.subtasks.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>

          <Button
            onClick={() => onDelete(template.id, template.name)}
            variant="outline"
            size="sm"
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
