import React, { useState } from 'react'
import { Settings, Eye, Move, Type, Volume2, X } from 'lucide-react'
import { useAccessibilityContext } from './AccessibilityContext'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

interface AccessibilitySettingsProps {
  isOpen: boolean
  onClose: () => void
}

export function AccessibilitySettings({ isOpen, onClose }: AccessibilitySettingsProps) {
  const { preferences, updatePreferences, announce } = useAccessibilityContext()
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)

  if (!isOpen) return null

  const handleToggle = (setting: keyof typeof preferences, label: string) => {
    const newValue = !preferences[setting]
    updatePreferences({ [setting]: newValue })
    announce(`${label} ${newValue ? 'enabled' : 'disabled'}`, 'assertive')
  }

  const settings = [
    {
      key: 'highContrast' as const,
      label: 'High Contrast Mode',
      description: 'Enhances color contrast for better visibility',
      icon: Eye,
      shortcut: 'Alt+Shift+H'
    },
    {
      key: 'reducedMotion' as const,
      label: 'Reduced Motion',
      description: 'Minimizes animations and transitions',
      icon: Move,
      shortcut: 'Alt+Shift+M'
    },
    {
      key: 'largeText' as const,
      label: 'Large Text',
      description: 'Increases text size throughout the app',
      icon: Type,
      shortcut: 'Alt+Shift+T'
    },
    {
      key: 'screenReaderEnabled' as const,
      label: 'Screen Reader Optimizations',
      description: 'Enhanced support for screen readers',
      icon: Volume2,
      shortcut: 'Alt+Shift+S'
    }
  ]

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-settings-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-blue-500" />
              <div>
                <CardTitle id="accessibility-settings-title">
                  Accessibility Settings
                </CardTitle>
                <CardDescription>
                  Customize your accessibility preferences
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close accessibility settings"
              className="touch-target"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Settings List */}
          <div className="space-y-4">
            {settings.map((setting) => {
              const Icon = setting.icon
              const isEnabled = preferences[setting.key]
              
              return (
                <div
                  key={setting.key}
                  className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex-shrink-0 mt-1">
                    <Icon className={`h-5 w-5 ${isEnabled ? 'text-blue-500' : 'text-gray-400'}`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {setting.label}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {setting.description}
                        </p>
                        {showKeyboardShortcuts && (
                          <p className="text-xs text-blue-500 mt-2 font-mono">
                            Shortcut: {setting.shortcut}
                          </p>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleToggle(setting.key, setting.label)}
                        className={`
                          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                          ${isEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}
                        `}
                        role="switch"
                        aria-checked={isEnabled}
                        aria-labelledby={`${setting.key}-label`}
                        aria-describedby={`${setting.key}-description`}
                      >
                        <span className="sr-only">Toggle {setting.label}</span>
                        <span
                          className={`
                            pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                            transition duration-200 ease-in-out
                            ${isEnabled ? 'translate-x-5' : 'translate-x-0'}
                          `}
                        >
                          <span
                            className={`
                              absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-200 ease-in
                              ${isEnabled ? 'opacity-0' : 'opacity-100'}
                            `}
                            aria-hidden="true"
                          >
                            <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                              <path
                                d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                          <span
                            className={`
                              absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-100 ease-out
                              ${isEnabled ? 'opacity-100' : 'opacity-0'}
                            `}
                            aria-hidden="true"
                          >
                            <svg className="h-3 w-3 text-blue-600" fill="currentColor" viewBox="0 0 12 12">
                              <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                            </svg>
                          </span>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Keyboard Shortcuts Toggle */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowKeyboardShortcuts(!showKeyboardShortcuts)
                announce(
                  `Keyboard shortcuts ${!showKeyboardShortcuts ? 'shown' : 'hidden'}`,
                  'polite'
                )
              }}
              className="w-full"
              aria-expanded={showKeyboardShortcuts}
              aria-controls="keyboard-shortcuts"
            >
              {showKeyboardShortcuts ? 'Hide' : 'Show'} Keyboard Shortcuts
            </Button>
            
            {showKeyboardShortcuts && (
              <div 
                id="keyboard-shortcuts" 
                className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                role="region"
                aria-label="Keyboard shortcuts information"
              >
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Global Keyboard Shortcuts
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {settings.map((setting) => (
                    <div key={setting.key} className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        {setting.label}:
                      </span>
                      <span className="font-mono text-blue-600 dark:text-blue-400">
                        {setting.shortcut}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Note: Use Cmd instead of Alt on Mac. These shortcuts work globally throughout the app.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Reset Button */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                updatePreferences({
                  highContrast: false,
                  reducedMotion: false,
                  largeText: false,
                  screenReaderEnabled: false
                })
                announce('All accessibility settings reset to defaults', 'assertive')
              }}
              className="w-full"
            >
              Reset All Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 