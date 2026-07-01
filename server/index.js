// Smart Office OS — local backend server
// Runs entirely on this PC. Data is saved to server/data/db.json, so it
// survives app restarts, PC restarts, etc. No internet connection or
// external database needed.
const express = require('express');
const cors = require('cors');
const { readDb, writeDb, nextId, writeLog } = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Every request except /ping and /api/auth/login must include a token.
// This is a simple local/offline app, so the "token" is just a marker —
// not meant to be secure against network attackers, only to keep the
// same shape the frontend already expects.
function makeToken(user) {
  return `local-token-${user.id}-${Date.now()}`;
}

app.get('/ping', (req, res) => res.json({ ok: true }));

// ── Auth ────────────────────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const db = readDb();
  const user = db.users.find(
    (u) => u.email.toLowerCase() === String(email || '').toLowerCase() && u.password === password
  );
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  const { password: _pw, ...safeUser } = user;
  writeDb((() => { writeLog(db, { user: user.email, role: user.role, action: 'Login', target: user.email, detail: 'Signed in', module: 'Auth', severity: 'info' }); return db; })());
  res.json({ token: makeToken(user), user: safeUser });
});

app.get('/api/auth/me', (req, res) => {
  // Without real session storage we just trust the frontend already has
  // the user info from login; this endpoint exists for compatibility.
  res.json({ user: null });
});

app.post('/api/auth/users', (req, res) => {
  const db = readDb();
  const { name, email, password, role } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'A user with that email already exists' });
  }
  const user = { id: nextId(db.users), name: name || '', email, password, role: role || 'user' };
  db.users.push(user);
  writeDb(db);
  const { password: _pw, ...safeUser } = user;
  res.json({ user: safeUser });
});

// ── Generic CRUD helper for simple collections ──────────────────────────
// `moduleName` labels entries in the Logs page (e.g. "Employees").
// `nameOf(item)` picks a human-readable label for the log's "target" field.
function crud(collectionName, moduleName, nameOf = (item) => item.name || `#${item.id}`) {
  const router = express.Router();

  router.get('/', (req, res) => {
    const db = readDb();
    res.json(db[collectionName]);
  });

  router.post('/', (req, res) => {
    const db = readDb();
    const item = { ...req.body, id: nextId(db[collectionName]) };
    db[collectionName].push(item);
    writeLog(db, { action: 'Create', target: nameOf(item), detail: `Added new ${moduleName.toLowerCase()} record`, module: moduleName, severity: 'low' });
    writeDb(db);
    res.json(item);
  });

  router.put('/:id', (req, res) => {
    const db = readDb();
    const id = String(req.params.id);
    const idx = db[collectionName].findIndex((x) => String(x.id) === id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    db[collectionName][idx] = { ...db[collectionName][idx], ...req.body, id: db[collectionName][idx].id };
    writeLog(db, { action: 'Update', target: nameOf(db[collectionName][idx]), detail: `Updated ${moduleName.toLowerCase()} record`, module: moduleName, severity: 'info' });
    writeDb(db);
    res.json(db[collectionName][idx]);
  });

  router.delete('/:id', (req, res) => {
    const db = readDb();
    const id = String(req.params.id);
    const removed = db[collectionName].find((x) => String(x.id) === id);
    const before = db[collectionName].length;
    db[collectionName] = db[collectionName].filter((x) => String(x.id) !== id);
    if (removed) writeLog(db, { action: 'Delete', target: nameOf(removed), detail: `Deleted ${moduleName.toLowerCase()} record`, module: moduleName, severity: 'medium' });
    writeDb(db);
    res.json({ success: true, deleted: before !== db[collectionName].length });
  });

  return router;
}

app.use('/api/employees', crud('employees', 'Employees', (e) => `${e.firstName || ''} ${e.lastName || ''}`.trim() || e.code || `#${e.id}`));
app.use('/api/departments', crud('departments', 'Departments', (d) => d.name || `#${d.id}`));
app.use('/api/shifts', crud('shifts', 'Shifts', (s) => s.name || `#${s.id}`));

// ── Attendance (slightly different shape: filtering + check-in/out) ─────
app.get('/api/attendance', (req, res) => {
  const db = readDb();
  let records = db.attendance;
  const { date_from, date_to, status } = req.query;
  if (date_from) records = records.filter((r) => r.date >= date_from);
  if (date_to) records = records.filter((r) => r.date <= date_to);
  if (status) records = records.filter((r) => r.status === status);
  res.json(records);
});

app.post('/api/attendance/checkin', (req, res) => {
  const db = readDb();
  const record = {
    id: nextId(db.attendance),
    date: new Date().toISOString().slice(0, 10),
    checkIn: new Date().toISOString(),
    checkOut: null,
    status: 'present',
    ...req.body,
  };
  db.attendance.push(record);
  writeLog(db, { action: 'Check-in', target: record.employee_name || `Employee #${record.employee_id ?? ''}`, detail: 'Checked in', module: 'Employees', severity: 'info' });
  writeDb(db);
  res.json(record);
});

app.post('/api/attendance/checkout', (req, res) => {
  const db = readDb();
  const { employee_id } = req.body || {};
  const idx = db.attendance.findIndex(
    (r) => String(r.employee_id) === String(employee_id) && !r.checkOut
  );
  if (idx === -1) return res.status(404).json({ error: 'No open check-in found' });
  db.attendance[idx].checkOut = new Date().toISOString();
  writeLog(db, { action: 'Check-out', target: db.attendance[idx].employee_name || `Employee #${employee_id}`, detail: 'Checked out', module: 'Employees', severity: 'info' });
  writeDb(db);
  res.json(db.attendance[idx]);
});

app.put('/api/attendance/:id/override', (req, res) => {
  const db = readDb();
  const id = String(req.params.id);
  const idx = db.attendance.findIndex((r) => String(r.id) === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.attendance[idx] = { ...db.attendance[idx], ...req.body };
  writeLog(db, { action: 'Override', target: db.attendance[idx].employee_name || `Attendance #${id}`, detail: 'Attendance record manually overridden', module: 'Employees', severity: 'medium' });
  writeDb(db);
  res.json(db.attendance[idx]);
});

// ── Logs (audit trail) ───────────────────────────────────────────────────
// Populated automatically by the actions above — Employees, Departments,
// Shifts, Attendance, Payroll all write here so the Logs page shows real,
// persisted history instead of nothing.
app.get('/api/logs', (req, res) => {
  const db = readDb();
  let logs = db.logs;
  const { module, severity, search } = req.query;
  if (module) logs = logs.filter((l) => l.module === module);
  if (severity) logs = logs.filter((l) => l.severity === severity);
  if (search) {
    const q = String(search).toLowerCase();
    logs = logs.filter((l) =>
      [l.action, l.user, l.target, l.detail].some((f) => (f || '').toLowerCase().includes(q))
    );
  }
  // Most recent first
  res.json([...logs].sort((a, b) => new Date(b.ts) - new Date(a.ts)));
});

// ── Payroll: loans, bonuses, payroll runs ────────────────────────────────
app.get('/api/payroll/loans/all', (req, res) => {
  const db = readDb();
  res.json(db.loans);
});

app.post('/api/payroll/loans', (req, res) => {
  const db = readDb();
  const loan = { ...req.body, id: nextId(db.loans) };
  db.loans.push(loan);
  writeLog(db, { action: 'Create Loan', target: loan.empName || `Employee #${loan.empId}`, detail: `${loan.type} — PKR ${loan.principal}`, module: 'Payroll', severity: 'low' });
  writeDb(db);
  res.json(loan);
});

app.get('/api/payroll/bonuses/:month', (req, res) => {
  const db = readDb();
  const { month } = req.params;
  res.json(db.bonuses.filter((b) => b.month === month));
});

app.post('/api/payroll/bonuses', (req, res) => {
  const db = readDb();
  const bonus = { ...req.body, id: nextId(db.bonuses) };
  db.bonuses.push(bonus);
  writeLog(db, { action: 'Create Bonus', target: bonus.empName || `Employee #${bonus.empId}`, detail: `${bonus.type} — PKR ${bonus.amount}`, module: 'Payroll', severity: 'low' });
  writeDb(db);
  res.json(bonus);
});

app.put('/api/payroll/bonuses/:id/status', (req, res) => {
  const db = readDb();
  const id = String(req.params.id);
  const idx = db.bonuses.findIndex((b) => String(b.id) === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.bonuses[idx].status = req.body.status;
  writeLog(db, { action: 'Update Bonus Status', target: db.bonuses[idx].empName || `Bonus #${id}`, detail: `Status set to ${req.body.status}`, module: 'Payroll', severity: 'info' });
  writeDb(db);
  res.json(db.bonuses[idx]);
});

app.get('/api/payroll/:month', (req, res) => {
  const db = readDb();
  const { month } = req.params;
  res.json(db.payrollRuns.filter((r) => r.month === month));
});

app.post('/api/payroll/run/:month', (req, res) => {
  const db = readDb();
  const { month } = req.params;
  const { employee_ids = [] } = req.body || {};
  const run = { id: nextId(db.payrollRuns), month, employee_ids, ran_at: new Date().toISOString() };
  db.payrollRuns.push(run);
  writeLog(db, { action: 'Run Payroll', target: month, detail: `Processed payroll for ${employee_ids.length} employee(s)`, module: 'Payroll', severity: 'medium' });
  writeDb(db);
  res.json(run);
});

// ── Alerts ────────────────────────────────────────────────────────────────
// Starts empty — nothing in the app currently generates alerts
// automatically, but they'll persist here once something does (or once
// you add alerts manually via the API).
app.get('/api/alerts', (req, res) => {
  const db = readDb();
  let alerts = db.alerts;
  const { severity, limit } = req.query;
  if (severity) alerts = alerts.filter((a) => a.severity === severity);
  alerts = [...alerts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  if (limit) alerts = alerts.slice(0, Number(limit));
  res.json(alerts);
});

app.put('/api/alerts/:id/acknowledge', (req, res) => {
  const db = readDb();
  const id = String(req.params.id);
  const idx = db.alerts.findIndex((a) => String(a.id) === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.alerts[idx].is_read = true;
  writeDb(db);
  res.json(db.alerts[idx]);
});

app.put('/api/alerts/read-all', (req, res) => {
  const db = readDb();
  db.alerts = db.alerts.map((a) => ({ ...a, is_read: true }));
  writeDb(db);
  res.json({ success: true });
});

function startServer(port) {
  const PORT = port || process.env.PORT || 4000;
  const { DB_FILE } = require('./db');
  return new Promise((resolve) => {
    const server = app.listen(PORT, () => {
      console.log(`Smart Office OS backend running at http://localhost:${PORT}/api`);
      console.log(`Data file: ${DB_FILE}`);
      resolve(server);
    });
  });
}

module.exports = { app, startServer };

// Allow running standalone too: `node server/index.js`
if (require.main === module) {
  startServer();
}
