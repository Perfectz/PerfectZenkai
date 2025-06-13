import { NavLink } from 'react-router-dom'
import {
  Home,
  BarChart3,
  CheckSquare,
  BookOpen,
  LogOut,
  User,
} from 'lucide-react'
import { useAuthStore } from '@/modules/auth'
import { Button } from '@/shared/ui/button'
import { useState } from 'react'

export default function NavigationBar() {
  const { user, logout } = useAuthStore()
  const [pressedItem, setPressedItem] = useState<string | null>(null)

  const handleLogout = async () => {
    if (
      confirm(
        'Are you sure you want to log out? This will clear all your local data.'
      )
    ) {
      await logout()
    }
  }

  const handleTouchStart = (path: string) => {
    setPressedItem(path)
  }

  const handleTouchEnd = () => {
    setPressedItem(null)
  }

  const NavItem = ({
    to,
    icon: Icon,
    label,
    path,
  }: {
    to: string
    icon: React.ElementType
    label: string
    path: string
  }) => (
    <NavLink
      to={to}
      className={({ isActive }) => `
        cyber-nav-item relative
        ${isActive ? 'active text-ki-green' : 'text-gray-500'}
        ${pressedItem === path ? 'scale-90 bg-white/10' : ''}
        transition-all duration-150 ease-out
        hover:scale-105
        active:scale-95
      `}
      onTouchStart={() => handleTouchStart(path)}
      onTouchEnd={handleTouchEnd}
      onMouseDown={() => handleTouchStart(path)}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      {({ isActive }) => (
        <>
          <Icon
            className={`
              cyber-icon h-5 w-5 transition-all duration-200
              ${isActive ? 'glow-ki scale-110' : ''}
              ${pressedItem === path ? 'scale-90' : ''}
            `}
          />
          <span
            className={`
            font-inter text-xs font-semibold tracking-wide
            ${isActive ? 'text-shadow-ki' : ''}
            transition-all duration-200
          `}
          >
            {label}
          </span>

          {/* Active indicator */}
          {isActive && (
            <div className="bg-ki-green ki-glow absolute -top-1 left-1/2 h-1 w-1 -translate-x-1/2 transform animate-pulse rounded-full"></div>
          )}

          {/* Ripple effect */}
          {pressedItem === path && (
            <div className="bg-ki-green/20 absolute inset-0 animate-ping rounded-lg"></div>
          )}
        </>
      )}
    </NavLink>
  )

  return (
    <>
      {/* Top user bar with cyber styling */}
      <div className="fixed inset-x-0 top-0 z-50 border-b border-gray-700 bg-gray-900 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="from-ki-green to-plasma-cyan ki-glow-soft flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br">
              <User className="text-dark-navy h-4 w-4" />
            </div>
            <div>
              <div className="font-inter text-sm font-semibold text-white">
                {user?.name || 'Cyber Warrior'}
              </div>
              <div className="font-mono text-xs text-gray-400">
                Training Mode
              </div>
            </div>
          </div>

          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="
              font-mono text-xs 
              text-gray-400 
              transition-all duration-200
              hover:scale-105 hover:bg-red-400/10
              hover:text-red-400
              active:scale-95
            "
          >
            <LogOut className="mr-1 h-4 w-4" />
            Exit
          </Button>
        </div>
      </div>

      {/* Bottom navigation with enhanced micro-interactions */}
      <div className="cyber-nav fixed inset-x-0 bottom-0 z-40">
        <div className="h-18 flex items-center justify-around px-2">
          <NavItem to="/" icon={Home} label="HQ" path="/" />
          <NavItem
            to="/weight"
            icon={BarChart3}
            label="Weight"
            path="/weight"
          />
          <NavItem to="/todo" icon={CheckSquare} label="Quests" path="/todo" />
          <NavItem to="/notes" icon={BookOpen} label="Intel" path="/notes" />
        </div>

        {/* Cyber grid effect */}
        <div className="via-ki-green/20 absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent to-transparent"></div>
      </div>
    </>
  )
}
