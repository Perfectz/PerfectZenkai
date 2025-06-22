import React, { useState, useEffect } from 'react'
import { Settings, Volume2, Check } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { ttsService } from '../services/TextToSpeechService'

interface TTSSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export function TTSSettings({ isOpen, onClose }: TTSSettingsProps) {
  const [config, setConfig] = useState(ttsService.getConfig())
  const [testText] = useState("Hello! This is a test of the text-to-speech feature.")
  const [isTesting, setIsTesting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setConfig(ttsService.getConfig())
    }
  }, [isOpen])

  const handleVoiceChange = (voice: string) => {
    const newConfig = { ...config, voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' }
    setConfig(newConfig)
    ttsService.updateConfig(newConfig)
  }

  const handleSpeedChange = (speed: number) => {
    const newConfig = { ...config, speed }
    setConfig(newConfig)
    ttsService.updateConfig(newConfig)
  }

  const handleModelChange = (model: 'tts-1' | 'tts-1-hd') => {
    const newConfig = { ...config, model }
    setConfig(newConfig)
    ttsService.updateConfig(newConfig)
  }

  const handleTestVoice = async () => {
    setIsTesting(true)
    try {
      await ttsService.speak(testText)
    } catch (error) {
      console.error('TTS test error:', error)
    } finally {
      setIsTesting(false)
    }
  }

  if (!isOpen) return null

  const voices = ttsService.getAvailableVoices()
  const voiceDescriptions: Record<string, string> = {
    alloy: 'Neutral, balanced voice',
    echo: 'Male, calm and steady',
    fable: 'British accent, warm',
    onyx: 'Deep, authoritative',
    nova: 'Female, friendly',
    shimmer: 'Soft, gentle female'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Text-to-Speech Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Voice Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Voice
            </label>
            <div className="grid grid-cols-1 gap-2">
              {voices.map((voice) => (
                <button
                  key={voice}
                  onClick={() => handleVoiceChange(voice)}
                  className={`
                    flex items-center justify-between p-3 rounded-lg border text-left transition-colors
                    ${config.voice === voice 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }
                  `}
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white capitalize">
                      {voice}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {voiceDescriptions[voice]}
                    </div>
                  </div>
                  {config.voice === voice && (
                    <Check className="w-4 h-4 text-blue-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Speed Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Speed: {config.speed}x
            </label>
            <input
              type="range"
              min="0.25"
              max="4.0"
              step="0.25"
              value={config.speed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0.25x</span>
              <span>1x (Normal)</span>
              <span>4x</span>
            </div>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Quality
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleModelChange('tts-1')}
                className={`
                  p-3 rounded-lg border text-center transition-colors
                  ${config.model === 'tts-1' 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }
                `}
              >
                <div className="font-medium text-gray-900 dark:text-white">Standard</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Faster, lower cost</div>
              </button>
              <button
                onClick={() => handleModelChange('tts-1-hd')}
                className={`
                  p-3 rounded-lg border text-center transition-colors
                  ${config.model === 'tts-1-hd' 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }
                `}
              >
                <div className="font-medium text-gray-900 dark:text-white">HD</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Higher quality</div>
              </button>
            </div>
          </div>

          {/* Test Voice */}
          <div>
            <Button
              onClick={handleTestVoice}
              disabled={isTesting}
              className="w-full"
              variant="outline"
            >
              {isTesting ? (
                <>
                  <Settings className="w-4 h-4 mr-2 animate-spin" />
                  Testing Voice...
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 mr-2" />
                  Test Current Voice
                </>
              )}
            </Button>
          </div>

          {/* API Key Status */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${config.apiKey ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                OpenAI API Key: {config.apiKey ? 'Configured' : 'Missing'}
              </span>
            </div>
            {!config.apiKey && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Add VITE_OPENAI_API_KEY to your environment variables
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={onClose} variant="outline">
            Done
          </Button>
        </div>
      </div>
    </div>
  )
} 