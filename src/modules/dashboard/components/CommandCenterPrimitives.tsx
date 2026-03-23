import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/shared/utils/cn'

type TileTone = 'emerald' | 'sky' | 'amber' | 'rose' | 'slate'

interface TileStat {
  label: string
  value: string
}

interface CommandCenterSectionProps {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

interface CommandCenterTileProps {
  icon: LucideIcon
  eyebrow: string
  title: string
  description: string
  value?: string
  meta?: string
  stats?: TileStat[]
  statusLabel?: string
  tone?: TileTone
  to?: string
  footer?: ReactNode
  ctaLabel?: string
  className?: string
}

interface CommandCenterPanelProps {
  eyebrow: string
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

const toneClasses: Record<TileTone, string> = {
  emerald: 'border-emerald-400/20 bg-emerald-500/[0.08] shadow-[0_20px_40px_-30px_rgba(52,211,153,0.65)]',
  sky: 'border-sky-400/20 bg-sky-500/[0.08] shadow-[0_20px_40px_-30px_rgba(56,189,248,0.65)]',
  amber: 'border-amber-400/20 bg-amber-500/[0.08] shadow-[0_20px_40px_-30px_rgba(251,191,36,0.55)]',
  rose: 'border-rose-400/20 bg-rose-500/[0.08] shadow-[0_20px_40px_-30px_rgba(251,113,133,0.55)]',
  slate: 'border-white/10 bg-slate-950/80 shadow-[0_20px_40px_-32px_rgba(15,23,42,0.85)]',
}

export function CommandCenterSection({
  eyebrow,
  title,
  description,
  action,
  children,
  className,
}: CommandCenterSectionProps) {
  return (
    <section className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
            {eyebrow}
          </p>
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-[2rem]">
              {title}
            </h2>
            <p className="max-w-3xl text-sm text-slate-300 sm:text-base">
              {description}
            </p>
          </div>
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      {children}
    </section>
  )
}

export function CommandCenterTile({
  icon: Icon,
  eyebrow,
  title,
  description,
  value,
  meta,
  stats,
  statusLabel,
  tone = 'slate',
  to,
  footer,
  ctaLabel = 'Open',
  className,
}: CommandCenterTileProps) {
  const content = (
    <div
      className={cn(
        'group flex h-full flex-col justify-between rounded-[1.75rem] border p-5 transition duration-200 sm:p-6',
        toneClasses[tone],
        to && 'hover:-translate-y-0.5 hover:border-white/20',
        className
      )}
    >
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-300">
                {eyebrow}
              </span>
              {statusLabel ? (
                <span className="inline-flex items-center rounded-full border border-white/10 bg-slate-900/70 px-3 py-1 text-[0.72rem] font-medium text-slate-300">
                  {statusLabel}
                </span>
              ) : null}
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="text-sm leading-6 text-slate-300">{description}</p>
            </div>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/70 text-white">
            <Icon className="h-5 w-5" />
          </div>
        </div>

        {value ? (
          <div className="space-y-1">
            <p className="text-3xl font-semibold tracking-tight text-white sm:text-[2rem]">
              {value}
            </p>
            {meta ? <p className="text-sm text-slate-400">{meta}</p> : null}
          </div>
        ) : meta ? (
          <p className="text-sm text-slate-400">{meta}</p>
        ) : null}

        {stats?.length ? (
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-sm text-slate-300">
        <div className="min-w-0 flex-1">{footer}</div>
        {to ? (
          <span className="inline-flex items-center gap-2 font-semibold text-white transition group-hover:gap-3">
            {ctaLabel}
            <ArrowUpRight className="h-4 w-4" />
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 font-semibold text-slate-300">
            Ready
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </div>
  )

  if (!to) {
    return content
  }

  return (
    <Link to={to} className="block h-full">
      {content}
    </Link>
  )
}

export function CommandCenterPanel({
  eyebrow,
  title,
  description,
  action,
  children,
  className,
}: CommandCenterPanelProps) {
  return (
    <div
      className={cn(
        'rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-5 shadow-[0_20px_40px_-32px_rgba(15,23,42,0.85)] sm:p-6',
        className
      )}
    >
      <div className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
            {eyebrow}
          </p>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {description ? <p className="text-sm text-slate-300">{description}</p> : null}
          </div>
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      <div className="pt-4">{children}</div>
    </div>
  )
}