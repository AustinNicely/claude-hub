import { ipcMain } from 'electron'
import { existsSync, readdirSync } from 'fs'
import { join } from 'path'
import { parseJsonlFileFiltered } from '../services/jsonl-parser'
import { getProjectsDir } from '../services/path-utils'

interface RawMessage {
  type?: string
  message?: {
    role: string
    content: string | ContentBlock[]
  }
  timestamp?: string
  uuid?: string
  isSidechain?: boolean
  sessionId?: string
}

interface ContentBlock {
  type: string
  text?: string
  thinking?: string
  name?: string
  input?: Record<string, unknown>
  tool_use_id?: string
  content?: string | ContentBlock[]
  signature?: string
}

interface ChatTurn {
  id: string
  role: 'user' | 'assistant'
  timestamp: string
  content: ContentBlock[]
}

function normalizeContent(content: string | ContentBlock[]): ContentBlock[] {
  if (typeof content === 'string') {
    return [{ type: 'text', text: content }]
  }
  return content
}

function isRelevantMessage(msg: RawMessage): boolean {
  // Skip file-history-snapshot, sidechain messages
  if (msg.type === 'file-history-snapshot') return false
  if (msg.isSidechain) return false
  if (!msg.message) return false
  if (!msg.message.role) return false
  return msg.message.role === 'user' || msg.message.role === 'assistant'
}

function mergeAssistantBlocks(turns: ChatTurn[]): ChatTurn[] {
  const merged: ChatTurn[] = []

  for (const turn of turns) {
    const last = merged[merged.length - 1]
    if (last && last.role === 'assistant' && turn.role === 'assistant') {
      // Merge consecutive assistant turns
      last.content.push(...turn.content)
    } else {
      merged.push({ ...turn })
    }
  }

  return merged
}

function attachToolResults(turns: ChatTurn[]): ChatTurn[] {
  // For each tool_result in a user turn, attach it to the preceding assistant's tool_use
  // This is just for tracking; the renderer will handle display
  return turns
}

function findSessionFileOnDisk(sessionId: string): string | null {
  const projectsDir = getProjectsDir()
  if (!existsSync(projectsDir)) return null

  try {
    const dirs = readdirSync(projectsDir, { withFileTypes: true }).filter((d) => d.isDirectory())
    for (const dir of dirs) {
      const candidate = join(projectsDir, dir.name, `${sessionId}.jsonl`)
      if (existsSync(candidate)) return candidate
    }
  } catch {
    // Ignore errors
  }
  return null
}

async function loadSession(sessionId: string): Promise<ChatTurn[]> {
  const sessionFile = findSessionFileOnDisk(sessionId)
  if (!sessionFile) return []

  const messages = await parseJsonlFileFiltered<RawMessage>(sessionFile, isRelevantMessage)

  const turns: ChatTurn[] = messages.map((msg) => ({
    id: msg.uuid || Math.random().toString(36).slice(2),
    role: msg.message!.role as 'user' | 'assistant',
    timestamp: msg.timestamp || new Date().toISOString(),
    content: normalizeContent(msg.message!.content)
  }))

  const merged = mergeAssistantBlocks(turns)
  return attachToolResults(merged)
}

export function registerSessionIpc(): void {
  ipcMain.handle('get-session', async (_event, sessionId: string) => {
    return loadSession(sessionId)
  })
}
