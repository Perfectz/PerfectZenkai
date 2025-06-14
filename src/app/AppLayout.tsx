import { Outlet } from 'react-router-dom'
import NavigationBar from './NavigationBar'
import GlobalFab from './GlobalFab'
import OfflineBanner from './components/OfflineBanner'
import InstallSheet from './components/InstallSheet'
import ForceInstallButton from './components/ForceInstallButton'
import { ToastProvider } from '@/shared/ui/toast'
import RouteDebug from '../debug/RouteDebug'

export default function AppLayout() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-background">
        {/* Offline Banner */}
        <OfflineBanner />

        {/* Navigation Bar (includes top user bar and bottom nav) */}
        <NavigationBar />

        {/* Main Content - adjusted for top and bottom bars */}
        <main className="px-4 pb-20 pt-20">
          <Outlet />
        </main>

        {/* Global FAB */}
        <GlobalFab />

        {/* Install Prompt */}
        <InstallSheet />

        {/* Force Install Button - Visible for debugging */}
        <ForceInstallButton />

        {/* Debug Component - Remove in production */}
        {import.meta.env.DEV && <RouteDebug />}
      </div>
    </ToastProvider>
  )
}
