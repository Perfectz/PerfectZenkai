import { useState, useEffect } from 'react'
import { Eye, Edit3, Bold, Italic, List, Link, Code } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent } from '@/shared/ui/card'
import { Textarea } from '@/shared/ui/textarea'
import { DescriptionFormat } from '../../types'

interface RichTextEditorProps {
  value?: string // Description content
  format?: DescriptionFormat // Format type
  onChange: (content: string, format: DescriptionFormat) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  maxLength?: number
  minHeight?: number
}

export function RichTextEditor({
  value = '',
  format = 'markdown',
  onChange,
  placeholder = 'Add a detailed description...',
  disabled = false,
  className = '',
  maxLength = 5000,
  minHeight = 120,
}: RichTextEditorProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [currentValue, setCurrentValue] = useState(value)
  const [currentFormat, setCurrentFormat] = useState(format)

  useEffect(() => {
    setCurrentValue(value)
  }, [value])

  useEffect(() => {
    setCurrentFormat(format)
  }, [format])

  const handleChange = (newValue: string) => {
    setCurrentValue(newValue)
    onChange(newValue, currentFormat)
  }

  const handleFormatChange = (newFormat: DescriptionFormat) => {
    setCurrentFormat(newFormat)
    onChange(currentValue, newFormat)
  }

  const insertMarkdown = (wrapper: string, placeholder: string = '') => {
    const textarea = document.querySelector(`[data-editor-id="${editorId}"]`) as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = currentValue.substring(start, end)
    const textToInsert = selectedText || placeholder

    let newText = ''
    if (wrapper === '[]()') {
      // Special case for links
      newText = `[${textToInsert || 'Link text'}](${selectedText ? '' : 'URL'})`
    } else {
      newText = `${wrapper}${textToInsert}${wrapper}`
    }

    const newValue = currentValue.substring(0, start) + newText + currentValue.substring(end)
    handleChange(newValue)

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + newText.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const renderPreview = () => {
    if (currentFormat === 'markdown') {
      return renderMarkdownPreview(currentValue)
    } else if (currentFormat === 'html') {
      return <div dangerouslySetInnerHTML={{ __html: currentValue }} />
    } else {
      return <div className="whitespace-pre-wrap">{currentValue}</div>
    }
  }

  const renderMarkdownPreview = (markdown: string) => {
    // Simple markdown renderer (we'll enhance this when react-markdown is available)
    let html = markdown
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 rounded">$1</code>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener">$1</a>')
      .replace(/\n\n/g, '</p><p class="mt-2">')
      .replace(/\n/g, '<br>')

    // Wrap in paragraph tags
    if (html && !html.includes('<h1>') && !html.includes('<h2>') && !html.includes('<h3>')) {
      html = `<p>${html}</p>`
    }

    return <div dangerouslySetInnerHTML={{ __html: html }} className="prose prose-sm max-w-none" />
  }

  const editorId = `editor-${Math.random().toString(36).substr(2, 9)}`

  const formatButtons = [
    { icon: Bold, action: () => insertMarkdown('**', 'bold text'), tooltip: 'Bold' },
    { icon: Italic, action: () => insertMarkdown('*', 'italic text'), tooltip: 'Italic' },
    { icon: Code, action: () => insertMarkdown('`', 'code'), tooltip: 'Code' },
    { icon: Link, action: () => insertMarkdown('[]()', 'link'), tooltip: 'Link' },
    { icon: List, action: () => insertMarkdown('- ', ''), tooltip: 'List item' },
  ]

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Format selector and toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Format selector */}
          <div className="flex items-center gap-1">
            {(['markdown', 'plaintext'] as DescriptionFormat[]).map((fmt) => (
              <Button
                key={fmt}
                variant={currentFormat === fmt ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFormatChange(fmt)}
                className="h-7 px-2 text-xs"
              >
                {fmt === 'markdown' ? 'MD' : 'TXT'}
              </Button>
            ))}
          </div>

          {/* Markdown toolbar */}
          {currentFormat === 'markdown' && !isPreviewMode && (
            <div className="flex items-center gap-1 ml-2 border-l pl-2">
              {formatButtons.map((button, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={button.action}
                  className="h-7 w-7 p-0"
                  title={button.tooltip}
                >
                  <button.icon className="h-3 w-3" />
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Preview toggle */}
        {currentFormat === 'markdown' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="h-7 px-2 text-xs"
          >
            {isPreviewMode ? (
              <>
                <Edit3 className="mr-1 h-3 w-3" />
                Edit
              </>
            ) : (
              <>
                <Eye className="mr-1 h-3 w-3" />
                Preview
              </>
            )}
          </Button>
        )}
      </div>

      {/* Editor/Preview area */}
      <Card>
        <CardContent className="p-3">
          {isPreviewMode ? (
            <div
              className="min-h-[120px] text-sm"
              style={{ minHeight: `${minHeight}px` }}
            >
              {currentValue ? renderPreview() : (
                <div className="text-muted-foreground italic">
                  No content to preview
                </div>
              )}
            </div>
          ) : (
            <Textarea
              data-editor-id={editorId}
              value={currentValue}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className="resize-none border-0 focus-visible:ring-0 p-0"
              style={{ minHeight: `${minHeight}px` }}
              maxLength={maxLength}
            />
          )}
        </CardContent>
      </Card>

      {/* Status bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {currentFormat.toUpperCase()}
          </Badge>
          {currentFormat === 'markdown' && (
            <span>
              Tip: Use **bold**, *italic*, `code`, [links](url), - lists
            </span>
          )}
        </div>
        <div>
          {currentValue.length}/{maxLength}
        </div>
      </div>
    </div>
  )
}

// Simpler read-only preview component
export function RichTextPreview({
  content,
  format = 'markdown',
  className = '',
}: {
  content: string
  format?: DescriptionFormat
  className?: string
}) {
  const renderContent = () => {
    if (format === 'markdown') {
      return renderMarkdownPreview(content)
    } else if (format === 'html') {
      return <div dangerouslySetInnerHTML={{ __html: content }} />
    } else {
      return <div className="whitespace-pre-wrap">{content}</div>
    }
  }

  const renderMarkdownPreview = (markdown: string) => {
    let html = markdown
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 rounded text-xs">$1</code>')
      .replace(/^### (.*$)/gm, '<h3 class="text-sm font-semibold mt-2 mb-1">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-base font-semibold mt-2 mb-1">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-lg font-bold mt-2 mb-1">$1</h1>')
      .replace(/^- (.*$)/gm, '<li class="ml-4 text-sm">• $1</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline text-sm" target="_blank" rel="noopener">$1</a>')
      .replace(/\n\n/g, '</p><p class="mt-1">')
      .replace(/\n/g, '<br>')

    if (html && !html.includes('<h1>') && !html.includes('<h2>') && !html.includes('<h3>')) {
      html = `<p class="text-sm">${html}</p>`
    }

    return <div dangerouslySetInnerHTML={{ __html: html }} className="prose prose-sm max-w-none" />
  }

  if (!content) return null

  return (
    <div className={`text-sm ${className}`}>
      {renderContent()}
    </div>
  )
} 