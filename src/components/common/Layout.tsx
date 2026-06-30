// @ts-nocheck
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useApp } from '../../store/appContext'
import { useEffect, useState } from 'react'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const { t, theme, colors, notifications, markAllRead, unreadCount } = useApp()
  const [time, setTime] = useState(new Date())
  const [autoSave, setAutoSave] = useState(false)
  const [showNotif, setShowNotif] = useState(false)

  useEffect(() => {
    const t1 = setInterval(() => setTime(new Date()), 1000)
    const t2 = setInterval(() => { setAutoSave(true); setTimeout(() => setAutoSave(false), 800) }, 5000)
    return () => { clearInterval(t1); clearInterval(t2) }
  }, [])

  const NAV = [
    { to: '/dashboard',   icon: '📊', label: t('dashboard') },
    { to: '/employees',   icon: '👥', label: t('employees') },
    { to: '/attendance',  icon: '⏰', label: t('attendance') },
    { to: '/cameras',     icon: '📷', label: t('cameras') },
    { to: '/payroll',     icon: '💰', label: t('payroll') },
    { to: '/reports',     icon: '📈', label: t('reports') },
    { to: '/departments', icon: '🏢', label: t('departments') },
    { to: '/shifts',      icon: '🕐', label: t('shifts') },
    { to: '/portal',      icon: '🧑‍💼', label: t('myPortal') },
    { to: '/records',     icon: '📁', label: t('employeeRecords') },
    { to: '/alerts',      icon: '🔔', label: t('alerts') },
    { to: '/logs',        icon: '🔒', label: t('auditLogs') },
    { to: '/settings',    icon: '⚙️', label: t('settings') },
  ]

  const NOTIF_ICON = { leave: '📅', alert: '⚠️', payroll: '💰', document: '📁', event: '🎉' }

  return (
    <div style={{ display: 'flex', height: '100vh', background: colors.bg, fontFamily: "'DM Sans', -apple-system, sans-serif", color: colors.text }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: colors.panelDark, borderRight: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '18px 16px', borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#2dd4bf,#0ea5e9)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900 }}>S</div>
            <div>
              <div style={{ color: colors.text, fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>Smart Office</div>
              <div style={{ color: '#2dd4bf', fontSize: 10, fontWeight: 600 }}>OS v2.0</div>
            </div>
          </div>
          <div style={{ marginTop: 12, padding: '6px 10px', background: colors.panel, borderRadius: 8, fontSize: 11, color: colors.textMuted, fontFamily: 'monospace' }}>
            {time.toLocaleTimeString('en-PK')}
          </div>
        </div>

        <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
          {NAV.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8,
              marginBottom: 2, textDecoration: 'none', fontSize: 13, fontWeight: isActive ? 700 : 500,
              background: isActive ? 'rgba(45,212,191,0.12)' : 'transparent',
              color: isActive ? '#2dd4bf' : colors.textMuted,
              borderLeft: isActive ? '3px solid #2dd4bf' : '3px solid transparent',
            })}>
              <span style={{ fontSize: 15 }}>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '8px 16px', fontSize: 10, color: autoSave ? '#34d399' : colors.border, fontWeight: 600, transition: 'color 0.3s', textAlign: 'center' }}>
          {autoSave ? `✓ ${t('autoSaved')}` : `● ${t('autoSaveOn')}`}
        </div>

        <div style={{ padding: '12px 16px', borderTop: `1px solid ${colors.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, background: '#2dd4bf', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: colors.text, fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
              <div style={{ color: colors.textMuted, fontSize: 10, textTransform: 'capitalize' }}>{user?.role?.replace('_', ' ')}</div>
            </div>
          </div>
          <button onClick={logout} style={{ width: '100%', padding: '7px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, color: '#f87171', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
            {t('signOut')}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar with notification bell */}
        <div style={{ height: 52, borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 24px', background: colors.panelDark, flexShrink: 0, position: 'relative' }}>
          <button onClick={() => setShowNotif(p => !p)} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 8 }}>
            🔔
            {unreadCount > 0 && <span style={{ position: 'absolute', top: 2, right: 2, background: '#f87171', color: '#fff', fontSize: 9, fontWeight: 800, borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadCount}</span>}
          </button>

          {showNotif && (
            <div style={{ position: 'absolute', top: 52, right: 16, width: 340, background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 14, boxShadow: '0 12px 32px rgba(0,0,0,0.4)', zIndex: 100, maxHeight: 420, overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: `1px solid ${colors.border}` }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{t('notifications')}</div>
                <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#2dd4bf', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>{t('markAllRead')}</button>
              </div>
              {notifications.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: colors.textFaint, fontSize: 13 }}>{t('noNotifications')}</div>}
              {notifications.map(n => (
                <div key={n.id} style={{ display: 'flex', gap: 10, padding: '12px 16px', borderBottom: `1px solid ${colors.border}`, background: n.read ? 'transparent' : 'rgba(45,212,191,0.04)' }}>
                  <div style={{ fontSize: 18 }}>{NOTIF_ICON[n.type] || '🔔'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: n.read ? 500 : 700, color: colors.text }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{n.body}</div>
                    <div style={{ fontSize: 10, color: colors.textFaint, marginTop: 3 }}>{n.time}</div>
                  </div>
                  {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2dd4bf', flexShrink: 0, marginTop: 4 }} />}
                </div>
              ))}
            </div>
          )}
        </div>

        <main style={{ flex: 1, overflowY: 'auto', background: colors.bg }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
