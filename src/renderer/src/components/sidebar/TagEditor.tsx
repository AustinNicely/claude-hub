import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, Plus, Trash2 } from 'lucide-react'
import type { Tag } from '../../types'
import { TAG_COLORS } from '../../hooks/useTags'

interface TagEditorProps {
  sessionId: string
  anchor: HTMLElement
  tags: Tag[]
  sessionTagIds: string[]
  onAddTag: (sessionId: string, tagId: string) => void
  onRemoveTag: (sessionId: string, tagId: string) => void
  onCreate: (name: string, color: string) => Tag
  onDeleteTag: (tagId: string) => void
  onClose: () => void
}

export function TagEditor({
  sessionId,
  anchor,
  tags,
  sessionTagIds,
  onAddTag,
  onRemoveTag,
  onCreate,
  onDeleteTag,
  onClose
}: TagEditorProps) {
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(TAG_COLORS[0])
  const ref = useRef<HTMLDivElement>(null)

  const rect = anchor.getBoundingClientRect()
  const flipLeft = rect.right + 230 > window.innerWidth
  const style = {
    position: 'fixed' as const,
    left: flipLeft ? rect.left - 230 - 8 : rect.right + 8,
    top: Math.min(rect.top, window.innerHeight - 320),
    zIndex: 50
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const handleCreate = () => {
    const trimmed = newName.trim()
    if (!trimmed) return
    const tag = onCreate(trimmed, newColor)
    onAddTag(sessionId, tag.id)
    setNewName('')
  }

  return createPortal(
    <div ref={ref} style={style} className="w-56 bg-surface-2 border border-border rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-[12px] font-medium text-gray-300">Tags</span>
        <button onClick={onClose} className="p-0.5 rounded text-gray-500 hover:text-gray-300 hover:bg-surface-3">
          <X size={12} />
        </button>
      </div>

      {/* Tag list */}
      <div className="px-3 py-2 space-y-0.5 max-h-36 overflow-y-auto">
        {tags.length === 0 && (
          <div className="text-[11px] text-gray-600 py-2 text-center">No tags yet</div>
        )}
        {tags.map((tag) => {
          const assigned = sessionTagIds.includes(tag.id)
          return (
            <div key={tag.id} className="flex items-center gap-2 py-0.5 group/tag">
              <label className="flex items-center gap-1.5 flex-1 cursor-pointer text-[12px]">
                <input
                  type="checkbox"
                  checked={assigned}
                  onChange={() => assigned ? onRemoveTag(sessionId, tag.id) : onAddTag(sessionId, tag.id)}
                  className="rounded border-gray-600 w-3 h-3"
                />
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                <span className="text-gray-300 truncate">{tag.name}</span>
              </label>
              <button
                onClick={() => onDeleteTag(tag.id)}
                className="opacity-0 group-hover/tag:opacity-100 text-gray-600 hover:text-red-400 p-0.5"
              >
                <Trash2 size={10} />
              </button>
            </div>
          )
        })}
      </div>

      {/* Create */}
      <div className="border-t border-border px-3 py-2 space-y-1.5">
        <div className="flex items-center gap-0.5">
          {TAG_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setNewColor(c)}
              className={`w-3 h-3 rounded-full transition-transform ${newColor === c ? 'ring-1 ring-white/40 ring-offset-1 ring-offset-surface-2 scale-110' : 'hover:scale-110'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
            placeholder="New tag..."
            className="flex-1 bg-surface-3 border border-border rounded px-2 py-1 text-[11px] text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent-dim"
          />
          <button
            onClick={handleCreate}
            disabled={!newName.trim()}
            className="p-1 rounded hover:bg-surface-3 text-gray-500 hover:text-accent disabled:opacity-30 disabled:hover:text-gray-500"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
