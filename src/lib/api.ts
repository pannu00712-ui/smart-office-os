// ─── DEMO MODE — No backend required ──────────────────────────
export default {} as any

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms))

const DEMO_USERS: Record<string, any> = {
  'admin@soos.io': { password: 'admin123', role: 'super_admin' },
  'admin@demo.com': { password: 'Admin@1234', role: 'super_admin' },
}

export const authApi = {
  login: async (email: string, password: string) => {
    await delay()
    const u = DEMO_USERS[email]
    if (!u || u.password !== password) throw { response: { status: 401, data: { detail: 'Invalid credentials' } } }
    const token = 'demo_token_' + Date.now()
    return { data: { access_token: token, user: { id: '1', email, role: u.role, org_id: 'demo' } } }
  },
  me: async () => {
    await delay()
    const email = localStorage.getItem('demo_email') || 'admin@soos.io'
    return { data: { id: '1', email, role: 'super_admin', org_id: 'demo' } }
  },
}

export const employeeApi = {
  list:   async (..._: any[]) => { await delay(); return { data: [] } },
  get:    async (..._: any[]) => { await delay(); return { data: null } },
  create: async (data: any)   => { await delay(); return { data: { ...data, id: String(Date.now()) } } },
  update: async (_: any, data: any) => { await delay(); return { data } },
  delete: async (..._: any[]) => { await delay(); return { data: {} } },
  enroll: async (..._: any[]) => { await delay(); return { data: { success: true } } },
  enrollmentStatus: async (..._: any[]) => { await delay(); return { data: { enrolled: false, photos: 0 } } },
}

const today = new Date().toISOString().split('T')[0]

export const attendanceApi = {
  list:    async (..._: any[]) => { await delay(); return { data: [] } },
  summary: async (..._: any[]) => { await delay(); return { data: { total_employees: 6, present: 4, absent: 1, late: 1, on_break: 0, not_yet_arrived: 0 } } },
  live:    async (..._: any[]) => { await delay(); return { data: { presence_list: [] } } },
  today:   async (..._: any[]) => { await delay(); return { data: null } },
  history: async (..._: any[]) => { await delay(); return { data: [] } },
  override: async (..._: any[]) => { await delay(); return { data: {} } },
  timeline: async (..._: any[]) => { await delay(); return { data: [] } },
}

export const cameraApi = {
  list:   async (..._: any[]) => { await delay(); return { data: [] } },
  create: async (data: any)   => { await delay(); return { data: { ...data, id: String(Date.now()) } } },
  update: async (..._: any[]) => { await delay(); return { data: {} } },
  delete: async (..._: any[]) => { await delay(); return { data: {} } },
  status: async (..._: any[]) => { await delay(); return { data: { online: false } } },
}

const ALERTS = [
  { id: '1', type: 'late_arrival', message: 'Hassan Malik arrived 15 minutes late', severity: 'medium', acknowledged: false, is_read: false, created_at: new Date().toISOString() },
  { id: '2', type: 'absent', message: 'Ayesha Khan is absent today', severity: 'high', acknowledged: false, is_read: false, created_at: new Date().toISOString() },
  { id: '3', type: 'system', message: 'System backup completed successfully', severity: 'low', acknowledged: true, is_read: true, created_at: new Date().toISOString() },
]

export const alertApi = {
  list:        async (..._: any[]) => { await delay(); return { data: ALERTS } },
  unreadCount: async (..._: any[]) => { await delay(); return { data: { unread_count: ALERTS.filter(a => !a.acknowledged).length } } },
  acknowledge: async (id: string) => { await delay(); const a = ALERTS.find(x => x.id === id); if (a) { a.acknowledged = true; a.is_read = true; } return { data: {} } },
  resolve:     async (id: string) => { await delay(); const i = ALERTS.findIndex(x => x.id === id); if (i >= 0) ALERTS.splice(i, 1); return { data: {} } },
  markAllRead: async (..._: any[]) => { await delay(); ALERTS.forEach(a => { a.acknowledged = true; a.is_read = true; }); return { data: {} } },
}

export const reportApi = {
  daily:     async (..._: any[]) => { await delay(); return { data: { records: [], summary: { present: 4, absent: 1, late: 1 } } } },
  monthly:   async (..._: any[]) => { await delay(); return { data: { records: [], summary: {} } } },
  breaks:    async (..._: any[]) => { await delay(); return { data: [] } },
  exportCsv: async (..._: any[]) => { await delay(); return { data: new Blob(['Employee,Date,Status\nDemo,'+today+',present']) } },
}
