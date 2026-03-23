import { Outlet } from 'react-router-dom'
import NavigationBar from './NavigationBar'
import GlobalFab from './GlobalFab'
import { OfflineIndicator } from '@/shared/components/OfflineIndicator'
import InstallSheet from './components/InstallSheet'
import ForceInstallButton from './components/ForceInstallButton'
import { ToastProvider } from '@/shared/ui/toast'
import AuthDebugger from '@/modules/auth/components/AuthDebugger'
// import UpdateBanner from './components/UpdateBanner' // Temporarily disabled to fix infinite loop

export default function AppLayout() {
  return (
    <ToastProvider>
      <div className="app-shell bg-background">
        {/* Offline Status Indicator */}
        <OfflineIndicator />

        {/* Navigation Bar (includes top user bar and bottom nav) */}
        <NavigationBar />

        {/* Main Content - Shared shell spacing for desktop and phone */}
        <main className="app-main">
          <div className="app-page min-h-[calc(100dvh-var(--app-top-bar-height)-var(--app-bottom-nav-height)-1.5rem)]">
            <Outlet />
          </div>
        </main>

        {/* Global FAB - Mobile optimized positioning */}
        <GlobalFab />

        {/* Install Prompt */}
        <InstallSheet />

        {/* Update Banner - Temporarily disabled */}
        {/* <UpdateBanner /> */}

        {/* Debug Components - Only in development */}
        {import.meta.env.DEV && (
          <>
            <ForceInstallButton />
            <AuthDebugger />
          </>
        )}
      </div>
    </ToastProvider>
  )
}
