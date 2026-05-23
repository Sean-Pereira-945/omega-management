import { useState, useEffect, useRef } from 'react'
import { Link, NavLink } from 'react-router-dom'

const baseLink =
  'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200'

const getLinkClass = (isActive: boolean) =>
  `${baseLink} ${
    isActive
      ? 'bg-ink-900 text-white shadow-soft'
      : 'text-[var(--text-muted)] hover:bg-[var(--surface-strong)] hover:text-[var(--text-primary)]'
  }`

type SidebarProps = {
  variant?: 'desktop' | 'mobile'
  isOpen?: boolean
  onClose?: () => void
  onNavigate?: () => void
}

export default function Sidebar({
  variant = 'desktop',
  isOpen = false,
  onClose,
  onNavigate,
}: SidebarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isUserMenuOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isUserMenuOpen])
  const wrapperClassName =
    variant === 'mobile'
      ? `fixed inset-0 z-50 flex lg:hidden transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`
      : 'hidden lg:block'
  const asideClassName =
    variant === 'mobile'
      ? `relative h-full w-[280px] bg-[var(--surface)] px-6 py-8 transition-transform duration-300 ease-out shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
      : 'lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:h-screen lg:w-[260px] lg:flex-col lg:gap-6 lg:border-r lg:border-[var(--border)] lg:bg-[var(--surface)] lg:px-6 lg:py-8'

  return (
    <div className={wrapperClassName} aria-label="Primary navigation">
      {variant === 'mobile' ? (
        <button
          type="button"
          className="absolute inset-0 bg-black/40 transition-opacity duration-300"
          onClick={onClose}
          aria-label="Close navigation"
        />
      ) : null}
      <aside className={`flex flex-col gap-6 ${asideClassName}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">
              Omega
            </p>
            <p className="font-display text-xl font-semibold text-[var(--text-primary)]">
              Management OS
            </p>
          </div>
          {variant === 'mobile' ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-primary)]"
            >
              Close
            </button>
          ) : null}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden">
          <nav className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
            <NavLink
              to="/products"
              onClick={onNavigate}
              className={({ isActive }) => getLinkClass(isActive)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 transition-transform duration-200 group-hover:scale-110">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              <span>Products</span>
            </NavLink>
            <NavLink
              to="/analytics"
              onClick={onNavigate}
              className={({ isActive }) => getLinkClass(isActive)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 transition-transform duration-200 group-hover:scale-110">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
              <span>Analytics</span>
            </NavLink>
            <NavLink
              to="/inventory"
              onClick={onNavigate}
              className={({ isActive }) => getLinkClass(isActive)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 transition-transform duration-200 group-hover:scale-110">
                <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
              </svg>
              <span>Inventory</span>
            </NavLink>
            <NavLink
              to="/stock-orders"
              onClick={onNavigate}
              className={({ isActive }) => getLinkClass(isActive)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 transition-transform duration-200 group-hover:scale-110">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.656 48.656 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M7.5 12l-3 3m3-3l3 3" />
              </svg>
              <span>Stock Orders</span>
            </NavLink>
            <NavLink
              to="/warehouse"
              onClick={onNavigate}
              className={({ isActive }) => getLinkClass(isActive)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 transition-transform duration-200 group-hover:scale-110">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m-1.5-7.75-9.25 3.364M3.75 19.5h16.5M12 2.25V4.5m0 12v2.25" />
              </svg>
              <span>Warehouse</span>
            </NavLink>
          </nav>

        </div>

        {/* User profile dropdown trigger */}
        <div className="relative mt-auto" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(prev => !prev)}
            className="flex w-full items-center gap-3 rounded-2xl bg-[var(--surface-muted)] p-3 text-left transition-all duration-200 hover:bg-[var(--surface-strong)] focus:outline-none"
            aria-haspopup="true"
            aria-expanded={isUserMenuOpen}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-900 text-xs font-bold text-white shadow-soft">
              AM
            </span>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-bold text-[var(--text-primary)]">A. Manager</p>
              <p className="truncate text-xs text-[var(--text-muted)]">Operations Lead</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`h-4 w-4 text-[var(--text-muted)] transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {/* Premium animated absolute Dropup Menu */}
          {isUserMenuOpen ? (
            <div className="absolute bottom-full left-0 z-50 mb-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-2 shadow-2xl animate-fade-in animate-slide-up flex flex-col gap-1">
              <Link
                to="/products?add=1"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  onNavigate?.();
                }}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition duration-150"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 text-[var(--text-muted)]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Add Product</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition duration-150 text-left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 text-[var(--text-muted)]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                <span>Profile Settings</span>
              </button>
              <div className="h-[1px] bg-[var(--border)] my-1" />
              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-sun-500 hover:bg-sun-500/10 transition duration-150 text-left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3-3H15m-3-3-3 3m3 3-3-3" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  )
}
