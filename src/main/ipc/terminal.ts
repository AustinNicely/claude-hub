import { ipcMain, BrowserWindow } from 'electron'

// node-pty is optional — terminal features disabled if not available
let pty: typeof import('node-pty') | null = null
try {
  pty = require('node-pty')
} catch {
  console.log('node-pty not available — terminal features disabled')
}

const terminals = new Map<string, ReturnType<typeof import('node-pty').spawn>>()
let nextId = 1

export function registerTerminalIpc(win: BrowserWindow): void {
  ipcMain.handle('spawn-terminal', async (_event, cwd?: string) => {
    if (!pty) throw new Error('Terminal not available')

    const id = `term-${nextId++}`
    const shell = process.platform === 'win32' ? 'powershell.exe' : process.env.SHELL || '/bin/bash'

    const cleanEnv = { ...process.env }
    delete cleanEnv.CLAUDECODE
    delete cleanEnv.CLAUDE_CODE_SESSION

    const term = pty.spawn(shell, [], {
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
      cwd: cwd || process.env.HOME || process.env.USERPROFILE || '.',
      env: cleanEnv as Record<string, string>
    })

    terminals.set(id, term)

    term.onData((data: string) => {
      win.webContents.send('terminal-data', id, data)
    })

    term.onExit(({ exitCode }: { exitCode: number }) => {
      terminals.delete(id)
      win.webContents.send('terminal-exit', id, exitCode)
    })

    return id
  })

  ipcMain.on('write-terminal', (_event, id: string, data: string) => {
    const term = terminals.get(id)
    if (term) term.write(data)
  })

  ipcMain.on('resize-terminal', (_event, id: string, cols: number, rows: number) => {
    const term = terminals.get(id)
    if (term) term.resize(cols, rows)
  })

  ipcMain.on('kill-terminal', (_event, id: string) => {
    const term = terminals.get(id)
    if (term) {
      term.kill()
      terminals.delete(id)
    }
  })
}

export function killAllTerminals(): void {
  for (const [id, term] of terminals) {
    term.kill()
    terminals.delete(id)
  }
}
