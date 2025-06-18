import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MessageBubble } from '../components/MessageBubble'
import type { ChatMessage } from '../types/chat.types'

describe('MessageBubble Component', () => {
  const mockUserMessage: ChatMessage = {
    id: '1',
    content: 'What exercises should I do today?',
    role: 'user',
    timestamp: new Date('2024-01-01T10:00:00Z'),
    metadata: {}
  }

  const mockAssistantMessage: ChatMessage = {
    id: '2',
    content: 'Based on your workout history, I recommend focusing on upper body strength training today...',
    role: 'assistant',
    timestamp: new Date('2024-01-01T10:01:00Z'),
    metadata: {
      contextUsed: true,
      responseTime: 1200,
      tokenCount: 150,
      model: 'gpt-4'
    }
  }

  describe('User Messages', () => {
    it('should render user message with correct styling', () => {
      render(<MessageBubble message={mockUserMessage} />)
      
      expect(screen.getByTestId('message-1')).toBeInTheDocument()
      expect(screen.getByTestId('message-1')).toHaveClass('user-message')
      expect(screen.getByText('What exercises should I do today?')).toBeInTheDocument()
    })

    it('should display timestamp for user messages', () => {
      render(<MessageBubble message={mockUserMessage} showTimestamp={true} />)
      
      expect(screen.getByTestId('message-timestamp')).toBeInTheDocument()
      expect(screen.getByText(/10:00/)).toBeInTheDocument()
    })

    it('should have proper accessibility attributes', () => {
      render(<MessageBubble message={mockUserMessage} />)
      
      const messageElement = screen.getByTestId('message-1')
      expect(messageElement).toHaveAttribute('role', 'listitem')
      expect(messageElement).toHaveAttribute('aria-label', 'User message')
    })
  })

  describe('Assistant Messages', () => {
    it('should render assistant message with correct styling', () => {
      render(<MessageBubble message={mockAssistantMessage} />)
      
      expect(screen.getByTestId('message-2')).toBeInTheDocument()
      expect(screen.getByTestId('message-2')).toHaveClass('assistant-message')
      expect(screen.getByText(/Based on your workout history/)).toBeInTheDocument()
    })

    it('should show metadata when available', () => {
      render(<MessageBubble message={mockAssistantMessage} showMetadata={true} />)
      
      expect(screen.getByTestId('message-metadata')).toBeInTheDocument()
      expect(screen.getByText(/Context used/)).toBeInTheDocument()
      expect(screen.getByText(/1.2s/)).toBeInTheDocument()
      expect(screen.getByText(/150 tokens/)).toBeInTheDocument()
    })

    it('should have assistant icon or avatar', () => {
      render(<MessageBubble message={mockAssistantMessage} />)
      
      expect(screen.getByTestId('assistant-avatar')).toBeInTheDocument()
    })
  })

  describe('Message Content', () => {
    it('should handle long messages with proper wrapping', () => {
      const longMessage = {
        ...mockAssistantMessage,
        content: 'This is a very long message that should wrap properly across multiple lines without breaking the layout or causing horizontal scrolling issues in the chat interface.'
      }
      
      render(<MessageBubble message={longMessage} />)
      
      const messageContent = screen.getByTestId('message-content')
      expect(messageContent).toHaveClass('break-words')
    })

    it('should support markdown formatting', () => {
      const markdownMessage = {
        ...mockAssistantMessage,
        content: '**Bold text** and *italic text* with [links](https://example.com)'
      }
      
      render(<MessageBubble message={markdownMessage} enableMarkdown={true} />)
      
      expect(screen.getByText('Bold text')).toHaveClass('font-bold')
      expect(screen.getByText('italic text')).toHaveClass('italic')
    })

    it('should sanitize harmful content', () => {
      const maliciousMessage = {
        ...mockAssistantMessage,
        content: '<script>alert("xss")</script>Safe content'
      }
      
      render(<MessageBubble message={maliciousMessage} />)
      
      expect(screen.getByText('Safe content')).toBeInTheDocument()
      expect(screen.queryByText('<script>')).not.toBeInTheDocument()
    })
  })

  describe('Streaming Messages', () => {
    it('should show streaming indicator for incomplete messages', () => {
      const streamingMessage = {
        ...mockAssistantMessage,
        content: 'Partial response...',
        isStreaming: true
      }
      
      render(<MessageBubble message={streamingMessage} />)
      
      expect(screen.getByTestId('streaming-indicator')).toBeInTheDocument()
    })

    it('should animate text cursor for streaming messages', () => {
      const streamingMessage = {
        ...mockAssistantMessage,
        isStreaming: true
      }
      
      render(<MessageBubble message={streamingMessage} />)
      
      expect(screen.getByTestId('typing-cursor')).toBeInTheDocument()
      expect(screen.getByTestId('typing-cursor')).toHaveClass('animate-pulse')
    })
  })

  describe('Error States', () => {
    it('should display error state for failed messages', () => {
      const errorMessage = {
        ...mockUserMessage,
        error: 'Failed to send message'
      }
      
      render(<MessageBubble message={errorMessage} />)
      
      expect(screen.getByTestId('message-error')).toBeInTheDocument()
      expect(screen.getByText(/Failed to send/)).toBeInTheDocument()
    })

    it('should show retry button for failed messages', () => {
      const errorMessage = {
        ...mockUserMessage,
        error: 'Network error'
      }
      
      render(<MessageBubble message={errorMessage} onRetry={() => {}} />)
      
      expect(screen.getByTestId('retry-button')).toBeInTheDocument()
    })
  })

  describe('Animations', () => {
    it('should animate in when message appears', () => {
      render(<MessageBubble message={mockAssistantMessage} animate={true} />)
      
      expect(screen.getByTestId('message-2')).toHaveClass('animate-fade-in-up')
    })

    it('should have smooth transitions for state changes', () => {
      render(<MessageBubble message={mockAssistantMessage} />)
      
      const messageElement = screen.getByTestId('message-2')
      expect(messageElement).toHaveClass('transition-all')
    })
  })
}) 