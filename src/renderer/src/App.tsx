import { useCallback, useEffect } from 'react'
import { TopBar } from './components/layout/TopBar'
import { Sidebar } from './components/layout/Sidebar'
import { MainPanel } from './components/layout/MainPanel'
import { useHistory } from './hooks/useHistory'
import { useSession } from './hooks/useSession'
import { useTerminal } from './hooks/useTerminal'
import type { ViewMode } from './types'

function App() {
  const { sessions, loading: historyLoading } = useHistory()
  const { turns, loading: sessionLoading, error: sessionError, currentSessionId, loadSession, clear } = useSession()
  const { terminalId, isRunning: isTerminalRunning, exitCode: terminalExitCode, spawn, close: closeTerminal } = useTerminal()

  const viewMode: ViewMode = terminalId
    ? 'terminal'
    : currentSessionId
      ? 'chat'
      : 'empty'

  const handleSelectSession = useCallback((sessionId: string) => {
    closeTerminal()
    loadSession(sessionId)
  }, [closeTerminal, loadSession])

  const handleNewSession = useCallback(async () => {
    clear()
    await spawn()
  }, [clear, spawn])

  const handleTerminalClose = useCallback(() => {
    closeTerminal()
  }, [closeTerminal])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        handleNewSession()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        // Focus search — handled by SearchBar
        const input = document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')
        input?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleNewSession])

  // Find current session title
  const currentSession = sessions.find((s) => s.sessionId === currentSessionId)
  const title = currentSession?.display || (terminalId ? 'New Session' : undefined)

  return (
    <div className="h-screen flex flex-col bg-surface-0">
      <TopBar onNewSession={handleNewSession} title={title} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          sessions={sessions}
          loading={historyLoading}
          selectedId={currentSessionId}
          onSelect={handleSelectSession}
        />
        <MainPanel
          viewMode={viewMode}
          turns={turns}
          loading={sessionLoading}
          error={sessionError}
          terminalId={terminalId}
          isTerminalRunning={isTerminalRunning}
          terminalExitCode={terminalExitCode}
          onTerminalClose={handleTerminalClose}
          onNewSession={handleNewSession}
        />
      </div>
    </div>
  )
}

export default App
