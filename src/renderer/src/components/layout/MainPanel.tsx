import type { ChatTurn, ViewMode } from '../../types'
import { ChatViewer } from '../chat/ChatViewer'
import { EmptyState } from '../chat/EmptyState'
import { TerminalView } from '../terminal/TerminalView'

interface MainPanelProps {
  viewMode: ViewMode
  turns: ChatTurn[]
  loading: boolean
  error: string | null
  terminalId: string | null
  isTerminalRunning: boolean
  terminalExitCode: number | null
  onTerminalClose: () => void
  onNewSession: () => void
  onContinue?: () => void
  sessionTitle?: string
}

export function MainPanel({
  viewMode,
  turns,
  loading,
  error,
  terminalId,
  isTerminalRunning,
  terminalExitCode,
  onTerminalClose,
  onNewSession,
  onContinue,
  sessionTitle
}: MainPanelProps) {
  if (viewMode === 'terminal' && terminalId) {
    return (
      <div className="flex-1 flex flex-col bg-surface-0">
        <TerminalView
          terminalId={terminalId}
          isRunning={isTerminalRunning}
          exitCode={terminalExitCode}
          onClose={onTerminalClose}
        />
      </div>
    )
  }

  if (viewMode === 'empty') {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface-0">
        <EmptyState onNewSession={onNewSession} />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-surface-0 overflow-hidden">
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Loading conversation...
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center text-red-400">
          {error}
        </div>
      ) : (
        <ChatViewer turns={turns} onContinue={onContinue} sessionTitle={sessionTitle} />
      )}
    </div>
  )
}
