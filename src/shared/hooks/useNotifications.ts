import { useState, useEffect } from 'react'

interface NotificationHook {
  permission: NotificationPermission
  isSupported: boolean
  requestPermission: () => Promise<NotificationPermission>
  scheduleDailyReminder: () => void
  clearDailyReminder: () => void
}

const REMINDER_TIMEOUT_KEY = 'perfect-zenkai-reminder-timeout'

export function useNotifications(): NotificationHook {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported] = useState(() => 'Notification' in window)

  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission)
    }
  }, [isSupported])

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      return 'denied'
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return 'denied'
    }
  }

  const getTimeUntilNext9AM = (): number => {
    const now = new Date()
    const next9AM = new Date()
    
    // Set to 9 AM today
    next9AM.setHours(9, 0, 0, 0)
    
    // If it's already past 9 AM today, set to 9 AM tomorrow
    if (now >= next9AM) {
      next9AM.setDate(next9AM.getDate() + 1)
    }
    
    return next9AM.getTime() - now.getTime()
  }

  const checkIfWeightLoggedToday = (): boolean => {
    // This would typically check the weight store
    // For now, we'll implement a simple check
    const today = new Date().toISOString().split('T')[0]
    
    // Check if there's a weight entry for today in localStorage
    // This is a simplified implementation - in a real app you'd check the actual store
    const hasWeightToday = localStorage.getItem(`weight-logged-${today}`)
    return hasWeightToday === 'true'
  }

  const sendDailyReminder = () => {
    if (permission !== 'granted') {
      return
    }

    // Don't send if weight already logged today
    if (checkIfWeightLoggedToday()) {
      return
    }

    // Skip weekends (optional feature mentioned in requirements)
    const today = new Date().getDay()
    if (today === 0 || today === 6) { // Sunday = 0, Saturday = 6
      return
    }

    const notification = new Notification('Time to weigh in', {
      body: 'Track your weight to stay on top of your health goals',
      icon: '/icons/logo192.png',
      tag: 'daily-weight-reminder',
      requireInteraction: false,
      data: {
        url: '/weight'
      }
    })

    notification.onclick = (event) => {
      event.preventDefault()
      window.focus()
      // Navigate to weight page
      window.location.href = '/weight'
      notification.close()
    }

    // Auto-close after 10 seconds
    setTimeout(() => {
      notification.close()
    }, 10000)
  }

  const scheduleDailyReminder = () => {
    if (permission !== 'granted') {
      return
    }

    // Clear any existing timeout
    clearDailyReminder()

    const timeUntil9AM = getTimeUntilNext9AM()
    
    const timeoutId = setTimeout(() => {
      sendDailyReminder()
      // Schedule the next reminder (24 hours later)
      scheduleDailyReminder()
    }, timeUntil9AM)

    // Store the timeout ID so we can clear it later
    localStorage.setItem(REMINDER_TIMEOUT_KEY, timeoutId.toString())
  }

  const clearDailyReminder = () => {
    const timeoutId = localStorage.getItem(REMINDER_TIMEOUT_KEY)
    if (timeoutId) {
      clearTimeout(parseInt(timeoutId))
      localStorage.removeItem(REMINDER_TIMEOUT_KEY)
    }
  }

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      clearDailyReminder()
    }
  }, [])

  return {
    permission,
    isSupported,
    requestPermission,
    scheduleDailyReminder,
    clearDailyReminder
  }
} 