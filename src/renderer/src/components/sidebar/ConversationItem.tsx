import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { format } from 'date-fns'
import { AlertCircle, Play, Trash2, FolderOpen, Star, Download, Tag as TagIcon, MoreHorizontal } from 'lucide-react'
import type { SessionSummary, ChatTurn } from '../../types'
import { getTextContent, truncateText } from '../../lib/message-parser'

interface ConversationItemProps {
  session: SessionSummary
  selected: boolean
  focused?: boolean
  onClick: () => void
  onContinue?: (sessionId: string) => void
  onDelete?: (sessionId: string) => void
  onOpenProject?: (projectPath: string) => void
  isPinned?: boolean
  onTogglePin?: (sessionId: string) => void
  tags?: { id: string; name: string; color: string }[]
  onOpenTagEditor?: (sessionId: string, anchor: HTMLElement) => void
  onExport?: (session: SessionSummary) => void
}

function ActionButton({ title, className, onClick, children }: {
  title: string
  className?: string
  onClick: (e: React.MouseEvent) => void
  children: React.ReactNode
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      title={title}
      className={`p-1 rounded hover:bg-surface-3 transition-colors ${className || ''}`}
      onClick={(e) => { e.stopPropagation(); onClick(e) }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.stopPropagation()
          e.preventDefault()
          onClick(e as unknown as React.MouseEvent)
        }
      }}
    >
      {children}
    </div>
  )
}

export function ConversationItem({
  session,
  selected,
  focused,
  onClick,
  onContinue,
  onDelete,
  onOpenProject,
  isPinned,
  onTogglePin,
  tags,
  onOpenTagEditor,
  onExport
}: ConversationItemProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [preview, setPreview] = useState<{ turns: ChatTurn[]; rect: DOMRect } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (focused && ref.current) {
      ref.current.scrollIntoView({ block: 'nearest' })
    }
  }, [focused])

  const timeStr = session.timestamp
    ? format(new Date(session.timestamp), 'h:mm a')
    : ''

  // Hover preview
  const handleMouseEnter = useCallback(() => {
    if (menuOpen) return
    hoverTimerRef.current = setTimeout(async () => {
      if (!ref.current || menuOpen) return
      try {
        const turns = await window.api.getSession(session.sessionId) as ChatTurn[]
        if (!ref.current) return
        const rect = ref.current.getBoundingClientRect()
        setPreview({ turns, rect })
      } catch { /* ignore */ }
    }, 500)
  }, [session.sessionId, menuOpen])

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
    setPreview(null)
  }, [])

  useEffect(() => {
    if (!preview) return
    const sidebar = ref.current?.closest('.overflow-y-auto')
    if (!sidebar) return
    const dismiss = () => setPreview(null)
    sidebar.addEventListener('scroll', dismiss, { passive: true })
    return () => sidebar.removeEventListener('scroll', dismiss)
  }, [preview])

  useEffect(() => {
    return () => { if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current) }
  }, [])

  // Overflow menu
  const openMenu = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setMenuPos({ top: rect.bottom + 4, left: rect.left })
    setMenuOpen(true)
    setPreview(null)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menuOpen])

  // Preview position
  const previewStyle = preview ? (() => {
    const { rect } = preview
    const popoverH = 180
    const top = rect.bottom + popoverH > window.innerHeight
      ? rect.top - popoverH - 4
      : rect.top
    return { position: 'fixed' as const, left: rect.right + 8, top, width: 300, zIndex: 50 }
  })() : null

  return (
    <>
      <button
        ref={ref}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`w-full text-left px-3 py-2 hover:bg-surface-2 transition-colors group ${
          selected ? 'bg-surface-2 border-l-2 border-accent' : 'border-l-2 border-transparent'
        } ${focused ? 'ring-1 ring-inset ring-accent/50' : ''}`}
      >
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-[13px] text-gray-200 truncate leading-snug">{session.display}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-gray-500 truncate">{session.projectName}</span>
              {timeStr && <span className="text-[11px] text-gray-600 flex-shrink-0">{timeStr}</span>}
              {tags && tags.length > 0 && (
                <div className="flex items-center gap-0.5 ml-0.5">
                  {tags.map((t) => (
                    <span key={t.id} className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} title={t.name} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Primary hover actions — pin, continue, overflow */}
          <div className={`flex-shrink-0 mt-0.5 flex items-center gap-px ${menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
            {onTogglePin && (
              <ActionButton
                title={isPinned ? 'Unpin' : 'Pin'}
                className={isPinned ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'}
                onClick={() => onTogglePin(session.sessionId)}
              >
                <Star size={11} fill={isPinned ? 'currentColor' : 'none'} />
              </ActionButton>
            )}
            {session.hasData && onContinue && (
              <ActionButton title="Continue" className="text-gray-500 hover:text-accent" onClick={() => onContinue(session.sessionId)}>
                <Play size={11} />
              </ActionButton>
            )}
            <ActionButton title="More" className="text-gray-500 hover:text-gray-300" onClick={openMenu}>
              <MoreHorizontal size={11} />
            </ActionButton>
          </div>

          {!session.hasData && (
            <AlertCircle size={11} className="text-gray-600 flex-shrink-0 mt-1" title="Session data unavailable" />
          )}
        </div>
      </button>

      {/* Overflow menu */}
      {menuOpen && menuPos && createPortal(
        <div
          ref={menuRef}
          className="fixed z-50 w-44 bg-surface-2 border border-border rounded-lg shadow-xl py-1 text-[12px]"
          style={{ top: menuPos.top, left: menuPos.left }}
        >
          {onOpenProject && (
            <MenuItem icon={<FolderOpen size={12} />} label="Open folder" onClick={() => { onOpenProject(session.project); setMenuOpen(false) }} />
          )}
          {onExport && (
            <MenuItem icon={<Download size={12} />} label="Export to Markdown" onClick={() => { onExport(session); setMenuOpen(false) }} />
          )}
          {onOpenTagEditor && (
            <MenuItem icon={<TagIcon size={12} />} label="Tags" onClick={(e) => { onOpenTagEditor(session.sessionId, e.currentTarget as HTMLElement); setMenuOpen(false) }} />
          )}
          {onDelete && (
            <>
              <div className="my-1 border-t border-border" />
              <MenuItem icon={<Trash2 size={12} />} label="Delete" className="text-red-400 hover:text-red-300" onClick={() => { onDelete(session.sessionId); setMenuOpen(false) }} />
            </>
          )}
        </div>,
        document.body
      )}

      {/* Hover preview */}
      {preview && previewStyle && !menuOpen && createPortal(
        <div style={previewStyle} className="bg-surface-2 border border-border rounded-lg shadow-xl p-3 pointer-events-none">
          <div className="text-[11px] font-medium text-gray-300 mb-2 truncate">{session.display}</div>
          <div className="space-y-1.5">
            {preview.turns.slice(0, 3).map((turn, i) => (
              <div key={i} className="text-[11px] leading-relaxed">
                <span className={`font-medium ${turn.role === 'user' ? 'text-accent' : 'text-gray-400'}`}>
                  {turn.role === 'user' ? 'You' : 'Claude'}:
                </span>{' '}
                <span className="text-gray-500">{truncateText(getTextContent(turn.content), 120)}</span>
              </div>
            ))}
            {preview.turns.length === 0 && <div className="text-[11px] text-gray-600">No messages</div>}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

function MenuItem({ icon, label, className, onClick }: {
  icon: React.ReactNode
  label: string
  className?: string
  onClick: (e: React.MouseEvent) => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-1.5 hover:bg-surface-3 transition-colors text-left ${className || 'text-gray-300'}`}
    >
      <span className="text-gray-500">{icon}</span>
      {label}
    </button>
  )
}
