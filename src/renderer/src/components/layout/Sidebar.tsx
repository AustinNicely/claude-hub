import { useState } from 'react'
import type { SessionSummary } from '../../types'
import { SearchBar } from '../sidebar/SearchBar'
import { ConversationList } from '../sidebar/ConversationList'

interface SidebarProps {
  sessions: SessionSummary[]
  loading: boolean
  selectedId: string | null
  onSelect: (sessionId: string) => void
}

export function Sidebar({ sessions, loading, selectedId, onSelect }: SidebarProps) {
  const [search, setSearch] = useState('')

  const filtered = search
    ? sessions.filter((s) =>
        s.display.toLowerCase().includes(search.toLowerCase()) ||
        s.projectName.toLowerCase().includes(search.toLowerCase())
      )
    : sessions

  return (
    <div className="w-72 bg-surface-1 border-r border-border flex flex-col h-full">
      <div className="p-3">
        <SearchBar value={search} onChange={setSearch} />
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
            Loading conversations...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
            {search ? 'No matches found' : 'No conversations'}
          </div>
        ) : (
          <ConversationList
            sessions={filtered}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        )}
      </div>
      <div className="p-3 border-t border-border">
        <div className="text-xs text-gray-500 text-center">
          {sessions.length} conversations
        </div>
      </div>
    </div>
  )
}
