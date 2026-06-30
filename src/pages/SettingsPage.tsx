// @ts-nocheck
import { useState } from 'react'
import { useApp, ROLE_PERMISSIONS } from '../store/appContext'

const USERS = [
  { id: 1, email: 'admin@soos.io', name: 'Admin', role: 'super_admin' },
  { id: 2, email: 'hr@soos.io', name: 'Hassan Malik', role: 'hr_manager' },
  { id: 3, email: 'manager@soos.io', name: 'Zara Ahmed', role: 'manager' },
  { id: 4, email: 'zara@soos.io', name: 'Zara Ahmed', role: 'employee' },
]

const BACKUP_HISTORY = [
  { id: 1, date: '2025-06-19 03:00 AM', size: '4.2 MB', type: 'Automatic', status: 'success' },
  { id: 2, date: '2025-06-18 03:00 AM', size: '4.1 MB', type: 'Automatic', status: 'success' },
  { id: 3, date: '2025-06-17 02:15 PM', size: '4.0 MB', type: 'Manual', status: 'success' },
  { id: 4, date: '2025-06-17 03:00 AM', size: '3.9 MB', type: 'Automatic', status: 'success' },
]

export default function SettingsPage() {
  const { theme, setTheme, lang, setLang, t, colors, pendingApprovals, setPendingApprovals } = useApp()
  const [tab, setTab] = useState('general')
  const [backups, setBackups] = useState(BACKUP_HISTORY)
  const [backing, setBacking] = useState(false)
  const [restoring, setRestoring] = useState(null)
  const [users, setUsers] = useState(USERS)
  const [msg, setMsg] = useState('')

  const doBackup = () => {
    setBacking(true)
    setTimeout(() => {
      setBackups(p => [{ id: Date.now(), date: new Date().toLocaleString('en-PK'), size: (Math.random() * 2 + 3.5).toFixed(1) + ' MB', type: 'Manual', status: 'success' }, ...p])
      setBacking(false)
      setMsg('Backup completed successfully!')
      setTimeout(() => setMsg(''), 3000)
    }, 1800)
  }

  const doRestore = (b) => {
    setRestoring(b.id)
    setTimeout(() => {
      setRestoring(null)
      setMsg(`Data restored from backup: ${b.date}`)
      setTimeout(() => setMsg(''), 3000)
    }, 2000)
  }

  const approveRequest = (id, approved) => {
    setPendingApprovals(p => p.map(r => r.id === id ? { ...r, status: approved ? 'approved' : 'rejected' } : r))
  }

  const TABS = [
    { id: 'general', label: '⚙️ General' },
    { id: 'permissions', label: '🔐 Permissions' },
    { id: 'approvals', label: '✅ Approvals', badge: pendingApprovals.filter(p => p.status === 'pending').length },
    { id: 'backup', label: '💾 Backup & Restore' },
  ]

  const card = { background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 16, padding: '20px 22px' }
  const lbl = { fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', padding: '28px 32px', fontFamily: "'DM Sans', sans-serif", color: colors.text }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>{t('settings')}</div>
        <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 3 }}>System preferences, security & data management</div>
      </div>

      {msg && <div style={{ padding: '12px 16px', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 10, color: '#34d399', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>✓ {msg}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 4, marginBottom: 24, width: 'fit-content' }}>
        {TABS.map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: tab === tb.id ? 'rgba(45,212,191,0.15)' : 'none', color: tab === tb.id ? '#2dd4bf' : colors.textMuted, cursor: 'pointer', fontSize: 13, fontWeight: tab === tb.id ? 700 : 500, position: 'relative' }}>
            {tb.label}
            {tb.badge > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#f87171', color: '#fff', fontSize: 9, fontWeight: 800, borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{tb.badge}</span>}
          </button>
        ))}
      </div>

      {/* General Tab */}
      {tab === 'general' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Theme */}
          <div style={card}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>🎨 {t('theme')}</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[{ id: 'dark', label: t('dark'), icon: '🌙' }, { id: 'light', label: t('light'), icon: '☀️' }].map(o => (
                <button key={o.id} onClick={() => setTheme(o.id)} style={{ flex: 1, padding: '16px', borderRadius: 12, border: `2px solid ${theme === o.id ? '#2dd4bf' : colors.border}`, background: theme === o.id ? 'rgba(45,212,191,0.1)' : colors.panelDark, color: theme === o.id ? '#2dd4bf' : colors.textMuted, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{o.icon}</div>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div style={card}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>🌐 {t('language')}</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[{ id: 'en', label: 'English', flag: '🇬🇧' }, { id: 'ur', label: 'اردو', flag: '🇵🇰' }].map(o => (
                <button key={o.id} onClick={() => setLang(o.id)} style={{ flex: 1, padding: '16px', borderRadius: 12, border: `2px solid ${lang === o.id ? '#2dd4bf' : colors.border}`, background: lang === o.id ? 'rgba(45,212,191,0.1)' : colors.panelDark, color: lang === o.id ? '#2dd4bf' : colors.textMuted, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{o.flag}</div>
                  {o.label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: colors.textFaint, marginTop: 10 }}>📌 Sidebar labels will update immediately. Full RTL layout support is in progress.</div>
          </div>
        </div>
      )}

      {/* Permissions Tab */}
      {tab === 'permissions' && (
        <div>
          <div style={card}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>🔐 Role-Based Permissions Matrix</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
                    <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, color: colors.textMuted, textTransform: 'uppercase' }}>Role</th>
                    {['canEdit', 'canDelete', 'canApprove', 'canViewPayroll', 'canViewLogs', 'needsApproval'].map(p => (
                      <th key={p} style={{ textAlign: 'center', padding: '8px 12px', fontSize: 10, color: colors.textMuted, textTransform: 'uppercase' }}>{p.replace('can', '').replace('needs', 'Needs ')}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(ROLE_PERMISSIONS).map(([key, perm]) => (
                    <tr key={key} style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <td style={{ padding: '12px', fontSize: 13, fontWeight: 700, color: perm.color }}>{perm.label}</td>
                      {['canEdit', 'canDelete', 'canApprove', 'canViewPayroll', 'canViewLogs', 'needsApproval'].map(p => (
                        <td key={p} style={{ textAlign: 'center', padding: '12px', fontSize: 16 }}>{perm[p] ? '✅' : '❌'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ ...card, marginTop: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>👥 User Role Assignments</div>
            {users.map(u => {
              const perm = ROLE_PERMISSIONS[u.role]
              return (
                <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${colors.border}` }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: colors.textMuted }}>{u.email}</div>
                  </div>
                  <select value={u.role} onChange={e => setUsers(p => p.map(x => x.id === u.id ? { ...x, role: e.target.value } : x))}
                    style={{ background: perm.color + '15', border: `1px solid ${perm.color}40`, borderRadius: 8, padding: '6px 12px', color: perm.color, fontWeight: 700, fontSize: 12, cursor: 'pointer', outline: 'none' }}>
                    {Object.entries(ROLE_PERMISSIONS).map(([k, p]) => <option key={k} value={k}>{p.label}</option>)}
                  </select>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Approvals Tab */}
      {tab === 'approvals' && (
        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>✅ Pending Approval Requests</div>
          <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 16 }}>Changes by Managers/Employees require Admin or HR approval before taking effect</div>
          {pendingApprovals.length === 0 && <div style={{ textAlign: 'center', color: colors.textFaint, padding: 32 }}>No pending approvals</div>}
          {pendingApprovals.map(r => (
            <div key={r.id} style={{ background: colors.panelDark, borderRadius: 12, padding: '14px 18px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{r.type} — {r.target}</div>
                <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{r.detail}</div>
                <div style={{ fontSize: 11, color: colors.textFaint, marginTop: 2 }}>Requested by {r.requestedBy}</div>
              </div>
              {r.status === 'pending' ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => approveRequest(r.id, true)} style={{ padding: '7px 16px', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 8, color: '#34d399', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>Approve</button>
                  <button onClick={() => approveRequest(r.id, false)} style={{ padding: '7px 16px', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, color: '#f87171', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>Reject</button>
                </div>
              ) : (
                <span style={{ padding: '4px 12px', borderRadius: 20, background: r.status === 'approved' ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)', color: r.status === 'approved' ? '#34d399' : '#f87171', fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>{r.status}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Backup Tab */}
      {tab === 'backup' && (
        <div>
          <div style={{ ...card, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>💾 {t('backup')}</div>
              <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>Automatic backup runs daily at 3:00 AM · Manual backup available anytime</div>
            </div>
            <button onClick={doBackup} disabled={backing} style={{ padding: '10px 24px', background: backing ? colors.panelDark : 'linear-gradient(135deg,#2dd4bf,#0ea5e9)', border: backing ? `1px solid ${colors.border}` : 'none', borderRadius: 10, color: backing ? colors.textMuted : '#0f172a', fontWeight: 800, fontSize: 13, cursor: backing ? 'not-allowed' : 'pointer' }}>
              {backing ? '⏳ Backing up...' : '💾 Backup Now'}
            </button>
          </div>

          <div style={card}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Backup History</div>
            {backups.map(b => (
              <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${colors.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 20 }}>{b.type === 'Automatic' ? '🤖' : '👤'}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{b.date}</div>
                    <div style={{ fontSize: 11, color: colors.textMuted }}>{b.type} backup · {b.size}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(52,211,153,0.12)', color: '#34d399', fontSize: 11, fontWeight: 700 }}>✓ Success</span>
                  <button onClick={() => doRestore(b)} disabled={restoring === b.id} style={{ padding: '6px 14px', background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.3)', borderRadius: 8, color: '#818cf8', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>
                    {restoring === b.id ? '⏳ Restoring...' : '↩ Restore'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
