const { app, BrowserWindow, shell } = require('electron')
const path = require('path')
const fs = require('fs')

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
