import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)]">
      <h2 className="font-display text-2xl font-semibold text-[var(--text-primary)]">
        Page not found
      </h2>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        That route does not exist yet.
      </p>
      <Link
        to="/products"
        className="mt-5 inline-flex rounded-full bg-ink-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
      >
        Back to products
      </Link>
    </section>
  )
}
