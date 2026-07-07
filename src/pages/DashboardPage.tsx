// @ts-nocheck
import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { usePersistedState } from '../hooks/usePersistedState'

const DEPT_COLORS = ['#2dd4bf', '#818cf8', '#fb7185', '#fbbf24', '#34d399', '#60a5fa', '#f97316', '#a78bfa']

const todayStr = () => new Date().toISOString().slice(0, 10)

export default function DashboardPage() {
  const [employees, setEmployees] = useState([])
  const [attendance, setAttendance] = useState([])
  const [departments, setDepartments] = useState([])
  const [cameras] = usePersistedState('soos_cameras', [])
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    Promise.all([
      api.getEmployees().catch(() => []),
      api.getAttendance({ date_from: todayStr(), date_to: todayStr() }).catch(() => []),
      api.getDepartments().catch(() => []),
    ]).then(([emp, att, dep]) => {
      setEmployees(Array.isArray(emp) ? emp : [])
      setAttendance(Array.isArray(att) ? att : [])
      setDepartments(Array.isArray(dep) ? dep : [])
      setError('')
      setLastRefresh(new Date())
      setLoading(false)
    }).catch((e) => {
      setError(e.message || 'Failed to load dashboard data')
      setLoading(false)
    })
  }

  useEffect(() => {
    load()
    // Refresh from the real backend periodically instead of faking random
    // numbers — this reflects actual check-ins/check-outs as they happen.
    const t = setInterval(load, 15000)
    return () => clearInterval(t)
  }, [])

  // ── Derived stats (all computed from real employees/attendance data) ──
  const total = employees.length
  const attByEmpId = new Map(attendance.map(a => [String(a.employee_id), a]))
  const activeEmployees = employees.filter(e => e.status !== 'inactive')
  const presentToday = activeEmployees.filter(e => attByEmpId.get(String(e.id))?.status === 'present').length
  const lateToday = activeEmployees.filter(e => attByEmpId.get(String(e.id))?.status === 'late').length
  const checkedIn = presentToday + lateToday
  const absentToday = Math.max(activeEmployees.length - checkedIn, 0)

  const onlineCams = cameras.length // no real online/offline probing in this offline build — count what's configured

  // Most recent check-ins/check-outs today, newest first
  const recentEvents = [...attendance]
    .sort((a, b) => new Date(b.check_in_time || 0) - new Date(a.check_in_time || 0))
    .slice(0, 6)

  const empName = (id) => {
    const e = employees.find(e => String(e.id) === String(id))
    return e ? `${e.firstName || ''} ${e.lastName || ''}`.trim() : 'Unknown'
  }
  const empDept = (id) => {
    const e = employees.find(e => String(e.id) === String(id))
    return e?.department || '-'
  }

  // Department breakdown from real departments + who's checked in today
  const deptList = departments.length
    ? departments.map(d => d.name)
    : [...new Set(employees.map(e => e.department).filter(Boolean))]

  const deptStats = deptList.map((name, i) => {
    const deptEmps = activeEmployees.filter(e => e.department === name)
    const present = deptEmps.filter(e => {
      const st = attByEmpId.get(String(e.id))?.status
      return st === 'present' || st === 'late'
    }).length
    return { dept: name, present, total: deptEmps.length, color: DEPT_COLORS[i % DEPT_COLORS.length] }
  })

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
            🔄 Auto-refresh: 15s
          </div>
          <div style={{ fontSize: 11, color: '#475569' }}>
            Last: {lastRefresh.toLocaleTimeString('en-PK')}
          </div>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, color: '#f87171', fontSize: 12 }}>
          {error}
        </div>
      )}

      {/* Main Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Employees', value: total, color: '#2dd4bf', icon: '👥' },
          { label: 'Present Today', value: presentToday + lateToday, color: '#34d399', icon: '✅' },
          { label: 'Absent', value: absentToday, color: '#f87171', icon: '❌' },
          { label: 'Late Arrivals', value: lateToday, color: '#fbbf24', icon: '⚡' },
          { label: 'Cameras Configured', value: cameras.length, color: '#818cf8', icon: '📷' },
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
            <div style={{ fontSize: 11, color: '#64748b' }}>{onlineCams} configured</div>
          </div>
          {cameras.length === 0 && (
            <div style={{ padding: '20px 0', textAlign: 'center', color: '#475569', fontSize: 12 }}>No cameras added yet — add one in the Cameras page.</div>
          )}
          {cameras.map(c => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: '#0d1526', borderRadius: 10, marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px #34d399' }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: '#475569', fontFamily: 'monospace' }}>{c.location_desc || c.rtsp_url || '—'}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#34d399' }}>CONFIGURED</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Events */}
        <div style={{ background: '#131c2e', border: '1px solid #1e2d45', borderRadius: 16, padding: '18px 20px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>⚡ Live Events</div>
          {recentEvents.length === 0 && (
            <div style={{ padding: '20px 0', textAlign: 'center', color: '#475569', fontSize: 12 }}>No check-ins today yet.</div>
          )}
          {recentEvents.map(e => {
            const col = e.status === 'late' ? '#fbbf24' : '#34d399'
            const time = e.check_in_time ? new Date(e.check_in_time).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }) : '-'
            return (
              <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #0f1c30' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: col + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
                    {e.check_out_time ? '↙' : '↗'}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{e.employee_name || empName(e.employee_id)}</div>
                    <div style={{ fontSize: 10, color: '#475569' }}>{empDept(e.employee_id)}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#94a3b8' }}>{time}</div>
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
        {deptStats.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#475569', fontSize: 12, padding: 20 }}>No departments yet — add some in the Departments page.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(deptStats.length, 5)}, 1fr)`, gap: 12 }}>
            {deptStats.map(d => (
              <div key={d.dept} style={{ background: '#0d1526', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: d.color, fontFamily: 'monospace' }}>{d.present}/{d.total}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{d.dept}</div>
                <div style={{ height: 4, background: '#1e2d45', borderRadius: 2, marginTop: 8 }}>
                  <div style={{ height: '100%', width: `${d.total ? (d.present / d.total) * 100 : 0}%`, background: d.color, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
