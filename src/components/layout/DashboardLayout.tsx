import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopNav from './TopNav'

export default function DashboardLayout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <div className="min-h-[100svh] bg-[var(--bg)]">
      <Sidebar variant="desktop" />
      <div className="min-h-[100svh] w-full lg:pl-[260px]">
        <div className="flex min-h-[100svh] flex-col">
          <TopNav onOpenNav={() => setIsMobileNavOpen(true)} />
          <main 
            key={pathname} 
            className="flex-1 px-4 py-6 sm:px-6 sm:py-8 mx-auto w-full max-w-[1400px] animate-fade-in animate-slide-up"
          >
            <Outlet />
          </main>
        </div>
      </div>
      <Sidebar
        variant="mobile"
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        onNavigate={() => setIsMobileNavOpen(false)}
      />
    </div>
  )
}
