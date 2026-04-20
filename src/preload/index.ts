import { contextBridge, ipcRenderer } from 'electron'

const api = {
  getHistory: (): Promise<unknown[]> => ipcRenderer.invoke('get-history'),
  getSession: (sessionId: string): Promise<unknown[]> => ipcRenderer.invoke('get-session', sessionId),

  onHistoryUpdate: (callback: (sessions: SessionSummary[]) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, sessions: SessionSummary[]): void => {
      callback(sessions)
    }
    ipcRenderer.on('history-updated', handler)
    return () => ipcRenderer.removeListener('history-updated', handler)
  },

  spawnTerminal: (cwd?: string): Promise<string> => ipcRenderer.invoke('spawn-terminal', cwd),

  writeTerminal: (id: string, data: string): void => {
    ipcRenderer.send('write-terminal', id, data)
  },

  resizeTerminal: (id: string, cols: number, rows: number): void => {
    ipcRenderer.send('resize-terminal', id, cols, rows)
  },

  killTerminal: (id: string): void => {
    ipcRenderer.send('kill-terminal', id)
  },

  onTerminalData: (callback: (id: string, data: string) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, id: string, data: string): void => {
      callback(id, data)
    }
    ipcRenderer.on('terminal-data', handler)
    return () => ipcRenderer.removeListener('terminal-data', handler)
  },

  onTerminalExit: (callback: (id: string, code: number) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, id: string, code: number): void => {
      callback(id, code)
    }
    ipcRenderer.on('terminal-exit', handler)
    return () => ipcRenderer.removeListener('terminal-exit', handler)
  },

  deleteSession: (sessionId: string): Promise<void> => ipcRenderer.invoke('delete-session', sessionId),
  openProject: (projectPath: string): Promise<void> => ipcRenderer.invoke('open-project', projectPath),
  exportSession: (filename: string, markdown: string): Promise<boolean> => ipcRenderer.invoke('export-session', filename, markdown)
}

contextBridge.exposeInMainWorld('api', api)
