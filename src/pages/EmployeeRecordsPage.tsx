// @ts-nocheck
import { useState, useEffect } from 'react'

// ─── Mock Data ────────────────────────────────────────────────────────────────
const EMPLOYEES = [
  { id: 1, code: 'EMP-001', name: 'Zara Ahmed', dept: 'Engineering', designation: 'Senior Developer', dob: '1994-06-22', joiningDate: '2022-03-15', photo: null },
  { id: 2, code: 'EMP-002', name: 'Hassan Malik', dept: 'HR', designation: 'HR Manager', dob: '1990-06-25', joiningDate: '2021-07-01', photo: null },
  { id: 3, code: 'EMP-003', name: 'Ayesha Khan', dept: 'Finance', designation: 'Finance Analyst', dob: '1996-07-02', joiningDate: '2023-01-10', photo: null },
  { id: 4, code: 'EMP-004', name: 'Omar Farooq', dept: 'Engineering', designation: 'Backend Engineer', dob: '1992-12-15', joiningDate: '2022-09-20', photo: null },
  { id: 5, code: 'EMP-005', name: 'Sana Baig', dept: 'Marketing', designation: 'Marketing Lead', dob: '1995-06-28', joiningDate: '2020-11-15', photo: null },
  { id: 6, code: 'EMP-006', name: 'Bilal Siddiqui', dept: 'Operations', designation: 'Ops Executive', dob: '1998-08-10', joiningDate: '2023-06-01', photo: null },
]

const DOC_TYPES = ['CNIC (Front)', 'CNIC (Back)', 'Employment Contract', 'Degree / Education', 'Experience Letter', 'Police Clearance', 'Medical Certificate', 'Bank Statement']

const INIT_DOCUMENTS = [
  { id: 1, empId: 1, type: 'CNIC (Front)', fileName: 'zara_cnic_front.pdf', uploadDate: '2022-03-15', size: '1.2 MB', verified: true },
  { id: 2, empId: 1, type: 'Employment Contract', fileName: 'zara_contract_2022.pdf', uploadDate: '2022-03-15', size: '480 KB', verified: true },
  { id: 3, empId: 1, type: 'Degree / Education', fileName: 'zara_bscs_degree.pdf', uploadDate: '2022-03-16', size: '2.1 MB', verified: true },
  { id: 4, empId: 2, type: 'CNIC (Front)', fileName: 'hassan_cnic.pdf', uploadDate: '2021-07-01', size: '1.1 MB', verified: true },
  { id: 5, empId: 2, type: 'Employment Contract', fileName: 'hassan_contract.pdf', uploadDate: '2021-07-01', size: '460 KB', verified: false },
  { id: 6, empId: 3, type: 'CNIC (Front)', fileName: 'ayesha_cnic.pdf', uploadDate: '2023-01-10', size: '1.3 MB', verified: true },
]

const INIT_APPRAISALS = [
  { id: 1, empId: 1, period: 'Q2 2025', date: '2025-06-15', reviewer: 'Hassan Malik', scores: { quality: 4.5, productivity: 4.2, communication: 4.0, teamwork: 4.8, punctuality: 4.5 }, overallRating: 4.4, status: 'completed', comments: 'Excellent performance, consistently delivers high quality code. Strong team player.', goals: 'Lead the new microservices migration project next quarter.' },
  { id: 2, empId: 2, period: 'Q2 2025', date: '2025-06-10', reviewer: 'Admin', scores: { quality: 4.0, productivity: 4.3, communication: 4.6, teamwork: 4.4, punctuality: 4.8 }, overallRating: 4.4, status: 'completed', comments: 'Great leadership in HR operations, well organized.', goals: 'Implement new performance review framework.' },
  { id: 3, empId: 3, period: 'Q2 2025', date: '2025-06-20', reviewer: 'Hassan Malik', scores: { quality: 3.8, productivity: 3.5, communication: 4.0, teamwork: 4.0, punctuality: 4.5 }, overallRating: 3.9, status: 'pending', comments: '', goals: '' },
  { id: 4, empId: 4, period: 'Q1 2025', date: '2025-03-15', reviewer: 'Zara Ahmed', scores: { quality: 4.2, productivity: 4.0, communication: 3.8, teamwork: 4.3, punctuality: 4.0 }, overallRating: 4.1, status: 'completed', comments: 'Solid backend work, good problem solving skills.', goals: 'Improve API documentation practices.' },
]

const INIT_TRAININGS = [
  { id: 1, empId: 1, title: 'AWS Certified Solutions Architect', type: 'Certification', provider: 'Amazon Web Services', startDate: '2025-01-10', endDate: '2025-03-10', status: 'completed', certificateUrl: 'aws_cert_zara.pdf', expiryDate: '2028-03-10' },
  { id: 2, empId: 1, title: 'Advanced React Patterns', type: 'Training', provider: 'Udemy', startDate: '2025-05-01', endDate: '2025-05-15', status: 'completed', certificateUrl: 'react_cert_zara.pdf', expiryDate: null },
  { id: 3, empId: 2, title: 'SHRM-CP Certification', type: 'Certification', provider: 'SHRM', startDate: '2024-09-01', endDate: '2024-12-01', status: 'completed', certificateUrl: 'shrm_hassan.pdf', expiryDate: '2027-12-01' },
  { id: 4, empId: 3, title: 'Financial Modeling & Valuation', type: 'Training', provider: 'CFI', startDate: '2025-06-01', endDate: '2025-07-01', status: 'in-progress', certificateUrl: null, expiryDate: null },
  { id: 5, empId: 4, title: 'Docker & Kubernetes Mastery', type: 'Training', provider: 'Coursera', startDate: '2025-04-01', endDate: '2025-04-30', status: 'completed', certificateUrl: 'docker_omar.pdf', expiryDate: null },
  { id: 6, empId: 5, title: 'Google Ads Certification', type: 'Certification', provider: 'Google', startDate: '2024-08-01', endDate: '2024-08-15', status: 'completed', certificateUrl: 'gads_sana.pdf', expiryDate: '2025-08-15' },
]

const STATUS_COL = { completed: '#34d399', pending: '#fbbf24', 'in-progress': '#818cf8', expired: '#f87171' }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const daysUntil = (dateStr) => {
  const today = new Date('2026-06-30') // app's "current date"
  const target = new Date(dateStr)
  target.setFullYear(today.getFullYear())
  if (target < today) target.setFullYear(today.getFullYear() + 1)
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24))
}

const getUpcomingEvents = () => {
  const events = []
  EMPLOYEES.forEach(e => {
    const bdayIn = daysUntil(e.dob)
    if (bdayIn <= 30) events.push({ type: 'birthday', emp: e, daysIn: bdayIn, date: e.dob })
    const annivIn = daysUntil(e.joiningDate)
    if (annivIn <= 30) {
      const years = new Date('2026-06-30').getFullYear() - new Date(e.joiningDate).getFullYear() + (annivIn === 0 ? 0 : 1)
      events.push({ type: 'anniversary', emp: e, daysIn: annivIn, date: e.joiningDate, years })
    }
  })
  return events.sort((a, b) => a.daysIn - b.daysIn)
}

const Avatar = ({ name, id, size = 36 }) => {
  const colors = ['#2dd4bf', '#f59e0b', '#818cf8', '#fb7185', '#34d399', '#60a5fa']
  const initials = name.split(' ').map(n => n[0]).join('')
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: colors[id % colors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35, fontWeight: 700, color: '#0f172a', flexShrink: 0 }}>
      {initials}
    </div>
  )
}

const StarRating = ({ value, size = 14 }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} style={{ fontSize: size, color: i <= Math.round(value) ? '#fbbf24' : '#1e2d45' }}>★</span>
    ))}
  </div>
)

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EmployeeRecordsPage() {
  const [tab, setTab] = useState('overview')
  const [documents, setDocuments] = useState(INIT_DOCUMENTS)
  const [appraisals, setAppraisals] = useState(INIT_APPRAISALS)
  const [trainings, setTrainings] = useState(INIT_TRAININGS)
  const [selectedEmp, setSelectedEmp] = useState(EMPLOYEES[0].id)
  const [showUpload, setShowUpload] = useState(false)
  const [showAppraisal, setShowAppraisal] = useState(false)
  const [showTraining, setShowTraining] = useState(false)
  const [viewAppraisal, setViewAppraisal] = useState(null)
  const [docForm, setDocForm] = useState({ type: DOC_TYPES[0], fileName: '' })
  const [apprForm, setApprForm] = useState({ period: '', reviewer: '', quality: 3, productivity: 3, communication: 3, teamwork: 3, punctuality: 3, comments: '', goals: '' })
  const [trainForm, setTrainForm] = useState({ title: '', type: 'Training', provider: '', startDate: '', endDate: '', status: 'in-progress' })

  const events = getUpcomingEvents()
  const emp = EMPLOYEES.find(e => e.id === selectedEmp)

  const empDocs = documents.filter(d => d.empId === selectedEmp)
  const empAppraisals = appraisals.filter(a => a.empId === selectedEmp)
  const empTrainings = trainings.filter(t => t.empId === selectedEmp)

  const inp = { background: '#0d1526', border: '1px solid #1e2d45', borderRadius: 8, padding: '9px 12px', color: '#f1f5f9', fontSize: 13, outline: 'none', width: '100%', fontFamily: 'inherit' }
  const lbl = { fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }

  const uploadDoc = () => {
    if (!docForm.fileName.trim()) return
    setDocuments(p => [...p, { id: Date.now(), empId: selectedEmp, type: docForm.type, fileName: docForm.fileName, uploadDate: new Date().toISOString().split('T')[0], size: (Math.random() * 2 + 0.3).toFixed(1) + ' MB', verified: false }])
    setDocForm({ type: DOC_TYPES[0], fileName: '' })
    setShowUpload(false)
  }

  const saveAppraisal = () => {
    const overall = ((apprForm.quality + apprForm.productivity + apprForm.communication + apprForm.teamwork + apprForm.punctuality) / 5).toFixed(1)
    setAppraisals(p => [{
      id: Date.now(), empId: selectedEmp, period: apprForm.period, date: new Date().toISOString().split('T')[0],
      reviewer: apprForm.reviewer, scores: { quality: apprForm.quality, productivity: apprForm.productivity, communication: apprForm.communication, teamwork: apprForm.teamwork, punctuality: apprForm.punctuality },
      overallRating: Number(overall), status: 'completed', comments: apprForm.comments, goals: apprForm.goals,
    }, ...p])
    setShowAppraisal(false)
    setApprForm({ period: '', reviewer: '', quality: 3, productivity: 3, communication: 3, teamwork: 3, punctuality: 3, comments: '', goals: '' })
  }

  const saveTraining = () => {
    if (!trainForm.title.trim()) return
    setTrainings(p => [{ id: Date.now(), empId: selectedEmp, ...trainForm, certificateUrl: null, expiryDate: null }, ...p])
    setShowTraining(false)
    setTrainForm({ title: '', type: 'Training', provider: '', startDate: '', endDate: '', status: 'in-progress' })
  }

  const TABS = [
    { id: 'overview', label: '🎉 Alerts & Events' },
    { id: 'documents', label: '📁 Documents' },
    { id: 'appraisal', label: '⭐ Performance' },
    { id: 'training', label: '🎓 Training' },
  ]

  return (
    <div style={{ background: '#0a1628', minHeight: '100vh', padding: '28px 32px', fontFamily: "'DM Sans', sans-serif", color: '#f1f5f9' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Employee Records</div>
          <div style={{ fontSize: 13, color: '#475569', marginTop: 3 }}>Documents · Performance Appraisals · Training & Certifications · Events</div>
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

      {/* ─── Overview / Alerts Tab ─── */}
      {tab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
            {[
              { label: 'Upcoming Birthdays', value: events.filter(e => e.type === 'birthday').length, color: '#fb7185', icon: '🎂' },
              { label: 'Upcoming Anniversaries', value: events.filter(e => e.type === 'anniversary').length, color: '#fbbf24', icon: '🎉' },
              { label: 'Total Events (30 days)', value: events.length, color: '#2dd4bf', icon: '📅' },
            ].map(c => (
              <div key={c.label} style={{ background: '#131c2e', border: '1px solid #1e2d45', borderRadius: 16, padding: '18px 20px' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{c.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: c.color, fontFamily: 'monospace' }}>{c.value}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{c.label}</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#131c2e', border: '1px solid #1e2d45', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e2d45', fontSize: 14, fontWeight: 700 }}>🔔 Upcoming Events (Next 30 Days)</div>
            {events.length === 0 && <div style={{ padding: 32, textAlign: 'center', color: '#475569' }}>No upcoming events</div>}
            {events.map((e, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: i < events.length - 1 ? '1px solid #0f1c30' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ fontSize: 28 }}>{e.type === 'birthday' ? '🎂' : '🎉'}</div>
                  <Avatar name={e.emp.name} id={e.emp.id} size={36} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{e.emp.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {e.type === 'birthday' ? '🎂 Birthday' : `🎉 ${e.years} Year Work Anniversary`} · {e.emp.dept}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: e.daysIn === 0 ? '#34d399' : e.daysIn <= 7 ? '#fbbf24' : '#818cf8' }}>
                    {e.daysIn === 0 ? '🎊 Today!' : e.daysIn === 1 ? 'Tomorrow' : `In ${e.daysIn} days`}
                  </div>
                  <div style={{ fontSize: 11, color: '#475569' }}>{new Date(e.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Documents / Appraisal / Training Tabs (need employee selector) ─── */}
      {tab !== 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20 }}>
          {/* Employee List */}
          <div style={{ background: '#131c2e', border: '1px solid #1e2d45', borderRadius: 16, padding: 12, height: 'fit-content' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '4px 8px 10px' }}>Select Employee</div>
            {EMPLOYEES.map(e => (
              <div key={e.id} onClick={() => setSelectedEmp(e.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 10, cursor: 'pointer', background: selectedEmp === e.id ? 'rgba(45,212,191,0.12)' : 'transparent', marginBottom: 2 }}>
                <Avatar name={e.name} id={e.id} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: selectedEmp === e.id ? '#2dd4bf' : '#e2e8f0' }}>{e.name}</div>
                  <div style={{ fontSize: 10, color: '#475569' }}>{e.code}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Content */}
          <div>
            {/* Documents Tab */}
            {tab === 'documents' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>📁 {emp.name}'s Documents</div>
                  <button onClick={() => setShowUpload(true)} style={{ padding: '9px 18px', background: 'linear-gradient(135deg,#2dd4bf,#0ea5e9)', border: 'none', borderRadius: 10, color: '#0f172a', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>+ Upload Document</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  {DOC_TYPES.map(dt => {
                    const doc = empDocs.find(d => d.type === dt)
                    return (
                      <div key={dt} style={{ background: '#131c2e', border: `1px solid ${doc ? '#1e2d45' : '#1e2d4550'}`, borderRadius: 14, padding: '14px 16px', opacity: doc ? 1 : 0.5 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <div style={{ fontSize: 24 }}>{doc ? '📄' : '📋'}</div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700 }}>{dt}</div>
                              {doc ? (
                                <>
                                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{doc.fileName} · {doc.size}</div>
                                  <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>Uploaded {doc.uploadDate}</div>
                                </>
                              ) : (
                                <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>Not uploaded</div>
                              )}
                            </div>
                          </div>
                          {doc && (
                            <span style={{ padding: '2px 8px', borderRadius: 6, background: doc.verified ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.12)', color: doc.verified ? '#34d399' : '#fbbf24', fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>
                              {doc.verified ? '✓ Verified' : 'Pending'}
                            </span>
                          )}
                        </div>
                        {doc && !doc.verified && (
                          <button onClick={() => setDocuments(p => p.map(d => d.id === doc.id ? { ...d, verified: true } : d))} style={{ marginTop: 10, width: '100%', padding: 6, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 8, color: '#34d399', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                            Mark as Verified
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Appraisal Tab */}
            {tab === 'appraisal' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>⭐ {emp.name}'s Performance Appraisals</div>
                  <button onClick={() => setShowAppraisal(true)} style={{ padding: '9px 18px', background: 'linear-gradient(135deg,#2dd4bf,#0ea5e9)', border: 'none', borderRadius: 10, color: '#0f172a', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>+ New Appraisal</button>
                </div>
                {empAppraisals.length === 0 && <div style={{ textAlign: 'center', color: '#475569', padding: 40 }}>No appraisals yet</div>}
                {empAppraisals.map(a => (
                  <div key={a.id} onClick={() => setViewAppraisal(a)} style={{ background: '#131c2e', border: '1px solid #1e2d45', borderRadius: 14, padding: '16px 18px', marginBottom: 12, cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>{a.period}</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Reviewed by {a.reviewer} · {a.date}</div>
                      </div>
                      <span style={{ padding: '3px 10px', borderRadius: 20, background: STATUS_COL[a.status] + '20', color: STATUS_COL[a.status], fontSize: 11, fontWeight: 700 }}>{a.status}</span>
                    </div>
                    {a.status === 'completed' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
                        <StarRating value={a.overallRating} size={16} />
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#fbbf24' }}>{a.overallRating}/5.0</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Training Tab */}
            {tab === 'training' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>🎓 {emp.name}'s Training & Certifications</div>
                  <button onClick={() => setShowTraining(true)} style={{ padding: '9px 18px', background: 'linear-gradient(135deg,#2dd4bf,#0ea5e9)', border: 'none', borderRadius: 10, color: '#0f172a', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>+ Add Training</button>
                </div>
                {empTrainings.length === 0 && <div style={{ textAlign: 'center', color: '#475569', padding: 40 }}>No training records</div>}
                {empTrainings.map(t => (
                  <div key={t.id} style={{ background: '#131c2e', border: '1px solid #1e2d45', borderRadius: 14, padding: '16px 18px', marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ fontSize: 28 }}>{t.type === 'Certification' ? '🏆' : '📚'}</div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>{t.title}</div>
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{t.provider} · {t.type}</div>
                          <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{t.startDate} → {t.endDate}</div>
                          {t.expiryDate && <div style={{ fontSize: 11, color: '#fbbf24', marginTop: 2 }}>Expires: {t.expiryDate}</div>}
                        </div>
                      </div>
                      <span style={{ padding: '3px 10px', borderRadius: 20, background: STATUS_COL[t.status] + '20', color: STATUS_COL[t.status], fontSize: 11, fontWeight: 700 }}>{t.status}</span>
                    </div>
                    {t.certificateUrl && (
                      <div style={{ marginTop: 10, padding: '6px 12px', background: '#0d1526', borderRadius: 8, fontSize: 12, color: '#2dd4bf', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        📜 {t.certificateUrl}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUpload && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowUpload(false)}>
          <div style={{ background: '#0d1526', border: '1px solid #1e2d45', borderRadius: 20, width: 440, padding: 28 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>📁 Upload Document</div>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Document Type</label>
              <select value={docForm.type} onChange={e => setDocForm(p => ({ ...p, type: e.target.value }))} style={inp}>
                {DOC_TYPES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={lbl}>File Name</label>
              <input value={docForm.fileName} onChange={e => setDocForm(p => ({ ...p, fileName: e.target.value }))} style={inp} placeholder="e.g. cnic_front.pdf" />
              <div style={{ fontSize: 11, color: '#475569', marginTop: 6 }}>📌 File picker simulated — type a filename to register the document</div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowUpload(false)} style={{ flex: 1, padding: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid #1e2d45', borderRadius: 10, color: '#64748b', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
              <button onClick={uploadDoc} style={{ flex: 2, padding: 10, background: 'linear-gradient(135deg,#2dd4bf,#0ea5e9)', border: 'none', borderRadius: 10, color: '#0f172a', fontWeight: 800, cursor: 'pointer' }}>Upload</button>
            </div>
          </div>
        </div>
      )}

      {/* New Appraisal Modal */}
      {showAppraisal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setShowAppraisal(false)}>
          <div style={{ background: '#0d1526', border: '1px solid #1e2d45', borderRadius: 20, width: 520, maxHeight: '90vh', overflowY: 'auto', padding: 28 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>⭐ New Performance Appraisal</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div><label style={lbl}>Review Period</label><input value={apprForm.period} onChange={e => setApprForm(p => ({ ...p, period: e.target.value }))} style={inp} placeholder="e.g. Q3 2025" /></div>
              <div><label style={lbl}>Reviewer</label><input value={apprForm.reviewer} onChange={e => setApprForm(p => ({ ...p, reviewer: e.target.value }))} style={inp} placeholder="Reviewer name" /></div>
            </div>
            {[['quality', 'Quality of Work'], ['productivity', 'Productivity'], ['communication', 'Communication'], ['teamwork', 'Teamwork'], ['punctuality', 'Punctuality']].map(([k, label]) => (
              <div key={k} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <label style={lbl}>{label}</label>
                  <span style={{ fontSize: 12, color: '#2dd4bf', fontWeight: 700 }}>{apprForm[k]}/5</span>
                </div>
                <input type="range" min="1" max="5" step="0.5" value={apprForm[k]} onChange={e => setApprForm(p => ({ ...p, [k]: Number(e.target.value) }))} style={{ width: '100%', accentColor: '#2dd4bf' }} />
              </div>
            ))}
            <div style={{ marginBottom: 12 }}><label style={lbl}>Comments</label><textarea value={apprForm.comments} onChange={e => setApprForm(p => ({ ...p, comments: e.target.value }))} style={{ ...inp, height: 60, resize: 'none' }} placeholder="Performance comments..." /></div>
            <div style={{ marginBottom: 8 }}><label style={lbl}>Goals for Next Period</label><textarea value={apprForm.goals} onChange={e => setApprForm(p => ({ ...p, goals: e.target.value }))} style={{ ...inp, height: 50, resize: 'none' }} placeholder="Goals..." /></div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => setShowAppraisal(false)} style={{ flex: 1, padding: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid #1e2d45', borderRadius: 10, color: '#64748b', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
              <button onClick={saveAppraisal} style={{ flex: 2, padding: 10, background: 'linear-gradient(135deg,#2dd4bf,#0ea5e9)', border: 'none', borderRadius: 10, color: '#0f172a', fontWeight: 800, cursor: 'pointer' }}>Submit Appraisal</button>
            </div>
          </div>
        </div>
      )}

      {/* View Appraisal Detail */}
      {viewAppraisal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setViewAppraisal(null)}>
          <div style={{ background: '#0d1526', border: '1px solid #1e2d45', borderRadius: 20, width: 480, padding: 28 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{viewAppraisal.period} Review</div>
              <button onClick={() => setViewAppraisal(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            {viewAppraisal.status === 'completed' ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <StarRating value={viewAppraisal.overallRating} size={20} />
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#fbbf24' }}>{viewAppraisal.overallRating}/5.0</div>
                </div>
                {Object.entries(viewAppraisal.scores).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #0f1c30' }}>
                    <span style={{ fontSize: 13, color: '#94a3b8', textTransform: 'capitalize' }}>{k}</span>
                    <StarRating value={v} size={13} />
                  </div>
                ))}
                <div style={{ marginTop: 14, padding: 12, background: '#131c2e', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, marginBottom: 4 }}>COMMENTS</div>
                  <div style={{ fontSize: 13, color: '#e2e8f0' }}>{viewAppraisal.comments}</div>
                </div>
                <div style={{ marginTop: 10, padding: 12, background: '#131c2e', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, marginBottom: 4 }}>GOALS</div>
                  <div style={{ fontSize: 13, color: '#e2e8f0' }}>{viewAppraisal.goals}</div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: '#475569', padding: 20 }}>Appraisal pending</div>
            )}
          </div>
        </div>
      )}

      {/* New Training Modal */}
      {showTraining && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowTraining(false)}>
          <div style={{ background: '#0d1526', border: '1px solid #1e2d45', borderRadius: 20, width: 460, padding: 28 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>🎓 Add Training / Certification</div>
            <div style={{ marginBottom: 12 }}><label style={lbl}>Title</label><input value={trainForm.title} onChange={e => setTrainForm(p => ({ ...p, title: e.target.value }))} style={inp} placeholder="e.g. AWS Certification" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div><label style={lbl}>Type</label>
                <select value={trainForm.type} onChange={e => setTrainForm(p => ({ ...p, type: e.target.value }))} style={inp}>
                  <option>Training</option><option>Certification</option><option>Workshop</option>
                </select>
              </div>
              <div><label style={lbl}>Provider</label><input value={trainForm.provider} onChange={e => setTrainForm(p => ({ ...p, provider: e.target.value }))} style={inp} placeholder="Provider" /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div><label style={lbl}>Start Date</label><input type="date" value={trainForm.startDate} onChange={e => setTrainForm(p => ({ ...p, startDate: e.target.value }))} style={inp} /></div>
              <div><label style={lbl}>End Date</label><input type="date" value={trainForm.endDate} onChange={e => setTrainForm(p => ({ ...p, endDate: e.target.value }))} style={inp} /></div>
            </div>
            <div style={{ marginBottom: 8 }}><label style={lbl}>Status</label>
              <select value={trainForm.status} onChange={e => setTrainForm(p => ({ ...p, status: e.target.value }))} style={inp}>
                <option value="in-progress">In Progress</option><option value="completed">Completed</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button onClick={() => setShowTraining(false)} style={{ flex: 1, padding: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid #1e2d45', borderRadius: 10, color: '#64748b', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
              <button onClick={saveTraining} style={{ flex: 2, padding: 10, background: 'linear-gradient(135deg,#2dd4bf,#0ea5e9)', border: 'none', borderRadius: 10, color: '#0f172a', fontWeight: 800, cursor: 'pointer' }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
