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
      <div className="min-h-screen bg-background">
        {/* Offline Status Indicator */}
        <OfflineIndicator />

        {/* Navigation Bar (includes top user bar and bottom nav) */}
        <NavigationBar />

        {/* Main Content - Mobile optimized with proper spacing */}
        <main className="px-4 sm:px-6 pb-20 sm:pb-24 pt-16 sm:pt-20 max-w-7xl mx-auto">
          <div className="min-h-[calc(100vh-10rem)] sm:min-h-[calc(100vh-12rem)]">
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
