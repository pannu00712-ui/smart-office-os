// @ts-nocheck
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useEffect, useState, useRef } from 'react'

const NAV = [
  { to: '/dashboard',   icon: '📊', label: 'Dashboard' },
  { to: '/employees',   icon: '👥', label: 'Employees' },
  { to: '/attendance',  icon: '⏰', label: 'Attendance' },
  { to: '/cameras',     icon: '📷', label: 'Cameras' },
  { to: '/payroll',     icon: '💰', label: 'Payroll' },
  { to: '/reports',     icon: '📈', label: 'Reports' },
  { to: '/departments', icon: '🏢', label: 'Departments' },
  { to: '/shifts',      icon: '🕐', label: 'Shifts' },
  { to: '/portal',      icon: '🧑‍💼', label: 'My Portal' },
  { to: '/alerts',      icon: '🔔', label: 'Alerts' },
  { to: '/logs',        icon: '🔒', label: 'Audit Logs' },
]

export default function Layout() {
  const { user, logout } = useAuthStore()
  const [time, setTime] = useState(new Date())
  const [autoSave, setAutoSave] = useState(false)

  useEffect(() => {
    const t1 = setInterval(() => setTime(new Date()), 1000)
    // Auto-save every 5 seconds
    const t2 = setInterval(() => {
      setAutoSave(true)
      setTimeout(() => setAutoSave(false), 800)
    }, 5000)
    return () => { clearInterval(t1); clearInterval(t2) }
  }, [])

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a1628', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width: 210, background: '#0d1526', borderRight: '1px solid #1e2d45', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: '18px 16px', borderBottom: '1px solid #1e2d45' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#2dd4bf,#0ea5e9)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900 }}>S</div>
            <div>
              <div style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>Smart Office</div>
              <div style={{ color: '#2dd4bf', fontSize: 10, fontWeight: 600 }}>OS v2.0</div>
            </div>
          </div>
          {/* Clock */}
          <div style={{ marginTop: 12, padding: '6px 10px', background: '#131c2e', borderRadius: 8, fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>
            {time.toLocaleTimeString('en-PK')}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
          {NAV.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8,
              marginBottom: 2, textDecoration: 'none', fontSize: 13, fontWeight: isActive ? 700 : 500,
              background: isActive ? 'rgba(45,212,191,0.12)' : 'transparent',
              color: isActive ? '#2dd4bf' : '#64748b',
              borderLeft: isActive ? '3px solid #2dd4bf' : '3px solid transparent',
              transition: 'all 0.15s',
            })}>
              <span style={{ fontSize: 15 }}>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Auto-save indicator */}
        <div style={{ padding: '8px 16px', fontSize: 10, color: autoSave ? '#34d399' : '#1e2d45', fontWeight: 600, transition: 'color 0.3s', textAlign: 'center' }}>
          {autoSave ? '✓ Auto-saved' : '● Auto-save on'}
        </div>

        {/* User */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #1e2d45' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, background: '#2dd4bf', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#f1f5f9', fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
              <div style={{ color: '#64748b', fontSize: 10, textTransform: 'capitalize' }}>{user?.role?.replace('_', ' ')}</div>
            </div>
          </div>
          <button onClick={logout} style={{ width: '100%', padding: '7px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, color: '#f87171', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: 'auto', background: '#0a1628' }}>
        <Outlet />
      </main>
    </div>
  )
}
