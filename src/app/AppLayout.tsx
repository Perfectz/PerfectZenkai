import { CardHeader, CardTitle } from '@/shared/ui/card'
import { Outlet, useNavigate } from 'react-router-dom'
import NavigationBar from './NavigationBar'
import GlobalFab from './GlobalFab'
import OfflineBanner from './components/OfflineBanner'
import InstallSheet from './components/InstallSheet'

export default function AppLayout() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      {/* Offline Banner */}
      <OfflineBanner />
      
      {/* Header */}
      <CardHeader className="border-b">
        <CardTitle 
          className="cursor-pointer hover:text-primary transition-colors flex items-center gap-2"
          onClick={() => navigate('/')}
        >
          <img 
            src="/icons/perfect_zenkai_favicon.svg" 
            alt="Perfect Zenkai Logo" 
            className="h-6 w-6"
          />
          Perfect Zenkai
        </CardTitle>
      </CardHeader>

      {/* Main Content */}
      <main className="pb-20 pt-4">
        <Outlet />
      </main>

      {/* Navigation Bar */}
      <NavigationBar />

      {/* Global FAB */}
      <GlobalFab />

      {/* Install Prompt */}
      <InstallSheet />
    </div>
  )
} 