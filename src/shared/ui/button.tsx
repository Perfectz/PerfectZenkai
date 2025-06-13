import * as React from 'react'
import { cn } from '@/shared/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'cyber-ki' | 'cyber-magenta' | 'cyber-cyan' | 'cyber-outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-inter'
    
    const variants = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
      
      // Cyber variants with glow effects
      'cyber-ki': 'bg-ki-green text-dark-navy font-semibold ki-glow-soft hover:ki-glow hover:scale-105 active:scale-95 neon-button',
      'cyber-magenta': 'bg-hyper-magenta text-white font-semibold magenta-glow hover:magenta-glow hover:scale-105 active:scale-95 neon-button',
      'cyber-cyan': 'bg-plasma-cyan text-dark-navy font-semibold cyan-glow hover:cyan-glow hover:scale-105 active:scale-95 neon-button',
      'cyber-outline': 'border-2 border-ki-green bg-transparent text-ki-green font-semibold hover:bg-ki-green hover:text-dark-navy hover:ki-glow transition-all duration-300 neon-button',
    }
    
    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10',
    }
    
    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button } 