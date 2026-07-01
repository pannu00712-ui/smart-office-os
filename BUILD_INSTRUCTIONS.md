# Smart Office OS — Build Guide

## Quick Start (Local, with real data saving)
```bash
npm install
npm run build
npm run electron:dev
```
`electron:dev` now also starts the local backend server automatically
(port 4000) alongside the app, so Employees/Departments/Shifts/Attendance/
Cameras all save to a real data file instead of resetting on refresh.

## Backend server
- Code: `server/index.js` (Express) + `server/db.js` (JSON-file storage)
- Dev mode data file: `server/data/db.json`
- Packaged `.exe` data file: `%APPDATA%/Smart Office OS/server-data/db.json`
- The server starts automatically — you do not need to run it separately.
  (If you ever want to run it alone: `npm run server`.)

## Build EXE
```bash
npm run electron:build:win
```
EXE milega: `release/Smart Office OS Setup 1.0.0.exe`
The backend server is bundled inside the exe and starts automatically when
the app launches — no separate installation needed on the target PC.

## Login
- Email: `admin@soos.io` / Password: `admin123`
- Email: `admin@demo.com` / Password: `Admin@1234`
(These work instantly without the backend, and also exist as real backend
accounts if you add more logic around auth later.)

## Note
Everything below now saves permanently to the local backend (survives app
restarts and PC restarts):
- Employees, Departments, Shifts, Attendance
- Cameras
- Payroll: loans, bonuses, payroll runs
- Logs — an audit trail is now written automatically whenever something is
  created/updated/deleted (login, employee changes, payroll runs, check-ins,
  etc.), so the Logs page shows real history instead of nothing.
- Alerts — persisted, but nothing in the app currently *generates* alerts
  automatically, so this list starts empty until something creates one.

Still using temporary/demo (in-memory) data: Reports page. Ask if you'd
like that wired up to the backend too (it needs to compute daily/monthly
summaries from the attendance data).
