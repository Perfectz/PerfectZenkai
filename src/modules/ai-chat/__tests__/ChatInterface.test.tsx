import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { ChatInterface } from '../components/ChatInterface'
import type { ChatMessage } from '../types/chat.types'

// Mock the AI chat service
const mockSendMessage = vi.fn()
const mockSendMessageStream = vi.fn()

vi.mock('../services/AiChatService', () => ({
  AiChatService: vi.fn().mockImplementation(() => ({
    sendMessage: mockSendMessage,
    sendMessageStream: mockSendMessageStream,
    isInitialized: () => true
  }))
}))

describe('ChatInterface Component', () => {
  const mockMessages: ChatMessage[] = [
    {
      id: '1',
      content: 'Hello, how can I help you today?',
      role: 'assistant',
      timestamp: new Date('2024-01-01T10:00:00Z')
    },
    {
      id: '2', 
      content: 'What exercises should I do today?',
      role: 'user',
      timestamp: new Date('2024-01-01T10:01:00Z')
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render chat interface with message history', () => {
      render(<ChatInterface initialMessages={mockMessages} />)
      
      expect(screen.getByTestId('chat-interface')).toBeInTheDocument()
      expect(screen.getByTestId('message-history')).toBeInTheDocument()
      expect(screen.getByTestId('chat-input')).toBeInTheDocument()
    })

    it('should display all messages in chronological order', () => {
      render(<ChatInterface initialMessages={mockMessages} />)
      
      const messageElements = screen.getAllByTestId(/^message-/)
      expect(messageElements).toHaveLength(2)
      
      expect(screen.getByText('Hello, how can I help you today?')).toBeInTheDocument()
      expect(screen.getByText('What exercises should I do today?')).toBeInTheDocument()
    })

    it('should distinguish between user and assistant messages', () => {
      render(<ChatInterface initialMessages={mockMessages} />)
      
      expect(screen.getByTestId('message-1')).toHaveClass('assistant-message')
      expect(screen.getByTestId('message-2')).toHaveClass('user-message')
    })

    it('should show empty state when no messages', () => {
      render(<ChatInterface initialMessages={[]} />)
      
      expect(screen.getByTestId('empty-chat-state')).toBeInTheDocument()
      expect(screen.getByText(/start a conversation/i)).toBeInTheDocument()
    })
  })

  describe('Message Input', () => {
    it('should allow typing messages', () => {
      render(<ChatInterface />)
      
      const input = screen.getByTestId('message-input')
      fireEvent.change(input, { target: { value: 'Test message' } })
      
      expect(input).toHaveValue('Test message')
    })

    it('should send message when clicking send button', async () => {
      const mockResponse: ChatMessage = {
        id: '3',
        content: 'Here are some great exercises...',
        role: 'assistant',
        timestamp: new Date()
      }
      
      mockSendMessage.mockResolvedValue(mockResponse)
      
      render(<ChatInterface />)
      
      const input = screen.getByTestId('message-input')
      const sendButton = screen.getByTestId('send-button')
      
      fireEvent.change(input, { target: { value: 'What exercises should I do?' } })
      fireEvent.click(sendButton)
      
      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith('What exercises should I do?', null)
      })
    })

    it('should send message when pressing Enter', async () => {
      render(<ChatInterface />)
      
      const input = screen.getByTestId('message-input')
      fireEvent.change(input, { target: { value: 'Test message' } })
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
      
      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalled()
      })
    })

    it('should clear input after sending message', async () => {
      mockSendMessage.mockResolvedValue({} as ChatMessage)
      
      render(<ChatInterface />)
      
      const input = screen.getByTestId('message-input')
      fireEvent.change(input, { target: { value: 'Test message' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      
      await waitFor(() => {
        expect(input).toHaveValue('')
      })
    })

    it('should disable send button when input is empty', () => {
      render(<ChatInterface />)
      
      const sendButton = screen.getByTestId('send-button')
      expect(sendButton).toBeDisabled()
    })

    it('should enable send button when input has content', () => {
      render(<ChatInterface />)
      
      const input = screen.getByTestId('message-input')
      const sendButton = screen.getByTestId('send-button')
      
      fireEvent.change(input, { target: { value: 'Test' } })
      expect(sendButton).not.toBeDisabled()
    })
  })

  describe('Real-time Streaming', () => {
    it('should show typing indicator when receiving streaming response', async () => {
      mockSendMessageStream.mockImplementation((content, context, onChunk) => {
        // Simulate streaming chunks
        setTimeout(() => onChunk({ content: 'Hello', isComplete: false }), 100)
        setTimeout(() => onChunk({ content: 'Hello world', isComplete: true }), 200)
        return Promise.resolve()
      })
      
      render(<ChatInterface enableStreaming={true} />)
      
      const input = screen.getByTestId('message-input')
      fireEvent.change(input, { target: { value: 'Test' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      
      await waitFor(() => {
        expect(screen.getByTestId('typing-indicator')).toBeInTheDocument()
      })
    })

    it('should display streaming text as it arrives', async () => {
      mockSendMessageStream.mockImplementation((content, context, onChunk) => {
        onChunk({ content: 'Hello', isComplete: false })
        onChunk({ content: 'Hello world', isComplete: false })
        onChunk({ content: 'Hello world!', isComplete: true })
        return Promise.resolve()
      })
      
      render(<ChatInterface enableStreaming={true} />)
      
      const input = screen.getByTestId('message-input')
      fireEvent.change(input, { target: { value: 'Test' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      
      await waitFor(() => {
        expect(screen.getByText('Hello world!')).toBeInTheDocument()
      })
    })

    it('should hide typing indicator when streaming completes', async () => {
      mockSendMessageStream.mockImplementation((content, context, onChunk) => {
        setTimeout(() => onChunk({ content: 'Complete response', isComplete: true }), 100)
        return Promise.resolve()
      })
      
      render(<ChatInterface enableStreaming={true} />)
      
      const input = screen.getByTestId('message-input')
      fireEvent.change(input, { target: { value: 'Test' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      
      await waitFor(() => {
        expect(screen.queryByTestId('typing-indicator')).not.toBeInTheDocument()
      })
    })
  })

  describe('Loading States', () => {
    it('should show loading state while sending message', async () => {
      mockSendMessage.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))
      
      render(<ChatInterface />)
      
      const input = screen.getByTestId('message-input')
      fireEvent.change(input, { target: { value: 'Test' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      
      expect(screen.getByTestId('message-loading')).toBeInTheDocument()
    })

    it('should disable input while sending message', async () => {
      mockSendMessage.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))
      
      render(<ChatInterface />)
      
      const input = screen.getByTestId('message-input')
      fireEvent.change(input, { target: { value: 'Test' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      
      expect(input).toBeDisabled()
    })
  })

  describe('Error Handling', () => {
    it('should display error message when send fails', async () => {
      mockSendMessage.mockRejectedValue(new Error('API Error'))
      
      render(<ChatInterface />)
      
      const input = screen.getByTestId('message-input')
      fireEvent.change(input, { target: { value: 'Test' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
        expect(screen.getByText(/failed to send message/i)).toBeInTheDocument()
      })
    })

    it('should allow retrying failed messages', async () => {
      mockSendMessage.mockRejectedValueOnce(new Error('API Error'))
      mockSendMessage.mockResolvedValueOnce({} as ChatMessage)
      
      render(<ChatInterface />)
      
      const input = screen.getByTestId('message-input')
      fireEvent.change(input, { target: { value: 'Test' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      
      await waitFor(() => {
        const retryButton = screen.getByTestId('retry-button')
        expect(retryButton).toBeInTheDocument()
      })
      
      fireEvent.click(screen.getByTestId('retry-button'))
      
      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ChatInterface />)
      
      expect(screen.getByLabelText(/chat interface/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/type your message/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/send message/i)).toBeInTheDocument()
    })

    it('should support keyboard navigation', () => {
      render(<ChatInterface />)
      
      const input = screen.getByTestId('message-input')
      const sendButton = screen.getByTestId('send-button')
      
      input.focus()
      expect(input).toHaveFocus()
      
      fireEvent.keyDown(input, { key: 'Tab' })
      expect(sendButton).toHaveFocus()
    })

    it('should announce new messages to screen readers', async () => {
      render(<ChatInterface />)
      
      const liveRegion = screen.getByTestId('chat-live-region')
      expect(liveRegion).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('Mobile Optimization', () => {
    it('should be touch-friendly on mobile', () => {
      render(<ChatInterface />)
      
      const sendButton = screen.getByTestId('send-button')
      expect(sendButton).toHaveClass('touch-target')
    })

    it('should handle virtual keyboard properly', () => {
      render(<ChatInterface />)
      
      const chatContainer = screen.getByTestId('chat-interface')
      expect(chatContainer).toHaveClass('mobile-keyboard-aware')
    })
  })
}) 