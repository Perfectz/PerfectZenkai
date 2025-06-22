// src/modules/ai-chat/services/TextToSpeechService.ts

interface TTSConfig {
  apiKey: string
  model?: 'tts-1' | 'tts-1-hd'
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
  speed?: number
}

interface TTSResult {
  success: boolean
  audioUrl?: string
  error?: string
  audioBuffer?: ArrayBuffer
}

export class TextToSpeechService {
  private apiKey: string
  private model: string
  private voice: string
  private speed: number
  private audioCache = new Map<string, string>()
  private currentAudio: HTMLAudioElement | null = null

  constructor(config: TTSConfig) {
    this.apiKey = config.apiKey
    this.model = config.model || 'tts-1'
    this.voice = config.voice || 'alloy'
    this.speed = config.speed || 1.0
  }

  /**
   * Convert text to speech using OpenAI's TTS API
   */
  async textToSpeech(text: string): Promise<TTSResult> {
    try {
      // Check cache first
      const cacheKey = this.getCacheKey(text)
      if (this.audioCache.has(cacheKey)) {
        return {
          success: true,
          audioUrl: this.audioCache.get(cacheKey)!
        }
      }

      // Validate inputs
      if (!text.trim()) {
        return { success: false, error: 'No text provided' }
      }

      if (!this.apiKey) {
        return { success: false, error: 'OpenAI API key not configured' }
      }

      // Clean text for TTS (remove markdown, excessive whitespace)
      const cleanText = this.cleanTextForTTS(text)
      
      if (cleanText.length > 4096) {
        return { success: false, error: 'Text too long (max 4096 characters)' }
      }

      // Make API request
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          input: cleanText,
          voice: this.voice,
          speed: this.speed,
          response_format: 'mp3'
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`TTS API error: ${response.status} - ${errorText}`)
      }

      // Convert response to audio blob
      const audioBuffer = await response.arrayBuffer()
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)

      // Cache the result
      this.audioCache.set(cacheKey, audioUrl)

      return {
        success: true,
        audioUrl,
        audioBuffer
      }
    } catch (error) {
      console.error('TTS error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'TTS generation failed'
      }
    }
  }

  /**
   * Play audio from text
   */
  async speak(text: string): Promise<TTSResult> {
    try {
      // Stop any currently playing audio
      this.stop()

      const result = await this.textToSpeech(text)
      
      if (!result.success || !result.audioUrl) {
        return result
      }

      // Play the audio
      const audio = new Audio(result.audioUrl)
      this.currentAudio = audio

      // Return promise that resolves when audio finishes
      return new Promise((resolve) => {
        audio.onended = () => {
          this.currentAudio = null
          resolve(result)
        }

        audio.onerror = () => {
          this.currentAudio = null
          resolve({
            success: false,
            error: 'Audio playback failed'
          })
        }

        audio.play().catch((error) => {
          this.currentAudio = null
          resolve({
            success: false,
            error: `Playback error: ${error.message}`
          })
        })
      })
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Speech playback failed'
      }
    }
  }

  /**
   * Stop current audio playback
   */
  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio.currentTime = 0
      this.currentAudio = null
    }
  }

  /**
   * Check if audio is currently playing
   */
  isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused
  }

  /**
   * Clean text for optimal TTS output
   */
  private cleanTextForTTS(text: string): string {
    return text
      // Remove markdown formatting
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      .trim()
      // Remove special characters that might cause issues
      .replace(/[^\w\s.,!?;:()\-'"]/g, '')
  }

  /**
   * Generate cache key for text
   */
  private getCacheKey(text: string): string {
    const cleanText = this.cleanTextForTTS(text)
    return `${this.model}-${this.voice}-${this.speed}-${btoa(cleanText).substring(0, 32)}`
  }

  /**
   * Clear audio cache to free memory
   */
  clearCache(): void {
    // Revoke object URLs to prevent memory leaks
    this.audioCache.forEach(url => {
      URL.revokeObjectURL(url)
    })
    this.audioCache.clear()
  }

  /**
   * Update TTS configuration
   */
  updateConfig(config: Partial<TTSConfig>): void {
    if (config.model) this.model = config.model
    if (config.voice) this.voice = config.voice
    if (config.speed !== undefined) this.speed = config.speed
    if (config.apiKey) this.apiKey = config.apiKey
  }

  /**
   * Get available voices
   */
  getAvailableVoices(): string[] {
    return ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']
  }

  /**
   * Get current configuration
   */
  getConfig(): TTSConfig {
    return {
      apiKey: this.apiKey,
      model: this.model as 'tts-1' | 'tts-1-hd',
      voice: this.voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
      speed: this.speed
    }
  }


}

// Export singleton instance
export const ttsService = new TextToSpeechService({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  model: 'tts-1',
  voice: 'alloy',
  speed: 1.0
}) 