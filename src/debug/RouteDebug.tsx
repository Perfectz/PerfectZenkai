import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/shared/ui/button'

export default function RouteDebug() {
  const location = useLocation()
  const navigate = useNavigate()

  const testRoutes = [
    { path: '/', label: 'Dashboard' },
    { path: '/weight', label: 'Weight' },
    { path: '/todo', label: 'Todo' },
    { path: '/notes', label: 'Notes' },
  ]

  return (
    <div className="fixed bottom-20 right-4 z-50 rounded-lg bg-gray-800 p-4 text-white shadow-lg">
      <h3 className="mb-2 text-sm font-bold">Route Debug</h3>
      <p className="mb-2 text-xs">Current: {location.pathname}</p>
      <div className="space-y-1">
        {testRoutes.map((route) => (
          <Button
            key={route.path}
            size="sm"
            variant={location.pathname === route.path ? 'default' : 'outline'}
            onClick={() => navigate(route.path)}
            className="w-full text-xs"
          >
            {route.label}
          </Button>
        ))}
      </div>
    </div>
  )
} 