import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { MessageSquare, FolderOpen, Terminal, Search } from 'lucide-react'
import type { SessionSummary } from '../types'

interface CommandPaletteProps {
  sessions: SessionSummary[]
  onSelect: (sessionId: string) => void
  onOpenProject: (projectPath: string) => void
  onNewSession: () => void
  onClose: () => void
}

function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase()
  const t = target.toLowerCase()
  if (t.includes(q)) return 100 + (q.length / t.length) * 50

  let qi = 0
  let consecutive = 0
  let score = 0
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      qi++
      consecutive++
      score += consecutive * 2
    } else {
      consecutive = 0
    }
  }
  return qi === q.length ? score : 0
}

interface PaletteEntry {
  id: string
  type: 'session' | 'project' | 'action'
  label: string
  detail?: string
  score: number
  action: () => void
}

export function CommandPalette({ sessions, onSelect, onOpenProject, onNewSession, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const items = useMemo((): PaletteEntry[] => {
    const entries: PaletteEntry[] = []

    entries.push({
      id: '__new__',
      type: 'action',
      label: 'New Session',
      detail: 'Start a new Claude session',
      score: 0,
      action: () => { onNewSession(); onClose() }
    })

    for (const s of sessions) {
      entries.push({
        id: s.sessionId,
        type: 'session',
        label: s.display,
        detail: s.projectName,
        score: 0,
        action: () => { onSelect(s.sessionId); onClose() }
      })
    }

    const seen = new Set<string>()
    for (const s of sessions) {
      if (!seen.has(s.project)) {
        seen.add(s.project)
        entries.push({
          id: `proj-${s.project}`,
          type: 'project',
          label: s.projectName,
          detail: s.project,
          score: 0,
          action: () => { onOpenProject(s.project); onClose() }
        })
      }
    }

    if (!query) return entries.slice(0, 20)

    const scored = entries.map((e) => ({
      ...e,
      score: Math.max(fuzzyScore(query, e.label), fuzzyScore(query, e.detail || ''))
    })).filter((e) => e.score > 0)

    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, 20)
  }, [query, sessions, onSelect, onOpenProject, onNewSession, onClose])

  useEffect(() => { setSelectedIndex(0) }, [items])

  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      items[selectedIndex]?.action()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  const iconForType = (type: string) => {
    switch (type) {
      case 'session': return <MessageSquare size={13} />
      case 'project': return <FolderOpen size={13} />
      case 'action': return <Terminal size={13} />
      default: return null
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[18vh]"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative w-[520px] max-h-[380px] bg-surface-1 border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border">
          <Search size={14} className="text-gray-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sessions, projects, or actions..."
            className="flex-1 bg-transparent text-[13px] text-gray-200 placeholder-gray-600 focus:outline-none"
          />
          <kbd className="text-[10px] text-gray-600 bg-surface-2 px-1.5 py-0.5 rounded">esc</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="flex-1 overflow-y-auto py-1">
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-[13px] text-gray-600">No results found</div>
          ) : (
            items.map((item, i) => (
              <div
                key={item.id}
                onClick={() => item.action()}
                className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors ${
                  i === selectedIndex ? 'bg-surface-2' : 'hover:bg-surface-2/50'
                }`}
              >
                <div className={`flex-shrink-0 ${i === selectedIndex ? 'text-gray-300' : 'text-gray-600'}`}>
                  {iconForType(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-gray-200 truncate">{item.label}</div>
                  {item.detail && (
                    <div className="text-[11px] text-gray-600 truncate">{item.detail}</div>
                  )}
                </div>
                <span className="text-[10px] text-gray-700 uppercase tracking-wide flex-shrink-0">{item.type}</span>
              </div>
            ))
          )}
        </div>

        {/* Footer hints */}
        <div className="px-4 py-1.5 border-t border-border flex items-center gap-4 text-[10px] text-gray-600">
          <span><kbd className="px-1 py-px bg-surface-2 rounded text-gray-500">↑↓</kbd> navigate</span>
          <span><kbd className="px-1 py-px bg-surface-2 rounded text-gray-500">↵</kbd> open</span>
        </div>
      </div>
    </div>,
    document.body
  )
}
