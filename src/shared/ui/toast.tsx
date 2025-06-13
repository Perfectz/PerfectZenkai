import * as React from "react"
import { cn } from "@/shared/lib/utils"
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react"
import { ToastContext, type Toast } from "@/shared/hooks/useToast"

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, toast.duration || 4000)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

// Toast container that renders all toasts
function ToastContainer({ 
  toasts, 
  removeToast 
}: { 
  toasts: Toast[]
  removeToast: (id: string) => void 
}) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <ToastComponent 
          key={toast.id} 
          toast={toast} 
          onRemove={() => removeToast(toast.id)} 
        />
      ))}
    </div>
  )
}

// Individual toast component
function ToastComponent({ 
  toast, 
  onRemove 
}: { 
  toast: Toast
  onRemove: () => void 
}) {
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const handleRemove = () => {
    setIsVisible(false)
    setTimeout(onRemove, 200) // Wait for animation
  }

  const variants = {
    success: {
      icon: CheckCircle,
      colors: 'bg-gray-900 border-ki-green text-ki-green ki-glow-soft',
      iconColor: 'text-ki-green'
    },
    error: {
      icon: XCircle,
      colors: 'bg-gray-900 border-red-400 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.3)]',
      iconColor: 'text-red-400'
    },
    warning: {
      icon: AlertTriangle,
      colors: 'bg-gray-900 border-yellow-400 text-yellow-400 shadow-[0_0_12px_rgba(251,191,36,0.3)]',
      iconColor: 'text-yellow-400'
    },
    info: {
      icon: Info,
      colors: 'bg-gray-900 border-plasma-cyan text-plasma-cyan cyan-glow',
      iconColor: 'text-plasma-cyan'
    }
  }

  const config = variants[toast.variant || 'info']
  const Icon = config.icon

  return (
    <div
      className={cn(
        "pointer-events-auto relative flex w-80 items-start gap-3 rounded-lg border p-4 transition-all duration-200 ease-out",
        config.colors,
        isVisible 
          ? "translate-x-0 opacity-100" 
          : "translate-x-full opacity-0"
      )}
    >
      {/* Icon */}
      <Icon className={cn("h-5 w-5 mt-0.5 cyber-icon", config.iconColor)} />
      
      {/* Content */}
      <div className="flex-1 space-y-1">
        {toast.title && (
          <div className="text-sm font-semibold font-inter">
            {toast.title}
          </div>
        )}
        {toast.description && (
          <div className="text-sm font-mono opacity-90">
            {toast.description}
          </div>
        )}
      </div>
      
      {/* Close button */}
      <button
        onClick={handleRemove}
        className="opacity-60 hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
      
      {/* Cyber accent line */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1 rounded-l-lg",
        toast.variant === 'success' && "bg-ki-green",
        toast.variant === 'error' && "bg-red-400",
        toast.variant === 'warning' && "bg-yellow-400",
        toast.variant === 'info' && "bg-plasma-cyan"
      )} />
    </div>
  )
}

 