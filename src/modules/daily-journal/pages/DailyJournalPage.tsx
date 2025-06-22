import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Mic, Zap, Brain, Target } from 'lucide-react'
import { useResponsiveBreakpoint } from '@/shared/hooks/useMobileInteractions'

interface StandupData {
  date: string
  yesterdayAccomplishments: string[]
  yesterdayBlockers: string[]
  yesterdayLessons: string
  todayPriorities: Array<{ text: string; category: string; estimatedTime?: number }>
  energyLevel: number
  mood: string
  availableHours: number
  motivationLevel: number
}

export const DailyJournalPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<'standup' | 'reflection' | 'insights'>('standup')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isRecording, setIsRecording] = useState(false)
  const { isMobile } = useResponsiveBreakpoint()

  // Mock data for demonstration
  const [standupData, setStandupData] = useState<StandupData>({
    date: selectedDate.toISOString().split('T')[0],
    yesterdayAccomplishments: [''],
    yesterdayBlockers: [''],
    yesterdayLessons: '',
    todayPriorities: [{ text: '', category: 'work' }],
    energyLevel: 7,
    mood: '',
    availableHours: 8,
    motivationLevel: 7
  })

  // Load data on mount and date change
  useEffect(() => {
    loadStandupData(selectedDate.toISOString().split('T')[0])
  }, [selectedDate])

  // Listen for AI Chat updates
  useEffect(() => {
    const handleStandupUpdate = (event: CustomEvent) => {
      const { date, data } = event.detail
      if (date === selectedDate.toISOString().split('T')[0]) {
        setStandupData(data)
      }
    }

    window.addEventListener('standupDataUpdated', handleStandupUpdate as EventListener)
    return () => {
      window.removeEventListener('standupDataUpdated', handleStandupUpdate as EventListener)
    }
  }, [selectedDate])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    setSelectedDate(newDate)
    loadStandupData(newDate.toISOString().split('T')[0])
  }

  const loadStandupData = (date: string) => {
    const key = `standup_${date}`
    const saved = localStorage.getItem(key)
    if (saved) {
      const data = JSON.parse(saved)
      setStandupData(data)
    } else {
      // Reset to defaults for new date
      setStandupData({
        date,
        yesterdayAccomplishments: [''],
        yesterdayBlockers: [''],
        yesterdayLessons: '',
        todayPriorities: [{ text: '', category: 'work' }],
        energyLevel: 7,
        mood: '',
        availableHours: 8,
        motivationLevel: 7
      })
    }
  }

  const saveStandupData = () => {
    const key = `standup_${standupData.date}`
    localStorage.setItem(key, JSON.stringify({
      ...standupData,
      updatedAt: new Date().toISOString()
    }))
  }

  const handleVoiceInput = async () => {
    setIsRecording(true)
    try {
      // Check if browser supports speech recognition
      const SpeechRecognition = (window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition
      if (!SpeechRecognition) {
        alert('Speech recognition not supported in this browser. Please use the AI Chat to fill your standup via voice.')
        setIsRecording(false)
        return
      }

      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onresult = (event: unknown) => {
        const eventData = event as { results: { length: number; [key: number]: { [key: number]: { transcript: string } } } }
        const transcript = eventData.results[eventData.results.length - 1][0].transcript
        
        // Show guidance to user about using AI Chat
        alert(`Voice captured: "${transcript}"\n\nFor better results, go to AI Chat and say:\n"Fill my standup form with: ${transcript}"`)
        
        setIsRecording(false)
      }

      recognition.onerror = () => {
        alert('Speech recognition error. Please try the AI Chat for voice input.')
        setIsRecording(false)
      }

      recognition.start()
      
      // Auto-stop after 10 seconds
      setTimeout(() => {
        recognition.stop()
        setIsRecording(false)
      }, 10000)
      
    } catch (error) {
      alert('Voice input error. Please use the AI Chat to fill your standup via voice.')
      setIsRecording(false)
    }
  }

  const addPriority = () => {
    setStandupData(prev => ({
      ...prev,
      todayPriorities: [...prev.todayPriorities, { text: '', category: 'work' }]
    }))
  }

  const updatePriority = (index: number, field: 'text' | 'category', value: string) => {
    setStandupData(prev => ({
      ...prev,
      todayPriorities: prev.todayPriorities.map((priority, i) => 
        i === index ? { ...priority, [field]: value } : priority
      )
    }))
  }

  const NavTab = ({ view, icon: Icon, label, isActive }: { 
    view: typeof currentView, 
    icon: React.ElementType, 
    label: string, 
    isActive: boolean 
  }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-all duration-200 ${
        isActive
          ? 'bg-ki-green text-black border border-ki-green shadow-lg shadow-ki-green/20'
          : 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-ki-green/50 hover:text-ki-green'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className={isMobile ? 'hidden' : 'block'}>{label}</span>
    </button>
  )

  return (
    <div className={`container mx-auto px-4 pb-24 pt-4 mobile-safe-area ${isMobile ? 'mobile-layout' : ''}`}>
      {/* Cyber-styled header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="cyber-title gradient-text-ki mb-2 text-xl sm:text-2xl">DAILY STANDUP PROTOCOL</h1>
        <p className="font-mono text-sm text-gray-400">
          Mission Planning & Reflection Interface
        </p>
      </div>

      {/* Date Navigation */}
      <div className="mb-6 bg-gray-900 rounded-xl border border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:border-ki-green/50 hover:text-ki-green transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-ki-green" />
            <div className="text-center">
              <div className="font-mono text-ki-green text-lg">
                {formatDate(selectedDate)}
              </div>
              <div className="text-xs text-gray-400 font-mono">
                {selectedDate.toISOString().split('T')[0]}
              </div>
            </div>
          </div>
          
          <button
            onClick={() => navigateDate('next')}
            className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:border-ki-green/50 hover:text-ki-green transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        <NavTab view="standup" icon={Target} label="STANDUP" isActive={currentView === 'standup'} />
        <NavTab view="reflection" icon={Brain} label="REFLECTION" isActive={currentView === 'reflection'} />
        <NavTab view="insights" icon={Zap} label="INSIGHTS" isActive={currentView === 'insights'} />
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {currentView === 'standup' && (
          <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
            {/* Header with voice input */}
            <div className="border-b border-gray-700 p-4 bg-gray-800/50">
              <div className="flex items-center justify-between">
                <h2 className="font-mono text-ki-green text-lg">MORNING STANDUP</h2>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-gray-400 font-mono text-right hidden sm:block">
                    💡 Use AI Chat: "Fill my standup form"
                  </div>
                  <button
                    onClick={handleVoiceInput}
                    disabled={isRecording}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-all ${
                      isRecording
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-ki-green text-black hover:bg-ki-green/90'
                    }`}
                  >
                    <Mic className="h-4 w-4" />
                    {isRecording ? 'RECORDING...' : 'VOICE INPUT'}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Yesterday's Review */}
              <div className="space-y-4">
                <h3 className="font-mono text-gray-300 text-sm border-l-2 border-ki-green pl-3">
                  YESTERDAY'S MISSION REPORT
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-mono text-gray-400 mb-2">
                      ACCOMPLISHMENTS
                    </label>
                    <textarea 
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 font-mono text-sm focus:outline-none focus:border-ki-green focus:ring-1 focus:ring-ki-green/50 resize-none"
                      rows={4}
                      placeholder="What objectives were completed..."
                      value={standupData.yesterdayAccomplishments[0] || ''}
                      onChange={(e) => setStandupData(prev => ({
                        ...prev,
                        yesterdayAccomplishments: [e.target.value]
                      }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-mono text-gray-400 mb-2">
                      BLOCKERS & OBSTACLES
                    </label>
                    <textarea 
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 font-mono text-sm focus:outline-none focus:border-ki-green focus:ring-1 focus:ring-ki-green/50 resize-none"
                      rows={4}
                      placeholder="What prevented progress..."
                      value={standupData.yesterdayBlockers[0] || ''}
                      onChange={(e) => setStandupData(prev => ({
                        ...prev,
                        yesterdayBlockers: [e.target.value]
                      }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-mono text-gray-400 mb-2">
                    KEY LEARNINGS
                  </label>
                  <textarea 
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 font-mono text-sm focus:outline-none focus:border-ki-green focus:ring-1 focus:ring-ki-green/50 resize-none"
                    rows={2}
                    placeholder="Insights gained from yesterday's operations..."
                    value={standupData.yesterdayLessons}
                    onChange={(e) => setStandupData(prev => ({
                      ...prev,
                      yesterdayLessons: e.target.value
                    }))}
                  />
                </div>
              </div>

              {/* Today's Status */}
              <div className="space-y-4">
                <h3 className="font-mono text-gray-300 text-sm border-l-2 border-ki-green pl-3">
                  TODAY'S MISSION STATUS
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-mono text-gray-400 mb-2">
                      ENERGY LEVEL: {standupData.energyLevel}/10
                    </label>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={standupData.energyLevel}
                      onChange={(e) => setStandupData(prev => ({
                        ...prev,
                        energyLevel: parseInt(e.target.value)
                      }))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 font-mono mt-1">
                      <span>LOW</span>
                      <span>OPTIMAL</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-mono text-gray-400 mb-2">
                      CURRENT MOOD
                    </label>
                    <select 
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 font-mono text-sm focus:outline-none focus:border-ki-green focus:ring-1 focus:ring-ki-green/50"
                      value={standupData.mood}
                      onChange={(e) => setStandupData(prev => ({
                        ...prev,
                        mood: e.target.value
                      }))}
                    >
                      <option value="">SELECT MOOD</option>
                      <option value="optimistic">😊 OPTIMISTIC</option>
                      <option value="focused">🎯 FOCUSED</option>
                      <option value="energetic">⚡ ENERGETIC</option>
                      <option value="calm">😌 CALM</option>
                      <option value="neutral">😐 NEUTRAL</option>
                      <option value="tired">😴 TIRED</option>
                      <option value="stressed">😰 STRESSED</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-mono text-gray-400 mb-2">
                      AVAILABLE HOURS: {standupData.availableHours}h
                    </label>
                    <input 
                      type="range" 
                      min="1" 
                      max="16" 
                      value={standupData.availableHours}
                      onChange={(e) => setStandupData(prev => ({
                        ...prev,
                        availableHours: parseInt(e.target.value)
                      }))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 font-mono mt-1">
                      <span>1h</span>
                      <span>16h</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Today's Priorities */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-gray-300 text-sm border-l-2 border-ki-green pl-3">
                    TODAY'S PRIORITY OBJECTIVES
                  </h3>
                  <button
                    onClick={addPriority}
                    className="px-3 py-1 bg-ki-green text-black rounded font-mono text-xs hover:bg-ki-green/90 transition-colors"
                  >
                    + ADD
                  </button>
                </div>
                
                <div className="space-y-3">
                  {standupData.todayPriorities.map((priority, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-1">
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 font-mono text-sm focus:outline-none focus:border-ki-green focus:ring-1 focus:ring-ki-green/50"
                          placeholder={`Priority ${index + 1}: Define objective...`}
                          value={priority.text}
                          onChange={(e) => updatePriority(index, 'text', e.target.value)}
                        />
                      </div>
                      <select 
                        className="px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 font-mono text-sm focus:outline-none focus:border-ki-green focus:ring-1 focus:ring-ki-green/50"
                        value={priority.category}
                        onChange={(e) => updatePriority(index, 'category', e.target.value)}
                      >
                        <option value="work">WORK</option>
                        <option value="personal">PERSONAL</option>
                        <option value="health">HEALTH</option>
                        <option value="learning">LEARNING</option>
                        <option value="other">OTHER</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="border-t border-gray-700 p-4 bg-gray-800/50">
              <div className="flex justify-end gap-3">
                <button 
                  onClick={saveStandupData}
                  className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg font-mono text-sm hover:bg-gray-600 transition-colors"
                >
                  SAVE DRAFT
                </button>
                <button 
                  onClick={() => {
                    saveStandupData()
                    alert('🚀 Mission initiated! Your standup has been saved and you\'re ready to tackle the day!')
                  }}
                  className="px-6 py-3 bg-ki-green text-black rounded-lg font-mono text-sm hover:bg-ki-green/90 transition-colors"
                >
                  INITIATE MISSION 🚀
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'reflection' && (
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
            <h2 className="font-mono text-ki-green text-lg mb-6">EVENING REFLECTION</h2>
            <div className="text-center text-gray-400 font-mono">
              Evening reflection interface will be implemented next...
            </div>
          </div>
        )}

        {currentView === 'insights' && (
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
            <h2 className="font-mono text-ki-green text-lg mb-6">AI INSIGHTS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                <h3 className="font-mono text-ki-green text-sm mb-2">
                  📊 PRODUCTIVITY ANALYSIS
                </h3>
                <p className="text-gray-300 text-sm">Score: 7.8/10 (+0.5 vs avg)</p>
                <p className="text-gray-400 text-xs">Goal Progress: 3 objectives advanced</p>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                <h3 className="font-mono text-ki-green text-sm mb-2">
                  🧠 AI RECOMMENDATIONS
                </h3>
                <ul className="text-gray-300 text-xs space-y-1">
                  <li>• Schedule deep work during 10-12 AM</li>
                  <li>• Break large tasks into 25-min chunks</li>
                  <li>• Your focus peaks after morning exercise</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 