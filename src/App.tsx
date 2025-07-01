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
  
  

  return (
    <AccessibilityProvider>
      {element}
    </AccessibilityProvider>
  )
}

export default App
