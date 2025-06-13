import { NavLink } from 'react-router-dom'
import { Home, BarChart3, CheckSquare, BookOpen, LogOut, User } from 'lucide-react'
import { useAuthStore } from '@/modules/auth'
import { Button } from '@/shared/ui/button'

export default function NavigationBar() {
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out? This will clear all your local data.')) {
      await logout()
    }
  }

  return (
    <>
      {/* Top user bar */}
      <div className="fixed top-0 inset-x-0 bg-card border-b z-50">
        <div className="flex justify-between items-center h-14 px-4">
          <div className="flex items-center space-x-3">
            {user?.picture ? (
              <img 
                src={user.picture} 
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <User className="h-8 w-8 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bottom navigation */}
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
    </>
  )
} 