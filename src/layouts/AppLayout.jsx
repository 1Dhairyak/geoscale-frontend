// ─────────────────────────────────────────────────────────────
// AppLayout.jsx — shared authenticated shell
//
// Renders the sticky top navigation bar with:
//   - Left:   GeoScale logo
//   - Centre: Map / Quiz / Multiplayer nav links
//   - Right:  Profile avatar link + logout button
//
// The <Outlet /> (main content area) fills the remaining height.
// ─────────────────────────────────────────────────────────────
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ── SVG icon components ────────────────────────────────────────
function GlobeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}
function MapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  )
}
function QuizIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}
function MultiIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

// Navigation link definitions
const NAV_LINKS = [
  { label: 'Map',         path: '/map',   Icon: MapIcon   },
  { label: 'Quiz',        path: '/quiz',  Icon: QuizIcon  },
  { label: 'Multiplayer', path: '/match', Icon: MultiIcon },
]

// ── Component ──────────────────────────────────────────────────
export default function AppLayout({ children }) {
  const { logout, username } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      background: 'radial-gradient(ellipse 700px 500px at 15% 0%, rgba(124,58,237,0.25), transparent 60%), radial-gradient(ellipse 600px 500px at 100% 100%, rgba(56,189,248,0.16), transparent 55%), #11132a',
      color: '#f3f4f6',
    }}>

      {/* ── Top navigation bar ──────────────────────────────── */}
      <header style={{
        height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
        background: 'rgba(17, 19, 42, 0.4)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        zIndex: 50,
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 200 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #7c3aed, #38bdf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
          }}>
            <GlobeIcon />
          </div>
          <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: '-0.02em' }}>
            GeoScale
          </span>
        </div>

        {/* Nav links */}
        <nav style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {NAV_LINKS.map(({ label, path, Icon }) => (
            <NavLink
              key={path}
              to={path}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 16px', borderRadius: 999,
                fontSize: 14, fontWeight: isActive ? 600 : 500,
                color: isActive ? '#fff' : '#9ca3af',
                background: isActive ? 'rgba(124, 58, 237, 0.2)' : 'transparent',
                border: isActive ? '1px solid rgba(124, 58, 237, 0.3)' : '1px solid transparent',
                textDecoration: 'none', transition: 'all 0.2s ease',
              })}
              onMouseEnter={e => { if (!e.currentTarget.dataset.active) e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { if (!e.currentTarget.dataset.active) e.currentTarget.style.color = '#9ca3af' }}
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Profile & logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 200, justifyContent: 'flex-end' }}>
          <NavLink
            to="/profile"
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 12px 6px 6px', borderRadius: 999,
              background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
              textDecoration: 'none', transition: 'background 0.2s ease', cursor: 'pointer',
            })}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '' }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#fff',
            }}>
              {(username || 'U')[0].toUpperCase()}
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#e5e7eb', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {username || 'Player'}
            </span>
          </NavLink>

          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)' }} />

          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36, borderRadius: '50%',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: '#9ca3af', transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,113,133,0.15)'; e.currentTarget.style.color = '#fb7185' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af' }}
          >
            <LogoutIcon />
          </button>
        </div>
      </header>

      {/* ── Page content ────────────────────────────────────── */}
      <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {children}
      </main>
    </div>
  )
}
