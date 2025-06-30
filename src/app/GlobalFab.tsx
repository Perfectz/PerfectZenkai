import React, { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/shared/ui/button'
import { Plus, Scale, CheckSquare, UtensilsCrossed, Dumbbell, BookOpen, MessageCircle, Keyboard, Settings, Mic, MicOff } from 'lucide-react'
import { useTouchFeedback } from '@/shared/hooks/useMobileInteractions'
import { AccessibilitySettings } from '@/shared/components/AccessibilitySettings'

interface QuickAction {
  key: string
  label: string
  icon: React.ReactNode
  action: () => void
  shortcut: string
  voiceCommands: string[]
}

// Add Speech Recognition interfaces
interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionAPI {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition?: new() => SpeechRecognitionAPI;
    webkitSpeechRecognition?: new() => SpeechRecognitionAPI;
  }
}

export default function GlobalFab() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showAccessibilitySettings, setShowAccessibilitySettings] = useState(false)
  const [isVoiceListening, setIsVoiceListening] = useState(false)
  const [speechRecognition, setSpeechRecognition] = useState<SpeechRecognitionAPI | null>(null)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const fabFeedback = useTouchFeedback<HTMLButtonElement>({ haptic: true })

  // Universal quick actions available on all pages
  const quickActions: QuickAction[] = useMemo(() => [
    {
      key: 'weight',
      label: 'Log Weight',
      icon: <Scale className="h-4 w-4" />,
      action: () => {
        navigate('/health')
        setTimeout(() => {
          const input = document.getElementById('weight-quick')
          if (input) input.focus()
        }, 100)
      },
      shortcut: 'W',
      voiceCommands: ['log weight', 'add weight', 'weight entry', 'record weight']
    },
    {
      key: 'task',
      label: 'Add Task', 
      icon: <CheckSquare className="h-4 w-4" />,
      action: () => {
        navigate('/todo')
        setTimeout(() => {
          const input = document.getElementById('todo-quick')
          if (input) input.focus()
        }, 100)
      },
      shortcut: 'T',
      voiceCommands: ['add task', 'new task', 'create task', 'task', 'todo']
    },
    {
      key: 'meal',
      label: 'Log Meal',
      icon: <UtensilsCrossed className="h-4 w-4" />,
      action: () => {
        navigate('/health')
        setTimeout(() => {
          const input = document.getElementById('meal-quick')
          if (input) input.focus()
        }, 100)
      },
      shortcut: 'M',
      voiceCommands: ['log meal', 'add meal', 'food entry', 'nutrition', 'eat']
    },
    {
      key: 'workout',
      label: 'Log Workout',
      icon: <Dumbbell className="h-4 w-4" />,
      action: () => {
        navigate('/health')
        setTimeout(() => {
          const input = document.getElementById('workout-quick')
          if (input) input.focus()
        }, 100)
      },
      shortcut: 'X',
      voiceCommands: ['log workout', 'add workout', 'exercise', 'training', 'gym']
    },
    {
      key: 'note',
      label: 'Add Note',
      icon: <BookOpen className="h-4 w-4" />,
      action: () => {
        navigate('/notes')
        setTimeout(() => {
          const input = document.getElementById('note-quick')
          if (input) input.focus()
        }, 100)
      },
      shortcut: 'N',
      voiceCommands: ['add note', 'new note', 'write note', 'note', 'journal']
    },
    {
      key: 'chat',
      label: 'AI Chat',
      icon: <MessageCircle className="h-4 w-4" />,
      action: () => {
        navigate('/chat')
        setTimeout(() => {
          const input = document.getElementById('chat-input')
          if (input) input.focus()
        }, 100)
      },
      shortcut: 'C',
      voiceCommands: ['open chat', 'ai chat', 'chat', 'assistant', 'help']
    }
  ], [navigate])

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'
      setSpeechRecognition(recognition)
    }
  }, [])

  // Voice command processing
  const processVoiceCommand = (transcript: string) => {
    const normalizedTranscript = transcript.toLowerCase().trim()
    
    // Find matching action based on voice commands
    const matchedAction = quickActions.find(action => 
      action.voiceCommands.some(command => 
        normalizedTranscript.includes(command.toLowerCase())
      )
    )

    if (matchedAction) {
      matchedAction.action()
      setIsExpanded(false)
      setVoiceError(null)
      
      // Provide voice feedback (if user has TTS enabled)
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(`${matchedAction.label} activated`)
        utterance.volume = 0.5
        utterance.rate = 1.2
        speechSynthesis.speak(utterance)
      }
    } else {
      setVoiceError(`Command "${transcript}" not recognized. Try saying "add task", "log weight", or "open chat".`)
    }
  }

  // Start voice listening
  const startVoiceListening = () => {
    if (!speechRecognition) {
      setVoiceError('Voice commands not supported in this browser')
      return
    }

    if (isVoiceListening) {
      stopVoiceListening()
      return
    }

    setIsVoiceListening(true)
    setVoiceError(null)

    speechRecognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript
      processVoiceCommand(transcript)
      setIsVoiceListening(false)
    }

    speechRecognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)
      setVoiceError(`Voice error: ${event.error}`)
      setIsVoiceListening(false)
    }

    speechRecognition.onend = () => {
      setIsVoiceListening(false)
    }

    try {
      speechRecognition.start()
    } catch (error) {
      console.error('Failed to start speech recognition:', error)
      setVoiceError('Failed to start voice listening')
      setIsVoiceListening(false)
    }
  }

  // Stop voice listening
  const stopVoiceListening = () => {
    if (speechRecognition && isVoiceListening) {
      speechRecognition.stop()
      setIsVoiceListening(false)
    }
  }

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if no input is focused and Alt/Cmd key is held
      if (document.activeElement?.tagName === 'INPUT' || 
          document.activeElement?.tagName === 'TEXTAREA') {
        return
      }

      // Toggle shortcuts help with Alt/Cmd + K
      if ((e.altKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setShowShortcuts(!showShortcuts)
        return
      }

      // Voice activation with Alt/Cmd + V
      if ((e.altKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault()
        startVoiceListening()
        return
      }

      // Quick actions with Alt/Cmd + letter
      if (e.altKey || e.metaKey) {
        const action = quickActions.find(a => a.shortcut.toLowerCase() === e.key.toLowerCase())
        if (action) {
          e.preventDefault()
          action.action()
          setIsExpanded(false)
        }
      }

      // ESC to close expanded FAB or stop voice
      if (e.key === 'Escape') {
        setIsExpanded(false)
        setShowShortcuts(false)
        stopVoiceListening()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [quickActions, showShortcuts, isVoiceListening])

  // Auto-close expanded FAB when route changes
  useEffect(() => {
    setIsExpanded(false)
    setShowShortcuts(false)
    stopVoiceListening()
  }, [location])

  return (
    <>
      {/* Voice Error Toast */}
      {voiceError && (
        <div className="fixed top-20 right-4 bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <MicOff className="h-4 w-4" />
            <span className="text-sm">{voiceError}</span>
            <button 
              onClick={() => setVoiceError(null)}
              className="ml-2 text-white/80 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Voice Listening Indicator */}
      {isVoiceListening && (
        <div className="fixed top-20 right-4 bg-ki-green/90 text-gray-900 px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            <span className="text-sm font-medium">Listening... Say a command</span>
          </div>
        </div>
      )}

      {/* Keyboard shortcuts overlay */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Keyboard className="h-5 w-5 text-ki-green" />
              Keyboard Shortcuts & Voice Commands
            </h3>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <div key={action.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-300">
                    {action.icon}
                    {action.label}
                  </div>
                  <div className="text-right">
                    <div className="bg-gray-800 px-2 py-1 rounded text-xs font-mono text-ki-green">
                      ⌘/Alt + {action.shortcut}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Voice: "{action.voiceCommands[0]}"
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-gray-700 pt-2 mt-3">
                <span className="text-gray-300">Toggle Shortcuts</span>
                <div className="bg-gray-800 px-2 py-1 rounded text-xs font-mono text-ki-green">
                  ⌘/Alt + K
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Voice Commands</span>
                <div className="bg-gray-800 px-2 py-1 rounded text-xs font-mono text-ki-green">
                  ⌘/Alt + V
                </div>
              </div>
            </div>
            <Button
              onClick={() => setShowShortcuts(false)}
              variant="outline"
              className="w-full mt-4"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Expanded actions menu */}
      {isExpanded && (
        <div className="fixed bottom-32 right-4 space-y-2 z-40">
          {quickActions.map((action, index) => (
            <Button
              key={action.key}
              onClick={() => {
                action.action()
                setIsExpanded(false)
              }}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-gray-900/95 border-gray-700 text-white hover:bg-gray-800 backdrop-blur-sm animate-in slide-in-from-bottom-2"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {action.icon}
              <span className="hidden sm:inline">{action.label}</span>
              <span className="text-xs text-gray-400 ml-auto">⌘{action.shortcut}</span>
            </Button>
          ))}
          
          {/* Voice Commands Button */}
          <Button
            onClick={startVoiceListening}
            variant="ghost"
            size="sm"
            className={`flex items-center gap-2 bg-gray-900/95 border border-gray-700 hover:bg-gray-800 backdrop-blur-sm ${
              isVoiceListening 
                ? 'text-ki-green border-ki-green animate-pulse' 
                : speechRecognition 
                  ? 'text-gray-400' 
                  : 'text-gray-600 opacity-50 cursor-not-allowed'
            }`}
            disabled={!speechRecognition}
            aria-label={isVoiceListening ? "Stop voice listening" : "Start voice commands"}
          >
            {isVoiceListening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isVoiceListening ? 'Listening...' : 'Voice Commands'}
            </span>
          </Button>
          
          <Button
            onClick={() => setShowShortcuts(true)}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 bg-gray-900/95 border border-gray-700 text-gray-400 hover:bg-gray-800 backdrop-blur-sm"
          >
            <Keyboard className="h-4 w-4" />
            <span className="hidden sm:inline">Shortcuts</span>
          </Button>
          <Button
            onClick={() => {
              setShowAccessibilitySettings(true)
              setIsExpanded(false)
            }}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 bg-gray-900/95 border border-gray-700 text-gray-400 hover:bg-gray-800 backdrop-blur-sm"
            aria-label="Open accessibility settings"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Accessibility</span>
          </Button>
        </div>
      )}

      {/* Main FAB button */}
      <Button
        ref={fabFeedback.elementRef}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsExpanded(!isExpanded)
          }
        }}
        className={`
          fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-40
          bg-gradient-to-r from-hyper-magenta to-plasma-cyan 
          hover:from-hyper-magenta/90 hover:to-plasma-cyan/90
          border-0 transition-all duration-200
          ${isExpanded ? 'rotate-45 scale-110' : 'hover:scale-105'}
        `}
        style={{
          boxShadow: '0 6px 20px rgba(255, 46, 234, 0.4)'
        }}
        aria-label={isExpanded ? 'Close quick actions' : 'Open quick actions'}
        data-testid="global-fab"
      >
        <Plus className="h-6 w-6 text-white" />
      </Button>

      {/* Accessibility Settings Modal */}
      <AccessibilitySettings
        isOpen={showAccessibilitySettings}
        onClose={() => setShowAccessibilitySettings(false)}
      />
    </>
  )
}
