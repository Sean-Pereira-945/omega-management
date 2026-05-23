import type { ReactNode } from 'react'

type PanelProps = {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
}

export default function Panel({ title, subtitle, action, children }: PanelProps) {
  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">
            {title}
          </h3>
          {subtitle ? (
            <p className="text-sm text-[var(--text-muted)]">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  )
}
