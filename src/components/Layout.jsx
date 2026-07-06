import { NavLink } from 'react-router-dom'

const PUBLIC_NAV = [
  { to: '/', label: 'Piket', icon: '✅', end: true },
  { to: '/jadwal', label: 'Jadwal', icon: '🗓️' },
]

const ADMIN_NAV = [
  { to: '/admin', label: 'Rekap', icon: '📊', end: true },
  { to: '/admin/jadwal', label: 'Jadwal', icon: '🗓️' },
  { to: '/admin/foto', label: 'Foto', icon: '📷' },
]

export default function Layout({ variant = 'public', children }) {
  const nav = variant === 'admin' ? ADMIN_NAV : PUBLIC_NAV
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-[480px] mx-auto min-h-screen pb-[calc(72px+env(safe-area-inset-bottom))]">
        {children}
      </div>
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E8E8] z-40"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="max-w-[480px] mx-auto flex h-14">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end ?? false}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${
                  isActive ? 'text-[#3E2723]' : 'text-[#999999]'
                }`
              }
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
