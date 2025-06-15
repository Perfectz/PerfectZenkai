import { NavLink } from 'react-router-dom'
import {
  Home,
  BarChart3,
  CheckSquare,
  Target,
  BookOpen,
  PenTool,
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
        flex flex-col items-center justify-center p-2 min-h-[48px] min-w-[48px] rounded-lg transition-all duration-200
        ${isActive 
          ? 'text-green-500 bg-green-500/10 border border-green-500/20' 
          : 'text-gray-500 hover:text-white hover:bg-white/5'
        }
        active:scale-95 touch-manipulation
      `}
    >
      <Icon className="h-5 w-5 mb-1 sm:h-6 sm:w-6" />
      <span className="text-xs font-semibold leading-tight">{label}</span>
    </NavLink>
  )

  return (
    <>
      {/* Top user bar - Mobile optimized */}
      <div className="fixed inset-x-0 top-0 z-50 border-b border-gray-700 bg-gray-900 safe-area-top">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 flex-shrink-0">
              <User className="h-4 w-4 text-black" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-white truncate">
                {user?.name || user?.username || 'User'}
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
            className="text-xs text-gray-400 hover:text-red-400 flex-shrink-0 min-h-[32px] px-2 sm:px-3"
          >
            <LogOut className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      {/* Bottom navigation - Mobile optimized */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-gray-900 border-t border-gray-700 safe-area-bottom">
        <div className="flex h-16 sm:h-18 items-center justify-around px-2 sm:px-4 max-w-md mx-auto sm:max-w-2xl">
          <NavItem to="/" icon={Home} label="Home" />
          <NavItem to="/health" icon={BarChart3} label="Health" />
          <NavItem to="/todo" icon={CheckSquare} label="Todo" />
          <NavItem to="/goals" icon={Target} label="Goals" />
          <NavItem to="/journal" icon={PenTool} label="Journal" />
          <NavItem to="/notes" icon={BookOpen} label="Notes" />
        </div>
      </div>
    </>
  )
}
