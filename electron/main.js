const { app, BrowserWindow, shell, nativeTheme } = require('electron')
const path = require('path')
const fs = require('fs')

// Force light theme regardless of the OS setting. Without this, on a
// Windows machine with dark mode enabled, Chromium renders native form
// controls (like <select> dropdown popups) using dark-mode colors —
// light gray text on a white list — making them unreadable, even though
// the rest of the app's CSS is explicitly light-themed.
nativeTheme.themeSource = 'light'

let mainWindow

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

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
