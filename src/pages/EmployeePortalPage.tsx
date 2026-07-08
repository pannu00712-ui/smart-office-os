// @ts-nocheck
import { useState, useEffect } from 'react'
import { attendanceApi } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const MY_LEAVES = []

const MY_PAYSLIPS = []

const ATTENDANCE = []

const STATUS_MAP = {
  approved: { color: '#34d399', bg: 'rgba(52,211,153,0.12)', label: 'Approved' },
  pending:  { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', label: 'Pending' },
  rejected: { color: '#f87171', bg: 'rgba(248,113,113,0.12)', label: 'Rejected' },
  paid:     { color: '#2dd4bf', bg: 'rgba(45,212,191,0.12)', label: 'Paid' },
}

const ATT_MAP = {
  present: '#34d399', late: '#fbbf24', absent: '#f87171', sunday: '#475569',
}

export default function EmployeePortalPage() {
  const { user } = useAuthStore()
  const MY_DATA = {
    code: user?.code || user?.email || '-',
    name: user?.name || 'Employee',
    email: user?.email || '-',
    department: user?.department || '-',
    designation: user?.designation || user?.role || '-',
    shift: user?.shift || '-',
    joiningDate: user?.joiningDate || '-',
    leave: { annual: 0, sick: 0, casual: 0, annualUsed: 0, sickUsed: 0, casualUsed: 0 },
  }

  const [tab, setTab] = useState('overview')
  const [leaves, setLeaves] = useState(MY_LEAVES)
  const [showApply, setShowApply] = useState(false)
  const [form, setForm] = useState({ type: 'Annual', from: '', to: '', reason: '' })
  const [msg, setMsg] = useState('')

  // Real check-in/check-out, backed by the local backend (server/data/db.json)
  const [today, setToday] = useState(null) // today's attendance record, or null if not checked in yet
  const [busy, setBusy] = useState(false)

  const loadToday = () => {
    const dateStr = new Date().toISOString().slice(0, 10)
    attendanceApi.list({ date_from: dateStr, date_to: dateStr })
      .then(r => {
        const mine = (r.data || []).find(rec => String(rec.employee_id) === MY_DATA.code)
        setToday(mine || null)
      })
      .catch(() => {})
  }

  useEffect(() => { loadToday() }, [])

  const doCheckIn = () => {
    setBusy(true)
    attendanceApi.checkin({ employee_id: MY_DATA.code, employee_name: MY_DATA.name })
      .then(() => { toast.success('Checked in!'); loadToday() })
      .catch(e => toast.error(e.message || 'Check-in failed'))
      .finally(() => setBusy(false))
  }

  const doCheckOut = () => {
    setBusy(true)
    attendanceApi.checkout({ employee_id: MY_DATA.code })
      .then(() => { toast.success('Checked out!'); loadToday() })
      .catch(e => toast.error(e.message || 'Check-out failed'))
      .finally(() => setBusy(false))
  }

  const calcDays = () => {
    if (!form.from || !form.to) return 0
    const diff = (new Date(form.to) - new Date(form.from)) / (1000*60*60*24) + 1
    return Math.max(0, diff)
  }

  const applyLeave = () => {
    if (!form.from || !form.to || !form.reason.trim()) { setMsg('Please fill all fields'); return }
    setLeaves(p => [{
      id: Date.now(), type: form.type, from: form.from, to: form.to,
      days: calcDays(), reason: form.reason, status: 'pending',
      appliedOn: new Date().toISOString().split('T')[0],
    }, ...p])
    setShowApply(false)
    setForm({ type: 'Annual', from: '', to: '', reason: '' })
    setMsg('Leave application submitted! Awaiting HR approval.')
    setTimeout(() => setMsg(''), 4000)
  }

  const TABS = [
    { id: 'overview', label: '🏠 Overview' },
    { id: 'leave', label: '📅 Leave' },
    { id: 'payslips', label: '💰 Payslips' },
    { id: 'attendance', label: '⏰ Attendance' },
  ]

  const inp = { background: '#0d1526', border: '1px solid #1e2d45', borderRadius: 8, padding: '9px 12px', color: '#f1f5f9', fontSize: 13, outline: 'none', width: '100%', fontFamily: 'inherit' }
  const lbl = { fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }

  return (
    <div style={{ background: '#0a1628', minHeight: '100vh', padding: '28px 32px', fontFamily: "'DM Sans', sans-serif", color: '#f1f5f9' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#2dd4bf', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{MY_DATA.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{MY_DATA.name}</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>{MY_DATA.code} · {MY_DATA.designation} · {MY_DATA.department}</div>
          </div>
        </div>
        <div style={{ padding: '8px 16px', background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.3)', borderRadius: 10, fontSize: 12, color: '#2dd4bf', fontWeight: 700 }}>
          🟢 Employee Portal
        </div>
      </div>

      {msg && <div style={{ padding: '12px 16px', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 10, color: '#34d399', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>{msg}</div>}

      {/* Today's Check In / Check Out — writes to the real backend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#131c2e', border: '1px solid #1e2d45', borderRadius: 16, padding: '16px 20px', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Today</div>
          <div style={{ fontSize: 14, marginTop: 4 }}>
            {!today && <span style={{ color: '#94a3b8' }}>Not checked in yet</span>}
            {today && !today.check_out_time && <span style={{ color: '#34d399', fontWeight: 700 }}>Checked in at {new Date(today.check_in_time).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}</span>}
            {today && today.check_out_time && <span style={{ color: '#60a5fa', fontWeight: 700 }}>Checked out at {new Date(today.check_out_time).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })} · {today.total_hours}h worked</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={doCheckIn} disabled={busy || (today && !today.check_out_time)}
            style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#2dd4bf,#0ea5e9)', border: 'none', borderRadius: 10, color: '#0f172a', fontWeight: 800, fontSize: 13, cursor: 'pointer', opacity: (busy || (today && !today.check_out_time)) ? 0.5 : 1 }}>
            ↗ Check In
          </button>
          <button onClick={doCheckOut} disabled={busy || !today || !!today.check_out_time}
            style={{ padding: '10px 20px', background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: 10, color: '#60a5fa', fontWeight: 800, fontSize: 13, cursor: 'pointer', opacity: (busy || !today || !!today.check_out_time) ? 0.5 : 1 }}>
            ↙ Check Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#131c2e', border: '1px solid #1e2d45', borderRadius: 12, padding: 4, marginBottom: 24, width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: tab === t.id ? 'rgba(45,212,191,0.15)' : 'none', color: tab === t.id ? '#2dd4bf' : '#64748b', cursor: 'pointer', fontSize: 13, fontWeight: tab === t.id ? 700 : 500 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Leave Balance */}
          <div style={{ background: '#131c2e', border: '1px solid #1e2d45', borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#2dd4bf' }}>📅 Leave Balance</div>
            {[
              { type: 'Annual', total: MY_DATA.leave.annual, used: MY_DATA.leave.annualUsed, color: '#818cf8' },
              { type: 'Sick', total: MY_DATA.leave.sick, used: MY_DATA.leave.sickUsed, color: '#fb7185' },
              { type: 'Casual', total: MY_DATA.leave.casual, used: MY_DATA.leave.casualUsed, color: '#fbbf24' },
            ].map(l => (
              <div key={l.type} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>{l.type} Leave</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: l.color }}>{l.total - l.used} / {l.total} remaining</span>
                </div>
                <div style={{ height: 6, background: '#0d1526', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: `${l.total ? (l.used / l.total) * 100 : 0}%`, background: l.color, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Info */}
          <div style={{ background: '#131c2e', border: '1px solid #1e2d45', borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#818cf8' }}>👤 My Info</div>
            {[
              ['Department', MY_DATA.department],
              ['Designation', MY_DATA.designation],
              ['Shift', MY_DATA.shift],
              ['Joining Date', MY_DATA.joiningDate],
              ['Email', MY_DATA.email],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #0f1c30' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>{k}</span>
                <span style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Recent Attendance */}
          <div style={{ background: '#131c2e', border: '1px solid #1e2d45', borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#34d399' }}>⏰ Recent Attendance</div>
            {ATTENDANCE.length === 0 && <div style={{ fontSize: 12, color: '#475569', padding: '8px 0' }}>No attendance records yet</div>}
            {ATTENDANCE.slice(0, 4).map(a => (
              <div key={a.date} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #0f1c30' }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>{a.date}</span>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: ATT_MAP[a.status] + '20', color: ATT_MAP[a.status], fontWeight: 700, textTransform: 'capitalize' }}>{a.status}</span>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{a.checkIn} – {a.checkOut}</span>
              </div>
            ))}
          </div>

          {/* Last Payslip */}
          <div style={{ background: '#131c2e', border: '1px solid #1e2d45', borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#fbbf24' }}>💰 Last Payslip{MY_PAYSLIPS[0] ? ` — ${MY_PAYSLIPS[0].month}` : ''}</div>
            {!MY_PAYSLIPS[0] && <div style={{ fontSize: 12, color: '#475569', padding: '8px 0' }}>No payslips yet</div>}
            {MY_PAYSLIPS[0] && [
              ['Gross Salary', MY_PAYSLIPS[0].gross, '#34d399'],
              ['Deductions', MY_PAYSLIPS[0].deductions, '#f87171'],
              ['Net Pay', MY_PAYSLIPS[0].net, '#2dd4bf'],
            ].map(([k, v, c]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #0f1c30' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>{k}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: c, fontFamily: 'monospace' }}>PKR {v.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leave Tab */}
      {tab === 'leave' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button onClick={() => setShowApply(true)} style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#2dd4bf,#0ea5e9)', border: 'none', borderRadius: 10, color: '#0f172a', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
              + Apply Leave
            </button>
          </div>
          <div style={{ background: '#131c2e', border: '1px solid #1e2d45', borderRadius: 16, overflow: 'hidden' }}>
            {leaves.length === 0 && <div style={{ fontSize: 13, color: '#475569', padding: '24px', textAlign: 'center' }}>No leave applications yet</div>}
            {leaves.map((l, i) => {
              const s = STATUS_MAP[l.status]
              return (
                <div key={l.id} style={{ display: 'grid', gridTemplateColumns: '100px 120px 180px 1fr 90px', gap: 0, padding: '14px 20px', borderBottom: i < leaves.length - 1 ? '1px solid #0f1c30' : 'none', alignItems: 'center' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 6, background: '#818cf820', color: '#818cf8', fontSize: 11, fontWeight: 700, width: 'fit-content' }}>{l.type}</span>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{l.from} → {l.to}</div>
                  <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>{l.days} day{l.days > 1 ? 's' : ''}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{l.reason}</div>
                  <span style={{ padding: '4px 10px', borderRadius: 20, background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, textAlign: 'center' }}>{s.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Payslips Tab */}
      {tab === 'payslips' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {MY_PAYSLIPS.length === 0 && <div style={{ fontSize: 13, color: '#475569', padding: '24px', textAlign: 'center' }}>No payslips yet</div>}
          {MY_PAYSLIPS.map(p => (
            <div key={p.month} style={{ background: '#131c2e', border: '1px solid #1e2d45', borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{p.month}</div>
              <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: 11, color: '#64748b' }}>Gross</div><div style={{ fontSize: 14, fontWeight: 700, color: '#34d399', fontFamily: 'monospace' }}>PKR {p.gross.toLocaleString()}</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: 11, color: '#64748b' }}>Deductions</div><div style={{ fontSize: 14, fontWeight: 700, color: '#f87171', fontFamily: 'monospace' }}>-{p.deductions.toLocaleString()}</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: 11, color: '#64748b' }}>Net Pay</div><div style={{ fontSize: 16, fontWeight: 800, color: '#2dd4bf', fontFamily: 'monospace' }}>PKR {p.net.toLocaleString()}</div></div>
                <span style={{ padding: '4px 12px', borderRadius: 20, background: STATUS_MAP.paid.bg, color: STATUS_MAP.paid.color, fontSize: 11, fontWeight: 700 }}>Paid</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Attendance Tab */}
      {tab === 'attendance' && (
        <div style={{ background: '#131c2e', border: '1px solid #1e2d45', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 1fr 1fr 120px', padding: '10px 20px', borderBottom: '1px solid #1e2d45', background: '#0d1526' }}>
            {['Date', 'Check In', 'Check Out', 'Hours', 'Status'].map(h => <div key={h} style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>{h}</div>)}
          </div>
          {ATTENDANCE.length === 0 && <div style={{ fontSize: 13, color: '#475569', padding: '24px', textAlign: 'center' }}>No attendance records yet</div>}
          {ATTENDANCE.map((a, i) => (
            <div key={a.date} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 1fr 1fr 120px', padding: '12px 20px', borderBottom: i < ATTENDANCE.length - 1 ? '1px solid #0f1c30' : 'none', alignItems: 'center' }}>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>{a.date}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: a.checkIn === '-' ? '#475569' : '#34d399', fontFamily: 'monospace' }}>{a.checkIn}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: a.checkOut === '-' ? '#475569' : '#60a5fa', fontFamily: 'monospace' }}>{a.checkOut}</div>
              <div style={{ fontSize: 13, color: '#e2e8f0', fontFamily: 'monospace' }}>{a.hours}</div>
              <span style={{ padding: '3px 10px', borderRadius: 6, background: ATT_MAP[a.status] + '20', color: ATT_MAP[a.status], fontSize: 11, fontWeight: 700, textTransform: 'capitalize', width: 'fit-content' }}>{a.status}</span>
            </div>
          ))}
        </div>
      )}

      {/* Apply Leave Modal */}
      {showApply && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowApply(false)}>
          <div style={{ background: '#0d1526', border: '1px solid #1e2d45', borderRadius: 20, width: 480, padding: 28 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>📅 Apply for Leave</div>
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={lbl}>Leave Type</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={inp}>
                  <option>Annual</option><option>Sick</option><option>Casual</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={lbl}>From Date</label><input type="date" value={form.from} onChange={e => setForm(p => ({ ...p, from: e.target.value }))} style={inp} /></div>
                <div><label style={lbl}>To Date</label><input type="date" value={form.to} onChange={e => setForm(p => ({ ...p, to: e.target.value }))} style={inp} /></div>
              </div>
              {calcDays() > 0 && <div style={{ padding: '8px 14px', background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.3)', borderRadius: 8, fontSize: 13, color: '#2dd4bf', fontWeight: 600 }}>📌 Total: {calcDays()} day{calcDays() > 1 ? 's' : ''}</div>}
              <div><label style={lbl}>Reason *</label><textarea value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} style={{ ...inp, height: 80, resize: 'none' }} placeholder="Reason for leave..." /></div>
              {msg && <div style={{ color: '#f87171', fontSize: 12 }}>{msg}</div>}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowApply(false)} style={{ flex: 1, padding: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid #1e2d45', borderRadius: 10, color: '#64748b', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
              <button onClick={applyLeave} style={{ flex: 2, padding: 10, background: 'linear-gradient(135deg,#2dd4bf,#0ea5e9)', border: 'none', borderRadius: 10, color: '#0f172a', fontWeight: 800, cursor: 'pointer' }}>Submit Application</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
