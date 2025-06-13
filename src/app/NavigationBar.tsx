import { NavLink } from 'react-router-dom'
import { Home, BarChart3, CheckSquare, BookOpen } from 'lucide-react'

export default function NavigationBar() {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-card border-t">
      <div className="flex justify-around items-center h-16">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center text-xs ${isActive ? 'text-primary' : 'text-muted-foreground'}`
          }
        >
          <Home className="h-5 w-5" />
          <span>Home</span>
        </NavLink>
        <NavLink
          to="/weight"
          className={({ isActive }) =>
            `flex flex-col items-center text-xs ${isActive ? 'text-primary' : 'text-muted-foreground'}`
          }
        >
          <BarChart3 className="h-5 w-5" />
          <span>Weight</span>
        </NavLink>
        <NavLink
          to="/todo"
          className={({ isActive }) =>
            `flex flex-col items-center text-xs ${isActive ? 'text-primary' : 'text-muted-foreground'}`
          }
        >
          <CheckSquare className="h-5 w-5" />
          <span>Tasks</span>
        </NavLink>
        <NavLink
          to="/notes"
          className={({ isActive }) =>
            `flex flex-col items-center text-xs ${isActive ? 'text-primary' : 'text-muted-foreground'}`
          }
        >
          <BookOpen className="h-5 w-5" />
          <span>Notes</span>
        </NavLink>
      </div>
    </nav>
  )
} 