import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const titles: Record<string, string> = {
  '/products': 'Products',
  '/analytics': 'Analytics',
  '/inventory': 'Inventory',
  '/stock-orders': 'Stock orders',
  '/warehouse': 'Warehouse',
}

type TopNavProps = {
  onOpenNav?: () => void
}

export default function TopNav({ onOpenNav }: TopNavProps) {
  const { pathname } = useLocation()
  const title = useMemo(() => {
    if (pathname.startsWith('/products/')) {
      return 'Product details'
    }
    return titles[pathname] ?? 'Overview'
  }, [pathname])

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') {
      return 'light'
    }
    const stored = window.localStorage.getItem('omega-theme')
    return stored === 'dark' ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem('omega-theme', theme)
  }, [theme])

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 backdrop-blur-md sm:px-6 sm:py-4 lg:-ml-[1px] lg:border-l lg:border-[var(--border)]">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenNav}
          className="flex items-center justify-center h-10 w-10 shrink-0 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--text-primary)] transition-all hover:scale-105 active:scale-95 lg:hidden"
          aria-label="Open navigation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <div className="space-y-0.5 min-w-0">
          <nav className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)] truncate" aria-label="Breadcrumb">
            {pathname.startsWith('/products/') ? (
              <div className="flex items-center gap-1">
                <Link to="/products" className="hover:text-[var(--text-primary)] transition-colors">
                  Products
                </Link>
                <span aria-hidden="true" className="opacity-60">/</span>
                <span className="text-[var(--text-primary)]">Details</span>
              </div>
            ) : null}
          </nav>
          <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight text-[var(--text-primary)] truncate">
            {title}
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          title="Notifications"
          className="relative flex items-center justify-center h-10 w-10 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--text-primary)] transition-all hover:scale-105 active:scale-95"
          aria-label="Notifications"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>
          <span className="absolute right-2.5 top-2.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sun-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sun-500"></span>
          </span>
        </button>
        <button
          type="button"
          title="Help & Support"
          className="flex items-center justify-center h-10 w-10 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--text-primary)] transition-all hover:scale-105 active:scale-95"
          aria-label="Help"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          className="flex items-center justify-center h-10 w-10 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--text-primary)] transition-all hover:scale-105 active:scale-95"
          aria-label={theme === 'light' ? 'Dark mode' : 'Light mode'}
        >
          {theme === 'light' ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 transition-transform hover:rotate-12">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 transition-transform hover:rotate-45">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.22 4.22l1.59 1.59m12.38 12.38l1.59 1.59M21 12h-2.25m-13.5 0H3m2.28 5.72l-1.59 1.59m12.38-12.38l-1.59 1.59M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z" />
            </svg>
          )}
        </button>
        <button
          type="button"
          aria-label="User menu"
          className="flex items-center justify-center h-10 w-10 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] transition-all hover:scale-105 active:scale-95"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-900 text-[10px] font-bold text-white">
            AM
          </span>
        </button>
      </div>
    </header>
  )
}
