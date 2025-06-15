import { Outlet } from 'react-router-dom'
import NavigationBar from './NavigationBar'
import GlobalFab from './GlobalFab'
import OfflineBanner from './components/OfflineBanner'
import InstallSheet from './components/InstallSheet'
import ForceInstallButton from './components/ForceInstallButton'
import { ToastProvider } from '@/shared/ui/toast'
import AuthDebugger from '@/modules/auth/components/AuthDebugger'

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

        {/* Auth Debugger - Temporary for debugging auth issues */}
        <AuthDebugger />
      </div>
    </ToastProvider>
  )
}
