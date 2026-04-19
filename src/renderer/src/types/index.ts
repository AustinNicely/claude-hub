export interface SessionSummary {
  sessionId: string
  display: string
  timestamp: number
  project: string
  projectName: string
  messageCount: number
  hasData: boolean
}

export interface ContentBlock {
  type: 'text' | 'thinking' | 'tool_use' | 'tool_result' | 'image'
  text?: string
  thinking?: string
  name?: string
  input?: Record<string, unknown>
  tool_use_id?: string
  content?: string | ContentBlock[]
  signature?: string
}

export interface ChatTurn {
  id: string
  role: 'user' | 'assistant'
  timestamp: string
  content: ContentBlock[]
  isThinking?: boolean
}

export interface DateGroup {
  label: string
  sessions: SessionSummary[]
}

export type ViewMode = 'chat' | 'terminal' | 'empty'

export interface ElectronAPI {
  getHistory: () => Promise<SessionSummary[]>
  getSession: (sessionId: string) => Promise<ChatTurn[]>
  onHistoryUpdate: (callback: (sessions: SessionSummary[]) => void) => () => void
  spawnTerminal: (cwd?: string) => Promise<string>
  writeTerminal: (id: string, data: string) => void
  resizeTerminal: (id: string, cols: number, rows: number) => void
  killTerminal: (id: string) => void
  onTerminalData: (callback: (id: string, data: string) => void) => () => void
  onTerminalExit: (callback: (id: string, code: number) => void) => () => void
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}
