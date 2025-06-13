import { Outlet } from 'react-router-dom'
import NavigationBar from './NavigationBar'
import GlobalFab from './GlobalFab'
import OfflineBanner from './components/OfflineBanner'
import InstallSheet from './components/InstallSheet'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Offline Banner */}
      <OfflineBanner />
      
      {/* Navigation Bar (includes top user bar and bottom nav) */}
      <NavigationBar />

      {/* Main Content - adjusted for top and bottom bars */}
      <main className="pt-20 pb-20 px-4">
        <Outlet />
      </main>

      {/* Global FAB */}
      <GlobalFab />

      {/* Install Prompt */}
      <InstallSheet />
    </div>
  )
} 