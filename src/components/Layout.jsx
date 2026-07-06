import { NavLink } from 'react-router-dom'
import {
  ClipboardCheck,
  CalendarDays,
  BarChart3,
  Camera,
  LogOut,
  Coffee,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const PUBLIC_NAV = [
  { to: '/', label: 'Piket', icon: ClipboardCheck, end: true },
  { to: '/jadwal', label: 'Jadwal', icon: CalendarDays },
]

const ADMIN_NAV = [
  { to: '/admin', label: 'Rekap', icon: BarChart3, end: true },
  { to: '/admin/jadwal', label: 'Jadwal', icon: CalendarDays },
  { to: '/admin/foto', label: 'Foto', icon: Camera },
]

function SidebarLink({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end ?? false}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius)] text-[14px] font-medium transition-colors cursor-pointer ${
          isActive
            ? 'bg-[var(--c-primary)] text-white'
            : 'text-[var(--c-text-secondary)] hover:bg-[var(--c-primary)]/8 hover:text-[var(--c-text)]'
        }`
      }
    >
      <Icon size={20} strokeWidth={1.75} />
      {label}
    </NavLink>
  )
}

function BottomNavLink({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end ?? false}
      className={({ isActive }) =>
        `flex-1 flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold cursor-pointer transition-colors ${
          isActive ? 'text-[var(--c-primary)]' : 'text-[var(--c-text-muted)]'
        }`
      }
    >
      <Icon size={20} strokeWidth={1.75} />
      {label}
    </NavLink>
  )
}

export default function Layout({ variant = 'public', title, children }) {
  const { session, signOut } = useAuth()
  const nav = variant === 'admin' ? ADMIN_NAV : PUBLIC_NAV

  return (
    <div className="min-h-dvh bg-[var(--c-bg)]">
      {/* Desktop sidebar - hidden on mobile */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-[240px] flex-col bg-[var(--c-surface)] border-r border-[var(--c-border)] z-30">
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-[var(--c-border)]">
          <Coffee size={22} className="text-[var(--c-primary)]" strokeWidth={2} />
          <span className="text-[15px] font-bold text-[var(--c-text)]">Berlaris Piket</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map((item) => (
            <SidebarLink key={item.to} {...item} />
          ))}
        </nav>
        {variant === 'admin' && session && (
          <div className="px-3 py-4 border-t border-[var(--c-border)]">
            <button
              onClick={signOut}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-[var(--radius)] text-[14px] font-medium text-[var(--c-text-secondary)] hover:bg-red-50 hover:text-[var(--c-danger)] transition-colors cursor-pointer"
            >
              <LogOut size={20} strokeWidth={1.75} />
              Keluar
            </button>
          </div>
        )}
      </aside>

      {/* Top bar - desktop only */}
      <header className="hidden lg:flex fixed top-0 left-[240px] right-0 h-16 bg-[var(--c-surface)] border-b border-[var(--c-border)] z-20 items-center px-8">
        {title && <h1 className="text-[18px] font-bold text-[var(--c-text)]">{title}</h1>}
      </header>

      {/* Main content */}
      <main className="lg:ml-[240px] lg:pt-16 pb-[calc(72px+env(safe-area-inset-bottom))] lg:pb-0 min-h-dvh">
        {children}
      </main>

      {/* Bottom nav - mobile only */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--c-surface)] border-t border-[var(--c-border)] z-40"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex h-14">
          {nav.map((item) => (
            <BottomNavLink key={item.to} {...item} />
          ))}
        </div>
      </nav>
    </div>
  )
}
