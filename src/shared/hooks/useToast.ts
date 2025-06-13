import * as React from "react"

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

// Toast context
export const ToastContext = React.createContext<{
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
} | null>(null)

// Hook to use toast
export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  
  return {
    toast: (toast: Omit<Toast, 'id'>) => context.addToast(toast),
    success: (title: string, description?: string) => 
      context.addToast({ title, description, variant: 'success' }),
    error: (title: string, description?: string) => 
      context.addToast({ title, description, variant: 'error' }),
    warning: (title: string, description?: string) => 
      context.addToast({ title, description, variant: 'warning' }),
    info: (title: string, description?: string) => 
      context.addToast({ title, description, variant: 'info' })
  }
} 