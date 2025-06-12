// src/app/AppShell.tsx
import { CardHeader, CardTitle } from '@/shared/ui/card'
import NavigationBar from './NavigationBar'
import GlobalFab from './GlobalFab'

export default function AppShell() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <CardHeader className="border-b">
        <CardTitle>Perfect Zenkai</CardTitle>
      </CardHeader>

      {/* Main Content */}
      <main className="pb-20 pt-4">
        <div className="container mx-auto px-4">
          <p className="text-muted-foreground">Welcome to Perfect Zenkai</p>
          <p className="text-sm text-muted-foreground mt-2">
            Your weight tracking and task management companion
          </p>
        </div>
      </main>

      {/* Navigation Bar */}
      <NavigationBar />

      {/* Global FAB */}
      <GlobalFab />
    </div>
  )
} 