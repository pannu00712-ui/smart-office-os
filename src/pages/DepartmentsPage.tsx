// @ts-nocheck
import { useState, useEffect } from 'react'
import { api } from '../lib/api'

const COLORS = ['#2dd4bf','#818cf8','#fb7185','#fbbf24','#34d399','#60a5fa','#f97316','#a78bfa','#e879f9','#4ade80']

const empty = () => ({ name: '', head: '', budget: '', location: '', description: '', color: COLORS[0], active: true })

export default function DepartmentsPage() {
  const [depts, setDepts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [modal, setModal] = useState(null) // null | { type: 'add'|'edit'|'delete', dept?: any }
  const [form, setForm] = useState(empty())
  const [search, setSearch] = useState('')
  const [confirmDel, setConfirmDel] = useState(null)

  const load = () => {
    setLoading(true)
    setError('')
    api.getDepartments()
      .then(res => setDepts(Array.isArray(res) ? res : res?.data || []))
      .catch(err => setError(err.message || 'Failed to load departments'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = depts.filter(d => (d.name || '').toLowerCase().includes(search.toLowerCase()) || (d.head || '').toLowerCase().includes(search.toLowerCase()))

  const openAdd = () => { setForm(empty()); setModal({ type: 'add' }) }
  const openEdit = (d) => { setForm({ ...d, budget: String(d.budget) }); setModal({ type: 'edit', dept: d }) }

  const save = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    setError('')
    try {
      const payload = { ...form, budget: Number(form.budget) || 0 }
      if (modal.type === 'add') {
        await api.createDepartment(payload)
      } else {
        await api.updateDepartment(modal.dept.id, payload)
      }
      setModal(null)
      load()
    } catch (err) {
      setError(err.message || 'Failed to save department')
    } finally {
      setSaving(false)
    }
  }

  const deleteDept = async (id) => {
    setError('')
    try {
      await api.deleteDepartment(id)
      setConfirmDel(null)
      load()
    } catch (err) {
      setError(err.message || 'Failed to delete department')
      setConfirmDel(null)
    }
  }

  const toggleActive = async (d) => {
    setError('')
    try {
      await api.updateDepartment(d.id, { ...d, active: !d.active })
      load()
    } catch (err) {
      setError(err.message || 'Failed to update department')
    }
  }

  const inp = { background: '#131c2e', border: '1px solid #1e2d45', borderRadius: 10, padding: '9px 14px', color: '#f1f5f9', fontSize: 13, outline: 'none', width: '100%', fontFamily: 'inherit' }
  const lbl = { fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }

  return (
    <div style={{ background: '#0a1628', minHeight: '100vh', padding: '28px 32px', fontFamily: "'DM Sans', sans-serif", color: '#f1f5f9' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Departments</div>
          <div style={{ fontSize: 13, color: '#475569', marginTop: 3 }}>Manage departments, heads & budgets</div>
        </div>
        <button onClick={openAdd} style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#2dd4bf,#0ea5e9)', border: 'none', borderRadius: 10, color: '#0f172a', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
          + New Department
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Departments', value: depts.length, color: '#2dd4bf' },
          { label: 'Active', value: depts.filter(d => d.active).length, color: '#34d399' },
          { label: 'Total Employees', value: depts.reduce((s, d) => s + d.employees, 0), color: '#818cf8' },
          { label: 'Total Budget', value: 'PKR ' + depts.reduce((s, d) => s + d.budget, 0).toLocaleString(), color: '#fbbf24' },
        ].map(c => (
          <div key={c.label} style={{ background: '#131c2e', border: '1px solid #1e2d45', borderRadius: 16, padding: '18px 20px' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: c.color, fontFamily: 'monospace' }}>{c.value}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search departments..." style={{ ...inp, width: 300, marginBottom: 20 }} />

      {error && <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '10px 14px', color: '#f87171', fontSize: 12, marginBottom: 16 }}>⚠ {error}</div>}

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#64748b', fontSize: 13 }}>Loading departments…</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#64748b', fontSize: 13 }}>No departments found.</div>
      ) : (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {filtered.map(d => (
          <div key={d.id} style={{ background: '#131c2e', border: `1px solid ${d.active ? '#1e2d45' : '#0f1c30'}`, borderRadius: 16, overflow: 'hidden', opacity: d.active ? 1 : 0.6 }}>
            <div style={{ height: 6, background: d.color }} />
            <div style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{d.description}</div>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: 20, background: d.active ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)', color: d.active ? '#34d399' : '#f87171', fontSize: 11, fontWeight: 700 }}>
                  {d.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[
                  ['👤 Head', d.head],
                  ['📍 Location', d.location],
                  ['👥 Employees', d.employees],
                  ['💰 Budget', 'PKR ' + d.budget.toLocaleString()],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: '#0d1526', borderRadius: 8, padding: '8px 12px' }}>
                    <div style={{ fontSize: 10, color: '#475569', fontWeight: 700 }}>{k}</div>
                    <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600, marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEdit(d)} style={{ flex: 1, padding: '7px', background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.3)', borderRadius: 8, color: '#818cf8', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Edit</button>
                <button onClick={() => toggleActive(d)} style={{ flex: 1, padding: '7px', background: d.active ? 'rgba(251,191,36,0.1)' : 'rgba(52,211,153,0.1)', border: `1px solid ${d.active ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'}`, borderRadius: 8, color: d.active ? '#fbbf24' : '#34d399', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>{d.active ? 'Deactivate' : 'Activate'}</button>
                <button onClick={() => setConfirmDel(d)} style={{ padding: '7px 12px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, color: '#f87171', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>🗑</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Add/Edit Modal */}
      {modal && modal.type !== 'delete' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setModal(null)}>
          <div style={{ background: '#0d1526', border: '1px solid #1e2d45', borderRadius: 20, width: 520, padding: 28 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>{modal.type === 'add' ? '+ New Department' : 'Edit Department'}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div><label style={lbl}>Department Name *</label><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={inp} placeholder="e.g. Sales" /></div>
              <div><label style={lbl}>Head / Manager</label><input value={form.head} onChange={e => setForm(p => ({ ...p, head: e.target.value }))} style={inp} placeholder="Name" /></div>
              <div><label style={lbl}>Budget (PKR)</label><input type="number" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} style={inp} placeholder="0" /></div>
              <div><label style={lbl}>Location</label><input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} style={inp} placeholder="Floor / Room" /></div>
            </div>
            <div style={{ marginBottom: 16 }}><label style={lbl}>Description</label><textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ ...inp, height: 70, resize: 'none' }} placeholder="Department description..." /></div>
            <div style={{ marginBottom: 20 }}>
              <label style={lbl}>Color</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {COLORS.map(c => (
                  <div key={c} onClick={() => setForm(p => ({ ...p, color: c }))} style={{ width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer', border: form.color === c ? '3px solid #fff' : '3px solid transparent' }} />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid #1e2d45', borderRadius: 10, color: '#64748b', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
              <button onClick={save} disabled={saving} style={{ flex: 2, padding: 10, background: 'linear-gradient(135deg,#2dd4bf,#0ea5e9)', border: 'none', borderRadius: 10, color: '#0f172a', fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving…' : 'Save Department'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirmDel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0d1526', border: '1px solid #1e2d45', borderRadius: 16, padding: 28, width: 380, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Delete "{confirmDel.name}"?</div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>This action cannot be undone.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDel(null)} style={{ flex: 1, padding: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid #1e2d45', borderRadius: 10, color: '#94a3b8', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
              <button onClick={() => deleteDept(confirmDel.id)} style={{ flex: 1, padding: 10, background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.4)', borderRadius: 10, color: '#f87171', cursor: 'pointer', fontWeight: 800 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
