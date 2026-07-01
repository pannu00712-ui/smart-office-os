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
    { id: 1, name: 'Admin', email: 'admin@demo.com', password: 'Admin@1234', role: 'admin' },
    { id: 2, name: 'Admin', email: 'admin@soos.io', password: 'admin123', role: 'admin' },
  ],
  employees: [],
  departments: [],
  shifts: [],
  attendance: [],
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
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
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

module.exports = { readDb, writeDb, nextId, DB_FILE };
