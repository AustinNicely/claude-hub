import { useCallback, useEffect, useState, useRef } from 'react'
import { TopBar } from './components/layout/TopBar'
import { Sidebar } from './components/layout/Sidebar'
import { MainPanel } from './components/layout/MainPanel'
import { CommandPalette } from './components/CommandPalette'
import { TagEditor } from './components/sidebar/TagEditor'
import { useHistory } from './hooks/useHistory'
import { useSession } from './hooks/useSession'
import { useTerminal } from './hooks/useTerminal'
import { usePinnedSessions } from './hooks/usePinnedSessions'
import { useTags } from './hooks/useTags'
import { getStorageItem, setStorageItem } from './lib/storage'
import { turnsToMarkdown } from './lib/message-parser'
import type { ViewMode, SessionSummary } from './types'

function App() {
  const { sessions, loading: historyLoading } = useHistory()
  const { turns, loading: sessionLoading, error: sessionError, currentSessionId, loadSession, clear } = useSession()
  const { terminalId, isRunning: isTerminalRunning, exitCode: terminalExitCode, spawn, close: closeTerminal } = useTerminal()
  const { pinnedIds, togglePin } = usePinnedSessions()
  const { tags, tagDefs, sessionTags, createTag, deleteTag, addTagToSession, removeTagFromSession } = useTags()

  // Sidebar resize
  const [sidebarWidth, setSidebarWidth] = useState(() => getStorageItem<number>('claude-hub-sidebar-width', 288))
  const resizingRef = useRef(false)

  // Keyboard navigation
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const filteredSessionsRef = useRef<SessionSummary[]>([])

  // Command palette
  const [paletteOpen, setPaletteOpen] = useState(false)

  // Tag editor
  const [tagEditorState, setTagEditorState] = useState<{ sessionId: string; anchor: HTMLElement } | null>(null)

  // Tag filter
  const [tagFilter, setTagFilter] = useState<string | null>(null)

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

  const handleContinueSession = useCallback(async (sessionId: string) => {
    closeTerminal()
    clear()
    const id = await spawn()
    if (id) {
      window.api.writeTerminal(id, `claude --resume ${sessionId}\n`)
    }
  }, [closeTerminal, clear, spawn])

  const handleDeleteSession = useCallback(async (sessionId: string) => {
    await window.api.deleteSession(sessionId)
    if (currentSessionId === sessionId) {
      closeTerminal()
      clear()
    }
  }, [currentSessionId, closeTerminal, clear])

  const handleOpenProject = useCallback(async (projectPath: string) => {
    await window.api.openProject(projectPath)
  }, [])

  const handleTerminalClose = useCallback(() => {
    closeTerminal()
  }, [closeTerminal])

  // Export from sidebar
  const handleExportSession = useCallback(async (session: SessionSummary) => {
    const sessionTurns = await window.api.getSession(session.sessionId)
    const md = turnsToMarkdown(sessionTurns as any, session.display)
    const filename = session.display.replace(/[^a-zA-Z0-9-_ ]/g, '').slice(0, 50) + '.md'
    await window.api.exportSession(filename, md)
  }, [])

  // Filtered sessions callback for keyboard nav
  const handleFilteredChange = useCallback((filtered: SessionSummary[]) => {
    filteredSessionsRef.current = filtered
  }, [])

  // Tag editor
  const handleOpenTagEditor = useCallback((sessionId: string, anchor: HTMLElement) => {
    setTagEditorState({ sessionId, anchor })
  }, [])

  // Sidebar resize handlers
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    resizingRef.current = true

    const handleMouseMove = (ev: MouseEvent) => {
      if (!resizingRef.current) return
      const width = Math.max(200, Math.min(600, ev.clientX))
      setSidebarWidth(width)
    }

    const handleMouseUp = () => {
      resizingRef.current = false
      setStorageItem('claude-hub-sidebar-width', sidebarWidth)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [sidebarWidth])

  // Persist sidebar width after resize ends
  useEffect(() => {
    if (!resizingRef.current) {
      setStorageItem('claude-hub-sidebar-width', sidebarWidth)
    }
  }, [sidebarWidth])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+N: new session
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        handleNewSession()
        return
      }

      // Ctrl+K: command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setPaletteOpen((prev) => !prev)
        return
      }

      // Skip arrow nav when input/textarea focused or palette open
      const active = document.activeElement
      const isInput = active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement
      if (isInput || paletteOpen) return

      const filtered = filteredSessionsRef.current
      if (filtered.length === 0) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocusedIndex((prev) => Math.min(prev + 1, filtered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusedIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter' && focusedIndex >= 0 && focusedIndex < filtered.length) {
        e.preventDefault()
        handleSelectSession(filtered[focusedIndex].sessionId)
      } else if (e.key === 'Escape') {
        setFocusedIndex(-1)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleNewSession, handleSelectSession, focusedIndex, paletteOpen])

  // Compute focused session ID
  const focusedId = focusedIndex >= 0 && focusedIndex < filteredSessionsRef.current.length
    ? filteredSessionsRef.current[focusedIndex].sessionId
    : null

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
          focusedId={focusedId}
          onSelect={handleSelectSession}
          onContinue={handleContinueSession}
          onDelete={handleDeleteSession}
          onOpenProject={handleOpenProject}
          width={sidebarWidth}
          pinnedIds={pinnedIds}
          onTogglePin={togglePin}
          onFilteredChange={handleFilteredChange}
          sessionTags={sessionTags}
          tagDefs={tagDefs}
          tagFilter={tagFilter}
          onTagFilterChange={setTagFilter}
          allTags={tags}
          onOpenTagEditor={handleOpenTagEditor}
          onExport={handleExportSession}
        />

        {/* Resize handle */}
        <div
          className="w-1 cursor-col-resize hover:bg-accent/30 active:bg-accent/50 transition-colors titlebar-no-drag flex-shrink-0"
          onMouseDown={handleResizeStart}
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
          onContinue={currentSessionId ? () => handleContinueSession(currentSessionId) : undefined}
          sessionTitle={title}
        />
      </div>

      {/* Command Palette */}
      {paletteOpen && (
        <CommandPalette
          sessions={sessions}
          onSelect={handleSelectSession}
          onOpenProject={handleOpenProject}
          onNewSession={handleNewSession}
          onClose={() => setPaletteOpen(false)}
        />
      )}

      {/* Tag Editor */}
      {tagEditorState && (
        <TagEditor
          sessionId={tagEditorState.sessionId}
          anchor={tagEditorState.anchor}
          tags={tags}
          sessionTagIds={sessionTags.get(tagEditorState.sessionId) || []}
          onAddTag={addTagToSession}
          onRemoveTag={removeTagFromSession}
          onCreate={createTag}
          onDeleteTag={deleteTag}
          onClose={() => setTagEditorState(null)}
        />
      )}
    </div>
  )
}

export default App
