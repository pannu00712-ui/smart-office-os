// @ts-nocheck
import { useState } from 'react'

const INITIAL_SHIFTS = [
  { id: 1, name: 'Morning (9–6)', startTime: '09:00', endTime: '18:00', checkInBuffer: 10, lateAfter: 15, earlyLeaveBuffer: 10, breakDuration: 60, breakStart: '13:00', breakEnd: '14:00', overtimeAfter: 30, overtimeRate: 1.5, halfDayHours: 4, gracePeriod: 5, active: true, color: '#2dd4bf' },
  { id: 2, name: 'Evening (2–11)', startTime: '14:00', endTime: '23:00', checkInBuffer: 10, lateAfter: 15, earlyLeaveBuffer: 10, breakDuration: 60, breakStart: '18:00', breakEnd: '19:00', overtimeAfter: 30, overtimeRate: 1.5, halfDayHours: 4, gracePeriod: 5, active: true, color: '#818cf8' },
  { id: 3, name: 'Night (10–7)', startTime: '22:00', endTime: '07:00', checkInBuffer: 10, lateAfter: 20, earlyLeaveBuffer: 10, breakDuration: 60, breakStart: '02:00', breakEnd: '03:00', overtimeAfter: 30, overtimeRate: 2.0, halfDayHours: 4, gracePeriod: 5, active: true, color: '#fb7185' },
  { id: 4, name: 'Flexi', startTime: '08:00', endTime: '20:00', checkInBuffer: 60, lateAfter: 60, earlyLeaveBuffer: 60, breakDuration: 60, breakStart: '12:00', breakEnd: '13:00', overtimeAfter: 60, overtimeRate: 1.25, halfDayHours: 4, gracePeriod: 30, active: true, color: '#fbbf24' },
]

const emptyShift = () => ({
  name: '', startTime: '09:00', endTime: '18:00',
  checkInBuffer: 10, lateAfter: 15, earlyLeaveBuffer: 10,
  breakDuration: 60, breakStart: '13:00', breakEnd: '14:00',
  overtimeAfter: 30, overtimeRate: 1.5, halfDayHours: 4,
  gracePeriod: 5, active: true, color: '#2dd4bf',
})

const COLORS = ['#2dd4bf','#818cf8','#fb7185','#fbbf24','#34d399','#60a5fa','#f97316','#a78bfa']

export default function ShiftsPage() {
  const [shifts, setShifts] = useState(INITIAL_SHIFTS)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyShift())

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const save = () => {
    if (!form.name.trim()) return
    if (modal?.type === 'edit') {
      setShifts(p => p.map(s => s.id === modal.shift.id ? { ...s, ...form } : s))
    } else {
      setShifts(p => [...p, { ...form, id: Date.now() }])
    }
    setModal(null)
  }

  const inp = { background: '#0d1526', border: '1px solid #1e2d45', borderRadius: 8, padding: '8px 12px', color: '#f1f5f9', fontSize: 13, outline: 'none', width: '100%', fontFamily: 'inherit' }
  const lbl = { fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }

  const calcHours = (s) => {
    const [sh, sm] = s.startTime.split(':').map(Number)
    const [eh, em] = s.endTime.split(':').map(Number)
    let diff = (eh * 60 + em) - (sh * 60 + sm)
    if (diff < 0) diff += 24 * 60
    return ((diff - s.breakDuration) / 60).toFixed(1)
  }

  return (
    <div style={{ background: '#0a1628', minHeight: '100vh', padding: '28px 32px', fontFamily: "'DM Sans', sans-serif", color: '#f1f5f9' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Shift Management</div>
          <div style={{ fontSize: 13, color: '#475569', marginTop: 3 }}>Configure shifts with check-in, check-out, break & overtime rules</div>
        </div>
        <button onClick={() => { setForm(emptyShift()); setModal({ type: 'add' }) }} style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#2dd4bf,#0ea5e9)', border: 'none', borderRadius: 10, color: '#0f172a', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
          + New Shift
        </button>
      </div>

      {/* Shift Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
        {shifts.map(s => (
          <div key={s.id} style={{ background: '#131c2e', border: '1px solid #1e2d45', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ height: 5, background: s.color }} />
            <div style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>{s.name}</div>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{s.startTime} → {s.endTime} · {calcHours(s)} hrs/day</div>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: 20, background: s.active ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)', color: s.active ? '#34d399' : '#f87171', fontSize: 11, fontWeight: 700 }}>
                  {s.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Rules Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                {[
                  ['⏰ Check-in Buffer', `±${s.checkInBuffer} min`],
                  ['⚡ Late After', `${s.lateAfter} min`],
                  ['🚪 Early Leave', `±${s.earlyLeaveBuffer} min`],
                  ['☕ Break', `${s.breakDuration} min (${s.breakStart}–${s.breakEnd})`],
                  ['📈 OT After', `${s.overtimeAfter} min`],
                  ['💰 OT Rate', `${s.overtimeRate}x`],
                  ['⏳ Half Day', `< ${s.halfDayHours} hrs`],
                  ['🕐 Grace Period', `${s.gracePeriod} min`],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: '#0d1526', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: 10, color: '#475569', fontWeight: 600 }}>{k}</div>
                    <div style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 700, marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setForm({ ...s }); setModal({ type: 'edit', shift: s }) }}
                  style={{ flex: 1, padding: '7px', background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.3)', borderRadius: 8, color: '#818cf8', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                  Edit
                </button>
                <button onClick={() => setShifts(p => p.map(x => x.id === s.id ? { ...x, active: !x.active } : x))}
                  style={{ flex: 1, padding: '7px', background: s.active ? 'rgba(251,191,36,0.08)' : 'rgba(52,211,153,0.08)', border: `1px solid ${s.active ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'}`, borderRadius: 8, color: s.active ? '#fbbf24' : '#34d399', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                  {s.active ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => setShifts(p => p.filter(x => x.id !== s.id))}
                  style={{ padding: '7px 12px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, color: '#f87171', cursor: 'pointer', fontSize: 12 }}>
                  🗑
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setModal(null)}>
          <div style={{ background: '#0d1526', border: '1px solid #1e2d45', borderRadius: 20, width: 600, maxHeight: '90vh', overflowY: 'auto', padding: 28 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>{modal.type === 'add' ? '+ New Shift' : 'Edit Shift'}</div>

            <div style={{ display: 'grid', gap: 16 }}>
              {/* Basic */}
              <div style={{ background: '#131c2e', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#2dd4bf', marginBottom: 12, textTransform: 'uppercase' }}>Basic Info</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div style={{ gridColumn: '1 / -1' }}><label style={lbl}>Shift Name *</label><input value={form.name} onChange={e => set('name', e.target.value)} style={inp} placeholder="e.g. Morning Shift" /></div>
                  <div><label style={lbl}>Start Time</label><input type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)} style={inp} /></div>
                  <div><label style={lbl}>End Time</label><input type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)} style={inp} /></div>
                  <div><label style={lbl}>Half Day (hrs)</label><input type="number" value={form.halfDayHours} onChange={e => set('halfDayHours', +e.target.value)} style={inp} /></div>
                </div>
              </div>

              {/* Check In/Out */}
              <div style={{ background: '#131c2e', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', marginBottom: 12, textTransform: 'uppercase' }}>Check-In / Check-Out Rules</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div><label style={lbl}>Grace Period (min)</label><input type="number" value={form.gracePeriod} onChange={e => set('gracePeriod', +e.target.value)} style={inp} /></div>
                  <div><label style={lbl}>Late After (min)</label><input type="number" value={form.lateAfter} onChange={e => set('lateAfter', +e.target.value)} style={inp} /></div>
                  <div><label style={lbl}>Check-in Buffer (min)</label><input type="number" value={form.checkInBuffer} onChange={e => set('checkInBuffer', +e.target.value)} style={inp} /></div>
                  <div><label style={lbl}>Early Leave (min)</label><input type="number" value={form.earlyLeaveBuffer} onChange={e => set('earlyLeaveBuffer', +e.target.value)} style={inp} /></div>
                </div>
              </div>

              {/* Break */}
              <div style={{ background: '#131c2e', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', marginBottom: 12, textTransform: 'uppercase' }}>Break Time</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div><label style={lbl}>Duration (min)</label><input type="number" value={form.breakDuration} onChange={e => set('breakDuration', +e.target.value)} style={inp} /></div>
                  <div><label style={lbl}>Break Start</label><input type="time" value={form.breakStart} onChange={e => set('breakStart', e.target.value)} style={inp} /></div>
                  <div><label style={lbl}>Break End</label><input type="time" value={form.breakEnd} onChange={e => set('breakEnd', e.target.value)} style={inp} /></div>
                </div>
              </div>

              {/* Overtime */}
              <div style={{ background: '#131c2e', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#34d399', marginBottom: 12, textTransform: 'uppercase' }}>Overtime</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><label style={lbl}>OT Starts After (min)</label><input type="number" value={form.overtimeAfter} onChange={e => set('overtimeAfter', +e.target.value)} style={inp} /></div>
                  <div><label style={lbl}>OT Rate (multiplier)</label><input type="number" step="0.25" value={form.overtimeRate} onChange={e => set('overtimeRate', +e.target.value)} style={inp} /></div>
                </div>
              </div>

              {/* Color */}
              <div>
                <label style={lbl}>Shift Color</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {COLORS.map(c => <div key={c} onClick={() => set('color', c)} style={{ width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer', border: form.color === c ? '3px solid #fff' : '3px solid transparent' }} />)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid #1e2d45', borderRadius: 10, color: '#64748b', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
              <button onClick={save} style={{ flex: 2, padding: 10, background: 'linear-gradient(135deg,#2dd4bf,#0ea5e9)', border: 'none', borderRadius: 10, color: '#0f172a', fontWeight: 800, cursor: 'pointer' }}>Save Shift</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
