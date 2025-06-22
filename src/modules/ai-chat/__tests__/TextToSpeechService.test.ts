import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { TextToSpeechService } from '../services/TextToSpeechService'

// Mock fetch API
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock HTMLAudioElement
class MockAudio {
  onended: (() => void) | null = null
  onerror: (() => void) | null = null
  paused = true
  currentTime = 0
  
  constructor(public src: string) {}
  
  play() {
    this.paused = false
    return Promise.resolve()
  }
  
  pause() {
    this.paused = true
  }
  
  triggerEnd() {
    this.paused = true
    if (this.onended) this.onended()
  }
  
  triggerError() {
    this.paused = true
    if (this.onerror) this.onerror()
  }
}

(global as unknown as { Audio: typeof MockAudio }).Audio = MockAudio

// Mock URL.createObjectURL
const mockCreateObjectURL = vi.fn()
global.URL.createObjectURL = mockCreateObjectURL
global.URL.revokeObjectURL = vi.fn()

// Mock btoa
global.btoa = vi.fn((str) => Buffer.from(str).toString('base64'))

// Speech synthesis mocks are available globally for testing
// Mock functions for potential future use
// const mockSpeak = vi.fn()
// const mockCancel = vi.fn()
// const mockGetVoices = vi.fn().mockReturnValue([
//   { name: 'Test Voice', lang: 'en-US' }
// ])

describe('TextToSpeechService', () => {
  let ttsService: TextToSpeechService
  const mockApiKey = 'test-api-key'
  
  beforeEach(() => {
    vi.clearAllMocks()
    ttsService = new TextToSpeechService({
      apiKey: mockApiKey,
      model: 'tts-1',
      voice: 'alloy',
      speed: 1.0
    })
    mockCreateObjectURL.mockReturnValue('blob:mock-url')
  })

  afterEach(() => {
    ttsService.clearCache()
  })

  describe('Constructor', () => {
    test('should initialize with default config', () => {
      const service = new TextToSpeechService({ apiKey: 'test' })
      const config = service.getConfig()
      
      expect(config.model).toBe('tts-1')
      expect(config.voice).toBe('alloy')
      expect(config.speed).toBe(1.0)
    })

    test('should initialize with custom config', () => {
      const service = new TextToSpeechService({
        apiKey: 'test',
        model: 'tts-1-hd',
        voice: 'nova',
        speed: 1.5
      })
      const config = service.getConfig()
      
      expect(config.model).toBe('tts-1-hd')
      expect(config.voice).toBe('nova')
      expect(config.speed).toBe(1.5)
    })
  })

  describe('textToSpeech', () => {
    test('should successfully generate speech', async () => {
      const mockAudioBuffer = new ArrayBuffer(1024)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockAudioBuffer)
      })

      const result = await ttsService.textToSpeech('Hello world')

      expect(result.success).toBe(true)
      expect(result.audioUrl).toBe('blob:mock-url')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/audio/speech',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mockApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'tts-1',
            input: 'Hello world',
            voice: 'alloy',
            speed: 1.0,
            response_format: 'mp3'
          })
        })
      )
    })

    test('should handle empty text', async () => {
      const result = await ttsService.textToSpeech('')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('No text provided')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    test('should handle missing API key', async () => {
      const service = new TextToSpeechService({ apiKey: '' })
      const result = await service.textToSpeech('Hello')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('OpenAI API key not configured')
    })

    test('should handle text too long', async () => {
      const longText = 'a'.repeat(5000)
      const result = await ttsService.textToSpeech(longText)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Text too long (max 4096 characters)')
    })

    test('should handle API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized')
      })

      const result = await ttsService.textToSpeech('Hello')

      expect(result.success).toBe(false)
      expect(result.error).toContain('TTS API error: 401')
    })

    test('should clean markdown from text', async () => {
      const mockAudioBuffer = new ArrayBuffer(1024)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockAudioBuffer)
      })

      await ttsService.textToSpeech('**Bold** and *italic* and `code`')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"input":"Bold and italic and code"')
        })
      )
    })

    test('should use cache for repeated requests', async () => {
      const mockAudioBuffer = new ArrayBuffer(1024)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockAudioBuffer)
      })

      // First request
      const result1 = await ttsService.textToSpeech('Hello')
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Second request (should use cache)
      const result2 = await ttsService.textToSpeech('Hello')
      expect(mockFetch).toHaveBeenCalledTimes(1) // No additional call
      expect(result2.audioUrl).toBe(result1.audioUrl)
    })
  })

  describe('speak', () => {
    test('should play audio successfully', async () => {
      const mockAudioBuffer = new ArrayBuffer(1024)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockAudioBuffer)
      })

      const speakPromise = ttsService.speak('Hello')
      
      // Simulate audio ending
      setTimeout(() => {
        const audio = ttsService['currentAudio'] as unknown as MockAudio
        if (audio) audio.triggerEnd()
      }, 10)

      const result = await speakPromise
      expect(result.success).toBe(true)
    })

    test('should handle audio playback error', async () => {
      const mockAudioBuffer = new ArrayBuffer(1024)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockAudioBuffer)
      })

      const speakPromise = ttsService.speak('Hello')
      
      // Simulate audio error
      setTimeout(() => {
        const audio = ttsService['currentAudio'] as unknown as MockAudio
        if (audio) audio.triggerError()
      }, 10)

      const result = await speakPromise
      expect(result.success).toBe(false)
      expect(result.error).toBe('Audio playback failed')
    })

    test('should stop current audio before playing new one', async () => {
      const mockAudioBuffer = new ArrayBuffer(1024)
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockAudioBuffer)
      })

      // Start first audio
      const speakPromise1 = ttsService.speak('Hello 1')
      expect(ttsService.isPlaying()).toBe(true)

      // Start second audio (should stop first)
      const speakPromise2 = ttsService.speak('Hello 2')
      
      // Complete both
      setTimeout(() => {
        const audio = ttsService['currentAudio'] as unknown as MockAudio
        if (audio) audio.triggerEnd()
      }, 10)

      await Promise.all([speakPromise1, speakPromise2])
    })
  })

  describe('Playback control', () => {
    test('stop should pause and reset current audio', () => {
      const mockAudio = new MockAudio('test')
      ttsService['currentAudio'] = mockAudio as unknown as HTMLAudioElement
      mockAudio.paused = false

      ttsService.stop()

      expect(mockAudio.paused).toBe(true)
      expect(mockAudio.currentTime).toBe(0)
      expect(ttsService['currentAudio']).toBe(null)
    })

    test('isPlaying should return correct status', () => {
      expect(ttsService.isPlaying()).toBe(false)

      const mockAudio = new MockAudio('test')
      ttsService['currentAudio'] = mockAudio as unknown as HTMLAudioElement
      mockAudio.paused = false

      expect(ttsService.isPlaying()).toBe(true)
    })
  })

  describe('Configuration', () => {
    test('updateConfig should update service settings', () => {
      ttsService.updateConfig({
        model: 'tts-1-hd',
        voice: 'nova',
        speed: 1.5
      })

      const config = ttsService.getConfig()
      expect(config.model).toBe('tts-1-hd')
      expect(config.voice).toBe('nova')
      expect(config.speed).toBe(1.5)
    })

    test('getAvailableVoices should return all voice options', () => {
      const voices = ttsService.getAvailableVoices()
      expect(voices).toEqual(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'])
    })
  })

  describe('Cache management', () => {
    test('clearCache should revoke object URLs and clear cache', () => {
      const mockRevoke = vi.fn()
      global.URL.revokeObjectURL = mockRevoke

      // Add something to cache
      ttsService['audioCache'].set('key1', 'blob:url1')
      ttsService['audioCache'].set('key2', 'blob:url2')

      ttsService.clearCache()

      expect(mockRevoke).toHaveBeenCalledWith('blob:url1')
      expect(mockRevoke).toHaveBeenCalledWith('blob:url2')
      expect(ttsService['audioCache'].size).toBe(0)
    })
  })
}) 