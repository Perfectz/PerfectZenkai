import { NavLink } from 'react-router-dom'
import {
  Home,
  BarChart3,
  CheckSquare,
  Target,
  BookOpen,
  LogOut,
  User,
} from 'lucide-react'
import { useAuthStore } from '@/modules/auth'
import { Button } from '@/shared/ui/button'

export default function NavigationBar() {
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    if (
      confirm(
        'Are you sure you want to log out? This will clear all your local data.'
      )
    ) {
      await logout()
    }
  }

  const NavItem = ({
    to,
    icon: Icon,
    label,
  }: {
    to: string
    icon: React.ElementType
    label: string
  }) => (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex flex-col items-center p-2 rounded-lg transition-colors
        ${isActive ? 'text-green-500' : 'text-gray-500'}
        hover:text-white hover:bg-white/10
      `}
    >
      <Icon className="h-5 w-5 mb-1" />
      <span className="text-xs font-semibold">{label}</span>
    </NavLink>
  )

  return (
    <>
      {/* Top user bar */}
      <div className="fixed inset-x-0 top-0 z-50 border-b border-gray-700 bg-gray-900">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
              <User className="h-4 w-4 text-black" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                {user?.name || 'User'}
              </div>
              <div className="text-xs text-gray-400">
                Online
              </div>
            </div>
          </div>

          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-xs text-gray-400 hover:text-red-400"
          >
            <LogOut className="mr-1 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-gray-900 border-t border-gray-700">
        <div className="flex h-16 items-center justify-around px-2">
          <NavItem to="/" icon={Home} label="Home" />
          <NavItem to="/weight" icon={BarChart3} label="Weight" />
          <NavItem to="/todo" icon={CheckSquare} label="Todo" />
          <NavItem to="/goals" icon={Target} label="Goals" />
          <NavItem to="/notes" icon={BookOpen} label="Notes" />
        </div>
      </div>
    </>
  )
}
