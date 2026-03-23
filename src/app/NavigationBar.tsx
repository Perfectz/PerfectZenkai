import type { ElementType } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LogOut,
  User,
  Shield,
} from 'lucide-react'
import { useAuthStore } from '@/modules/auth'
import { Button } from '@/shared/ui/button'
import { getPrimaryNavigation } from './module-system/registry'

export default function NavigationBar() {
  const { user, logout } = useAuthStore()
  const isAdmin = user?.role === 'admin'
  const primaryNavItems = getPrimaryNavigation(user?.role)

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
    icon: ElementType
    label: string
  }) => (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex min-h-[52px] min-w-[56px] flex-1 items-center justify-center gap-1 rounded-xl px-2 py-2 text-center transition-all duration-200 sm:min-w-[92px] sm:flex-none sm:flex-row sm:gap-2 sm:px-3
        ${isActive 
          ? 'border border-green-500/30 bg-green-500/10 text-green-300 shadow-[0_0_0_1px_rgba(34,255,183,0.08)]' 
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
        }
        active:scale-95 touch-manipulation
      `}
    >
      <Icon className="h-5 w-5 shrink-0 sm:h-[18px] sm:w-[18px]" />
      <span className="text-[11px] font-semibold leading-tight sm:text-sm">{label}</span>
    </NavLink>
  )

  return (
    <>
      {/* Top user bar */}
      <div className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/88 backdrop-blur-xl safe-area-top">
        <div className="mx-auto flex h-[var(--app-top-bar-height)] max-w-[92rem] items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-cyan-400 shadow-[0_8px_24px_rgba(27,231,255,0.18)]">
              <User className="h-4 w-4 text-black" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-white sm:text-base">
                {user?.name || user?.username || 'User'}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="hidden sm:inline">Local-first session</span>
                <span className="sm:hidden">Online</span>
                {isAdmin && (
                  <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {isAdmin && (
              <NavLink to="/admin">
                <Button
                  variant="ghost"
                  size="sm"
                  className="min-h-[38px] rounded-xl border border-amber-400/20 bg-amber-400/10 px-2 text-xs text-amber-300 hover:text-amber-200 sm:px-3"
                >
                  <Shield className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              </NavLink>
            )}

            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="min-h-[38px] rounded-xl border border-white/10 px-2 text-xs text-slate-300 hover:text-red-300 sm:px-3"
            >
              <LogOut className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 pt-2 sm:bottom-4 sm:px-6 sm:pb-0 safe-area-bottom">
        <div className="mx-auto flex h-[var(--app-bottom-nav-height)] max-w-2xl items-center justify-between gap-1 rounded-[1.4rem] border border-white/10 bg-slate-950/88 px-2 shadow-[0_18px_50px_rgba(2,8,23,0.5)] backdrop-blur-xl sm:h-auto sm:gap-2 sm:px-3 sm:py-2">
          {primaryNavItems.map((item) => (
            <NavItem key={item.id} to={item.to} icon={item.icon} label={item.label} />
          ))}
        </div>
      </div>
    </>
  )
}
