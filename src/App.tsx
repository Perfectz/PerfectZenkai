import { useRoutes } from 'react-router-dom'
import { appRoutes } from './app/routes'
import { usePerformanceMonitoring } from '@/shared/hooks/usePerformanceMonitoring'
import { AccessibilityProvider } from '@/shared/components/AccessibilityProvider'
import '@/scripts/cleanupDuplicates'
import { runDuplicateCleanup } from './scripts/cleanupDuplicates'
import { runImmediateCleanup, runCompleteReset, runSmartCleanup } from './scripts/immediateCleanup'

function App() {
  // Initialize performance monitoring
  usePerformanceMonitoring({
    enabled: true,
    debug: import.meta.env.DEV,
    sampleRate: 1.0
  })

  const element = useRoutes(appRoutes)
  
  // Add global cleanup functions for duplicate tasks
  if (typeof window !== 'undefined') {
    // Define the window extensions
    const windowExtended = window as typeof window & {
      cleanupDuplicates: typeof runDuplicateCleanup
      runImmediateCleanup: typeof runImmediateCleanup
      runCompleteReset: typeof runCompleteReset
      runSmartCleanup: typeof runSmartCleanup
    }
    
    // Assign all the cleanup functions
    windowExtended.cleanupDuplicates = runDuplicateCleanup
    windowExtended.runImmediateCleanup = runImmediateCleanup
    windowExtended.runCompleteReset = runCompleteReset
    windowExtended.runSmartCleanup = runSmartCleanup
  }

  return (
    <AccessibilityProvider>
      {element}
    </AccessibilityProvider>
  )
}

export default App
