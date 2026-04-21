import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { Play, Search, X, ChevronUp, ChevronDown, Download, BarChart3 } from 'lucide-react'
import type { ChatTurn } from '../../types'
import { MessageBubble } from './MessageBubble'
import { ConversationStats } from './ConversationStats'
import { getTextContent, turnsToMarkdown, computeStats } from '../../lib/message-parser'

interface ChatViewerProps {
  turns: ChatTurn[]
  onContinue?: () => void
  sessionTitle?: string
}

export function ChatViewer({ turns, onContinue, sessionTitle }: ChatViewerProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const turnRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const [chatSearchOpen, setChatSearchOpen] = useState(false)
  const [chatSearch, setChatSearch] = useState('')
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [showStats, setShowStats] = useState(false)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0
    }
  }, [turns])

  // Ctrl+F
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        if (!containerRef.current) return
        e.preventDefault()
        setChatSearchOpen(true)
        setTimeout(() => searchInputRef.current?.focus(), 0)
      }
      if (e.key === 'Escape' && chatSearchOpen) {
        setChatSearchOpen(false)
        setChatSearch('')
        setCurrentMatchIndex(0)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [chatSearchOpen])

  const matches = useMemo(() => {
    if (!chatSearch) return []
    const q = chatSearch.toLowerCase()
    return turns
      .map((turn, idx) => ({ turn, idx }))
      .filter(({ turn }) => getTextContent(turn.content).toLowerCase().includes(q))
  }, [turns, chatSearch])

  useEffect(() => {
    if (matches.length === 0) return
    const match = matches[currentMatchIndex]
    if (!match) return
    turnRefs.current.get(match.turn.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [currentMatchIndex, matches])

  const nextMatch = useCallback(() => {
    setCurrentMatchIndex((prev) => (prev + 1) % matches.length)
  }, [matches.length])

  const prevMatch = useCallback(() => {
    setCurrentMatchIndex((prev) => (prev - 1 + matches.length) % matches.length)
  }, [matches.length])

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (e.shiftKey) prevMatch()
      else nextMatch()
    }
  }, [nextMatch, prevMatch])

  const handleExport = useCallback(async () => {
    const md = turnsToMarkdown(turns, sessionTitle)
    const filename = (sessionTitle || 'conversation').replace(/[^a-zA-Z0-9-_ ]/g, '').slice(0, 50) + '.md'
    await window.api.exportSession(filename, md)
  }, [turns, sessionTitle])

  const stats = useMemo(() => computeStats(turns), [turns])
  const matchTurnIds = useMemo(() => new Set(matches.map((m) => m.turn.id)), [matches])
  const currentMatchTurnId = matches[currentMatchIndex]?.turn.id

  if (turns.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        No messages in this conversation
      </div>
    )
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Search bar — slides down from top */}
        {chatSearchOpen && (
          <div className="bg-surface-1/95 backdrop-blur-sm border-b border-border px-4 py-2 flex items-center gap-2 z-10">
            <Search size={13} className="text-gray-500 flex-shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={chatSearch}
              onChange={(e) => { setChatSearch(e.target.value); setCurrentMatchIndex(0) }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Find in conversation..."
              className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-600 focus:outline-none"
            />
            {chatSearch && (
              <span className="text-[11px] text-gray-500 flex-shrink-0 tabular-nums">
                {matches.length > 0 ? `${currentMatchIndex + 1} of ${matches.length}` : 'No results'}
              </span>
            )}
            <div className="flex items-center gap-px ml-1">
              <button onClick={prevMatch} className="p-1 rounded text-gray-500 hover:text-gray-300 hover:bg-surface-2 disabled:opacity-30" disabled={matches.length === 0}>
                <ChevronUp size={13} />
              </button>
              <button onClick={nextMatch} className="p-1 rounded text-gray-500 hover:text-gray-300 hover:bg-surface-2 disabled:opacity-30" disabled={matches.length === 0}>
                <ChevronDown size={13} />
              </button>
            </div>
            <button onClick={() => { setChatSearchOpen(false); setChatSearch(''); setCurrentMatchIndex(0) }} className="p-1 rounded text-gray-500 hover:text-gray-300 hover:bg-surface-2 ml-0.5">
              <X size={13} />
            </button>
          </div>
        )}

        {/* Floating action buttons — top right corner */}
        <div className="absolute top-2 right-5 z-10 flex items-center gap-0.5 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button
            onClick={handleExport}
            className="p-1.5 rounded-md bg-surface-1/80 backdrop-blur-sm text-gray-500 hover:text-gray-200 hover:bg-surface-2 transition-colors"
            title="Export to Markdown"
          >
            <Download size={13} />
          </button>
          <button
            onClick={() => setShowStats(!showStats)}
            className={`p-1.5 rounded-md backdrop-blur-sm transition-colors ${
              showStats
                ? 'bg-accent/15 text-accent'
                : 'bg-surface-1/80 text-gray-500 hover:text-gray-200 hover:bg-surface-2'
            }`}
            title="Conversation stats"
          >
            <BarChart3 size={13} />
          </button>
        </div>

        {/* Messages */}
        <div ref={containerRef} className="flex-1 overflow-y-auto selectable-content">
          <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">
            {turns.map((turn) => {
              const isMatch = matchTurnIds.has(turn.id)
              const isCurrent = turn.id === currentMatchTurnId
              return (
                <div
                  key={turn.id}
                  ref={(el) => { if (el) turnRefs.current.set(turn.id, el); else turnRefs.current.delete(turn.id) }}
                  className={
                    isCurrent
                      ? 'ring-2 ring-yellow-500/40 rounded-lg transition-shadow'
                      : isMatch
                        ? 'ring-1 ring-yellow-500/15 rounded-lg'
                        : ''
                  }
                >
                  <MessageBubble turn={turn} />
                </div>
              )
            })}
            {onContinue && (
              <div className="flex justify-center pt-4 pb-2">
                <button
                  onClick={onContinue}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors text-sm font-medium"
                >
                  <Play size={14} />
                  Continue this conversation
                </button>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>

      {/* Stats panel */}
      {showStats && (
        <ConversationStats stats={stats} onClose={() => setShowStats(false)} />
      )}
    </div>
  )
}
