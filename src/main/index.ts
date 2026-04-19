import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { registerHistoryIpc, startHistoryWatcher, stopHistoryWatcher } from './ipc/history'
import { registerSessionIpc } from './ipc/session'
import { registerTerminalIpc, killAllTerminals } from './ipc/terminal'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    backgroundColor: '#0f0f0f',
    titleBarStyle: 'hiddenInset',
    ...(process.platform === 'win32' ? { titleBarOverlay: { color: '#0f0f0f', symbolColor: '#999' } } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow!.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  registerTerminalIpc(mainWindow)
  startHistoryWatcher(mainWindow)
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.claude-hub')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerHistoryIpc()
  registerSessionIpc()

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  killAllTerminals()
  stopHistoryWatcher()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
