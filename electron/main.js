const { app, BrowserWindow, shell, nativeTheme } = require('electron')
const path = require('path')
const fs = require('fs')

// Force light theme regardless of the OS setting. Without this, on a
// Windows machine with dark mode enabled, Chromium renders native form
// controls (like <select> dropdown popups) using dark-mode colors —
// light gray text on a white list — making them unreadable, even though
// the rest of the app's CSS is explicitly light-themed.
nativeTheme.themeSource = 'light'

// Data must go to a writable per-user folder (e.g. %APPDATA%/Smart Office OS),
// not the install directory, which is typically read-only once packaged.
process.env.SOOS_DATA_DIR = path.join(app.getPath('userData'), 'server-data')

let mainWindow
let backendServer

// Returns a Promise that resolves once the backend is actually listening
// (or resolves anyway after a failure, so the UI never hangs forever).
// createWindow() now awaits this — previously it ran in parallel, so the
// renderer's very first api.getEmployees()/getAttendance()/etc. calls could
// fire before Express had finished binding to the port, making pages look
// empty until a manual reload even though the backend was fine a moment later.
function startBackend() {
  // The Express backend is plain Node.js code, and Electron's main
  // process already runs on Node — so we can just require() and start
  // it in-process. No separate server install or process to manage.
  const serverPaths = [
    path.join(__dirname, '../server/index.js'),
    path.join(process.resourcesPath, 'app/server/index.js'),
    path.join(app.getAppPath(), 'server/index.js'),
  ]
  const serverPath = serverPaths.find((p) => fs.existsSync(p))
  if (!serverPath) {
    console.error('Backend server file not found, tried:', serverPaths)
    return Promise.resolve()
  }
  try {
    const { startServer } = require(serverPath)
    return startServer(4000)
      .then((server) => { backendServer = server })
      .catch((e) => { console.error('Backend server failed to start:', e) })
  } catch (e) {
    console.error('Failed to start backend server:', e)
    return Promise.resolve()
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
    title: 'Smart Office OS',
    show: false,
  })

  // Try multiple paths for dist/index.html
  const paths = [
    path.join(__dirname, '../dist/index.html'),
    path.join(process.resourcesPath, 'app/dist/index.html'),
    path.join(app.getAppPath(), 'dist/index.html'),
  ]

  let indexPath = null
  for (const p of paths) {
    if (fs.existsSync(p)) {
      indexPath = p
      break
    }
  }

  if (indexPath) {
    mainWindow.loadFile(indexPath)
  } else {
    // Fallback - show error
    mainWindow.loadURL('data:text/html,<h1>Error: dist/index.html not found</h1><pre>' + paths.join('\n') + '</pre>')
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(async () => {
  await startBackend()
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (backendServer) backendServer.close()
  if (process.platform !== 'darwin') app.quit()
})
