import { NavLink } from 'react-router-dom'
import { BarChart3 } from 'lucide-react'

export default function NavigationBar() {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-card border-t">
      <div className="flex justify-around items-center h-16">
        <NavLink
          to="/weight"
          className={({ isActive }) =>
            `flex flex-col items-center text-xs ${isActive ? 'text-primary' : 'text-muted-foreground'}`
          }
        >
          <BarChart3 className="h-5 w-5" />
          <span>Weight</span>
        </NavLink>
      </div>
    </nav>
  )
} 