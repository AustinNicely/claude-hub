import { useState, useMemo, useEffect, useCallback } from 'react'
import { Calendar, FolderTree, ArrowDownAZ, ArrowDown01, Clock } from 'lucide-react'
import type { SessionSummary, SortMode, Tag } from '../../types'
import { getStorageItem, setStorageItem } from '../../lib/storage'
import { SearchBar } from '../sidebar/SearchBar'
import { ConversationList } from '../sidebar/ConversationList'

interface SidebarProps {
  sessions: SessionSummary[]
  loading: boolean
  selectedId: string | null
  focusedId?: string | null
  onSelect: (sessionId: string) => void
  onContinue?: (sessionId: string) => void
  onDelete?: (sessionId: string) => void
  onOpenProject?: (projectPath: string) => void
  width: number
  pinnedIds?: Set<string>
  onTogglePin?: (sessionId: string) => void
  onFilteredChange?: (sessions: SessionSummary[]) => void
  sessionTags?: Map<string, string[]>
  tagDefs?: Map<string, Tag>
  tagFilter?: string | null
  onTagFilterChange?: (tagId: string | null) => void
  allTags?: Tag[]
  onOpenTagEditor?: (sessionId: string, anchor: HTMLElement) => void
  onExport?: (session: SessionSummary) => void
}

const SORT_OPTIONS: { value: SortMode; icon: typeof Clock; label: string }[] = [
  { value: 'date', icon: Clock, label: 'Date' },
  { value: 'name', icon: ArrowDownAZ, label: 'Name' },
  { value: 'messages', icon: ArrowDown01, label: 'Messages' },
]

export function Sidebar({
  sessions,
  loading,
  selectedId,
  focusedId,
  onSelect,
  onContinue,
  onDelete,
  onOpenProject,
  width,
  pinnedIds,
  onTogglePin,
  onFilteredChange,
  sessionTags,
  tagDefs,
  tagFilter,
  onTagFilterChange,
  allTags,
  onOpenTagEditor,
  onExport
}: SidebarProps) {
  const [search, setSearch] = useState('')
  const [groupMode, setGroupMode] = useState<'date' | 'project'>('date')
  const [projectFilter, setProjectFilter] = useState<string | null>(null)
  const [sortMode, setSortMode] = useState<SortMode>(() => getStorageItem<SortMode>('claude-hub-sort', 'date'))

  const projectNames = useMemo(() => {
    const names = new Set(sessions.map((s) => s.projectName).filter(Boolean))
    return [...names].sort((a, b) => a.localeCompare(b))
  }, [sessions])

  const hasFilters = projectNames.length > 1 || (allTags && allTags.length > 0)

  const filtered = useMemo(() => {
    let result = sessions

    if (projectFilter) {
      result = result.filter((s) => s.projectName === projectFilter)
    }

    if (tagFilter && sessionTags) {
      result = result.filter((s) => {
        const tags = sessionTags.get(s.sessionId)
        return tags && tags.includes(tagFilter)
      })
    }

    if (search) {
      const q = search.toLowerCase()
      result = result.filter((s) =>
        s.display.toLowerCase().includes(q) ||
        s.projectName.toLowerCase().includes(q)
      )
    }

    const sorted = [...result]
    switch (sortMode) {
      case 'name':
        sorted.sort((a, b) => a.display.localeCompare(b.display))
        break
      case 'messages':
        sorted.sort((a, b) => b.messageCount - a.messageCount)
        break
      case 'date':
      default:
        sorted.sort((a, b) => b.timestamp - a.timestamp)
        break
    }

    return sorted
  }, [sessions, search, projectFilter, sortMode, tagFilter, sessionTags])

  useEffect(() => {
    onFilteredChange?.(filtered)
  }, [filtered, onFilteredChange])

  const handleSortChange = useCallback((mode: SortMode) => {
    setSortMode(mode)
    setStorageItem('claude-hub-sort', mode)
  }, [])

  const activeFilterCount = (projectFilter ? 1 : 0) + (tagFilter ? 1 : 0)

  return (
    <div className="bg-surface-1 border-r border-border flex flex-col h-full" style={{ width }}>
      {/* Controls */}
      <div className="px-3 pt-3 pb-2 space-y-2">
        <SearchBar value={search} onChange={setSearch} />

        {/* Toolbar row: group + sort */}
        <div className="flex items-center">
          <div className="flex items-center bg-surface-2 rounded-md p-0.5">
            <button
              onClick={() => setGroupMode('date')}
              className={`p-1 rounded transition-colors ${groupMode === 'date' ? 'bg-surface-3 text-gray-200' : 'text-gray-500 hover:text-gray-300'}`}
              title="Group by date"
            >
              <Calendar size={13} />
            </button>
            <button
              onClick={() => setGroupMode('project')}
              className={`p-1 rounded transition-colors ${groupMode === 'project' ? 'bg-surface-3 text-gray-200' : 'text-gray-500 hover:text-gray-300'}`}
              title="Group by project"
            >
              <FolderTree size={13} />
            </button>
          </div>

          <div className="ml-auto flex items-center bg-surface-2 rounded-md p-0.5">
            {SORT_OPTIONS.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => handleSortChange(value)}
                className={`p-1 rounded transition-colors ${sortMode === value ? 'bg-surface-3 text-gray-200' : 'text-gray-500 hover:text-gray-300'}`}
                title={`Sort by ${label}`}
              >
                <Icon size={13} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter chips — single scrollable row mixing projects + tags */}
      {hasFilters && (
        <div className="px-3 pb-2">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {projectNames.length > 1 && projectNames.map((name) => (
              <button
                key={`p-${name}`}
                onClick={() => setProjectFilter(projectFilter === name ? null : name)}
                className={`px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap transition-colors flex-shrink-0 ${
                  projectFilter === name
                    ? 'bg-accent/20 text-accent ring-1 ring-accent/30'
                    : 'bg-surface-2 text-gray-500 hover:text-gray-300'
                }`}
              >
                {name}
              </button>
            ))}
            {allTags && allTags.length > 0 && projectNames.length > 1 && (
              <div className="w-px h-3 bg-border flex-shrink-0 mx-0.5" />
            )}
            {allTags && allTags.map((tag) => (
              <button
                key={`t-${tag.id}`}
                onClick={() => onTagFilterChange?.(tagFilter === tag.id ? null : tag.id)}
                className={`px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap transition-colors flex items-center gap-1 flex-shrink-0 ${
                  tagFilter === tag.id
                    ? 'ring-1 ring-white/20'
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={{ backgroundColor: tag.color + '22', color: tag.color }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Session list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
            Loading conversations...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
            {search || projectFilter || tagFilter ? 'No matches found' : 'No conversations'}
          </div>
        ) : (
          <ConversationList
            sessions={filtered}
            selectedId={selectedId}
            focusedId={focusedId}
            onSelect={onSelect}
            onContinue={onContinue}
            onDelete={onDelete}
            onOpenProject={onOpenProject}
            groupMode={groupMode}
            pinnedIds={pinnedIds}
            onTogglePin={onTogglePin}
            sessionTags={sessionTags}
            tagDefs={tagDefs}
            onOpenTagEditor={onOpenTagEditor}
            onExport={onExport}
          />
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-border">
        <div className="text-[11px] text-gray-600 text-center">
          {activeFilterCount > 0
            ? `${filtered.length} of ${sessions.length}`
            : sessions.length}{' '}
          conversations
        </div>
      </div>
    </div>
  )
}
