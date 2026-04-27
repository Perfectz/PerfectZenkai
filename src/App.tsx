import { useRoutes } from 'react-router-dom'
import { appRoutes } from './app/routes'
import { usePerformanceMonitoring } from '@/shared/hooks/usePerformanceMonitoring'
import { AccessibilityProvider } from '@/shared/components/AccessibilityProvider'
import AppLifecycleManager from '@/app/module-system/AppLifecycleManager'

if (import.meta.env.DEV) {
  void import('@/scripts/cleanupDuplicates')
  void import('@/scripts/immediateCleanup')
}

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
      <AppLifecycleManager />
      {element}
    </AccessibilityProvider>
  )
}

export default App
