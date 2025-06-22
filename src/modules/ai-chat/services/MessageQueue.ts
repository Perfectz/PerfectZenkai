// src/modules/ai-chat/services/MessageQueue.ts

import type { QueuedMessage, ChatMessage } from '../types/chat.types'

export class MessageQueue {
  private queue: QueuedMessage[] = []
  private isProcessing: boolean = false

  constructor() {
    // Initialize message queue
    this.loadQueue()
  }

  public async enqueue(message: QueuedMessage): Promise<void> {
    try {
      this.queue.push(message)
      await this.saveQueue()
    } catch (error) {
      console.error('Error enqueueing message:', error)
      throw error
    }
  }

  public async dequeue(): Promise<QueuedMessage | null> {
    try {
      const message = this.queue.shift()
      if (message) {
        await this.saveQueue()
      }
      return message || null
    } catch (error) {
      console.error('Error dequeuing message:', error)
      return null
    }
  }

  public async getAllQueued(): Promise<QueuedMessage[]> {
    return [...this.queue]
  }

  public async processQueue(
    processor: (message: QueuedMessage) => Promise<ChatMessage>
  ): Promise<ChatMessage[]> {
    if (this.isProcessing) {
      return []
    }

    this.isProcessing = true
    const processedMessages: ChatMessage[] = []

    try {
      while (this.queue.length > 0) {
        const message = this.queue[0]

        try {
          // Attempt to process the message
          const response = await processor(message)
          processedMessages.push(response)
          
          // Remove from queue on success
          this.queue.shift()
          await this.saveQueue()

        } catch (error) {
          console.error(`Error processing message ${message.id}:`, error)
          
          // Increment retry count
          message.retryCount++

          if (message.retryCount >= message.maxRetries) {
            // Give up after max retries
            console.warn(`Message ${message.id} failed after ${message.maxRetries} retries, removing from queue`)
            this.queue.shift()
            await this.saveQueue()
          } else {
            // Keep in queue for retry
            console.log(`Message ${message.id} will be retried (attempt ${message.retryCount + 1}/${message.maxRetries})`)
            break // Stop processing for now, will retry later
          }
        }
      }
    } finally {
      this.isProcessing = false
    }

    return processedMessages
  }

  public async clearQueue(): Promise<void> {
    this.queue = []
    await this.saveQueue()
  }

  public getQueueLength(): number {
    return this.queue.length
  }

  public isQueueEmpty(): boolean {
    return this.queue.length === 0
  }

  private async loadQueue(): Promise<void> {
    try {
      // For minimal implementation, use localStorage
      // In real implementation, this would use IndexedDB
      const stored = localStorage.getItem('ai-chat-queue')
      if (stored) {
        const parsed = JSON.parse(stored)
        this.queue = parsed.map((item: Record<string, unknown>) => ({
          ...item,
          timestamp: new Date(item.timestamp as string)
        }))
      }
    } catch (error) {
      console.error('Error loading queue from storage:', error)
      this.queue = []
    }
  }

  private async saveQueue(): Promise<void> {
    try {
      // For minimal implementation, use localStorage  
      // In real implementation, this would use IndexedDB
      const serializable = this.queue.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      }))
      localStorage.setItem('ai-chat-queue', JSON.stringify(serializable))
    } catch (error) {
      console.error('Error saving queue to storage:', error)
    }
  }

  public async retryMessage(messageId: string): Promise<boolean> {
    const messageIndex = this.queue.findIndex(msg => msg.id === messageId)
    
    if (messageIndex === -1) {
      return false
    }

    // Reset retry count for manual retry
    this.queue[messageIndex].retryCount = 0
    await this.saveQueue()
    
    return true
  }

  public async removeMessage(messageId: string): Promise<boolean> {
    const initialLength = this.queue.length
    this.queue = this.queue.filter(msg => msg.id !== messageId)
    
    if (this.queue.length < initialLength) {
      await this.saveQueue()
      return true
    }
    
    return false
  }

  public getFailedMessages(): QueuedMessage[] {
    return this.queue.filter(msg => msg.retryCount >= msg.maxRetries)
  }

  public getPendingMessages(): QueuedMessage[] {
    return this.queue.filter(msg => msg.retryCount < msg.maxRetries)
  }
} 