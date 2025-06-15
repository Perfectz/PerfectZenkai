import * as React from 'react'
import { cn } from '@/shared/utils/cn'

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function Sheet({
  open,
  onOpenChange: _onOpenChange,
  children,
}: SheetProps) {
  return <>{open && children}</>
}

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'bottom' | 'top' | 'left' | 'right'
}

export const SheetContent: React.FC<SheetContentProps> = ({
  side = 'bottom',
  className,
  ...props
}) => {
  const basePosition =
    side === 'bottom'
      ? 'inset-x-0 bottom-0'
      : side === 'top'
        ? 'inset-x-0 top-0'
        : side === 'left'
          ? 'inset-y-0 left-0'
          : 'inset-y-0 right-0'

  return (
    <div
      className={cn(
        'slide-in-from- fixed z-50 bg-background shadow-lg transition-transform animate-in' +
          side +
          '-5',
        basePosition,
        className
      )}
      {...props}
    />
  )
}

export const SheetHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className
    )}
    {...props}
  />
)

export const SheetTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => <h2 className={cn('text-lg font-semibold', className)} {...props} />

export const SheetDescription: React.FC<
  React.HTMLAttributes<HTMLParagraphElement>
> = ({ className, ...props }) => (
  <p className={cn('text-sm text-muted-foreground', className)} {...props} />
)
