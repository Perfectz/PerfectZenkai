import { Button } from '@/shared/ui/button'
import { Plus } from 'lucide-react'

export default function GlobalFab() {
  return (
    <Button
      size="icon"
      className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-primary opacity-60 shadow-lg"
      onClick={() => {
        // FAB actions will be added in later MVPs
        console.log('FAB clicked')
      }}
    >
      <Plus className="h-6 w-6" />
    </Button>
  )
} 