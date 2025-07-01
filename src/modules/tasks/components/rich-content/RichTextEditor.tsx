import { useState, useEffect, lazy, Suspense } from 'react'
import { Eye, Edit3, Bold, Italic, List, Link, Code } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent } from '@/shared/ui/card'
import { Textarea } from '@/shared/ui/textarea'
import { DescriptionFormat } from '../../types'

const ReactMarkdown = lazy(() => import('react-markdown'))
const SyntaxHighlighter = lazy(() => import('react-syntax-highlighter'))
const remarkGfm = lazy(() => import('remark-gfm'))
const rehypeRaw = lazy(() => import('rehype-raw'))

// You can choose a style from react-syntax-highlighter/dist/esm/styles/prism
// For example, import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism'
// For now, we'll use a simple inline style or a default if not provided
const defaultCodeStyle = {
  'pre[class*="language-"]': {
    backgroundColor: '#2d2d2d',
    color: '#ccc',
    padding: '1em',
    borderRadius: '0.5em',
    overflow: 'auto',
  },
  'code[class*="language-"]': {
    backgroundColor: '#2d2d2d',
    color: '#ccc',
  },
}

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
      return (
        <Suspense fallback={<div>Loading preview...</div>}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={defaultCodeStyle}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              },
            }}
          >
            {currentValue}
          </ReactMarkdown>
        </Suspense>
      )
    } else if (currentFormat === 'html') {
      return <div dangerouslySetInnerHTML={{ __html: currentValue }} />
    } else {
      return <div className="whitespace-pre-wrap">{currentValue}</div>
    }
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
      return (
        <Suspense fallback={<div>Loading preview...</div>}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={defaultCodeStyle}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </Suspense>
      )
    } else if (format === 'html') {
      return <div dangerouslySetInnerHTML={{ __html: content }} />
    } else {
      return <div className="whitespace-pre-wrap">{content}</div>
    }
  }

  if (!content) return null

  return (
    <div className={`text-sm ${className}`}>
      {renderContent()}
    </div>
  )
} 