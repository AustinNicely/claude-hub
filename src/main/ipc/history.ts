import { ipcMain, BrowserWindow } from 'electron'
import { existsSync, readdirSync } from 'fs'
import { join } from 'path'
import { parseJsonlFile } from '../services/jsonl-parser'
import { getHistoryPath, getProjectsDir } from '../services/path-utils'
import { FileWatcher } from '../services/file-watcher'

interface HistoryEntry {
  display: string
  timestamp: number
  project: string
  sessionId: string
}

export interface SessionSummary {
  sessionId: string
  display: string
  timestamp: number
  project: string
  projectName: string
  messageCount: number
  hasData: boolean
}

const watcher = new FileWatcher()

function getProjectName(project: string): string {
  if (!project) return 'Unknown'
  const parts = project.replace(/\\/g, '/').split('/')
  return parts[parts.length - 1] || parts[parts.length - 2] || project
}

export async function loadHistory(): Promise<SessionSummary[]> {
  const historyPath = getHistoryPath()
  if (!existsSync(historyPath)) return []

  const entries = await parseJsonlFile<HistoryEntry>(historyPath)

  // Aggregate by sessionId — keep latest timestamp and first display text
  const sessionMap = new Map<string, {
    display: string
    timestamp: number
    project: string
    messageCount: number
  }>()

  for (const entry of entries) {
    const existing = sessionMap.get(entry.sessionId)
    if (existing) {
      existing.messageCount++
      if (entry.timestamp > existing.timestamp) {
        existing.timestamp = entry.timestamp
      }
    } else {
      sessionMap.set(entry.sessionId, {
        display: entry.display,
        timestamp: entry.timestamp,
        project: entry.project,
        messageCount: 1
      })
    }
  }

  // Scan project directories: find all session files and collect sessions not in history
  const existingFiles = new Set<string>()
  const projectsDir = getProjectsDir()
  if (existsSync(projectsDir)) {
    try {
      const projectDirs = readdirSync(projectsDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
      for (const dir of projectDirs) {
        const dirPath = join(projectsDir, dir.name)
        const files = readdirSync(dirPath, { withFileTypes: true })
          .filter((f) => f.isFile() && f.name.endsWith('.jsonl'))
        for (const file of files) {
          const sid = file.name.replace('.jsonl', '')
          existingFiles.add(sid)
          if (!sessionMap.has(sid)) {
            sessionMap.set(sid, {
              display: 'Untitled session',
              timestamp: 0,
              project: dir.name,
              messageCount: 0
            })
          }
        }
      }
    } catch {
      // Ignore scan errors
    }
  }

  const summaries: SessionSummary[] = []
  for (const [sessionId, data] of sessionMap) {
    summaries.push({
      sessionId,
      display: data.display || 'Untitled session',
      timestamp: data.timestamp,
      project: data.project,
      projectName: getProjectName(data.project),
      messageCount: data.messageCount,
      hasData: existingFiles.has(sessionId)
    })
  }

  // Sort by recency
  summaries.sort((a, b) => b.timestamp - a.timestamp)
  return summaries
}

export function registerHistoryIpc(): void {
  ipcMain.handle('get-history', async () => {
    return loadHistory()
  })
}

export function startHistoryWatcher(win: BrowserWindow): void {
  const historyPath = getHistoryPath()
  watcher.start(historyPath, async () => {
    try {
      const sessions = await loadHistory()
      win.webContents.send('history-updated', sessions)
    } catch {
      // Ignore watcher errors
    }
  })
}

export function stopHistoryWatcher(): void {
  watcher.stop()
}
