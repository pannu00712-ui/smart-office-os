// @ts-nocheck
import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'

const SEV_MAP = {
  info:   { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8', label: 'Info' },
  low:    { bg: 'rgba(52,211,153,0.12)',  color: '#34d399', label: 'Low' },
  medium: { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24', label: 'Medium' },
  high:   { bg: 'rgba(248,113,113,0.12)', color: '#f87171', label: 'High' },
}

const MOD_COLORS = {
  Employees: '#2dd4bf', Payroll: '#818cf8', Cameras: '#fb7185', Departments: '#fbbf24',
  Shifts: '#34d399', Auth: '#60a5fa', System: '#94a3b8', 'Employee Portal': '#f97316',
}

export default function LogsPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState({ module: 'All', severity: 'All', search: '' })

  const load = useCallback(() => {
    setError('')
    api.getLogs({
      module: filter.module !== 'All' ? filter.module : undefined,
      severity: filter.severity !== 'All' ? filter.severity : undefined,
      search: filter.search || undefined,
    })
      .then(res => setLogs(Array.isArray(res) ? res : res?.data || []))
      .catch(err => setError(err.message || 'Failed to load logs'))
      .finally(() => setLoading(false))
  }, [filter.module, filter.severity, filter.search])

  // Initial load + refetch whenever filters change
  useEffect(() => { setLoading(true); load() }, [load])

  // Poll for new entries every 30s (logs are written server-side by other actions)
  useEffect(() => {
    const t = setInterval(load, 30000)
    return () => clearInterval(t)
  }, [load])

  const modules = ['All', ...Array.from(new Set(logs.map(l => l.module)))]
  const severities = ['All', 'info', 'low', 'medium', 'high']

  const fmt = (ts) => {
    const d = new Date(ts)
    return d.toLocaleDateString('en-PK') + ' ' + d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const exportLogs = () => {
    const csv = ['Timestamp,User,Role,Action,Target,Detail,Module,Severity,IP',
      ...logs.map(l => `"${fmt(l.ts)}","${l.user}","${l.role}","${l.action}","${l.target}","${l.detail}","${l.module}","${l.severity}","${l.ip}"`)
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `soos-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const inp = { background: '#131c2e', border: '1px solid #1e2d45', borderRadius: 8, padding: '8px 12px', color: '#f1f5f9', fontSize: 12, outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }

  return (
    <div style={{ background: '#0a1628', minHeight: '100vh', padding: '28px 32px', fontFamily: "'DM Sans', sans-serif", color: '#f1f5f9' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Audit Logs</div>
          <div style={{ fontSize: 13, color: '#475569', marginTop: 3 }}>Permanent, non-deletable activity trail — all admin actions recorded</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ padding: '8px 14px', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, color: '#f87171', fontSize: 12, fontWeight: 700 }}>
            🔒 Logs cannot be deleted
          </div>
          <button onClick={exportLogs} style={{ padding: '9px 18px', background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.3)', borderRadius: 10, color: '#818cf8', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
            📥 Export CSV
          </button>
        </div>
      </div>

      {error && <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '10px 14px', color: '#f87171', fontSize: 12, marginBottom: 16 }}>⚠ {error}</div>}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Logs', value: logs.length, color: '#2dd4bf' },
          { label: 'High Severity', value: logs.filter(l => l.severity === 'high').length, color: '#f87171' },
          { label: 'Today', value: logs.filter(l => new Date(l.ts).toDateString() === new Date().toDateString()).length, color: '#fbbf24' },
          { label: 'System Events', value: logs.filter(l => l.user === 'system').length, color: '#94a3b8' },
        ].map(c => (
          <div key={c.label} style={{ background: '#131c2e', border: '1px solid #1e2d45', borderRadius: 16, padding: '16px 20px' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: c.color, fontFamily: 'monospace' }}>{c.value}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input value={filter.search} onChange={e => setFilter(p => ({ ...p, search: e.target.value }))} placeholder="Search action, user, target..." style={{ ...inp, width: 250 }} />
        <select value={filter.module} onChange={e => setFilter(p => ({ ...p, module: e.target.value }))} style={inp}>
          {modules.map(m => <option key={m}>{m}</option>)}
        </select>
        <select value={filter.severity} onChange={e => setFilter(p => ({ ...p, severity: e.target.value }))} style={inp}>
          {severities.map(s => <option key={s} value={s}>{s === 'All' ? 'All Severity' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: '#475569', display: 'flex', alignItems: 'center' }}>
          {loading ? 'Loading…' : `Showing ${logs.length} logs`}
        </div>
      </div>

      {/* Logs Table */}
      <div style={{ background: '#131c2e', border: '1px solid #1e2d45', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '180px 150px 160px 1fr 100px 80px', padding: '10px 16px', borderBottom: '1px solid #1e2d45', background: '#0d1526' }}>
          {['Timestamp', 'User', 'Action', 'Details', 'Module', 'Severity'].map(h => (
            <div key={h} style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
          ))}
        </div>
        <div style={{ maxHeight: 'calc(100vh - 380px)', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#64748b', fontSize: 13 }}>Loading logs…</div>
          ) : logs.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#64748b', fontSize: 13 }}>No logs found.</div>
          ) : logs.map((l, i) => {
            const sev = SEV_MAP[l.severity] || SEV_MAP.info
            const modColor = MOD_COLORS[l.module] || '#94a3b8'
            return (
              <div key={l.id} style={{ display: 'grid', gridTemplateColumns: '180px 150px 160px 1fr 100px 80px', padding: '10px 16px', borderBottom: i < logs.length - 1 ? '1px solid #0f1c30' : 'none', alignItems: 'center' }}>
                <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>{fmt(l.ts)}</div>
                <div>
                  <div style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 600 }}>{l.user}</div>
                  <div style={{ fontSize: 10, color: '#475569' }}>{(l.role || '').replace('_', ' ')}</div>
                </div>
                <div style={{ fontSize: 12, color: '#2dd4bf', fontWeight: 700, fontFamily: 'monospace' }}>{l.action}</div>
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{l.target}</div>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{l.detail}</div>
                </div>
                <div>
                  <span style={{ padding: '3px 8px', borderRadius: 6, background: modColor + '20', color: modColor, fontSize: 10, fontWeight: 700 }}>{l.module}</span>
                </div>
                <div>
                  <span style={{ padding: '3px 8px', borderRadius: 6, background: sev.bg, color: sev.color, fontSize: 10, fontWeight: 700 }}>{sev.label}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
