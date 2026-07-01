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
Cameras, Employees, Departments, Shifts, and Attendance now persist to a
real local data file. Payroll, Alerts, Logs, and Reports still use demo
mock data (in-memory) and reset on refresh — ask if you'd like those wired
up to the backend too.
