import { NavLink } from 'react-router-dom'
import { Home, BarChart3, CheckSquare, BookOpen, LogOut, User } from 'lucide-react'
import { useAuthStore } from '@/modules/auth'
import { Button } from '@/shared/ui/button'
import { useState } from 'react'

export default function NavigationBar() {
  const { user, logout } = useAuthStore()
  const [pressedItem, setPressedItem] = useState<string | null>(null)

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out? This will clear all your local data.')) {
      await logout()
    }
  }

  const handleTouchStart = (path: string) => {
    setPressedItem(path)
  }

  const handleTouchEnd = () => {
    setPressedItem(null)
  }

  const NavItem = ({ to, icon: Icon, label, path }: { 
    to: string, 
    icon: React.ElementType, 
    label: string,
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
              h-5 w-5 cyber-icon transition-all duration-200
              ${isActive ? 'glow-ki scale-110' : ''}
              ${pressedItem === path ? 'scale-90' : ''}
            `} 
          />
          <span className={`
            text-xs font-semibold font-inter tracking-wide
            ${isActive ? 'text-shadow-ki' : ''}
            transition-all duration-200
          `}>
            {label}
          </span>
          
          {/* Active indicator */}
          {isActive && (
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-ki-green rounded-full ki-glow animate-pulse"></div>
          )}
          
          {/* Ripple effect */}
          {pressedItem === path && (
            <div className="absolute inset-0 bg-ki-green/20 rounded-lg animate-ping"></div>
          )}
        </>
      )}
    </NavLink>
  )

  return (
    <>
      {/* Top user bar with cyber styling */}
      <div className="fixed top-0 inset-x-0 bg-gray-900 border-b border-gray-700 z-50 backdrop-blur-md">
        <div className="flex justify-between items-center h-14 px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ki-green to-plasma-cyan flex items-center justify-center ki-glow-soft">
              <User className="h-4 w-4 text-dark-navy" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white font-inter">
                {user?.name || 'Cyber Warrior'}
              </div>
              <div className="text-xs text-gray-400 font-mono">
                Training Mode
              </div>
            </div>
          </div>
          
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="
              text-gray-400 hover:text-red-400 
              hover:bg-red-400/10 
              transition-all duration-200
              font-mono text-xs
              hover:scale-105
              active:scale-95
            "
          >
            <LogOut className="h-4 w-4 mr-1" />
            Exit
          </Button>
        </div>
      </div>

      {/* Bottom navigation with enhanced micro-interactions */}
      <div className="fixed bottom-0 inset-x-0 cyber-nav z-40">
        <div className="flex justify-around items-center h-18 px-2">
          <NavItem to="/" icon={Home} label="HQ" path="/" />
          <NavItem to="/weight" icon={BarChart3} label="Weight" path="/weight" />
          <NavItem to="/todo" icon={CheckSquare} label="Quests" path="/todo" />
          <NavItem to="/notes" icon={BookOpen} label="Intel" path="/notes" />
        </div>
        
        {/* Cyber grid effect */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ki-green/20 to-transparent"></div>
      </div>
    </>
  )
} 