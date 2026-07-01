// @ts-nocheck
// src/lib/api.ts — change BASE_URL to your server PC's LAN IP
// e.g. http://192.168.1.100:4000/api

function getStoredUrl() {
  try { return localStorage.getItem('soos_api_url') || 'http://localhost:4000/api'; } catch { return 'http://localhost:4000/api'; }
}

function getToken() {
  try { return localStorage.getItem('access_token') || ''; } catch { return ''; }
}

// Builds a query string, dropping undefined/null/empty values
// (so e.g. `{ severity: filter || undefined }` doesn't turn into "?severity=undefined").
function qs(params) {
  if (!params) return '';
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );
  const s = new URLSearchParams(clean).toString();
  return s ? `?${s}` : '';
}

async function requestRaw(method, path, body) {
  const BASE_URL = getStoredUrl();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) { const e = await res.json().catch(() => ({ error: res.statusText })); throw new Error(e.error || 'Failed'); }
  return res;
}

async function request(method, path, body) {
  const res = await requestRaw(method, path, body);
  return res.json();
}

// For CSV/file downloads — returns a Blob instead of parsing JSON.
async function requestBlob(method, path, body) {
  const res = await requestRaw(method, path, body);
  return res.blob();
}

export const api = {
  login: (email, password) => request('POST', '/auth/login', { email, password }),
  me: () => request('GET', '/auth/me'),
  createUser: (data) => request('POST', '/auth/users', data),
  getEmployees: () => request('GET', '/employees'),
  createEmployee: (data) => request('POST', '/employees', data),
  updateEmployee: (id, data) => request('PUT', `/employees/${id}`, data),
  deleteEmployee: (id) => request('DELETE', `/employees/${id}`),
  getAttendance: (params) => request('GET', `/attendance${qs(params)}`),
  checkIn: (data) => request('POST', '/attendance/checkin', data),
  checkOut: (data) => request('POST', '/attendance/checkout', data),
  overrideAttendance: (id, data) => request('PUT', `/attendance/${id}/override`, data),
  getCameras: () => request('GET', '/cameras'),
  discoverCameras: () => request('GET', '/cameras/discover'),
  addCamera: (data) => request('POST', '/cameras', data),
  updateCamera: (id, data) => request('PUT', `/cameras/${id}`, data),
  deleteCamera: (id) => request('DELETE', `/cameras/${id}`),
  getCameraLogs: (id) => request('GET', `/cameras/${id}/logs`),
  getDepartments: () => request('GET', '/departments'),
  createDepartment: (data) => request('POST', '/departments', data),
  updateDepartment: (id, data) => request('PUT', `/departments/${id}`, data),
  deleteDepartment: (id) => request('DELETE', `/departments/${id}`),
  getShifts: () => request('GET', '/shifts'),
  createShift: (data) => request('POST', '/shifts', data),
  updateShift: (id, data) => request('PUT', `/shifts/${id}`, data),
  deleteShift: (id) => request('DELETE', `/shifts/${id}`),
  getPayroll: (month) => request('GET', `/payroll/${month}`),
  runPayroll: (month, ids) => request('POST', `/payroll/run/${month}`, { employee_ids: ids }),
  getLoans: () => request('GET', '/payroll/loans/all'),
  createLoan: (data) => request('POST', '/payroll/loans', data),
  getBonuses: (month) => request('GET', `/payroll/bonuses/${month}`),
  createBonus: (data) => request('POST', '/payroll/bonuses', data),
  updateBonusStatus: (id, status) => request('PUT', `/payroll/bonuses/${id}/status`, { status }),
  getLeaves: () => request('GET', '/leaves'),
  applyLeave: (data) => request('POST', '/leaves', data),
  approveLeave: (id, approve) => request('PUT', `/leaves/${id}/approve`, { approve }),
  getLogs: (params) => request('GET', `/logs${qs(params)}`),
  getNotifications: () => request('GET', '/notifications'),
  markRead: (id) => request('PUT', `/notifications/${id}/read`, {}),
  markAllRead: () => request('PUT', '/notifications/read-all', {}),
  getBackups: () => request('GET', '/backup'),
  runBackup: () => request('POST', '/backup/run', {}),
  restoreBackup: (id) => request('POST', `/backup/restore/${id}`, {}),
  ping: () => request('GET', '/../ping'),
  setServerUrl: (url) => { try { localStorage.setItem('soos_api_url', url); } catch {} },
  getServerUrl: () => { try { return localStorage.getItem('soos_api_url') || 'http://localhost:4000/api'; } catch { return 'http://localhost:4000/api'; } },
};

// ─── Resource-scoped API clients ──────────────────────────────────────────────
// These wrap `api` above but return `{ data }` (matching how the pages consume
// them, e.g. `const r = await cameraApi.list(); setCameras(r.data)`).

export const cameraApi = {
  list: async () => ({ data: await request('GET', '/cameras') }),
  discover: async () => ({ data: await request('GET', '/cameras/discover') }),
  create: (data) => request('POST', '/cameras', data),
  update: (id, data) => request('PUT', `/cameras/${id}`, data),
  delete: (id) => request('DELETE', `/cameras/${id}`),
  logs: async (id) => ({ data: await request('GET', `/cameras/${id}/logs`) }),
};

export const attendanceApi = {
  list: async (params) => ({ data: await request('GET', `/attendance${qs(params)}`) }),
  checkin: (data) => request('POST', '/attendance/checkin', data),
  checkout: (data) => request('POST', '/attendance/checkout', data),
  override: (id, data) => request('PUT', `/attendance/${id}/override`, data),
};

// NOTE: the backend (as of the last build) does not yet expose an /alerts
// route — only /notifications. This client is wired up and ready, but the
// backend route needs to be added before this will return real data.
export const alertApi = {
  list: async (params) => ({ data: await request('GET', `/alerts${qs(params)}`) }),
  acknowledge: (id) => request('PUT', `/alerts/${id}/acknowledge`, {}),
  markAllRead: () => request('PUT', '/alerts/read-all', {}),
};

// NOTE: the backend does not yet expose /reports/daily, /reports/monthly, or
// /reports/export either — same caveat as alertApi above.
export const reportApi = {
  daily: async (params) => ({ data: await request('GET', `/reports/daily${qs(params)}`) }),
  monthly: async (params) => ({ data: await request('GET', `/reports/monthly${qs(params)}`) }),
  exportCsv: async (params) => ({ data: await requestBlob('GET', `/reports/export${qs(params)}`) }),
};

export function connectWebSocket(onMessage) {
  const wsUrl = getStoredUrl().replace('http', 'ws').replace('/api', '');
  const ws = new WebSocket(wsUrl);
  ws.onmessage = (e) => { try { onMessage(JSON.parse(e.data)); } catch {} };
  ws.onclose = () => setTimeout(() => connectWebSocket(onMessage), 3000);
  return ws;
}
