import React from 'react'

export const DailyJournalPage: React.FC = () => {
  return (
    <div className="app-page pb-8 pt-4">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-slate-950/85 p-6 shadow-[0_30px_80px_-44px_rgba(14,165,233,0.45)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300/80">
          Legacy compatibility shim
        </p>
        <div className="mt-3 space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Daily standup has been folded into Journal.
          </h1>
          <p className="text-base leading-7 text-slate-300">
            This page is intentionally retained only to keep older imports from breaking
            while the product settles on one canonical daily workflow. Morning planning
            and evening reflection now live in the journal module.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <a
            href="/journal"
            className="inline-flex items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-300/20"
          >
            Open journal
          </a>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
          >
            Back to dashboard
          </a>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          The old mock standup form and AI-demo guidance were removed so this module no
          longer competes conceptually with the real journal flow.
        </div>
      </div>
    </div>
  )
}