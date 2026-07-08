// Simple JSON-file datastore. No native database driver needed — just
// plain Node.js `fs`, so `npm install` never has to compile anything.
//
// In dev mode, data lives in server/data/db.json inside the project.
// In a packaged .exe, the install folder is normally read-only, so
// Electron's main process points SOOS_DATA_DIR at a writable per-user
// folder (e.g. %APPDATA%/Smart Office OS/server-data) before requiring
// this module — see electron/main.js.
const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.SOOS_DATA_DIR || path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const DEFAULT_DATA = {
  users: [
    { id: 1, name: 'Admin', email: 'admin@soos.io', password: 'admin123', role: 'admin' },
  ],
  employees: [],
  departments: [],
  shifts: [],
  attendance: [],
  logs: [],
  loans: [],
  bonuses: [],
  payrollRuns: [],
  alerts: [],
};

function ensureDbFile() {
  if (!fs.existsSync(DB_FILE)) {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
  }
}

function readDb() {
  ensureDbFile();
  try {
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    // Fill in any collections missing from an older db.json (e.g. upgrading
    // from a version of the app that didn't have logs/payroll/alerts yet).
    let changed = false;
    for (const key of Object.keys(DEFAULT_DATA)) {
      if (!(key in data)) { data[key] = Array.isArray(DEFAULT_DATA[key]) ? [] : DEFAULT_DATA[key]; changed = true; }
    }
    if (changed) writeDb(data);
    return data;
  } catch (e) {
    console.error('Failed to read db.json, resetting to defaults:', e.message);
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function nextId(list) {
  return list.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

// Appends an audit-log entry. Called from various endpoints below whenever
// something meaningful happens (an employee is added, payroll runs, etc.)
// so the Logs page has real, persisted data instead of nothing.
function writeLog(db, { user = 'admin@soos.io', role = 'admin', action, target = '', detail = '', module = 'System', severity = 'info' }) {
  db.logs.push({
    id: nextId(db.logs),
    ts: new Date().toISOString(),
    user, role, action, target, detail, module, severity,
  });
}

module.exports = { readDb, writeDb, nextId, writeLog, DB_FILE };
