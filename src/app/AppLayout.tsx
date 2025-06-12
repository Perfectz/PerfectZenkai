import { CardHeader, CardTitle } from '@/shared/ui/card'
import { Outlet } from 'react-router-dom'
import NavigationBar from './NavigationBar'
import GlobalFab from './GlobalFab'
import splashGif from '@/assets/illustrations/splashimg.gif'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <CardHeader className="border-b">
        <CardTitle>Perfect Zenkai</CardTitle>
      </CardHeader>

      {/* Main Content */}
      <main className="pb-20 pt-4">
        <Outlet />
      </main>

      {/* Navigation Bar */}
      <NavigationBar />

      {/* Global FAB */}
      <GlobalFab />

      {/* Splash Image */}
      <img
        src={splashGif}
        alt="Cyber Ninja Splash"
        className="fixed bottom-20 right-4 w-60 h-auto z-10 pointer-events-none select-none"
      />
    </div>
  )
} 