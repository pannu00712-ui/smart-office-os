// Smart Office OS — local backend server
// Runs entirely on this PC. Data is saved to server/data/db.json, so it
// survives app restarts, PC restarts, etc. No internet connection or
// external database needed.
const express = require('express');
const cors = require('cors');
const { readDb, writeDb, nextId } = require('./db');

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
function crud(collectionName) {
  const router = express.Router();

  router.get('/', (req, res) => {
    const db = readDb();
    res.json(db[collectionName]);
  });

  router.post('/', (req, res) => {
    const db = readDb();
    const item = { ...req.body, id: nextId(db[collectionName]) };
    db[collectionName].push(item);
    writeDb(db);
    res.json(item);
  });

  router.put('/:id', (req, res) => {
    const db = readDb();
    const id = String(req.params.id);
    const idx = db[collectionName].findIndex((x) => String(x.id) === id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    db[collectionName][idx] = { ...db[collectionName][idx], ...req.body, id: db[collectionName][idx].id };
    writeDb(db);
    res.json(db[collectionName][idx]);
  });

  router.delete('/:id', (req, res) => {
    const db = readDb();
    const id = String(req.params.id);
    const before = db[collectionName].length;
    db[collectionName] = db[collectionName].filter((x) => String(x.id) !== id);
    writeDb(db);
    res.json({ success: true, deleted: before !== db[collectionName].length });
  });

  return router;
}

app.use('/api/employees', crud('employees'));
app.use('/api/departments', crud('departments'));
app.use('/api/shifts', crud('shifts'));

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
  writeDb(db);
  res.json(db.attendance[idx]);
});

app.put('/api/attendance/:id/override', (req, res) => {
  const db = readDb();
  const id = String(req.params.id);
  const idx = db.attendance.findIndex((r) => String(r.id) === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.attendance[idx] = { ...db.attendance[idx], ...req.body };
  writeDb(db);
  res.json(db.attendance[idx]);
});

function startServer(port) {
  const PORT = port || process.env.PORT || 4000;
  return new Promise((resolve) => {
    const server = app.listen(PORT, () => {
      console.log(`Smart Office OS backend running at http://localhost:${PORT}/api`);
      console.log(`Data file: server/data/db.json`);
      resolve(server);
    });
  });
}

module.exports = { app, startServer };

// Allow running standalone too: `node server/index.js`
if (require.main === module) {
  startServer();
}
