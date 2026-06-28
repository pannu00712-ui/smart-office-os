// @ts-nocheck
import { useState, useEffect } from 'react'

const CAMERAS = [
  { id: 1, name: 'Main Entrance', ip: '192.168.1.101', status: 'online', lastSeen: 'Just now' },
  { id: 2, name: 'Parking Area', ip: '192.168.1.102', status: 'offline', lastSeen: '5 min ago' },
  { id: 3, name: 'Floor 3', ip: '192.168.1.103', status: 'online', lastSeen: 'Just now' },
]

const genStats = () => ({
  total: 6,
  present: Math.floor(Math.random() * 3) + 3,
  absent: Math.floor(Math.random() * 2) + 1,
  late: Math.floor(Math.random() * 2),
  onLeave: 1,
  cameras: { online: 2, offline: 1 },
})

const RECENT_EVENTS = [
  { id: 1, type: 'checkin', emp: 'Zara Ahmed', time: '08:55 AM', camera: 'Main Entrance', status: 'on-time' },
  { id: 2, type: 'checkin', emp: 'Hassan Malik', time: '09:18 AM', camera: 'Main Entrance', status: 'late' },
  { id: 3, type: 'checkout', emp: 'Omar Farooq', time: '06:05 PM', camera: 'Main Entrance', status: 'normal' },
  { id: 4, type: 'alert', emp: 'CAM-002 Parking', time: '10:30 AM', camera: '-', status: 'offline' },
  { id: 5, type: 'checkin', emp: 'Sana Baig', time: '08:50 AM', camera: 'Floor 3', status: 'on-time' },
]

export default function DashboardPage() {
  const [stats, setStats] = useState(genStats())
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [cameras, setCameras] = useState(CAMERAS)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setStats(genStats())
      setLastRefresh(new Date())
      setTick(p => p + 1)
      // randomly toggle camera status
      setCameras(p => p.map(c => ({
        ...c,
        status: Math.random() > 0.15 ? 'online' : 'offline',
        lastSeen: Math.random() > 0.5 ? 'Just now' : '1 min ago',
      })))
    }, 5000)
    return () => clearInterval(t)
  }, [])

  const onlineCams = cameras.filter(c => c.status === 'online').length

  return (
    <div style={{ background: '#0a1628', minHeight: '100vh', padding: '24px 28px', fontFamily: "'DM Sans', sans-serif", color: '#f1f5f9' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>Live Dashboard</div>
          <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: '6px 12px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 8, fontSize: 11, color: '#34d399', fontWeight: 700 }}>
            🔄 Auto-refresh: 5s
          </div>
          <div style={{ fontSize: 11, color: '#475569' }}>
            Last: {lastRefresh.toLocaleTimeString('en-PK')}
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Employees', value: stats.total, color: '#2dd4bf', icon: '👥' },
          { label: 'Present Today', value: stats.present, color: '#34d399', icon: '✅' },
          { label: 'Absent', value: stats.absent, color: '#f87171', icon: '❌' },
          { label: 'Late Arrivals', value: stats.late, color: '#fbbf24', icon: '⚡' },
          { label: 'On Leave', value: stats.onLeave, color: '#818cf8', icon: '🏖' },
        ].map(c => (
          <div key={c.label} style={{ background: '#131c2e', border: '1px solid #1e2d45', borderRadius: 14, padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 0% 100%, ${c.color}15 0%, transparent 60%)` }} />
            <div style={{ fontSize: 20, marginBottom: 6 }}>{c.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: c.color, fontFamily: 'monospace', lineHeight: 1 }}>{c.value}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, fontWeight: 500 }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Camera Status */}
        <div style={{ background: '#131c2e', border: '1px solid #1e2d45', borderRadius: 16, padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>📷 Camera Status</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{onlineCams}/{cameras.length} Online</div>
          </div>
          {cameras.map(c => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: '#0d1526', borderRadius: 10, marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.status === 'online' ? '#34d399' : '#f87171', boxShadow: c.status === 'online' ? '0 0 6px #34d399' : 'none' }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: '#475569', fontFamily: 'monospace' }}>{c.ip}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: c.status === 'online' ? '#34d399' : '#f87171' }}>{c.status.toUpperCase()}</div>
                <div style={{ fontSize: 10, color: '#475569' }}>{c.lastSeen}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Events */}
        <div style={{ background: '#131c2e', border: '1px solid #1e2d45', borderRadius: 16, padding: '18px 20px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>⚡ Live Events</div>
          {RECENT_EVENTS.map(e => {
            const col = e.status === 'late' ? '#fbbf24' : e.status === 'offline' ? '#f87171' : '#34d399'
            return (
              <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #0f1c30' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: col + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
                    {e.type === 'checkin' ? '↗' : e.type === 'checkout' ? '↙' : '⚠'}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{e.emp}</div>
                    <div style={{ fontSize: 10, color: '#475569' }}>{e.camera}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#94a3b8' }}>{e.time}</div>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: col + '20', color: col, fontWeight: 700 }}>{e.status}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Department Breakdown */}
      <div style={{ background: '#131c2e', border: '1px solid #1e2d45', borderRadius: 16, padding: '18px 20px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>🏢 Department Attendance</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {[
            { dept: 'Engineering', present: 2, total: 2, color: '#2dd4bf' },
            { dept: 'HR', present: 1, total: 1, color: '#818cf8' },
            { dept: 'Finance', present: 1, total: 1, color: '#fb7185' },
            { dept: 'Marketing', present: 0, total: 1, color: '#fbbf24' },
            { dept: 'Operations', present: 1, total: 1, color: '#34d399' },
          ].map(d => (
            <div key={d.dept} style={{ background: '#0d1526', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: d.color, fontFamily: 'monospace' }}>{d.present}/{d.total}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{d.dept}</div>
              <div style={{ height: 4, background: '#1e2d45', borderRadius: 2, marginTop: 8 }}>
                <div style={{ height: '100%', width: `${(d.present / d.total) * 100}%`, background: d.color, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
